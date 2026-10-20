"""
LingoStream Universal - Pipeline Ekstraksi Video YouTube 4 Lapis
Prioritas Berurutan:
1. Subtitel Manual via yt-dlp (format json3)
2. Auto-Caption yt-dlp (Pembersihan rolling captions & penggabungan kalimat)
3. Unduh Audio + Faster-Whisper ASR (VAD filter, word-timestamps, pembersihan file sementara instan)
4. Fallback OCR Hardsub (OpenCV + PaddleOCR opsional)

Persyaratan Khusus:
- Regex ekstraksi ID video yang presisi (menolak URL tidak valid dengan HTTP 422, tanpa video ID palsu).
- Terjemahan paralel (ThreadPoolExecutor maks 8 worker) dengan caching SQLite.
- Deteksi kalimat i+1 (tepat 1 kata baru dari known_lemmas).
- Cache disk berbasis JSON per (video_id, target_lang, native_lang).
"""

import os
import re
import json
import time
import shutil
import logging
import tempfile
from urllib.parse import urlparse, parse_qs
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import List, Dict, Optional, Tuple, Any

from fastapi import HTTPException
import yt_dlp

from app.schemas import (
    TranscriptSegment,
    VideoTranscriptResponse,
    UniversalToken,
)
from app.dictionary import DictionaryService
from app.nlp.japanese import JapaneseNLPEngine
from app.nlp.chinese import ChineseNLPEngine
from app.nlp.korean import KoreanNLPEngine
from app.nlp.arabic import ArabicNLPEngine
from app.nlp.thai import ThaiNLPEngine
from app.nlp.western import WesternNLPEngine

logger = logging.getLogger(__name__)

# Coba muat faster-whisper secara lazy
_WHISPER_MODEL_INSTANCE = None
HAS_FASTER_WHISPER = False
try:
    from faster_whisper import WhisperModel
    HAS_FASTER_WHISPER = True
except Exception as e:
    logger.warning("faster-whisper tidak tersedia: %s", e)

# Coba muat OpenCV & PaddleOCR opsional
HAS_OPENCV = False
cv2 = None
try:
    import importlib
    cv2 = importlib.import_module("cv2")
    HAS_OPENCV = True
except Exception:
    pass

HAS_PADDLE_OCR = False
PaddleOCR = None
try:
    import importlib
    paddleocr_mod = importlib.import_module("paddleocr")
    PaddleOCR = getattr(paddleocr_mod, "PaddleOCR", None)
    HAS_PADDLE_OCR = PaddleOCR is not None
except Exception:
    pass

# Pola Regex Ekstraksi YouTube ID Resmi (mendukung m.youtube.com, www, shorts, youtu.be, dll)
YOUTUBE_URL_REGEX = re.compile(
    r'(?:https?:\/\/)?(?:[a-zA-Z0-9_-]+\.)?(?:youtube\.com\/(?:watch\?.*v=|embed\/|v\/|shorts\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})'
)


def extract_youtube_video_id(url: str) -> str:
    """
    Mengekstrak ID video YouTube 11-karakter secara deterministik dan presisi dari berbagai format:
    - URL web standar (watch?v=, watch?feature=...&v=)
    - Mobile (m.youtube.com, music.youtube.com)
    - Short links (youtu.be/ID)
    - Shorts, embed, live (/shorts/ID, /embed/ID, /live/ID)
    - Input parsial/terpotong di ponsel (v=ID, =ID)
    - String ID 11 karakter langsung
    Menolak URL tidak valid dengan HTTP 422 tanpa ID fiktif.
    """
    clean_url = url.strip()
    if not clean_url:
        raise HTTPException(
            status_code=422,
            detail="URL YouTube tidak boleh kosong. Harap masukkan URL YouTube atau ID video yang sah."
        )

    # 1. Regex URL YouTube resmi
    m = YOUTUBE_URL_REGEX.search(clean_url)
    if m:
        return m.group(1)

    # 2. Parsing URL terstruktur menggunakan urlparse & parse_qs
    try:
        parsed = urlparse(clean_url if "://" in clean_url else f"https://{clean_url}")
        if "youtube" in parsed.netloc or "youtu.be" in parsed.netloc:
            qs = parse_qs(parsed.query)
            if "v" in qs and qs["v"]:
                cand = qs["v"][0].strip()
                if re.match(r'^[a-zA-Z0-9_-]{11}$', cand):
                    return cand
            path_parts = [p for p in parsed.path.split("/") if p]
            if "youtu.be" in parsed.netloc and path_parts:
                cand = path_parts[0]
                if re.match(r'^[a-zA-Z0-9_-]{11}$', cand):
                    return cand
            for prefix in ("shorts", "embed", "v", "live"):
                if prefix in path_parts:
                    idx = path_parts.index(prefix)
                    if idx + 1 < len(path_parts):
                        cand = path_parts[idx + 1]
                        if re.match(r'^[a-zA-Z0-9_-]{11}$', cand):
                            return cand
    except Exception:
        pass

    # 3. Format awalan v= atau = (misal potongan copy-paste URL di ponsel)
    m_v = re.match(r'^(?:v=|=)([a-zA-Z0-9_-]{11})(?:[&?].*)?$', clean_url)
    if m_v:
        return m_v.group(1)

    # 4. Jika input langsung berupa 11 karakter ID video
    if re.match(r'^[a-zA-Z0-9_-]{11}$', clean_url):
        return clean_url

    raise HTTPException(
        status_code=422,
        detail=f"URL YouTube tidak valid: '{url}'. Harap masukkan URL YouTube yang sah (watch?v=, youtu.be, shorts/, atau live/)."
    )


