"""
LingoStream Universal - Kamus Inti Offline dan Manajemen Cache SQLite
Menyediakan lookup kamus offline bertingkat:
1. Kamus leksikon inti offline (bawaan)
2. Cache persisten SQLite untuk istilah dan terjemahan
3. Fallback online terjemahan (deep-translator) dengan auto-caching
"""

import os
import sqlite3
import logging
import requests
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

# Kamus offline inti untuk kosakata frekuensi tinggi dan kata fungsional
CORE_DICTIONARY: Dict[str, Dict[str, Dict[str, Any]]] = {
    "ja": {
        "食べる": {"meanings": ["makan"], "pos": "VERB", "proficiency": "JLPT N5"},
        "飲む": {"meanings": ["minum"], "pos": "VERB", "proficiency": "JLPT N5"},
        "行く": {"meanings": ["pergi"], "pos": "VERB", "proficiency": "JLPT N5"},
        "来る": {"meanings": ["datang"], "pos": "VERB", "proficiency": "JLPT N5"},
        "見る": {"meanings": ["melihat", "menonton"], "pos": "VERB", "proficiency": "JLPT N5"},
        "振り返る": {"meanings": ["menoleh ke belakang", "mengenang kembali"], "pos": "VERB", "proficiency": "JLPT N3"},
        "引き出し": {"meanings": ["laci", "penarikan uang"], "pos": "NOUN", "proficiency": "JLPT N4"},
        "取り扱い": {"meanings": ["penanganan", "perlakuan"], "pos": "NOUN", "proficiency": "JLPT N2"},
        "お願い": {"meanings": ["permohonan", "tolong"], "pos": "NOUN", "proficiency": "JLPT N5"},
        "私": {"meanings": ["saya", "aku"], "pos": "PRON", "proficiency": "JLPT N5"},
        "あなた": {"meanings": ["anda", "kamu"], "pos": "PRON", "proficiency": "JLPT N5"},
        "日本": {"meanings": ["Jepang"], "pos": "NOUN", "proficiency": "JLPT N5"},
        "日本語": {"meanings": ["bahasa Jepang"], "pos": "NOUN", "proficiency": "JLPT N5"},
        "学生": {"meanings": ["pelajar", "mahasiswa"], "pos": "NOUN", "proficiency": "JLPT N5"},
        "先生": {"meanings": ["guru", "dokter"], "pos": "NOUN", "proficiency": "JLPT N5"},
        "本": {"meanings": ["buku"], "pos": "NOUN", "proficiency": "JLPT N5"},
        "今日": {"meanings": ["hari ini"], "pos": "NOUN", "proficiency": "JLPT N5"},
        "明日": {"meanings": ["besok"], "pos": "NOUN", "proficiency": "JLPT N5"},
        "昨日": {"meanings": ["kemarin"], "pos": "NOUN", "proficiency": "JLPT N5"},
        "美味しい": {"meanings": ["enak", "lezat"], "pos": "ADJ", "proficiency": "JLPT N5"},
        "大きい": {"meanings": ["besar"], "pos": "ADJ", "proficiency": "JLPT N5"},
        "小さい": {"meanings": ["kecil"], "pos": "ADJ", "proficiency": "JLPT N5"},
    },
    "zh": {
        "你好": {"meanings": ["halo", "apa kabar"], "pos": "NOUN", "proficiency": "HSK 1"},
        "吃": {"meanings": ["makan"], "pos": "VERB", "proficiency": "HSK 1"},
        "喝": {"meanings": ["minum"], "pos": "VERB", "proficiency": "HSK 1"},
        "去": {"meanings": ["pergi"], "pos": "VERB", "proficiency": "HSK 1"},
        "来": {"meanings": ["datang"], "pos": "VERB", "proficiency": "HSK 1"},
        "看": {"meanings": ["melihat", "membaca"], "pos": "VERB", "proficiency": "HSK 1"},
        "我": {"meanings": ["saya", "aku"], "pos": "PRON", "proficiency": "HSK 1"},
        "你": {"meanings": ["kamu", "anda"], "pos": "PRON", "proficiency": "HSK 1"},
        "他": {"meanings": ["dia (laki-laki)"], "pos": "PRON", "proficiency": "HSK 1"},
        "她": {"meanings": ["dia (perempuan)"], "pos": "PRON", "proficiency": "HSK 1"},
        "是": {"meanings": ["adalah", "iya"], "pos": "VERB", "proficiency": "HSK 1"},
        "不": {"meanings": ["tidak", "bukan"], "pos": "ADV", "proficiency": "HSK 1"},
        "一": {"meanings": ["satu"], "pos": "NUM", "proficiency": "HSK 1"},
        "好": {"meanings": ["baik", "bagus"], "pos": "ADJ", "proficiency": "HSK 1"},
        "中国": {"meanings": ["Tiongkok", "China"], "pos": "NOUN", "proficiency": "HSK 1"},
        "汉语": {"meanings": ["bahasa Mandarin"], "pos": "NOUN", "proficiency": "HSK 1"},
        "老师": {"meanings": ["guru"], "pos": "NOUN", "proficiency": "HSK 1"},
        "学生": {"meanings": ["siswa", "murid"], "pos": "NOUN", "proficiency": "HSK 1"},
        "大": {"meanings": ["besar"], "pos": "ADJ", "proficiency": "HSK 1"},
        "小": {"meanings": ["kecil"], "pos": "ADJ", "proficiency": "HSK 1"},
    },
    "ko": {
        "안녕": {"meanings": ["kedamaian", "halo"], "pos": "NOUN", "proficiency": "TOPIK 1"},
        "먹다": {"meanings": ["makan"], "pos": "VERB", "proficiency": "TOPIK 1"},
        "마시다": {"meanings": ["minum"], "pos": "VERB", "proficiency": "TOPIK 1"},
        "가다": {"meanings": ["pergi"], "pos": "VERB", "proficiency": "TOPIK 1"},
        "오다": {"meanings": ["datang"], "pos": "VERB", "proficiency": "TOPIK 1"},
        "보다": {"meanings": ["melihat", "menonton"], "pos": "VERB", "proficiency": "TOPIK 1"},
        "독립": {"meanings": ["kemerdekaan", "kemandirian"], "pos": "NOUN", "proficiency": "TOPIK 2"},
        "같이": {"meanings": ["bersama", "seperti"], "pos": "ADV", "proficiency": "TOPIK 1"},
        "나": {"meanings": ["aku", "saya"], "pos": "PRON", "proficiency": "TOPIK 1"},
        "저": {"meanings": ["saya (sopan)"], "pos": "PRON", "proficiency": "TOPIK 1"},
        "사람": {"meanings": ["orang", "manusia"], "pos": "NOUN", "proficiency": "TOPIK 1"},
        "한국": {"meanings": ["Korea"], "pos": "NOUN", "proficiency": "TOPIK 1"},
        "한국어": {"meanings": ["bahasa Korea"], "pos": "NOUN", "proficiency": "TOPIK 1"},
        "선생님": {"meanings": ["guru"], "pos": "NOUN", "proficiency": "TOPIK 1"},
        "학생": {"meanings": ["siswa"], "pos": "NOUN", "proficiency": "TOPIK 1"},
        "크다": {"meanings": ["besar"], "pos": "ADJ", "proficiency": "TOPIK 1"},
        "작다": {"meanings": ["kecil"], "pos": "ADJ", "proficiency": "TOPIK 1"},
        "좋다": {"meanings": ["bagus", "baik"], "pos": "ADJ", "proficiency": "TOPIK 1"},
    },
    "ar": {
        "كتاب": {"meanings": ["buku"], "pos": "NOUN", "root": "كتب"},
        "كتب": {"meanings": ["menulis"], "pos": "VERB", "root": "كتب"},
        "كاتب": {"meanings": ["penulis"], "pos": "NOUN", "root": "كتب"},
        "مكتبة": {"meanings": ["perpustakaan", "toko buku"], "pos": "NOUN", "root": "كتب"},
        "درس": {"meanings": ["belajar"], "pos": "VERB", "root": "درس"},
        "مدرسة": {"meanings": ["sekolah"], "pos": "NOUN", "root": "درس"},
        "سلام": {"meanings": ["damai", "keselamatan"], "pos": "NOUN", "root": "سلم"},
        "أنا": {"meanings": ["saya", "aku"], "pos": "PRON", "root": None},
        "أنت": {"meanings": ["kamu", "anda"], "pos": "PRON", "root": None},
        "هو": {"meanings": ["dia (laki-laki)"], "pos": "PRON", "root": None},
        "هي": {"meanings": ["dia (perempuan)"], "pos": "PRON", "root": None},
        "كبير": {"meanings": ["besar"], "pos": "ADJ", "root": "كبر"},
        "صغير": {"meanings": ["kecil"], "pos": "ADJ", "root": "صغر"},
    },
    "th": {
        "ภาษา": {"meanings": ["bahasa"], "pos": "NOUN"},
        "ไทย": {"meanings": ["Thai", "Thailand"], "pos": "NOUN"},
        "กิน": {"meanings": ["makan"], "pos": "VERB"},
        "ดื่ม": {"meanings": ["minum"], "pos": "VERB"},
        "ไป": {"meanings": ["pergi"], "pos": "VERB"},
        "มา": {"meanings": ["datang"], "pos": "VERB"},
        "ดู": {"meanings": ["melihat"], "pos": "VERB"},
        "ฉัน": {"meanings": ["saya (wanita)"], "pos": "PRON"},
        "ผม": {"meanings": ["saya (pria)"], "pos": "PRON"},
        "ดี": {"meanings": ["bagus", "baik"], "pos": "ADJ"},
        "ใหญ่": {"meanings": ["besar"], "pos": "ADJ"},
        "เล็ก": {"meanings": ["kecil"], "pos": "ADJ"},
    },
    "en": {
        "go": {"meanings": ["pergi"], "pos": "VERB", "proficiency": "CEFR A1"},
        "eat": {"meanings": ["makan"], "pos": "VERB", "proficiency": "CEFR A1"},
        "buy": {"meanings": ["membeli"], "pos": "VERB", "proficiency": "CEFR A1"},
        "see": {"meanings": ["melihat"], "pos": "VERB", "proficiency": "CEFR A1"},
        "book": {"meanings": ["buku"], "pos": "NOUN", "proficiency": "CEFR A1"},
        "good": {"meanings": ["baik", "bagus"], "pos": "ADJ", "proficiency": "CEFR A1"},
        "big": {"meanings": ["besar"], "pos": "ADJ", "proficiency": "CEFR A1"},
        "small": {"meanings": ["kecil"], "pos": "ADJ", "proficiency": "CEFR A1"},
        "learn": {"meanings": ["belajar"], "pos": "VERB", "proficiency": "CEFR A1"},
    },
    "de": {
        "aufstehen": {"meanings": ["bangun tidur", "berdiri"], "pos": "VERB", "proficiency": "CEFR A1"},
        "gehen": {"meanings": ["pergi", "berjalan"], "pos": "VERB", "proficiency": "CEFR A1"},
        "essen": {"meanings": ["makan"], "pos": "VERB", "proficiency": "CEFR A1"},
        "trinken": {"meanings": ["minum"], "pos": "VERB", "proficiency": "CEFR A1"},
        "Buch": {"meanings": ["buku"], "pos": "NOUN", "gender": "neuter", "proficiency": "CEFR A1"},
        "Mann": {"meanings": ["pria", "laki-laki"], "pos": "NOUN", "gender": "masculine", "proficiency": "CEFR A1"},
        "Frau": {"meanings": ["wanita", "perempuan"], "pos": "NOUN", "gender": "feminine", "proficiency": "CEFR A1"},
        "Kind": {"meanings": ["anak"], "pos": "NOUN", "gender": "neuter", "proficiency": "CEFR A1"},
        "gut": {"meanings": ["baik", "bagus"], "pos": "ADJ", "proficiency": "CEFR A1"},
    },
    "id": {
        "makan": {"meanings": ["memasukkan makanan ke mulut"], "pos": "VERB"},
        "minum": {"meanings": ["memasukkan air ke tenggorokan"], "pos": "VERB"},
        "pergi": {"meanings": ["berangkat menuju suatu tempat"], "pos": "VERB"},
        "datang": {"meanings": ["sampai di tujuan"], "pos": "VERB"},
        "buku": {"meanings": ["lembar kertas berjilid"], "pos": "NOUN"},
        "baik": {"meanings": ["elok", "patut", "sehat"], "pos": "ADJ"},
        "memperbaiki": {"meanings": ["membetulkan", "mereparasi"], "pos": "VERB"},
    }
}


