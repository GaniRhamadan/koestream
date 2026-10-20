"""
LingoStream Universal - Fondasi Mesin Linguistik & Algoritma Penyejajaran DP
Menyediakan kelas dasar BaseNLPEngine, pemeriksaan rentang Unicode aksara dunia,
dan algoritma DP (Dynamic Programming) untuk Okurigana Alignment (furigana hanya di atas kanji).
"""

from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Tuple
from app.schemas import UniversalToken, DisplayPart


def is_kanji(ch: str) -> bool:
    """Memeriksa apakah satu karakter adalah Kanji / CJK Ideograph."""
    if not ch:
        return False
    cp = ord(ch[0])
    return (
        (0x4E00 <= cp <= 0x9FFF) or   # CJK Unified Ideographs
        (0x3400 <= cp <= 0x4DBF) or   # CJK Extension A
        (0xF900 <= cp <= 0xFAFF)      # CJK Compatibility Ideographs
    )


def is_han(ch: str) -> bool:
    """Sinonim untuk is_kanji (aksara Han / Hanzi)."""
    return is_kanji(ch)


def is_hiragana(ch: str) -> bool:
    """Memeriksa apakah satu karakter adalah Hiragana."""
    if not ch:
        return False
    cp = ord(ch[0])
    return 0x3040 <= cp <= 0x309F


def is_katakana(ch: str) -> bool:
    """Memeriksa apakah satu karakter adalah Katakana."""
    if not ch:
        return False
    cp = ord(ch[0])
    return 0x30A0 <= cp <= 0x30FF


def is_hangul(ch: str) -> bool:
    """Memeriksa apakah satu karakter adalah aksara Hangul Korea (Syllable / Jamo)."""
    if not ch:
        return False
    cp = ord(ch[0])
    return (
        (0xAC00 <= cp <= 0xD7AF) or  # Hangul Syllables
        (0x1100 <= cp <= 0x11FF) or  # Hangul Jamo
        (0x3130 <= cp <= 0x318F)      # Compatibility Jamo
    )


def is_arabic(ch: str) -> bool:
    """Memeriksa apakah satu karakter adalah aksara Arab."""
    if not ch:
        return False
    cp = ord(ch[0])
    return (
        (0x0600 <= cp <= 0x06FF) or  # Arabic
        (0x0750 <= cp <= 0x077F) or  # Arabic Supplement
        (0x08A0 <= cp <= 0x08FF) or  # Arabic Extended-A
        (0xFB50 <= cp <= 0xFDFF) or  # Arabic Presentation Forms-A
        (0xFE70 <= cp <= 0xFEFF)     # Arabic Presentation Forms-B
    )


def is_thai(ch: str) -> bool:
    """Memeriksa apakah satu karakter adalah aksara Thai."""
    if not ch:
        return False
    cp = ord(ch[0])
    return 0x0E00 <= cp <= 0x0E7F


def katakana_to_hiragana(text: str) -> str:
    """Mengubah teks Katakana menjadi Hiragana."""
    chars = []
    for ch in text:
        cp = ord(ch)
        if 0x30A1 <= cp <= 0x30F6:
            chars.append(chr(cp - 0x60))
        else:
            chars.append(ch)
    return "".join(chars)


def hiragana_to_katakana(text: str) -> str:
    """Mengubah teks Hiragana menjadi Katakana."""
    chars = []
    for ch in text:
        cp = ord(ch)
        if 0x3041 <= cp <= 0x3096:
            chars.append(chr(cp + 0x60))
        else:
            chars.append(ch)
    return "".join(chars)