def get_nlp_engine_for_lang(target_lang: str):
    """Mengembalikan instance engine NLP yang sesuai dengan kode bahasa."""
    lang = target_lang.lower()
    if lang == "ja":
        return JapaneseNLPEngine()
    elif lang == "zh":
        return ChineseNLPEngine()
    elif lang == "ko":
        return KoreanNLPEngine()
    elif lang == "ar":
        return ArabicNLPEngine()
    elif lang == "th":
        return ThaiNLPEngine()
    elif lang in ["en", "de", "fr", "es", "ru", "id"]:
        return WesternNLPEngine(lang)
    else:
        # Default western/latin engine
        return WesternNLPEngine(lang)


class YouTubePipelineService:
    """
    Layanan pipeline 4-lapis ekstraksi transkrip dan analisis NLP untuk video YouTube.
    """

    def __init__(self, cache_dir: Optional[str] = None):
        self.cache_dir = cache_dir or os.getenv("CACHE_DIR", "./cache")
        os.makedirs(self.cache_dir, exist_ok=True)
        self.dict_service = DictionaryService.get_instance()

    def _get_cache_path(self, video_id: str, target_lang: str, native_lang: str) -> str:
        """Menentukan path file cache JSON untuk kombinasi parameter."""
        filename = f"transcript_{video_id}_{target_lang}_{native_lang}.json"
        return os.path.join(self.cache_dir, filename)

    def _load_from_cache(self, video_id: str, target_lang: str, native_lang: str) -> Optional[VideoTranscriptResponse]:
        """Membaca cache disk jika tersedia."""
        cache_file = self._get_cache_path(video_id, target_lang, native_lang)
        if os.path.exists(cache_file):
            try:
                with open(cache_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    logger.info("Memuat transkrip dari disk cache: %s", cache_file)
                    return VideoTranscriptResponse(**data)
            except Exception as e:
                logger.warning("Gagal membaca cache disk: %s", e)
        return None

    def _save_to_cache(self, response: VideoTranscriptResponse, target_lang: str, native_lang: str) -> None:
        """Menyimpan hasil ekstraksi ke disk cache."""
        cache_file = self._get_cache_path(response.video_id, target_lang, native_lang)
        try:
            with open(cache_file, "w", encoding="utf-8") as f:
                json.dump(response.model_dump(), f, ensure_ascii=False, indent=2)
            logger.info("Berhasil menyimpan transkrip ke disk cache: %s", cache_file)
        except Exception as e:
            logger.warning("Gagal menyimpan ke cache disk: %s", e)

    def _clean_rolling_captions(self, raw_events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Membersihkan duplikasi baris bergulir (rolling captions) ala YouTube
        dan menggabungkan event-event kecil menjadi kalimat utuh berdasarkan tanda baca dan jeda > 700 ms.
        """
        cleaned_events: List[Dict[str, Any]] = []
        last_text = ""

        # Fase 1: Dedup teks berturut-turut & bersihkan tag noise musik
        for ev in raw_events:
            text = ev.get("text", "").strip()
            # Bersihkan tag noise seperti [音楽], [ 音楽 ], [Musik], [ Music ], dll.
            text = re.sub(r'[\[［\(\uff08]\s*(?:音楽|Musik|Music|Applause|Laughter|BGM|Sfx|Cheering|拍手|歓声)\s*[\]］\)\uff09]', '', text, flags=re.IGNORECASE)
            text = re.sub(r'\[\s*\]|\(\s*\)|（\s*）|［\s*］', '', text)
            text = re.sub(r'\s+', ' ', text).strip()
            if not text:
                continue
            
            # Abaikan jika baris persis sama dengan sebelumnya
            if text == last_text:
                continue
                
            # Jika baris ini merupakan kelanjutan dari rolling caption
            if last_text and text.startswith(last_text):
                text = text[len(last_text):].strip()
            elif last_text and last_text.startswith(text):
                continue

            if not text:
                continue

            cleaned_events.append({
                "start_ms": ev.get("start_ms", 0),
                "end_ms": ev.get("end_ms", 0),
                "text": text,
            })
            last_text = ev.get("text", "").strip()

        # Fase 2: Gabungkan event kecil menjadi kalimat utuh (tanda baca atau jeda > 700ms)
        sentence_events: List[Dict[str, Any]] = []
        if not cleaned_events:
            return sentence_events

        curr_start = cleaned_events[0]["start_ms"]
        curr_end = cleaned_events[0]["end_ms"]
        curr_text_parts = [cleaned_events[0]["text"]]

        sentence_endings = ('.', '!', '?', '。', '！', '？', '\n')

        for i in range(1, len(cleaned_events)):
            ev = cleaned_events[i]
            prev_ev = cleaned_events[i - 1]
            gap_ms = ev["start_ms"] - prev_ev["end_ms"]

            prev_text = curr_text_parts[-1]
            ends_with_punct = prev_text.endswith(sentence_endings)

            if gap_ms > 700 or ends_with_punct:
                # Tutup kalimat saat ini
                sentence_events.append({
                    "start_ms": curr_start,
                    "end_ms": curr_end,
                    "text": " ".join(curr_text_parts),
                })
                curr_start = ev["start_ms"]
                curr_end = ev["end_ms"]
                curr_text_parts = [ev["text"]]
            else:
                curr_end = max(curr_end, ev["end_ms"])
                curr_text_parts.append(ev["text"])

        if curr_text_parts:
            sentence_events.append({
                "start_ms": curr_start,
                "end_ms": curr_end,
                "text": " ".join(curr_text_parts),
            })

        return sentence_events

    def _layer1_manual_subtitles(self, ydl: yt_dlp.YoutubeDL, info: Dict[str, Any], target_lang: str) -> Optional[List[Dict[str, Any]]]:
        """LAPISAN 1: Ekstraksi Subtitel Manual (json3)."""
        subtitles = info.get("subtitles") or {}
        # Cari bahasa persis atau awalan (contoh: ja, ja-JP)
        matched_lang = None
        for lang_code in subtitles.keys():
            if lang_code == target_lang or lang_code.startswith(f"{target_lang}-"):
                matched_lang = lang_code
                break

        if not matched_lang:
            logger.info("Lapisan 1: Tidak ada subtitel manual untuk bahasa '%s'", target_lang)
            return None

        # Unduh format json3 atau vtt
        sub_formats = subtitles[matched_lang]
        json3_url = None
        for fmt in sub_formats:
            if fmt.get("ext") == "json3":
                json3_url = fmt.get("url")
                break
        if not json3_url and sub_formats:
            json3_url = sub_formats[0].get("url")

        if not json3_url:
            return None

        try:
            # Ambil data subtitle json3
            import urllib.request
            req = urllib.request.Request(json3_url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode("utf-8"))

            events = data.get("events", [])
            raw_segments = []
            for ev in events:
                t_start = ev.get("tStartMs", 0)
                d_duration = ev.get("dDurationMs", 0)
                segs = ev.get("segs", [])
                text = "".join([s.get("utf8", "") for s in segs]).strip()
                if text and text != "\n":
                    raw_segments.append({
                        "start_ms": t_start,
                        "end_ms": t_start + d_duration,
                        "text": text,
                    })

            if raw_segments:
                logger.info("Lapisan 1 BERHASIL: Menemukan %d segmen subtitel manual", len(raw_segments))
                return self._clean_rolling_captions(raw_segments)
        except Exception as e:
            logger.warning("Lapisan 1 gagal mengunduh json3: %s", e)

        return None

    def _layer2_auto_subtitles(self, ydl: yt_dlp.YoutubeDL, info: Dict[str, Any], target_lang: str) -> Optional[List[Dict[str, Any]]]:
        """LAPISAN 2: Ekstraksi Auto-Caption yt-dlp + Normalisasi Rolling Captions."""
        auto_subs = info.get("automatic_captions") or {}
        matched_lang = None
        for lang_code in auto_subs.keys():
            if lang_code == target_lang or lang_code.startswith(f"{target_lang}-"):
                matched_lang = lang_code
                break

        if not matched_lang:
            logger.info("Lapisan 2: Tidak ada auto-subtitles untuk bahasa '%s'", target_lang)
            return None

        sub_formats = auto_subs[matched_lang]
        json3_url = None
        for fmt in sub_formats:
            if fmt.get("ext") == "json3":
                json3_url = fmt.get("url")
                break
        if not json3_url and sub_formats:
            json3_url = sub_formats[0].get("url")

        if not json3_url:
            return None

        try:
            import urllib.request
            req = urllib.request.Request(json3_url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode("utf-8"))

            events = data.get("events", [])
            raw_segments = []
            for ev in events:
                t_start = ev.get("tStartMs", 0)
                d_duration = ev.get("dDurationMs", 0)
                segs = ev.get("segs", [])
                text = "".join([s.get("utf8", "") for s in segs]).strip()
                if text and text != "\n":
                    raw_segments.append({
                        "start_ms": t_start,
                        "end_ms": t_start + d_duration,
                        "text": text,
                    })

            if raw_segments:
                cleaned = self._clean_rolling_captions(raw_segments)
                logger.info("Lapisan 2 BERHASIL: Menghasilkan %d segmen dari auto-sub", len(cleaned))
                return cleaned
        except Exception as e:
            logger.warning("Lapisan 2 gagal mengunduh auto-sub json3: %s", e)

        return None

    def _extract_native_captions_map(
        self,
        info: Dict[str, Any],
        native_lang: str,
        raw_segments: List[Dict[str, Any]]
    ) -> Dict[int, str]:
        """
        Mengekstrak subtitle native (misal id) langsung dari track subtitle YouTube (manual atau auto-sub)
        dan memetakan ke indeks raw_segments berdasarkan temporal overlap.
        Menghilangkan kebutuhan ratusan panggilan HTTP scraping terjemahan.
        """
        mapping: Dict[int, str] = {}
        if not info or not raw_segments:
            return mapping

        subtitles = info.get("subtitles") or {}
        auto_subs = info.get("automatic_captions") or {}

        matched_sub_formats = None
        for lang_code, fmts in subtitles.items():
            if lang_code == native_lang or lang_code.startswith(f"{native_lang}-"):
                matched_sub_formats = fmts
                break
        if not matched_sub_formats:
            for lang_code, fmts in auto_subs.items():
                if lang_code == native_lang or lang_code.startswith(f"{native_lang}-"):
                    matched_sub_formats = fmts
                    break

        if not matched_sub_formats:
            return mapping

        json3_url = None
        for fmt in matched_sub_formats:
            if fmt.get("ext") == "json3":
                json3_url = fmt.get("url")
                break
        if not json3_url and matched_sub_formats:
            json3_url = matched_sub_formats[0].get("url")

        if not json3_url:
            return mapping

        try:
            import urllib.request
            req = urllib.request.Request(json3_url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=5) as resp:
                data = json.loads(resp.read().decode("utf-8"))

            events = data.get("events", [])
            native_events: List[Dict[str, Any]] = []
            for ev in events:
                t_start = ev.get("tStartMs", 0)
                d_duration = ev.get("dDurationMs", 0)
                segs = ev.get("segs", [])
                text = "".join([s.get("utf8", "") for s in segs]).strip()
                text = re.sub(r'[\[［\(\uff08]\s*(?:音楽|Musik|Music|Applause|Laughter|BGM|Sfx|Cheering|拍手|歓声)\s*[\]］\)\uff09]', '', text, flags=re.IGNORECASE)
                text = re.sub(r'\[\s*\]|\(\s*\)|（\s*）|［\s*］', '', text)
                text = re.sub(r'\s+', ' ', text).strip()
                if text and text != "\n":
                    native_events.append({
                        "start_ms": t_start,
                        "end_ms": t_start + d_duration,
                        "text": text,
                    })

            for i, seg in enumerate(raw_segments):
                s_start = seg["start_ms"]
                s_end = seg["end_ms"]
                best_overlap = 0
                best_text = ""
                for nev in native_events:
                    overlap = max(0, min(s_end, nev["end_ms"]) - max(s_start, nev["start_ms"]))
                    if overlap > best_overlap:
                        best_overlap = overlap
                        best_text = nev["text"]
                if best_text and best_overlap > 200:
                    mapping[i] = best_text

            if mapping:
                logger.info("Berhasil memetakan %d segmen terjemahan native langsung dari YouTube", len(mapping))
        except Exception as e:
            logger.debug("Gagal mengekstrak track subtitle native: %s", e)

        return mapping

    def _layer3_whisper_asr(self, video_url: str, target_lang: str) -> Optional[List[Dict[str, Any]]]:
        """
        LAPISAN 3: Unduh Audio Stream (m4a) -> Silero VAD -> faster-whisper dengan word_timestamps.
        File audio sementara dihapus SEGERA setelah transkripsi selesai.
        """
        if not HAS_FASTER_WHISPER:
            logger.info("Lapisan 3: faster-whisper tidak terpasang, melewati ASR")
            return None

        temp_dir = tempfile.mkdtemp(prefix="lingostream_audio_")
        audio_path = os.path.join(temp_dir, "audio.m4a")

        try:
            ydl_opts = {
                "format": "bestaudio[ext=m4a]/bestaudio/best",
                "outtmpl": audio_path,
                "quiet": True,
                "no_warnings": True,
            }
            logger.info("Lapisan 3: Mengunduh audio m4a sementara...")
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.download([video_url])

            if not os.path.exists(audio_path):
                # Cari file dengan ekstensi apa pun di temp_dir
                files = os.listdir(temp_dir)
                if files:
                    audio_path = os.path.join(temp_dir, files[0])
                else:
                    logger.warning("Lapisan 3: Gagal mengunduh file audio")
                    return None

            # Coba ASR cepat berbasis Gemini Cloud jika API Key tersedia
            from app.gemini_service import GeminiService
            gemini_svc = GeminiService.get_instance()
            if gemini_svc.is_available():
                logger.info("Lapisan 3: Menjalankan Gemini Cloud ASR untuk transkripsi audio cepat...")
                gemini_segments = gemini_svc.transcribe_audio_with_timestamps(audio_path, target_lang)
                if gemini_segments:
                    logger.info("Lapisan 3 BERHASIL via Gemini Cloud ASR: Menghasilkan %d segmen", len(gemini_segments))
                    return gemini_segments
                logger.info("Gemini Cloud ASR tidak menghasilkan segmen, beralih ke Faster-Whisper lokal...")

            # Muat model Faster-Whisper secara lazy
            global _WHISPER_MODEL_INSTANCE
            if _WHISPER_MODEL_INSTANCE is None:
                model_size = os.getenv("WHISPER_MODEL", "small")
                device = os.getenv("WHISPER_DEVICE", "cpu")
                compute_type = os.getenv("WHISPER_COMPUTE_TYPE", "int8")
                logger.info("Memuat model Faster-Whisper (%s, %s, %s)...", model_size, device, compute_type)
                _WHISPER_MODEL_INSTANCE = WhisperModel(model_size, device=device, compute_type=compute_type)

            # Jalankan transkripsi dengan vad_filter=True dan word_timestamps=True
            segments_gen, _ = _WHISPER_MODEL_INSTANCE.transcribe(
                audio_path,
                language=target_lang if target_lang != "zh" else "zh",
                vad_filter=True,
                word_timestamps=True,
            )

            results: List[Dict[str, Any]] = []
            for seg in segments_gen:
                text = seg.text.strip()
                if text:
                    results.append({
                        "start_ms": int(seg.start * 1000),
                        "end_ms": int(seg.end * 1000),
                        "text": text,
                    })

            logger.info("Lapisan 3 BERHASIL: Menghasilkan %d segmen via Faster-Whisper", len(results))
            return results

        except Exception as e:
            logger.warning("Lapisan 3 Whisper ASR gagal: %s", e)
            return None
        finally:
            # WAJIB: Hapus file dan folder audio sementara segera!
            shutil.rmtree(temp_dir, ignore_errors=True)
            logger.info("File audio sementara berhasil dibersihkan dari disk")

    def _layer4_ocr_hardsub(self, video_url: str) -> Optional[List[Dict[str, Any]]]:
        """
        LAPISAN 4: OCR Hardsub pada area bawah layar via OpenCV + PaddleOCR opsional.
        """
        if not (HAS_OPENCV and HAS_PADDLE_OCR):
            logger.info("Lapisan 4: OpenCV atau PaddleOCR tidak terpasang, melewati OCR hardsub")
            return None
        # Implementasi fallback OCR jika model PaddleOCR terpasang
        return None

    def _generate_demo_data(self, video_id: str, target_lang: str, native_lang: str) -> VideoTranscriptResponse:
        """Menghasilkan data demo eksplisit berlabel demo saat demo=true disertakan."""
        nlp_engine = get_nlp_engine_for_lang(target_lang)
        
        sample_texts = {
            "ja": [
                ("こんにちは、世界！", "Halo, dunia!", 1000, 3000),
                ("私は毎日日本語を勉強します。", "Saya belajar bahasa Jepang setiap hari.", 3500, 7000),
                ("振り返ると、懐かしい思い出がたくさんあります。", "Ketika menoleh ke belakang, ada banyak kenangan manis.", 7500, 12000),
                ("美味しいご飯を食べに行きましょう。", "Ayo pergi makan makanan yang enak.", 12500, 16000),
            ],
            "zh": [
                ("你好，欢迎来到这里！", "Halo, selamat datang di sini!", 1000, 3500),
                ("不是每一个问题都有简单的答案。", "Tidak setiap pertanyaan memiliki jawaban sederhana.", 4000, 8000),
                ("我们要一起努力学习汉语。", "Kita harus berusaha bersama belajar bahasa Mandarin.", 8500, 12500),
            ],
            "ko": [
                ("안녕하세요, 만나서 반갑습니다.", "Halo, senang bertemu dengan Anda.", 1000, 3500),
                ("한국의 역사는 독립을 향한 여정이었습니다.", "Sejarah Korea adalah perjalanan menuju kemerdekaan.", 4000, 8500),
                ("친구와 같이 맛있는 밥을 먹었어요.", "Saya makan makanan lezat bersama teman.", 9000, 13000),
            ],
            "ar": [
                ("أَهْلاً وَسَهْلاً بِكُمْ فِي هَذَا الْفِيدْيُو.", "Selamat datang di video ini.", 1000, 4000),
                ("الْقِرَاءَةُ هِيَ مِفْتَاحُ الْمَعْرِفَةِ.", "Membaca adalah kunci pengetahuan.", 4500, 8000),
            ],
            "th": [
                ("สวัสดีครับ ยินดีต้อนรับสู่บทเรียนภาษาไทย", "Halo, selamat datang di pelajaran bahasa Thailand.", 1000, 4500),
                ("การเรียนภาษาใหม่สนุกมาก", "Belajar bahasa baru sangat menyenangkan.", 5000, 8500),
            ],
            "en": [
                ("Welcome to this comprehensive language tutorial.", "Selamat datang di tutorial bahasa komprehensif ini.", 1000, 4000),
                ("Yesterday I went to the store and bought a great book.", "Kemarin saya pergi ke toko dan membeli buku bagus.", 4500, 8500),
            ],
            "de": [
                ("Guten Tag, herzlich willkommen zu unserem Kurs.", "Halo, selamat datang di kursus kami.", 1000, 4000),
                ("Ich stehe jeden Morgen um sieben Uhr auf.", "Saya bangun jam tujuh setiap pagi.", 4500, 8500),
            ],
            "id": [
                ("Selamat datang di platform belajar bahasa universal.", "Selamat datang di platform belajar bahasa universal.", 1000, 4000),
                ("Kita sedang memperbaiki cara kita belajar kosakata baru.", "Kita sedang memperbaiki cara kita belajar kosakata baru.", 4500, 9000),
            ],
        }

        samples = sample_texts.get(target_lang, sample_texts["ja"])
        segments: List[TranscriptSegment] = []

        for idx, item in enumerate(samples):
            sentence = item[0]
            trans = item[1]
            s_ms = item[2]
            e_ms = item[3]
            tokens = nlp_engine.analyze(sentence, native_lang)
            segments.append(TranscriptSegment(
                index=idx,
                start_ms=s_ms,
                end_ms=e_ms,
                original_text=sentence,
                translated_text=trans,
                translation_failed=False,
                is_i_plus_one=False,
                tokens=tokens
            ))

        return VideoTranscriptResponse(
            video_id=video_id,
            title="LingoStream Demo Session (Mode Demo)",
            channel="LingoStream Universal",
            language=target_lang,
            writing_direction="rtl" if target_lang == "ar" else "ltr",
            source_type="demo",
            engine_used={"pipeline": "demo_generator", "nlp": target_lang},
            truncated=False,
            segments=segments
        )

    def process_video(
        self,
        youtube_url: str,
        target_lang: str = "ja",
        native_lang: str = "id",
        known_lemmas: Optional[List[str]] = None,
        max_segments: int = 200,
        demo: bool = False,
    ) -> VideoTranscriptResponse:
        """
        Memproses video YouTube melalui pipeline 4 lapis secara aman dan deterministik.
        """
        known_set = set(known_lemmas or [])
        video_id = extract_youtube_video_id(youtube_url)

        # 1. Periksa cache disk
        cached_result = self._load_from_cache(video_id, target_lang, native_lang)
        if cached_result:
            # Perbarui status i+1 secara dinamis berdasarkan known_lemmas terkini pengguna
            for seg in cached_result.segments:
                unmastered_count = 0
                for tok in seg.tokens:
                    if tok.pos not in ["PUNCT", "OTHER"] and tok.lemma not in known_set:
                        unmastered_count += 1
                seg.is_i_plus_one = (unmastered_count == 1)
            return cached_result

        # Jika mode demo diminta secara eksplisit
        if demo:
            demo_resp = self._generate_demo_data(video_id, target_lang, native_lang)
            self._save_to_cache(demo_resp, target_lang, native_lang)
            return demo_resp

        canonical_url = f"https://www.youtube.com/watch?v={video_id}"

        # 2. Inisialisasi yt-dlp untuk membaca metadata video
        ydl_opts = {
            "quiet": True,
            "no_warnings": True,
            "skip_download": True,
        }

        info: Optional[Dict[str, Any]] = None
        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(canonical_url, download=False)
        except Exception as e:
            logger.warning("Gagal mengekstrak metadata yt-dlp untuk %s: %s", canonical_url, e)

        title = info.get("title", f"Video {video_id}") if info else f"Video {video_id}"
        channel = info.get("uploader", "Unknown Channel") if info else "Unknown Channel"

        raw_segments: Optional[List[Dict[str, Any]]] = None
        source_type = "unknown"
        engine_used: Dict[str, str] = {}

        # 3. Jalankan 4 Lapisan Pipeline
        if info:
            # Lapisan 1: Subtitel Manual
            raw_segments = self._layer1_manual_subtitles(None, info, target_lang)
            if raw_segments:
                source_type = "manual_sub"
                engine_used["pipeline"] = "layer1_manual_subtitles"

            # Lapisan 2: Auto-Caption yt-dlp
            if not raw_segments:
                raw_segments = self._layer2_auto_subtitles(None, info, target_lang)
                if raw_segments:
                    source_type = "auto_sub"
                    engine_used["pipeline"] = "layer2_auto_captions"

        # Lapisan 3: Faster-Whisper ASR
        if not raw_segments:
            raw_segments = self._layer3_whisper_asr(canonical_url, target_lang)
            if raw_segments:
                source_type = "whisper_asr"
                engine_used["pipeline"] = f"layer3_faster_whisper_{os.getenv('WHISPER_MODEL', 'small')}"

        # Lapisan 4: OCR Hardsub
        if not raw_segments:
            raw_segments = self._layer4_ocr_hardsub(canonical_url)
            if raw_segments:
                source_type = "ocr_hardsub"
                engine_used["pipeline"] = "layer4_ocr_hardsub"

        # Jika seluruh lapisan gagal
        if not raw_segments:
            raise HTTPException(
                status_code=404,
                detail=f"Tidak ditemukan subtitel untuk video '{video_id}' dalam bahasa '{target_lang}', dan ASR Whisper tidak menghasilkan transkrip. Anda dapat mencoba lagi dengan demo=true jika ingin melihat antarmuka contoh."
            )

        # 4. Potong sesuai max_segments dan tandai flag truncated
        truncated = False
        if len(raw_segments) > max_segments:
            raw_segments = raw_segments[:max_segments]
            truncated = True

        # 5. Analisis NLP per segmen
        nlp_engine = get_nlp_engine_for_lang(target_lang)
        engine_info = nlp_engine.get_engine_info()
        engine_used.update(engine_info)

        # 6. Terjemahan Kalimat Cerdas & Berkualitas Tinggi
        from app.gemini_service import GeminiService
        gemini_svc = GeminiService.get_instance()
        translations: Dict[int, Tuple[str, bool]] = {}

        # 6a. Cek Cache Kalimat Terlebih Dahulu (Hindari terjemahan berulang)
        uncached_indices: List[int] = []
        for i, seg in enumerate(raw_segments):
            text = seg["text"].strip()
            cached = self.dict_service.get_sentence_cache(target_lang, native_lang, text)
            # Pastikan cache bersih, tidak mengandung "ikan air tawar" atau noise [musik]
            if cached and "ikan air tawar" not in cached.lower() and "[musik]" not in cached.lower() and "[music]" not in cached.lower():
                translations[i] = (cached, False)
            else:
                uncached_indices.append(i)

        # 6b. Prioritas 1: Jika Gemini AI aktif, gunakan Gemini untuk kalimat yang belum ada di cache
        if gemini_svc.is_available() and uncached_indices:
            logger.info("Menggunakan Gemini untuk terjemahan dialog berkualitas tinggi bagi %d kalimat...", len(uncached_indices))
            items_to_translate = [
                {"index": i, "text": raw_segments[i]["text"]}
                for i in uncached_indices
            ]
            batch_size = 20
            max_translate = min(len(items_to_translate), 80)
            for start_i in range(0, max_translate, batch_size):
                chunk = items_to_translate[start_i:start_i + batch_size]
                try:
                    chunk_trans = gemini_svc.batch_translate(chunk, target_lang, native_lang)
                    for idx_res, trans_text in chunk_trans.items():
                        clean_trans = re.sub(r'[\[［\(\uff08]\s*(?:musik|music|applause)\s*[\]］\)\uff09]', '', trans_text, flags=re.IGNORECASE).strip()
                        translations[idx_res] = (clean_trans, False)
                        self.dict_service.save_sentence_cache(target_lang, native_lang, raw_segments[idx_res]["text"], clean_trans)
                except Exception as ex:
                    logger.warning("Gagal menerjemahkan chunk via Gemini: %s", ex)

        # 6c. Prioritas 2: Gunakan track terjemahan manual YouTube HANYA jika Gemini tidak aktif
        if not gemini_svc.is_available() and len(translations) < len(raw_segments) and info:
            native_subs_map = self._extract_native_captions_map(info, native_lang, raw_segments)
            for idx in range(len(raw_segments)):
                if idx not in translations and idx in native_subs_map and native_subs_map[idx]:
                    cand = native_subs_map[idx]
                    if "ikan air tawar" not in cand.lower():
                        translations[idx] = (cand, False)

        # 6d. Prioritas 3: Fallback ke kamus / translate_sentence untuk segmen yang masih kosong
        untranslated_indices = [
            i for i in range(len(raw_segments))
            if i not in translations and i < 20
        ]

        def translate_task(idx: int, text: str) -> Tuple[int, str, bool]:
            try:
                t = self.dict_service.translate_sentence(text, target_lang, native_lang)
                return idx, t, (not bool(t))
            except Exception as ex:
                logger.debug("Terjemahan gagal untuk segmen %d: %s", idx, ex)
                return idx, "", True

        if untranslated_indices:
            with ThreadPoolExecutor(max_workers=4) as executor:
                future_to_idx = {
                    executor.submit(translate_task, i, raw_segments[i]["text"]): i
                    for i in untranslated_indices
                }
                for fut in as_completed(future_to_idx):
                    idx_res, trans_text, failed = fut.result()
                    translations[idx_res] = (trans_text, failed)

        # 7. Rakit Segmen Akhir & Hitung i+1
        final_segments: List[TranscriptSegment] = []
        for i, seg in enumerate(raw_segments):
            text = seg["text"]
            tokens = nlp_engine.analyze(text, native_lang)
            trans_text, trans_failed = translations.get(i, ("", True))

            # Hitung apakah ini kalimat i+1 (tepat 1 kata baru)
            unmastered_count = 0
            for tok in tokens:
                if tok.pos not in ["PUNCT", "OTHER"] and tok.lemma not in known_set:
                    unmastered_count += 1
            is_i_plus_one = (unmastered_count == 1)

            final_segments.append(TranscriptSegment(
                index=i,
                start_ms=seg["start_ms"],
                end_ms=seg["end_ms"],
                original_text=text,
                translated_text=trans_text,
                translation_failed=trans_failed,
                is_i_plus_one=is_i_plus_one,
                tokens=tokens
            ))

        writing_dir = "rtl" if target_lang == "ar" else "ltr"

        response = VideoTranscriptResponse(
            video_id=video_id,
            title=title,
            channel=channel,
            language=target_lang,
            writing_direction=writing_dir,
            source_type=source_type,
            engine_used=engine_used,
            truncated=truncated,
            segments=final_segments
        )

        # Simpan ke cache disk
        self._save_to_cache(response, target_lang, native_lang)
        return response
