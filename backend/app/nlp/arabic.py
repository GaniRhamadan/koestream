"""
LingoStream Universal - Mesin Linguistik Bahasa Arab (ar)
Fitur:
1. Dukungan Arah Teks Right-to-Left (RTL).
2. Auto-Tashkeel (Vokalisasi harakat) via Mishkal / CAMeL Tools jika tersedia.
   Jika tidak terpasang, teks dipertahankan apa adanya dan engine_used['tashkeel']='none' (tidak memalsukan harakat).
3. Ekstraksi Akar Tiga Huruf (Triliteral Root) dan pengupasan klitik (ال, و, ب, ل, ك, ف).
4. Transliterasi Fonetik ALA-LC / Buckwalter.
"""

import logging
import re
from typing import List, Dict, Optional, Tuple, Any
from app.nlp.base import BaseNLPEngine, is_arabic
from app.schemas import UniversalToken, DisplayPart
from app.dictionary import DictionaryService

logger = logging.getLogger(__name__)

# Coba periksa ketersediaan pustaka Tashkeel
_MISHKAL = None
HAS_MISHKAL = False
try:
    import importlib
    mishkal_tashkeel = importlib.import_module("mishkal.tashkeel")
    tashkeel_cls = getattr(mishkal_tashkeel, "TashkeelClass", None)
    if tashkeel_cls is not None:
        _MISHKAL = tashkeel_cls()
        HAS_MISHKAL = True
except Exception:
    _MISHKAL = None
    HAS_MISHKAL = False

# Pemetaan transliterasi Buckwalter standar
BUCKWALTER_MAP = {
    'ا': 'a', 'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j', 'ح': 'h', 'خ': 'kh',
    'د': 'd', 'ذ': 'dh', 'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh', 'ص': 's',
    'ض': 'd', 'ط': 't', 'ظ': 'z', 'ع': "'", 'غ': 'gh', 'ف': 'f', 'ق': 'q',
    'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n', 'ه': 'h', 'و': 'w', 'ي': 'y',
    'ة': 'h', 'ى': 'a', 'ء': "'", 'ئ': "'", 'ؤ': "'", 'إ': 'i', 'أ': 'a',
    'آ': 'aa', 'َ': 'a', 'ِ': 'i', 'ُ': 'u', 'ً': 'an', 'ٍ': 'in', 'ٌ': 'un',
    'ْ': '', 'ّ': '',
}

# Kamus akar kata Arab umum frekuensi tinggi
KNOWN_ARABIC_ROOTS: Dict[str, Tuple[str, str, str]] = {
    # kata: (lemma, root, pos)
    "كتاب": ("كتاب", "كتب", "NOUN"),
    "الكتاب": ("كتاب", "كتب", "NOUN"),
    "كتب": ("كتب", "كتب", "VERB"),
    "كاتب": ("كاتب", "كتب", "NOUN"),
    "مكتوب": ("مكتوب", "كتب", "NOUN"),
    "مكتبة": ("مكتبة", "كتب", "NOUN"),
    "مكتب": ("مكتب", "كتب", "NOUN"),
    "درس": ("درس", "درس", "VERB"),
    "مدرسة": ("مدرسة", "درس", "NOUN"),
    "مدرس": ("مدرس", "درس", "NOUN"),
    "طالب": ("طالب", "طلب", "NOUN"),
    "سلام": ("سلام", "سلم", "NOUN"),
    "مسلم": ("مسلم", "سلم", "NOUN"),
    "إسلام": ("إسلام", "سلم", "NOUN"),
    "كبير": ("كبير", "كبر", "ADJ"),
    "صغير": ("صغير", "صغر", "ADJ"),
    "جميل": ("جميل", "جمل", "ADJ"),
    "أنا": ("أنا", "", "PRON"),
    "أنت": ("أنت", "", "PRON"),
    "هو": ("هو", "", "PRON"),
    "هي": ("هي", "", "PRON"),
    "نحن": ("نحن", "", "PRON"),
    "في": ("في", "", "ADP"),
    "من": ("من", "", "ADP"),
    "إلى": ("إلى", "", "ADP"),
    "على": ("على", "", "ADP"),
}


def arabic_to_translit(arabic_text: str) -> str:
    """Mengubah teks Arab menjadi transliterasi latin yang mudah dibaca."""
    res = []
    for ch in arabic_text:
        res.append(BUCKWALTER_MAP.get(ch, ch))
    return "".join(res)


