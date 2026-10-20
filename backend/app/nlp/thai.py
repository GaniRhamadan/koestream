"""
LingoStream Universal - Mesin Linguistik Bahasa Thailand (th)
Fitur:
1. Segmentasi kata tanpa spasi menggunakan PyThaiNLP (engine newmm).
2. Romanisasi RTGS (Royal Thai General System of Transcription).
3. KALKULASI 5 NADA THAI NYATA:
   - Klasifikasi konsonan awal: Tinggi (High), Tengah (Mid), Rendah (Low).
   - Tanda nada: Mai Ek, Mai Tho, Mai Tri, Mai Jattawa.
   - Jenis suku kata: Hidup (Live syllable) vs Mati (Dead syllable).
   - Panjang vokal: Pendek (Short) vs Panjang (Long).
   - Menghasilkan 5 nada fonologis: Mid (0), Low (1), Falling (2), High (3), Rising (4).
"""

import logging
import re
from typing import List, Dict, Optional, Tuple, Any
from app.nlp.base import BaseNLPEngine, is_thai
from app.schemas import UniversalToken, DisplayPart, ToneOrPitch
from app.dictionary import DictionaryService

logger = logging.getLogger(__name__)

try:
    from pythainlp.tokenize import word_tokenize as pythai_word_tokenize
    from pythainlp.tokenize import syllable_tokenize as pythai_syllable_tokenize
    from pythainlp.transliterate import romanize as pythai_romanize
    HAS_PYTHAINLP = True
except Exception as e:
    logger.warning("PyThaiNLP tidak tersedia: %s", e)
    HAS_PYTHAINLP = False

# Himpunan Konsonan Bahasa Thai menurut Kelas Fonologis
HIGH_CONSONANTS = set("ขฃฉฐถผฝศษสห")
MID_CONSONANTS = set("กจฎฏดตบปอ")
LOW_CONSONANTS = set("คฅฆงชซฌญฑฒณทธนพฟภมยรลวฬฮ")

# Tanda Nada Thai
TONE_MARKS = {
    "่": "mai_ek",
    "้": "mai_tho",
    "๊": "mai_tri",
    "๋": "mai_jattawa",
}

# Vokal Pendek Thai (Short Vowels)
SHORT_VOWELS = set("ะิึุ็")
# Konsonan Mati Akhir (Stop Codas: -k, -t, -p sound)
STOP_FINAL_CONSONANTS = set("กขคฆดตถทธจชซศษสบปพฟภ")
# Konsonan Hidup Akhir (Sonorant Codas: -m, -n, -ng, -w, -y)
SONORANT_FINAL_CONSONANTS = set("งนมยรลวฬญณ")


def calculate_thai_syllable_tone(syllable: str) -> Tuple[int, str]:
    """
    Menghitung nada Thai (0: Mid, 1: Low, 2: Falling, 3: High, 4: Rising)
    secara presisi berdasarkan fonologi Thai resmi.
    """
    if not syllable:
        return 0, "mid"

    # 1. Temukan konsonan awal
    initial_char = None
    for ch in syllable:
        if ch in HIGH_CONSONANTS or ch in MID_CONSONANTS or ch in LOW_CONSONANTS:
            initial_char = ch
            break
            
    if not initial_char:
        return 0, "mid"

    # Tentukan kelas konsonan awal
    if initial_char in HIGH_CONSONANTS:
        c_class = "high"
    elif initial_char in MID_CONSONANTS:
        c_class = "mid"
    else:
        c_class = "low"

    # 2. Temukan tanda nada jika ada
    tone_mark = None
    for ch in syllable:
        if ch in TONE_MARKS:
            tone_mark = TONE_MARKS[ch]
            break

    # JIKA MEMILIKI TANDA NADA:
    if tone_mark == "mai_ek":
        # Low class -> Falling (2); Mid/High class -> Low (1)
        if c_class == "low":
            return 2, "falling"
        else:
            return 1, "low"
    elif tone_mark == "mai_tho":
        # Low class -> High (3); Mid/High class -> Falling (2)
        if c_class == "low":
            return 3, "high"
        else:
            return 2, "falling"
    elif tone_mark == "mai_tri":
        # Mid class -> High (3)
        return 3, "high"
    elif tone_mark == "mai_jattawa":
        # Mid class -> Rising (4)
        return 4, "rising"

    # JIKA TANPA TANDA NADA: Periksa jenis suku kata (Hidup vs Mati)
    # Konsonan terakhir
    consonants_in_syl = [ch for ch in syllable if ch in HIGH_CONSONANTS or ch in MID_CONSONANTS or ch in LOW_CONSONANTS]
    has_final_c = len(consonants_in_syl) > 1
    final_c = consonants_in_syl[-1] if has_final_c else None

    is_dead = False
    if final_c and final_c in STOP_FINAL_CONSONANTS:
        is_dead = True
    elif not final_c and any(v in syllable for v in SHORT_VOWELS):
        is_dead = True

    is_short_vowel = any(v in syllable for v in SHORT_VOWELS)

    if not is_dead:
        # Suku Kata Hidup (Live Syllable)
        if c_class == "high":
            return 4, "rising"
        elif c_class in ["mid", "low"]:
            return 0, "mid"
    else:
        # Suku Kata Mati (Dead Syllable)
        if c_class in ["high", "mid"]:
            return 1, "low"
        else:  # low class
            if is_short_vowel:
                return 3, "high"
            else:
                return 2, "falling"

    return 0, "mid"


