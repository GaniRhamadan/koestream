"""
LingoStream Universal - Mesin Linguistik Bahasa Mandarin (zh)
Fitur:
1. Segmentasi kata dengan Jieba.
2. Pinyin bertanda nada via PyPinyin (per karakter dan per kata).
3. Aturan Tone Sandhi Lengkap:
   - 3+3 -> 2+3 (contoh: 你好 nǐ hǎo -> ní hǎo) serta rantai tiga nada-3.
   - 不 (bù) -> bú sebelum suku kata bernada ke-4.
   - 一 (yī) -> yí sebelum nada ke-4; yì sebelum nada 1, 2, 3; tetap yī pada nomor/akhir kata.
   - Nada netral pada partikel (了, 的, 吗, 呢).
4. Pemeriksaan nada asli suku kata berikutnya (bukan nada hasil sandhi).
5. Penggantian diakritik nada vokal yang presisi tanpa string-replace naif.
"""

import logging
import re
from typing import List, Dict, Optional, Tuple, Any
from app.nlp.base import BaseNLPEngine, is_han
from app.schemas import UniversalToken, DisplayPart, ToneOrPitch
from app.dictionary import DictionaryService

logger = logging.getLogger(__name__)

try:
    import jieba
    from pypinyin import pinyin, Style
    HAS_JIEBA_PYPINYIN = True
except Exception as e:
    logger.warning("Jieba/PyPinyin tidak tersedia: %s", e)
    HAS_JIEBA_PYPINYIN = False

# Kamus konversi diakritik nada pinyin untuk vokal Mandarin
TONE_DIACRITICS = {
    # a
    ("a", 1): "ā", ("a", 2): "á", ("a", 3): "ǎ", ("a", 4): "à", ("a", 5): "a",
    # e
    ("e", 1): "ē", ("e", 2): "é", ("e", 3): "ě", ("e", 4): "è", ("e", 5): "e",
    # i
    ("i", 1): "ī", ("i", 2): "í", ("i", 3): "ǐ", ("i", 4): "ì", ("i", 5): "i",
    # o
    ("o", 1): "ō", ("o", 2): "ó", ("o", 3): "ǒ", ("o", 4): "ò", ("o", 5): "o",
    # u
    ("u", 1): "ū", ("u", 2): "ú", ("u", 3): "ǔ", ("u", 4): "ù", ("u", 5): "u",
    # ü
    ("ü", 1): "ǖ", ("ü", 2): "ǘ", ("ü", 3): "ǚ", ("ü", 4): "ǜ", ("ü", 5): "ü",
    ("v", 1): "ǖ", ("v", 2): "ǘ", ("v", 3): "ǚ", ("v", 4): "ǜ", ("v", 5): "ü",
}

# Pemetaan dari karakter berdiakritik kembali ke vokal dasar + nomor nada
REVERSE_TONE_MAP = {
    "ā": ("a", 1), "á": ("a", 2), "ǎ": ("a", 3), "à": ("a", 4),
    "ē": ("e", 1), "é": ("e", 2), "ě": ("e", 3), "è": ("e", 4),
    "ī": ("i", 1), "í": ("i", 2), "ǐ": ("i", 3), "ì": ("i", 4),
    "ō": ("o", 1), "ó": ("o", 2), "ǒ": ("o", 3), "ò": ("o", 4),
    "ū": ("u", 1), "ú": ("u", 2), "ǔ": ("u", 3), "ù": ("u", 4),
    "ǖ": ("ü", 1), "ǘ": ("ü", 2), "ǚ": ("ü", 3), "ǜ": ("ü", 4),
}


def extract_tone_number(pinyin_syllable: str) -> int:
    """Mendeteksi nomor nada (1..4, atau 5 untuk netral) dari suku kata pinyin."""
    for ch in pinyin_syllable:
        if ch in REVERSE_TONE_MAP:
            return REVERSE_TONE_MAP[ch][1]
    return 5