def extract_arabic_root_rule(word: str) -> Tuple[str, Optional[str]]:
    """
    Ekstraksi akar kata 3 huruf dengan mengupas klitik awalan/akhiran umum.
    Mengembalikan (lemma, root).
    """
    clean = re.sub(r'[\u064B-\u065F\u0670]', '', word)  # buang harakat untuk analisis akar
    
    # 1. Periksa tabel leksikon
    if clean in KNOWN_ARABIC_ROOTS:
        lem, rt, _ = KNOWN_ARABIC_ROOTS[clean]
        return lem, (rt if rt else None)
    
    # 2. Pengupasan klitik awalan (ال, و, ف, ب, ك, ل)
    stem = clean
    if stem.startswith("ال") and len(stem) > 4:
        stem = stem[2:]
    elif (stem.startswith("و") or stem.startswith("ف")) and len(stem) > 3:
        stem = stem[1:]
        if stem.startswith("ال") and len(stem) > 4:
            stem = stem[2:]
    
    # Periksa leksikon setelah pengupasan awalan
    if stem in KNOWN_ARABIC_ROOTS:
        lem, rt, _ = KNOWN_ARABIC_ROOTS[stem]
        return lem, (rt if rt else None)

    # 3. Pola wazan sederhana (مَفْعُول, مَفْعَل, فَاعِل, فَعِيل)
    if len(stem) == 4 and stem.startswith("م"):
        # e.g., مكتب -> كتب
        candidate_root = stem[1:]
        return stem, candidate_root
    elif len(stem) == 4 and stem[1] == "ا":
        # e.g., كاتب -> كتب
        candidate_root = stem[0] + stem[2:]
        return stem, candidate_root
    elif len(stem) == 4 and stem[2] == "ي":
        # e.g., كبير -> كبر
        candidate_root = stem[:2] + stem[3:]
        return stem, candidate_root
    elif len(stem) == 3:
        return stem, stem

    return stem, None


class ArabicNLPEngine(BaseNLPEngine):
    """
    Mesin Linguistik Bahasa Arab dengan Vokalisasi dan Morfologi Akar Kata.
    """

    def __init__(self):
        self.dict_service = DictionaryService.get_instance()

    def get_engine_info(self) -> Dict[str, str]:
        tashkeel_engine = "mishkal" if HAS_MISHKAL else "none"
        return {
            "tashkeel": tashkeel_engine,
            "root_extraction": "morphological_rule_stripping",
            "direction": "rtl",
        }

    def _vocalize(self, text: str) -> str:
        """Menambahkan harakat pada teks gundul jika pustaka tersedia."""
        if HAS_MISHKAL and _MISHKAL is not None:
            try:
                return _MISHKAL.tashkeel(text)
            except Exception as e:
                logger.debug("Mishkal error: %s", e)
        return text

    def analyze(self, text: str, native_lang: str = "id") -> List[UniversalToken]:
        tokens: List[UniversalToken] = []
        clean_text = text.strip()
        if not clean_text:
            return tokens

        # 1. Tashkeel jika tersedia
        vocalized_sentence = self._vocalize(clean_text)

        # 2. Tokenisasi kata
        vocalized_words = vocalized_sentence.split()
        original_words = clean_text.split()
        
        token_id_counter = 0
        for idx, w_orig in enumerate(original_words):
            w_voc = vocalized_words[idx] if idx < len(vocalized_words) else w_orig

            lemma, root = extract_arabic_root_rule(w_orig)
            
            # Tentukan POS
            pos = "NOUN"
            clean_w = re.sub(r'[\u064B-\u065F\u0670]', '', w_orig)
            if clean_w in KNOWN_ARABIC_ROOTS:
                pos = KNOWN_ARABIC_ROOTS[clean_w][2]
            elif clean_w in ["في", "من", "إلى", "على", "عن", "مع", "حتى", "ب", "ل"]:
                pos = "ADP"
            elif clean_w in ["و", "ثم", "أو", "لكن"]:
                pos = "CONJ"
            elif clean_w in ["أنا", "أنت", "هو", "هي", "نحن", "هم", "هن"]:
                pos = "PRON"

            translit_written = arabic_to_translit(w_orig)
            translit_pronounced = arabic_to_translit(w_voc)

            rule_note: Optional[str] = None
            if root:
                rule_note = f"Akar kata triliteral: [{root}]"

            # Di UI RTL, display_part membawa teks Arab
            display_parts = [DisplayPart(text=w_orig, ruby=None)]

            # Lookup arti kata
            word_info = self.dict_service.lookup(lemma, "ar", native_lang)
            if not word_info["meanings"]:
                word_info = self.dict_service.lookup(clean_w, "ar", native_lang)

            tokens.append(UniversalToken(
                token_id=token_id_counter,
                surface=w_orig,
                display_parts=display_parts,
                phonetic_script=translit_written,
                pronounced_as=translit_pronounced,
                orthographic_rule_note=rule_note,
                lemma=lemma,
                pos=pos,
                root=root,
                meanings=word_info.get("meanings", []),
                linked_token_ids=[]
            ))
            token_id_counter += 1

        return tokens