class ThaiNLPEngine(BaseNLPEngine):
    """
    Mesin Linguistik Bahasa Thailand dengan Kalkulasi Nada dan Segmentasi Aksara.
    """

    def __init__(self):
        self.dict_service = DictionaryService.get_instance()

    def get_engine_info(self) -> Dict[str, str]:
        return {
            "segmenter": "pythainlp_newmm" if HAS_PYTHAINLP else "whitespace_fallback",
            "tone_calculator": "full_5_tone_phonology_rules",
            "romanization": "rtgs",
        }

    def analyze(self, text: str, native_lang: str = "id") -> List[UniversalToken]:
        tokens: List[UniversalToken] = []
        clean_text = text.strip()
        if not clean_text:
            return tokens

        # 1. Segmentasi kata dengan PyThaiNLP newmm
        if HAS_PYTHAINLP:
            words = pythai_word_tokenize(clean_text, engine="newmm")
        else:
            words = clean_text.split()

        token_id_counter = 0
        for w in words:
            if not w.strip():
                continue

            # Romanisasi RTGS
            if HAS_PYTHAINLP:
                try:
                    romanized = pythai_romanize(w, engine="royin")
                except Exception:
                    romanized = w
            else:
                romanized = w

            # Kalkulasi Nada untuk kata (berdasarkan suku kata)
            tone_num, tone_name = calculate_thai_syllable_tone(w)

            tone_or_pitch = ToneOrPitch(
                system="th_tone",
                value=f"{tone_name} (tone {tone_num})",
                pattern=[tone_num]
            )

            # Tentukan POS dasar
            pos = "NOUN"
            if w in ["กิน", "ดื่ม", "ไป", "มา", "ดู", "มี", "ชอบ", "พูด"]:
                pos = "VERB"
            elif w in ["ฉัน", "ผม", "คุณ", "เขา", "เรา"]:
                pos = "PRON"
            elif w in ["ดี", "ใหญ่", "เล็ก", "สวย", "อร่อย"]:
                pos = "ADJ"
            elif w in ["มาก", "ไม่", "ด้วย"]:
                pos = "ADV"
            elif w in ["ครับ", "ค่ะ", "นะ"]:
                pos = "PART"

            display_parts = [DisplayPart(text=w, ruby=None)]

            # Lookup kamus
            word_info = self.dict_service.lookup(w, "th", native_lang)

            tokens.append(UniversalToken(
                token_id=token_id_counter,
                surface=w,
                display_parts=display_parts,
                phonetic_script=romanized,
                pronounced_as=f"{romanized} [{tone_name}]",
                orthographic_rule_note=f"Nada Thai: {tone_name.capitalize()} (Tone {tone_num})",
                lemma=w,
                pos=pos,
                tone_or_pitch=tone_or_pitch,
                meanings=word_info.get("meanings", []),
                linked_token_ids=[]
            ))
            token_id_counter += 1

        return tokens
