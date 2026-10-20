"""
LingoStream Universal - Mesin Linguistik Bahasa Korea (ko)
Fitur:
1. Segmentasi morfem KiwiPiePy: memisahkan kata benda dari Josa (은/는, 이/가, 을/를, 에, 에서, dll.)
   dan batang kata kerja/sifat dari Eomi.
2. Penentuan Lemma kamus kata kerja/sifat (batang + 다).
3. Pelafalan nyata g2pk2 pada tingkat KALIMAT UTUH untuk mempertahankan asimilasi lintas-kata
   (liaison/연음, nasalisasi/비음화 seperti 독립 -> [동닙], palatalisasi/구개음화 seperti 같이 -> [가치]).
4. Penjajaran kembali pembacaan Hangul hasil g2pk ke tingkat token.
5. Transkripsi Revised Romanization (RR).
"""

import logging
import re
from typing import List, Dict, Optional, Tuple, Any
from app.nlp.base import BaseNLPEngine, is_hangul
from app.schemas import UniversalToken, DisplayPart
from app.dictionary import DictionaryService

logger = logging.getLogger(__name__)

# Coba muat KiwiPiePy
try:
    from kiwipiepy import Kiwi
    _KIWI = Kiwi()
    HAS_KIWI = True
except Exception as e:
    logger.warning("KiwiPiePy tidak tersedia: %s", e)
    _KIWI = None
    HAS_KIWI = False

# Coba muat g2pk2 atau g2pk dengan pengecekan aman (hindari subprocess pip install blocking jika mecab belum terpasang)
_G2P = None
HAS_G2P = False
try:
    import importlib.util
    if importlib.util.find_spec("mecab") is not None:
        from g2pk2 import G2p as G2p2
        _G2P = G2p2()
        HAS_G2P = True
    else:
        logger.info("mecab belum terpasang, menggunakan fallback aturan asimilasi leksikon untuk pelafalan Korea")
except Exception as e:
    logger.warning("g2pk2/g2pk tidak dapat diinisialisasi: %s", e)
    _G2P = None
    HAS_G2P = False

# Pemetaan tag POS Kiwi ke Universal POS
KIWI_TO_UPOS: Dict[str, str] = {
    "NNG": "NOUN",  # General Noun
    "NNP": "NOUN",  # Proper Noun
    "NNB": "NOUN",  # Bound Noun
    "NR": "NUM",    # Number
    "NP": "PRON",   # Pronoun
    "VV": "VERB",   # Verb
    "VA": "ADJ",    # Adjective
    "VX": "AUX",    # Auxiliary Verb
    "VCP": "AUX",   # Positive Copula (이다)
    "VCN": "AUX",   # Negative Copula (아니다)
    "MM": "DET",    # Determiner
    "MAG": "ADV",   # General Adverb
    "MAJ": "CONJ",  # Conjunctive Adverb
    "IC": "OTHER",  # Interjection
    "JKS": "PART",  # Subject Particle (이/가)
    "JKC": "PART",  # Complement Particle (이/가)
    "JKG": "PART",  # Genitive Particle (의)
    "JKO": "PART",  # Object Particle (을/를)
    "JKB": "PART",  # Adverbial Particle (에/에서/로)
    "JKV": "PART",  # Vocative Particle
    "JKQ": "PART",  # Quotative Particle
    "JX": "PART",   # Auxiliary Particle (은/는/도/만)
    "JC": "CONJ",   # Conjunctive Particle (와/과)
    "EP": "AUX",    # Pre-final ending
    "EF": "PART",   # Terminal ending
    "EC": "CONJ",   # Connecting ending
    "ETN": "OTHER", # Nominalizing ending
    "ETM": "OTHER", # Adnominal ending
    "SF": "PUNCT",  # Period, Question mark
    "SP": "PUNCT",  # Comma
    "SS": "PUNCT",  # Quotes
    "SE": "PUNCT",  # Ellipsis
    "SO": "PUNCT",  # Hyphen
    "SW": "PUNCT",  # Symbols
}

# Tabel fonetik Hangul untuk Romanisasi Standar (Revised Romanization)
CHOSUNG = ['g', 'kk', 'n', 'd', 'tt', 'r', 'm', 'b', 'pp', 's', 'ss', '', 'j', 'jj', 'ch', 'k', 't', 'p', 'h']
JUNGSUNG = ['a', 'ae', 'ya', 'yae', 'eo', 'e', 'yeo', 'ye', 'o', 'wa', 'wae', 'oe', 'yo', 'u', 'wo', 'we', 'wi', 'yu', 'eu', 'ui', 'i']
JONGSUNG = ['', 'k', 'k', 'ks', 'n', 'nj', 'nh', 't', 'l', 'lg', 'lm', 'lb', 'ls', 'lt', 'lp', 'lh', 'm', 'p', 'ps', 't', 't', 'ng', 't', 't', 'k', 't', 'p', 'h']