class DictionaryService:
    """
    Layanan kamus terpadu dengan penyimpanan cache SQLite.
    """
    _instance: Optional["DictionaryService"] = None

    def __init__(self, db_path: Optional[str] = None):
        if db_path is None:
            db_path = os.getenv("SQLITE_DB_PATH", "./cache/lingostream_dictionary.sqlite3")
        self.db_path = db_path
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        self._init_db()

    @classmethod
    def get_instance(cls) -> "DictionaryService":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _init_db(self) -> None:
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS word_cache (
                        target_lang TEXT NOT NULL,
                        word TEXT NOT NULL,
                        native_lang TEXT NOT NULL,
                        meaning TEXT NOT NULL,
                        pos TEXT,
                        proficiency_tag TEXT,
                        PRIMARY KEY (target_lang, word, native_lang)
                    )
                """)
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS sentence_translation_cache (
                        source_lang TEXT NOT NULL,
                        target_lang TEXT NOT NULL,
                        original_text TEXT NOT NULL,
                        translated_text TEXT NOT NULL,
                        PRIMARY KEY (source_lang, target_lang, original_text)
                    )
                """)
                conn.commit()
        except Exception as e:
            logger.warning("Gagal menginisialisasi SQLite dictionary cache: %s", e)

    def lookup(self, word: str, target_lang: str, native_lang: str = "id") -> Dict[str, Any]:
        """
        Mencari definisi kata: Offline Core -> Cache SQLite -> Deep-Translator Fallback.
        """
        clean_word = word.strip()
        if not clean_word:
            return {"meanings": [], "pos": "OTHER", "proficiency_tag": None}

        # 1. Periksa kamus inti offline
        lang_dict = CORE_DICTIONARY.get(target_lang, {})
        if clean_word in lang_dict:
            entry = lang_dict[clean_word]
            return {
                "meanings": entry.get("meanings", []),
                "pos": entry.get("pos", "OTHER"),
                "proficiency_tag": entry.get("proficiency"),
                "root": entry.get("root"),
                "gender": entry.get("gender"),
            }

        # 2. Periksa cache SQLite
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "SELECT meaning, pos, proficiency_tag FROM word_cache WHERE target_lang=? AND word=? AND native_lang=?",
                    (target_lang, clean_word, native_lang)
                )
                row = cursor.fetchone()
                if row:
                    meanings = [m.strip() for m in row[0].split(";") if m.strip()]
                    return {
                        "meanings": meanings,
                        "pos": row[1] or "OTHER",
                        "proficiency_tag": row[2]
                    }
        except Exception as e:
            logger.debug("Error saat membaca SQLite word cache: %s", e)

        # 3. Fallback deep-translator
        translated_meaning = self._translate_online(clean_word, target_lang, native_lang)
        if translated_meaning:
            self._save_to_cache(target_lang, clean_word, native_lang, translated_meaning)
            return {
                "meanings": [translated_meaning],
                "pos": "OTHER",
                "proficiency_tag": None
            }

        return {"meanings": [], "pos": "OTHER", "proficiency_tag": None}

    def _save_to_cache(self, target_lang: str, word: str, native_lang: str, meaning: str, pos: Optional[str] = None, tag: Optional[str] = None) -> None:
        try:
            with sqlite3.connect(self.db_path, timeout=10.0) as conn:
                cursor = conn.cursor()
                cursor.execute(
                    """
                    INSERT OR REPLACE INTO word_cache (target_lang, word, native_lang, meaning, pos, proficiency_tag)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    (target_lang, word, native_lang, meaning, pos, tag)
                )
                conn.commit()
        except Exception as e:
            logger.debug("Error saat menyimpan ke SQLite word cache: %s", e)

    def _translate_online(self, text: str, source_lang: str, target_lang: str) -> Optional[str]:
        clean = text.strip()
        if not clean:
            return None

        # Lapisan 1: Google Translate single endpoint dengan User-Agent & timeout ketat
        try:
            src = "zh-CN" if source_lang == "zh" else source_lang
            url = "https://translate.googleapis.com/translate_a/single"
            params = {"client": "gtx", "sl": src, "tl": target_lang, "dt": "t", "q": clean}
            headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
            r = requests.get(url, params=params, headers=headers, timeout=2.5)
            if r.status_code == 200:
                data = r.json()
                if data and isinstance(data, list) and data[0]:
                    parts = [p[0] for p in data[0] if p and p[0]]
                    if parts:
                        return "".join(parts).strip()
        except Exception as e:
            logger.debug("Google GTX gagal untuk '%s': %s", clean, e)

        # Lapisan 2: MyMemory API dengan timeout 3.0s
        try:
            lang_map = {
                "ja": "ja-JP", "id": "id-ID", "zh": "zh-CN", "ko": "ko-KR",
                "ar": "ar-SA", "th": "th-TH", "ru": "ru-RU", "en": "en-US",
                "es": "es-ES", "fr": "fr-FR", "de": "de-DE",
            }
            s_code = lang_map.get(source_lang, source_lang)
            t_code = lang_map.get(target_lang, target_lang)
            url = "https://api.mymemory.translated.net/get"
            r = requests.get(url, params={"q": clean, "langpair": f"{s_code}|{t_code}"}, timeout=3.0)
            if r.status_code == 200:
                data = r.json()
                res = data.get("responseData", {}).get("translatedText")
                if res and not res.startswith("MYMEMORY WARNING"):
                    return res.strip()
        except Exception as e:
            logger.debug("MyMemory API gagal untuk '%s': %s", clean, e)

        # Lapisan 3: deep-translator fallback
        try:
            from deep_translator import GoogleTranslator
            src = "zh-CN" if source_lang == "zh" else source_lang
            translated = GoogleTranslator(source=src, target=target_lang).translate(clean)
            return translated.strip() if translated else None
        except Exception as e:
            logger.debug("Deep-translator gagal untuk '%s': %s", clean, e)

        return None

    def translate_sentence(self, sentence: str, source_lang: str, target_lang: str = "id") -> str:
        """
        Menerjemahkan kalimat utuh dengan dukungan cache SQLite dan timeout aman.
        """
        clean_text = sentence.strip()
        if not clean_text:
            return ""

        # Periksa cache SQLite
        try:
            with sqlite3.connect(self.db_path, timeout=10.0) as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "SELECT translated_text FROM sentence_translation_cache WHERE source_lang=? AND target_lang=? AND original_text=?",
                    (source_lang, target_lang, clean_text)
                )
                row = cursor.fetchone()
                if row and row[0]:
                    return row[0]
        except Exception as e:
            logger.debug("Error membaca cache kalimat: %s", e)

        # Terjemahkan daring secara aman
        translated = self._translate_online(clean_text, source_lang, target_lang)
        if translated:
            try:
                with sqlite3.connect(self.db_path, timeout=10.0) as conn:
                    cursor = conn.cursor()
                    cursor.execute(
                        "INSERT OR REPLACE INTO sentence_translation_cache VALUES (?, ?, ?, ?)",
                        (source_lang, target_lang, clean_text, translated)
                    )
                    conn.commit()
            except Exception as e:
                logger.debug("Error menyimpan cache kalimat: %s", e)
            return translated

        return ""

    def get_sentence_cache(self, source_lang: str, target_lang: str, original_text: str) -> Optional[str]:
        """Membaca terjemahan kalimat langsung dari SQLite cache tanpa memicu panggilan online."""
        clean_text = original_text.strip()
        if not clean_text:
            return None
        try:
            with sqlite3.connect(self.db_path, timeout=10.0) as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "SELECT translated_text FROM sentence_translation_cache WHERE source_lang=? AND target_lang=? AND original_text=?",
                    (source_lang, target_lang, clean_text)
                )
                row = cursor.fetchone()
                if row and row[0]:
                    return row[0]
        except Exception as e:
            logger.debug("Error membaca cache kalimat: %s", e)
        return None

    def save_sentence_cache(self, source_lang: str, target_lang: str, original_text: str, translated_text: str) -> None:
        """Menyimpan terjemahan kalimat langsung ke database SQLite cache."""
        clean_orig = original_text.strip()
        clean_trans = translated_text.strip()
        if not clean_orig or not clean_trans:
            return
        try:
            with sqlite3.connect(self.db_path, timeout=10.0) as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "INSERT OR REPLACE INTO sentence_translation_cache VALUES (?, ?, ?, ?)",
                    (source_lang, target_lang, clean_orig, clean_trans)
                )
                conn.commit()
        except Exception as e:
            logger.debug("Error menyimpan cache kalimat: %s", e)