def change_syllable_tone(pinyin_syllable: str, target_tone: int) -> str:
    """
    Mengubah nada suatu suku kata pinyin ke nomor nada tertentu (1..5)
    secara presisi pada vokal utama.
    """
    # Temukan vokal yang membawa diakritik nada saat ini
    found_char = None
    base_vowel = None
    for ch in pinyin_syllable:
        if ch in REVERSE_TONE_MAP:
            found_char = ch
            base_vowel, _ = REVERSE_TONE_MAP[ch]
            break
            
    if found_char and base_vowel:
        new_vowel = TONE_DIACRITICS.get((base_vowel, target_tone), base_vowel)
        return pinyin_syllable.replace(found_char, new_vowel, 1)

    # Jika suku kata sebelumnya bernada netral, cari vokal utama menurut aturan urutan pinyin (a, o, e, iu, ui)
    vowels = ["a", "o", "e", "ui", "iu", "u", "i", "ü", "v"]
    for v in vowels:
        if v in pinyin_syllable:
            target_v = v[-1] if len(v) > 1 else v
            new_vowel = TONE_DIACRITICS.get((target_v, target_tone), target_v)
            return pinyin_syllable.replace(target_v, new_vowel, 1)

    return pinyin_syllable


class ChineseNLPEngine(BaseNLPEngine):
    """
    Mesin Linguistik Bahasa Mandarin dengan Evaluasi Tone Sandhi yang Teliti.
    """

    def __init__(self):
        self.dict_service = DictionaryService.get_instance()

    def get_engine_info(self) -> Dict[str, str]:
        return {
            "segmenter": "jieba" if HAS_JIEBA_PYPINYIN else "char_fallback",
            "pinyin": "pypinyin" if HAS_JIEBA_PYPINYIN else "basic_pinyin",
            "tone_sandhi": "full_phonological_rules",
        }

    def _get_raw_syllables(self, text: str) -> List[Tuple[str, str, int]]:
        """
        Mengembalikan daftar (karakter, pinyin_tertulis, nada_asli) untuk setiap karakter.
        """
        if not HAS_JIEBA_PYPINYIN:
            # Fallback sederhana jika pypinyin tidak ada
            return [(ch, ch, 5) for ch in text]

        py_list = pinyin(text, style=Style.TONE, neutral_tone_with_five=False)
        result = []
        for ch, p_sub in zip(text, py_list):
            py_str = p_sub[0] if p_sub else ch
            tone_num = extract_tone_number(py_str)
            result.append((ch, py_str, tone_num))
        return result

    def analyze(self, text: str, native_lang: str = "id") -> List[UniversalToken]:
        tokens: List[UniversalToken] = []
        if not text.strip():
            return tokens

        # 1. Segmentasi kata dengan Jieba
        if HAS_JIEBA_PYPINYIN:
            words = [w for w in jieba.cut(text) if w.strip()]
        else:
            words = [ch for ch in text if ch.strip()]

        # 2. Dapatkan pinyin dan nada ASLI per karakter untuk seluruh kalimat
        # Ini krusial agar sandhi antar-kata memeriksa nada ASLI kata berikutnya!
        char_info = self._get_raw_syllables(text)
        
        # Buat pemetaan index karakter ke (char, raw_pinyin, raw_tone)
        char_map: Dict[int, Tuple[str, str, int]] = {}
        c_idx = 0
        for item in char_info:
            char_map[c_idx] = item
            c_idx += 1

        # 3. Telusuri tiap kata dan lakukan tone sandhi
        global_char_pos = 0
        token_id_counter = 0

        for w_idx, word in enumerate(words):
            word_len = len(word)
            word_chars = []
            word_raw_pinyins = []
            word_raw_tones = []

            for i in range(word_len):
                c_pos = global_char_pos + i
                if c_pos in char_map:
                    ch, r_py, r_tone = char_map[c_pos]
                else:
                    ch = word[i]
                    r_py = ch
                    r_tone = 5
                word_chars.append(ch)
                word_raw_pinyins.append(r_py)
                word_raw_tones.append(r_tone)

            # Buat salinan pinyin untuk lafal setelah sandhi
            pronounced_pinyins = list(word_raw_pinyins)
            rule_notes: List[str] = []

            # Terapkan Aturan Sandhi
            for i in range(word_len):
                ch = word_chars[i]
                curr_tone = word_raw_tones[i]
                
                # Cari nada ASLI karakter berikutnya (bisa di dalam kata ini atau di awal kata berikutnya)
                next_raw_tone: Optional[int] = None
                if i + 1 < word_len:
                    next_raw_tone = word_raw_tones[i + 1]
                else:
                    # Periksa karakter pertama kata berikutnya
                    next_pos = global_char_pos + word_len
                    # Lewati spasi/tanda baca jika ada
                    while next_pos < len(text) and text[next_pos].isspace():
                        next_pos += 1
                    if next_pos in char_map:
                        next_raw_tone = char_map[next_pos][2]

                # (a) Aturan Tone Sandhi 3+3 -> 2+3
                if curr_tone == 3 and next_raw_tone == 3:
                    pronounced_pinyins[i] = change_syllable_tone(pronounced_pinyins[i], 2)
                    rule_notes.append(f"Tone Sandhi 3+3 -> 2+3: {word_raw_pinyins[i]} -> {pronounced_pinyins[i]}")

                # (b) Aturan Sandhi 不 (bù -> bú di depan nada 4)
                if ch == "不":
                    if next_raw_tone == 4:
                        pronounced_pinyins[i] = change_syllable_tone(pronounced_pinyins[i], 2)
                        rule_notes.append("Tone Sandhi 不: bù -> bú sebelum nada 4")
                    else:
                        pronounced_pinyins[i] = change_syllable_tone(pronounced_pinyins[i], 4)

                # (c) Aturan Sandhi 一 (yī -> yí sebelum nada 4; yì sebelum nada 1, 2, 3)
                if ch == "一":
                    # Tetap yī bila sebagai angka ordinal atau di akhir
                    is_ordinal_or_end = (i == word_len - 1 and (next_raw_tone is None or next_raw_tone == 5))
                    if not is_ordinal_or_end and next_raw_tone is not None:
                        if next_raw_tone == 4:
                            pronounced_pinyins[i] = change_syllable_tone(pronounced_pinyins[i], 2)
                            rule_notes.append("Tone Sandhi 一: yī -> yí sebelum nada 4")
                        elif next_raw_tone in [1, 2, 3]:
                            pronounced_pinyins[i] = change_syllable_tone(pronounced_pinyins[i], 4)
                            rule_notes.append(f"Tone Sandhi 一: yī -> yì sebelum nada {next_raw_tone}")

                # (d) Nada netral untuk partikel umum
                if ch in ["了", "的", "吗", "呢"]:
                    pronounced_pinyins[i] = change_syllable_tone(pronounced_pinyins[i], 5)

            # Buat DisplayParts per karakter
            display_parts: List[DisplayPart] = []
            for ch, p_ruby in zip(word_chars, word_raw_pinyins):
                if is_han(ch):
                    display_parts.append(DisplayPart(text=ch, ruby=p_ruby))
                else:
                    display_parts.append(DisplayPart(text=ch, ruby=None))

            written_pinyin_str = " ".join(word_raw_pinyins)
            pronounced_pinyin_str = " ".join(pronounced_pinyins)
            orthographic_note = "; ".join(rule_notes) if rule_notes else None

            # Estimasi Universal POS
            pos = "NOUN"
            if word in ["是", "吃", "喝", "去", "来", "看", "说", "有"]:
                pos = "VERB"
            elif word in ["我", "你", "他", "她", "它", "我们", "你们"]:
                pos = "PRON"
            elif word in ["好", "大", "小", "多", "少", "高", "红"]:
                pos = "ADJ"
            elif word in ["不", "很", "非常", "也", "都"]:
                pos = "ADV"
            elif word in ["的", "了", "吗", "呢", "吧"]:
                pos = "PART"
            elif word in ["一", "二", "三", "四", "五", "十", "百"]:
                pos = "NUM"

            # Nada/Tone metadata
            first_tone = word_raw_tones[0] if word_raw_tones else 5
            tone_or_pitch = ToneOrPitch(
                system="zh_tone",
                value=f"tone{first_tone}",
                pattern=word_raw_tones
            )

            # Lookup kamus
            word_info = self.dict_service.lookup(word, "zh", native_lang)

            tokens.append(UniversalToken(
                token_id=token_id_counter,
                surface=word,
                display_parts=display_parts,
                phonetic_script=written_pinyin_str,
                pronounced_as=pronounced_pinyin_str,
                orthographic_rule_note=orthographic_note,
                lemma=word,
                pos=pos,
                tone_or_pitch=tone_or_pitch,
                proficiency_tag=word_info.get("proficiency_tag"),
                meanings=word_info.get("meanings", []),
                linked_token_ids=[]
            ))

            global_char_pos += word_len
            token_id_counter += 1

        return tokens