def hangul_to_rr(hangul_text: str) -> str:
    """Mengubah teks Hangul menjadi Romanisasi Standar Korea (RR)."""
    result = []
    for ch in hangul_text:
        cp = ord(ch)
        if 0xAC00 <= cp <= 0xD7AF:
            s_idx = cp - 0xAC00
            cho = s_idx // 588
            jung = (s_idx % 588) // 28
            jong = s_idx % 28
            syllable_rr = CHOSUNG[cho] + JUNGSUNG[jung] + JONGSUNG[jong]
            result.append(syllable_rr)
        else:
            result.append(ch)
    return "".join(result)


# Aturan asimilasi fonologis umum untuk fallback jika g2pk2 tidak ada
COMMON_PHONOLOGICAL_PAIRS = {
    "독립": ("동닙", "Asimilasi Nasalisasi (비음화): 독립 -> [동닙]"),
    "같이": ("가치", "Asimilasi Palatalisasi (구개음화): 같이 -> [가치]"),
    "국물": ("궁물", "Asimilasi Nasalisasi (비음화): 국물 -> [궁물]"),
    "십년": ("심년", "Asimilasi Nasalisasi (비음화): 십년 -> [심년]"),
    "굳이": ("구지", "Asimilasi Palatalisasi (구개음화): 굳이 -> [구지]"),
    "맞히다": ("마치다", "Aspirasi (격음화): 맞히다 -> [마치다]"),
    "맏이": ("마지", "Asimilasi Palatalisasi (구개음화): 맏이 -> [마지]"),
}


