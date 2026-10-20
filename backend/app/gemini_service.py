"""
LingoStream Universal - Layanan Google Gemini Cloud AI
Menyediakan akselerasi cloud bertenaga Gemini:
1. Speech-to-Text (ASR) Audio Multimodal dengan Word/Sentence Timestamps instan (< 30 detik untuk file besar).
2. Terjemahan Kontekstual Kalimat Dialog secara Paralel / Batch.
3. Penjelasan Tata Bahasa & Nuansa Budaya Alami (AI Grammar Tutor).
"""

import os
import json
import logging
import time
from typing import List, Dict, Optional, Any

logger = logging.getLogger(__name__)

def _load_env_file():
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    env_path = os.path.join(backend_dir, ".env")
    if os.path.exists(env_path):
        try:
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        k, v = k.strip(), v.strip()
                        if k and k not in os.environ:
                            os.environ[k] = v
        except Exception as ex:
            logger.debug("Gagal membaca .env: %s", ex)

_load_env_file()

# Coba impor google-genai
HAS_GEMINI_SDK = False
try:
    from google import genai
    from google.genai import types
    HAS_GEMINI_SDK = True
except Exception as e:
    logger.warning("google-genai SDK tidak tersedia: %s", e)


class GeminiService:
    _instance: Optional["GeminiService"] = None

    def __init__(self, api_key: Optional[str] = None, model_name: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY", "").strip()
        self.model_name = model_name or os.getenv("GEMINI_MODEL", "gemini-3.5-flash").strip()
        self.client = None
        if HAS_GEMINI_SDK and self.api_key:
            try:
                self.client = genai.Client(api_key=self.api_key)
                logger.info("GeminiService berhasil diinisialisasi dengan model: %s", self.model_name)
            except Exception as e:
                logger.error("Gagal menginisialisasi Google GenAI client: %s", e)
                self.client = None

    @classmethod
    def get_instance(cls) -> "GeminiService":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def is_available(self) -> bool:
        """Memeriksa apakah API Key Gemini aktif dan client siap digunakan."""
        return bool(HAS_GEMINI_SDK and self.client and self.api_key)

    def transcribe_audio_with_timestamps(
        self,
        audio_path: str,
        target_lang: str = "ja"
    ) -> Optional[List[Dict[str, Any]]]:
        """
        LAPISAN CLOUD ASR: Mengunggah file audio ke Google Cloud dan mentranskripsi dengan timestamp presisi.
        File audio di Google Cloud segera dihapus setelah selesai.
        """
        if not self.is_available():
            logger.info("Gemini API tidak aktif, melewati Gemini Cloud ASR")
            return None

        if not os.path.exists(audio_path):
            logger.warning("File audio tidak ditemukan di path: %s", audio_path)
            return None

        uploaded_file = None
        try:
            logger.info("Mengunggah audio ke Gemini File API (%s)...", audio_path)
            uploaded_file = self.client.files.upload(file=audio_path)
            logger.info("Audio berhasil diunggah ke Gemini: %s", uploaded_file.name)

            lang_names = {
                "ja": "Bahasa Jepang (Japanese)",
                "zh": "Bahasa Mandarin (Chinese)",
                "ko": "Bahasa Korea (Korean)",
                "ar": "Bahasa Arab (Arabic)",
                "th": "Bahasa Thailand (Thai)",
                "en": "Bahasa Inggris (English)",
                "de": "Bahasa Jerman (German)",
                "id": "Bahasa Indonesia (Indonesian)",
            }
            lang_label = lang_names.get(target_lang, target_lang)

            prompt = f"""
Dengarkan audio terlampir dan lakukan transkripsi dialog dalam {lang_label} secara presisi.
Bagi transkripsi menjadi segmen kalimat pendek dengan timestamp awal dan akhir dalam milidetik (ms).

KEMBALIKAN HANYA ARRAY JSON VALID tanpa markdown dan tanpa teks lain:
[
  {{
    "start_ms": 1200,
    "end_ms": 4500,
    "text": "Kalimat yang diucapkan dalam aksara asli"
  }}
]
"""
            logger.info("Menjalankan transkripsi Gemini multimodal audio (%s)...", self.model_name)
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=[uploaded_file, prompt],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.2,
                )
            )

            text_resp = response.text.strip()
            data = json.loads(text_resp)
            if isinstance(data, list) and len(data) > 0:
                results: List[Dict[str, Any]] = []
                for item in data:
                    txt = str(item.get("text", "")).strip()
                    if txt:
                        results.append({
                            "start_ms": int(item.get("start_ms", 0)),
                            "end_ms": int(item.get("end_ms", 0)),
                            "text": txt,
                        })
                logger.info("Gemini Cloud ASR BERHASIL: Menghasilkan %d segmen dialog!", len(results))
                return results

            logger.warning("Format respons Gemini ASR tidak sesuai: %s", text_resp[:100])
            return None

        except Exception as e:
            logger.error("Gagal melakukan transkripsi audio via Gemini: %s", e)
            return None
        finally:
            if uploaded_file and hasattr(self.client, "files"):
                try:
                    self.client.files.delete(name=uploaded_file.name)
                    logger.info("File audio sementara di Google Cloud berhasil dibersihkan")
                except Exception as del_err:
                    logger.debug("Gagal menghapus file dari Gemini Cloud: %s", del_err)

    def batch_translate(
        self,
        sentences: List[Dict[str, Any]],
        target_lang: str,
        native_lang: str = "id"
    ) -> Dict[int, str]:
        """
        Menerjemahkan kumpulan kalimat sekaligus dalam 1 request prompt Gemini dengan pemahaman konteks dialog.
        Menerima list: [{"index": 0, "text": "..."}]
        Mengembalikan dict: {0: "Terjemahan Indonesia", ...}
        """
        if not self.is_available() or not sentences:
            return {}

        candidate_models = [self.model_name, "gemini-3.8-flash", "gemini-flash-latest", "gemini-3.5-flash"]
        # Hilangkan duplikat sambil mempertahankan urutan
        models_to_try = list(dict.fromkeys([m for m in candidate_models if m]))

        items_json = json.dumps([{"id": s["index"], "text": s["text"]} for s in sentences], ensure_ascii=False)
        prompt = f"""
Anda adalah penerjemah profesional bahasa imersif dan lokalisasi anime/drama.
Terjemahkan kalimat-kalimat dialog percakapan berikut dari '{target_lang}' ke Bahasa Indonesia ('{native_lang}') secara alami, akurat, dan sesuai konteks adegan.
JANGAN menerjemahkan secara kaku atau harfiah per kata, melainkan gunakan bahasa Indonesia percakapan yang mengalir dan tepat.

Daftar kalimat:
{items_json}

KEMBALIKAN HANYA ARRAY JSON VALID:
[
  {{"id": 0, "translation": "Terjemahan alami yang tepat"}},
  ...
]
"""

        for model in models_to_try:
            try:
                response = self.client.models.generate_content(
                    model=model,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        temperature=0.3,
                    )
                )

                text_resp = response.text.strip()
                data = json.loads(text_resp)
                translations: Dict[int, str] = {}
                if isinstance(data, list):
                    for item in data:
                        item_id = item.get("id")
                        trans = item.get("translation", "").strip()
                        if item_id is not None and trans:
                            translations[int(item_id)] = trans
                logger.info("Gemini Batch Translate berhasil (%s) menerjemahkan %d kalimat", model, len(translations))
                return translations
            except Exception as e:
                logger.warning("Gemini batch translate gagal dengan model '%s': %s, mencoba model berikutnya...", model, e)

        logger.error("Seluruh model Gemini gagal untuk batch translate")
        return {}

    def explain_grammar_ai(
        self,
        sentence: str,
        target_lang: str,
        native_lang: str = "id"
    ) -> Optional[str]:
        """
        Menghasilkan penjelasan tata bahasa, nuansa budaya, dan penggunaan kata layaknya tutor bahasa pribadi.
        """
        if not self.is_available():
            return None

        try:
            prompt = f"""
Jelaskan tata bahasa kalimat berikut untuk seorang pembelajar bahasa.
Kalimat ({target_lang}): "{sentence}"
Bahasa penjelasan: {native_lang}

Berikan penjelasan ringkas, terstruktur, dan ramah:
1. Terjemahan alami dan konteks penggunaannya (sopan/santai/gaul).
2. Poin tata bahasa penting (fungsi partikel, konjugasi kata kerja, atau pola kalimat).
3. Nuansa budaya atau tips menghafalnya.
"""
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
            )
            return response.text.strip()
        except Exception as e:
            logger.error("Gemini explain grammar error: %s", e)
            return None