def align_okurigana_dp(surface: str, reading_hira: str) -> List[DisplayPart]:
    """
    Algoritma Penyejajaran Okurigana Berbasis Dynamic Programming & Backtracking.
    Memetakan kata permukaan yang bercampur kanji dan kana (seperti 振り返る, 食べる, 引き出し, 取り扱い, お願い)
    secara presisi sehingga furigana HANYA muncul tepat di atas blok kanji yang relevan.
    
    Contoh:
    - 食べる (たべる) -> [DisplayPart(text='食', ruby='た'), DisplayPart(text='べる', ruby=None)]
    - 振り返る (ふりかえる) -> [
        DisplayPart(text='振', ruby='ふ'),
        DisplayPart(text='り', ruby=None),
        DisplayPart(text='返', ruby='かえ'),
        DisplayPart(text='る', ruby=None)
      ]
    - お願い (おねがい) -> [
        DisplayPart(text='お', ruby=None),
        DisplayPart(text='願', ruby='ねが'),
        DisplayPart(text='い', ruby=None)
      ]
    """
    if not surface:
        return []
    
    # Normalisasi cara baca ke hiragana
    reading = katakana_to_hiragana(reading_hira)
    
    # Jika tidak ada kanji sama sekali, kembalikan tanpa ruby
    has_kanji_char = any(is_kanji(ch) for ch in surface)
    if not has_kanji_char:
        return [DisplayPart(text=surface, ruby=None)]
    
    # Pisahkan surface menjadi blok-blok bertipe seragam (KANJI vs NON_KANJI)
    blocks: List[Tuple[bool, str]] = []  # (is_kanji_block, text)
    curr_is_kanji = is_kanji(surface[0])
    curr_chars = [surface[0]]
    
    for ch in surface[1:]:
        ch_k = is_kanji(ch)
        if ch_k == curr_is_kanji:
            curr_chars.append(ch)
        else:
            blocks.append((curr_is_kanji, "".join(curr_chars)))
            curr_is_kanji = ch_k
            curr_chars = [ch]
    blocks.append((curr_is_kanji, "".join(curr_chars)))
    
    # Backtracking DP untuk mencocokkan blok-blok dengan string reading
    num_blocks = len(blocks)
    
    def solve(block_idx: int, read_pos: int) -> Optional[List[DisplayPart]]:
        if block_idx == num_blocks:
            return [] if read_pos == len(reading) else None
        
        is_k, block_text = blocks[block_idx]
        
        if not is_k:
            # Blok kana / non-kanji: harus cocok persis dengan karakter pembacaan
            expected = katakana_to_hiragana(block_text)
            n_exp = len(expected)
            if reading[read_pos:read_pos + n_exp] == expected:
                sub = solve(block_idx + 1, read_pos + n_exp)
                if sub is not None:
                    return [DisplayPart(text=block_text, ruby=None)] + sub
            return None
        else:
            # Blok kanji: dapat mengonsumsi 1 hingga sisa pembacaan
            # Prioritaskan panjang wajar (minimal 1 mora per kanji)
            min_consume = len(block_text)
            max_consume = len(reading) - (num_blocks - 1 - block_idx)
            
            for consume in range(min_consume, max_consume + 1):
                ruby_part = reading[read_pos:read_pos + consume]
                sub = solve(block_idx + 1, read_pos + consume)
                if sub is not None:
                    return [DisplayPart(text=block_text, ruby=ruby_part)] + sub
            
            # Jika rentang ketat tidak cocok (misalnya singkatan), coba konsumsi minimal 1
            if min_consume > 1:
                for consume in range(1, min_consume):
                    ruby_part = reading[read_pos:read_pos + consume]
                    sub = solve(block_idx + 1, read_pos + consume)
                    if sub is not None:
                        return [DisplayPart(text=block_text, ruby=ruby_part)] + sub
            
            return None
    
    matched = solve(0, 0)
    if matched:
        return matched
    
    # Fallback jika penyejajaran pembacaan terurai tidak sinkron 100%:
    # Pasang seluruh reading di atas seluruh surface kanji
    return [DisplayPart(text=surface, ruby=reading)]


class BaseNLPEngine(ABC):
    """
    Antarmuka abstrak standar untuk semua mesin linguistik per bahasa.
    """
    
    @abstractmethod
    def analyze(self, text: str, native_lang: str = "id") -> List[UniversalToken]:
        """
        Menganalisis kalimat mentah menjadi daftar UniversalToken yang terstandarisasi.
        """
        pass
    
    @abstractmethod
    def get_engine_info(self) -> Dict[str, str]:
        """
        Mengembalikan informasi pustaka dan model yang digunakan oleh engine ini.
        """
        pass