class KoreanNLPEngine(BaseNLPEngine):
    """
    Mesin Linguistik Bahasa Korea dengan Morfologi Kiwipiepy dan Fonologi Kalimat g2pk.
    """

    def __init__(self):
        self.dict_service = DictionaryService.get_instance()

    def get_engine_info(self) -> Dict[str, str]:
        return {
            "morphology": "kiwipiepy" if HAS_KIWI else "regex_fallback",
            "phonology": "g2pk2_sentence_level" if HAS_G2P else "lexicon_phonology",
            "romanization": "revised_romanization",
        }

    def _apply_sentence_g2p(self, sentence: str) -> str:
        """Menghasilkan pelafalan nyata pada tingkat kalimat utuh."""
        if HAS_G2P and _G2P is not None:
            try:
                return _G2P(sentence)
            except Exception as e:
                logger.debug("G2P error: %s", e)
        
        # Fallback aturan asimilasi leksikon
        res = sentence
        for written, (pronounced, _) in COMMON_PHONOLOGICAL_PAIRS.items():
            res = res.replace(written, pronounced)
        return res

    def analyze(self, text: str, native_lang: str = "id") -> List[UniversalToken]:
        tokens: List[UniversalToken] = []
        clean_text = text.strip()
        if not clean_text:
            return tokens

        # 1. Jalankan pelafalan nyata pada tingkat KALIMAT UTUH
        sentence_pronounced = self._apply_sentence_g2p(clean_text)

        token_id_counter = 0

        if HAS_KIWI and _KIWI is not None:
            # Segmentasi morfem presisi
            morphemes = _KIWI.tokenize(clean_text)
            
            for m in morphemes:
                form = m.form
                tag = m.tag
                upos = KIWI_TO_UPOS.get(tag, "OTHER")
                
                # Lemma kamus: Kata kerja (VV) dan kata sifat (VA) diberi akhiran '다'
                if upos in ["VERB", "ADJ"] or tag in ["VV", "VA"]:
                    lemma = f"{form}다"
                else:
                    lemma = form

                # Pelafalan per token
                token_pronounced = form
                rule_note: Optional[str] = None

                # Periksa apakah kata ini memiliki aturan asimilasi terkenal
                if form in COMMON_PHONOLOGICAL_PAIRS:
                    token_pronounced, rule_note = COMMON_PHONOLOGICAL_PAIRS[form]
                elif HAS_G2P and _G2P is not None:
                    try:
                        g2p_res = _G2P(form)
                        if g2p_res != form:
                            token_pronounced = g2p_res
                            rule_note = f"Asimilasi bunyi Hangul: {form} -> [{token_pronounced}]"
                    except Exception:
                        pass

                phonetic_script = hangul_to_rr(form)
                pronounced_as = hangul_to_rr(token_pronounced)

                display_parts = [DisplayPart(text=form, ruby=None)]

                # Lookup arti kata & TOPIK level
                word_info = self.dict_service.lookup(lemma, "ko", native_lang)
                if not word_info["meanings"]:
                    word_info = self.dict_service.lookup(form, "ko", native_lang)

                tokens.append(UniversalToken(
                    token_id=token_id_counter,
                    surface=form,
                    display_parts=display_parts,
                    phonetic_script=phonetic_script,
                    pronounced_as=pronounced_as,
                    orthographic_rule_note=rule_note,
                    lemma=lemma,
                    pos=upos,
                    sub_pos=tag,
                    proficiency_tag=word_info.get("proficiency_tag"),
                    meanings=word_info.get("meanings", []),
                    linked_token_ids=[]
                ))
                token_id_counter += 1
        else:
            # Fallback jika KiwiPiePy belum terpasang
            # Pisahkan berdasarkan spasi dan partikel penanda
            words = clean_text.split()
            particles = ["은", "는", "이", "가", "을", "를", "에", "에서", "도", "의", "과", "와", "로", "으로"]
            
            for w in words:
                token_pronounced = w
                rule_note = None

                # Periksa apakah kata ini memiliki aturan asimilasi leksikon utuh
                if w in COMMON_PHONOLOGICAL_PAIRS:
                    token_pronounced, rule_note = COMMON_PHONOLOGICAL_PAIRS[w]
                    word_info = self.dict_service.lookup(w, "ko", native_lang)
                    tokens.append(UniversalToken(
                        token_id=token_id_counter,
                        surface=w,
                        display_parts=[DisplayPart(text=w, ruby=None)],
                        phonetic_script=hangul_to_rr(w),
                        pronounced_as=hangul_to_rr(token_pronounced),
                        orthographic_rule_note=rule_note,
                        lemma=w,
                        pos="ADV" if w == "같이" else "NOUN",
                        proficiency_tag=word_info.get("proficiency_tag"),
                        meanings=word_info.get("meanings", [])
                    ))
                    token_id_counter += 1
                    continue

                # Periksa apakah berakhiran partikel
                matched_particle = None
                stem = w
                for p in sorted(particles, key=len, reverse=True):
                    if w.endswith(p) and len(w) > len(p):
                        stem = w[:-len(p)]
                        matched_particle = p
                        break

                if matched_particle:
                    # Token 1: Kata dasar
                    word_info = self.dict_service.lookup(stem, "ko", native_lang)
                    tokens.append(UniversalToken(
                        token_id=token_id_counter,
                        surface=stem,
                        display_parts=[DisplayPart(text=stem, ruby=None)],
                        phonetic_script=hangul_to_rr(stem),
                        pronounced_as=hangul_to_rr(stem),
                        orthographic_rule_note=None,
                        lemma=stem,
                        pos="NOUN",
                        proficiency_tag=word_info.get("proficiency_tag"),
                        meanings=word_info.get("meanings", [])
                    ))
                    token_id_counter += 1

                    # Token 2: Partikel Josa
                    tokens.append(UniversalToken(
                        token_id=token_id_counter,
                        surface=matched_particle,
                        display_parts=[DisplayPart(text=matched_particle, ruby=None)],
                        phonetic_script=hangul_to_rr(matched_particle),
                        pronounced_as=hangul_to_rr(matched_particle),
                        orthographic_rule_note=f"Partikel penanda ({matched_particle})",
                        lemma=matched_particle,
                        pos="PART",
                        meanings=["partikel penanda"]
                    ))
                    token_id_counter += 1
                else:
                    word_info = self.dict_service.lookup(w, "ko", native_lang)
                    tokens.append(UniversalToken(
                        token_id=token_id_counter,
                        surface=w,
                        display_parts=[DisplayPart(text=w, ruby=None)],
                        phonetic_script=hangul_to_rr(w),
                        pronounced_as=hangul_to_rr(token_pronounced),
                        orthographic_rule_note=rule_note,
                        lemma=w,
                        pos="NOUN",
                        proficiency_tag=word_info.get("proficiency_tag"),
                        meanings=word_info.get("meanings", [])
                    ))
                    token_id_counter += 1

        return tokens
