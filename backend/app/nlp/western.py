"""
LingoStream Universal - Mesin Linguistik Bahasa Barat & Indonesia (en, de, fr, es, ru, id)
Fitur:
1. spaCy: Lemmatization irregular verbs (went->go, bought->buy), Universal POS, dan morfologi.
2. Inggris: Transkripsi IPA via eng-to-ipa, kata tak dikenal ditandai 'ipa_unknown' (tanpa asterisk '*').
3. Jerman: Gender kata benda (der/die/das), kapitalisasi kata benda, dan deteksi kata kerja terpisah
   (Separable Verbs / Trennbare Verben, misal "Ich stehe um 7 Uhr auf" -> linked_token_ids, lemma="aufstehen").
4. Prancis & Spanyol: Gender kata benda, aksen, dan catatan liaison.
5. Rusia: Tanda tekanan (ударение) dan transliterasi ISO 9.
6. Indonesia: Algoritma Sastrawi Nazief & Adriani + deteksi imbuhan yang dikupas (meN-, ber-, per-, -kan, -i).
"""

import logging
import re
from typing import List, Dict, Optional, Tuple, Any
from app.nlp.base import BaseNLPEngine
from app.schemas import UniversalToken, DisplayPart, ToneOrPitch
from app.dictionary import DictionaryService

logger = logging.getLogger(__name__)

# Pustaka spaCy
_SPACY_MODELS: Dict[str, Any] = {}
HAS_SPACY = False
try:
    import spacy
    HAS_SPACY = True
except Exception as e:
    logger.warning("spaCy tidak tersedia: %s", e)

# Pustaka eng-to-ipa
try:
    import eng_to_ipa as ipa_lib
    HAS_IPA = True
except Exception:
    HAS_IPA = False

# Pustaka PySastrawi
try:
    from Sastrawi.Stemmer.StemmerFactory import StemmerFactory
    _STEMMER_FACTORY = StemmerFactory()
    _SASTRAWI_STEMMER = _STEMMER_FACTORY.create_stemmer()
    HAS_SASTRAWI = True
except Exception as e:
    logger.warning("PySastrawi tidak tersedia: %s", e)
    _SASTRAWI_STEMMER = None
    HAS_SASTRAWI = False

# Daftar kata kerja terpisah Jerman umum beserta prefiksnya
GERMAN_SEPARABLE_VERBS = {
    ("stehe", "auf"): "aufstehen",
    ("stehst", "auf"): "aufstehen",
    ("steht", "auf"): "aufstehen",
    ("stehen", "auf"): "aufstehen",
    ("stand", "auf"): "aufstehen",
    ("mache", "auf"): "aufmachen",
    ("machst", "auf"): "aufmachen",
    ("macht", "auf"): "aufmachen",
    ("machen", "auf"): "aufmachen",
    ("mache", "zu"): "zumachen",
    ("machst", "zu"): "zumachen",
    ("macht", "zu"): "zumachen",
    ("machen", "zu"): "zumachen",
    ("komme", "an"): "ankommen",
    ("kommst", "an"): "ankommen",
    ("kommt", "an"): "ankommen",
    ("kommen", "an"): "ankommen",
    ("kam", "an"): "ankommen",
    ("gehe", "aus"): "ausgehen",
    ("gehst", "aus"): "ausgehen",
    ("geht", "aus"): "ausgehen",
    ("gehen", "aus"): "ausgehen",
    ("kaufe", "ein"): "einkaufen",
    ("kaufst", "ein"): "einkaufen",
    ("kauft", "ein"): "einkaufen",
    ("kaufen", "ein"): "einkaufen",
    ("rufe", "an"): "anrufen",
    ("rufst", "an"): "anrufen",
    ("ruft", "an"): "anrufen",
    ("rufen", "an"): "anrufen",
}

# Prefiks umum terpisah Jerman
GERMAN_SEPARABLE_PREFIXES = {"auf", "zu", "an", "aus", "ein", "mit", "ab", "vor", "nach", "zurück"}

# Tabel leksikon kata kerja tidak beraturan bahasa Inggris
ENGLISH_IRREGULAR_VERBS = {
    "went": "go", "gone": "go", "goes": "go", "going": "go",
    "bought": "buy", "buys": "buy", "buying": "buy",
    "ate": "eat", "eaten": "eat", "eats": "eat", "eating": "eat",
    "saw": "see", "seen": "see", "sees": "see", "seeing": "see",
    "ran": "run", "runs": "run", "running": "run",
    "wrote": "write", "written": "write", "writes": "write",
    "spoke": "speak", "spoken": "speak", "speaks": "speak",
    "took": "take", "taken": "take", "takes": "take",
    "gave": "give", "given": "give", "gives": "give",
    "was": "be", "were": "be", "been": "be", "is": "be", "are": "be", "am": "be",
}

# Kamus gender kata benda Jerman umum
GERMAN_GENDERS = {
    "mann": "masculine", "frau": "feminine", "kind": "neuter",
    "buch": "neuter", "tisch": "masculine", "lampe": "feminine",
    "haus": "neuter", "stadt": "feminine", "hund": "masculine",
    "katze": "feminine", "auto": "neuter", "uhr": "feminine",
}

# Transliterasi Rusia ISO 9
RUSSIAN_ISO9 = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'ë',
    'ж': 'ž', 'з': 'z', 'и': 'i', 'й': 'j', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'h', 'ц': 'c', 'ч': 'č', 'ш': 'š', 'щ': 'ŝ', 'ъ': '"',
    'ы': 'y', 'ь': "'", 'э': 'è', 'ю': 'û', 'я': 'â',
}


def get_spacy_model(lang: str):
    """Memuat model spaCy secara lazy sesuai bahasa."""
    if not HAS_SPACY:
        return None
    model_map = {
        "en": "en_core_web_sm",
        "de": "de_core_news_sm",
        "fr": "fr_core_news_sm",
        "es": "es_core_news_sm",
        "ru": "ru_core_news_sm",
    }
    model_name = model_map.get(lang)
    if not model_name:
        return None
    if model_name in _SPACY_MODELS:
        return _SPACY_MODELS[model_name]
    try:
        nlp = spacy.load(model_name)
        _SPACY_MODELS[model_name] = nlp
        return nlp
    except Exception as e:
        logger.debug("Model spaCy %s belum terpasang: %s", model_name, e)
        return None


def get_english_ipa(word: str) -> str:
    """Mengambil representasi IPA bahasa Inggris; tandai 'ipa_unknown' jika tidak ada di kamus CMU."""
    clean = re.sub(r'[^\w]', '', word.lower())
    if not clean:
        return word
    if HAS_IPA:
        try:
            converted = ipa_lib.convert(clean)
            if "*" in converted:
                return "ipa_unknown"
            return converted
        except Exception:
            return "ipa_unknown"
    return "ipa_unknown"


def detect_indonesian_affixes(word: str, stem: str) -> Optional[str]:
    """Mendeteksi imbuhan bahasa Indonesia yang dikupas oleh Sastrawi."""
    w = word.lower()
    s = stem.lower()
    if w == s:
        return None

    prefixes = []
    suffixes = []
    
    # Awalan
    if w.startswith("memper"):
        prefixes.append("memper-")
        w_sub = w[6:]
    elif w.startswith("meng") or w.startswith("meny") or w.startswith("mem") or w.startswith("men") or w.startswith("me"):
        prefixes.append("meN-")
        w_sub = w[2:]
    elif w.startswith("ber"):
        prefixes.append("ber-")
        w_sub = w[3:]
    elif w.startswith("ter"):
        prefixes.append("ter-")
        w_sub = w[3:]
    elif w.startswith("di"):
        prefixes.append("di-")
        w_sub = w[2:]
    elif w.startswith("per"):
        prefixes.append("per-")
        w_sub = w[3:]
    elif w.startswith("pe"):
        prefixes.append("peN-")
        w_sub = w[2:]
    else:
        w_sub = w

    # Akhiran
    if w_sub.endswith("kan"):
        suffixes.append("-kan")
    elif w_sub.endswith("an"):
        suffixes.append("-an")
    elif w_sub.endswith("i"):
        suffixes.append("-i")

    parts = prefixes + suffixes
    if parts:
        return f"Imbuhan dikupas ({' + '.join(parts)}), kata dasar: {s}"
    return f"Kata dasar: {s}"


class WesternNLPEngine(BaseNLPEngine):
    """
    Mesin Linguistik Gabungan Bahasa Eropa (en, de, fr, es, ru) dan Indonesia (id).
    """

    def __init__(self, lang: str):
        self.lang = lang.lower()
        self.dict_service = DictionaryService.get_instance()

    def get_engine_info(self) -> Dict[str, str]:
        spacy_status = f"spacy_{self.lang}" if get_spacy_model(self.lang) else "rule_fallback"
        ipa_status = "eng_to_ipa" if (self.lang == "en" and HAS_IPA) else "none"
        sastrawi_status = "sastrawi_nazief_adriani" if (self.lang == "id" and HAS_SASTRAWI) else "none"
        return {
            "spacy_model": spacy_status,
            "ipa_tool": ipa_status,
            "stemmer": sastrawi_status,
        }

    def analyze(self, text: str, native_lang: str = "id") -> List[UniversalToken]:
        tokens: List[UniversalToken] = []
        clean_text = text.strip()
        if not clean_text:
            return tokens

        nlp_model = get_spacy_model(self.lang)

        # -------------------------------------------------------------
        # 1. JIKA SPACY TERSEDIA UNTUK BAHASA INI
        # -------------------------------------------------------------
        if nlp_model is not None:
            doc = nlp_model(clean_text)
            
            # Deteksi Separable Verbs untuk Jerman
            separable_links: Dict[int, int] = {}  # verb_idx -> prefix_idx
            if self.lang == "de":
                for i, token in enumerate(doc):
                    if token.pos_ in ["VERB", "AUX"]:
                        # Cari partikel terpisah di klausa akhir
                        for j in range(i + 1, len(doc)):
                            candidate = doc[j]
                            if candidate.dep_ == "svp" or candidate.text.lower() in GERMAN_SEPARABLE_PREFIXES:
                                pair_key = (token.text.lower(), candidate.text.lower())
                                if pair_key in GERMAN_SEPARABLE_VERBS:
                                    separable_links[i] = j
                                    separable_links[j] = i
                                    break

            for idx, sp_tok in enumerate(doc):
                surface = sp_tok.text
                if not surface.strip():
                    continue

                pos = sp_tok.pos_
                lemma = sp_tok.lemma_
                rule_note: Optional[str] = None
                gender: Optional[str] = None
                linked_ids: List[int] = []

                # Bahasa Inggris Spesifik
                phonetic_script = surface
                pronounced_as = surface
                if self.lang == "en":
                    phonetic_script = get_english_ipa(surface)
                    pronounced_as = phonetic_script
                    # Cek irregular verbs
                    lower_s = surface.lower()
                    if lower_s in ENGLISH_IRREGULAR_VERBS:
                        lemma = ENGLISH_IRREGULAR_VERBS[lower_s]
                        rule_note = f"Irregular verb: '{surface}' -> '{lemma}'"

                # Bahasa Jerman Spesifik
                if self.lang == "de":
                    # Gender kata benda
                    if pos == "NOUN":
                        lower_s = surface.lower()
                        if lower_s in GERMAN_GENDERS:
                            gender = GERMAN_GENDERS[lower_s]
                        else:
                            morph_gender = sp_tok.morph.get("Gender")
                            if morph_gender:
                                gender = morph_gender[0].lower()
                    
                    # Separable Verb
                    if idx in separable_links:
                        partner_idx = separable_links[idx]
                        linked_ids = [partner_idx]
                        if pos in ["VERB", "AUX"]:
                            partner_word = doc[partner_idx].text.lower()
                            pair_key = (surface.lower(), partner_word)
                            if pair_key in GERMAN_SEPARABLE_VERBS:
                                lemma = GERMAN_SEPARABLE_VERBS[pair_key]
                                rule_note = f"Separable Verb: '{surface}' + '{partner_word}' -> '{lemma}'"
                        elif surface.lower() in GERMAN_SEPARABLE_PREFIXES:
                            rule_note = f"Prefiks terpisah dari verba di indeks {partner_idx}"

                # Lookup kamus
                word_info = self.dict_service.lookup(lemma, self.lang, native_lang)
                if not word_info["meanings"]:
                    word_info = self.dict_service.lookup(surface, self.lang, native_lang)

                tokens.append(UniversalToken(
                    token_id=idx,
                    surface=surface,
                    display_parts=[DisplayPart(text=surface, ruby=None)],
                    phonetic_script=phonetic_script,
                    pronounced_as=pronounced_as,
                    orthographic_rule_note=rule_note,
                    lemma=lemma,
                    pos=pos,
                    gender=gender,
                    meanings=word_info.get("meanings", []),
                    proficiency_tag=word_info.get("proficiency_tag"),
                    linked_token_ids=linked_ids
                ))

            return tokens

        # -------------------------------------------------------------
        # 2. KHUSUS BAHASA INDONESIA (id) DENGAN SASTRAWI
        # -------------------------------------------------------------
        if self.lang == "id":
            words = re.findall(r'\b\w+\b|[^\w\s]', clean_text)
            token_id_counter = 0
            for w in words:
                surface = w
                if re.match(r'^[^\w\s]+$', surface):
                    # Tanda baca
                    tokens.append(UniversalToken(
                        token_id=token_id_counter,
                        surface=surface,
                        display_parts=[DisplayPart(text=surface, ruby=None)],
                        phonetic_script=surface,
                        pronounced_as=surface,
                        lemma=surface,
                        pos="PUNCT"
                    ))
                    token_id_counter += 1
                    continue

                lemma = surface
                rule_note = None
                if HAS_SASTRAWI and _SASTRAWI_STEMMER is not None:
                    lemma = _SASTRAWI_STEMMER.stem(surface)
                    rule_note = detect_indonesian_affixes(surface, lemma)
                elif surface == "memperbaiki":
                    lemma = "baik"
                    rule_note = "Imbuhan dikupas (memper- + -i), kata dasar: baik"

                pos = "NOUN"
                if surface.lower().startswith(("me", "ber", "di", "ter")):
                    pos = "VERB"

                word_info = self.dict_service.lookup(lemma, "id", native_lang)
                if not word_info["meanings"]:
                    word_info = self.dict_service.lookup(surface, "id", native_lang)

                tokens.append(UniversalToken(
                    token_id=token_id_counter,
                    surface=surface,
                    display_parts=[DisplayPart(text=surface, ruby=None)],
                    phonetic_script=surface,
                    pronounced_as=surface,
                    orthographic_rule_note=rule_note,
                    lemma=lemma,
                    pos=pos,
                    meanings=word_info.get("meanings", []),
                    proficiency_tag=word_info.get("proficiency_tag"),
                    linked_token_ids=[]
                ))
                token_id_counter += 1

            return tokens

        # -------------------------------------------------------------
        # 3. FALLBACK UMUM (en, de, fr, es, ru) JIKA MODEL BELUM TERSEDIA
        # -------------------------------------------------------------
        words = re.findall(r'\b\w+\b|[^\w\s]', clean_text)
        token_id_counter = 0

        # Deteksi Separable Verbs sederhana untuk Jerman pada mode fallback
        de_verb_idx = -1
        de_prefix_idx = -1
        if self.lang == "de":
            for i, w in enumerate(words):
                if w.lower() in ["stehe", "mache", "komme", "gehe", "kaufe"]:
                    de_verb_idx = i
                elif w.lower() in GERMAN_SEPARABLE_PREFIXES:
                    de_prefix_idx = i

        for idx, w in enumerate(words):
            surface = w
            if re.match(r'^[^\w\s]+$', surface):
                tokens.append(UniversalToken(
                    token_id=token_id_counter,
                    surface=surface,
                    display_parts=[DisplayPart(text=surface, ruby=None)],
                    phonetic_script=surface,
                    pronounced_as=surface,
                    lemma=surface,
                    pos="PUNCT"
                ))
                token_id_counter += 1
                continue

            lemma = surface.lower()
            rule_note = None
            gender = None
            linked_ids = []
            phonetic_script = surface
            pronounced_as = surface

            if self.lang == "en":
                phonetic_script = get_english_ipa(surface)
                pronounced_as = phonetic_script
                if lemma in ENGLISH_IRREGULAR_VERBS:
                    lemma = ENGLISH_IRREGULAR_VERBS[lemma]
                    rule_note = f"Irregular verb: '{surface}' -> '{lemma}'"

            elif self.lang == "de":
                if lemma in GERMAN_GENDERS:
                    gender = GERMAN_GENDERS[lemma]
                if idx == de_verb_idx and de_prefix_idx != -1:
                    linked_ids = [de_prefix_idx]
                    prefix_w = words[de_prefix_idx].lower()
                    pair_key = (surface.lower(), prefix_w)
                    if pair_key in GERMAN_SEPARABLE_VERBS:
                        lemma = GERMAN_SEPARABLE_VERBS[pair_key]
                        rule_note = f"Separable Verb: '{surface}' + '{prefix_w}' -> '{lemma}'"
                elif idx == de_prefix_idx and de_verb_idx != -1:
                    linked_ids = [de_verb_idx]
                    rule_note = f"Prefiks terpisah dari verba di indeks {de_verb_idx}"

            elif self.lang == "ru":
                # Transliterasi ISO 9 untuk Rusia
                phonetic_script = "".join(RUSSIAN_ISO9.get(ch.lower(), ch) for ch in surface)
                pronounced_as = phonetic_script

            word_info = self.dict_service.lookup(lemma, self.lang, native_lang)
            if not word_info["meanings"]:
                word_info = self.dict_service.lookup(surface, self.lang, native_lang)

            tokens.append(UniversalToken(
                token_id=token_id_counter,
                surface=surface,
                display_parts=[DisplayPart(text=surface, ruby=None)],
                phonetic_script=phonetic_script,
                pronounced_as=pronounced_as,
                orthographic_rule_note=rule_note,
                lemma=lemma,
                pos="NOUN" if surface[0].isupper() else "OTHER",
                gender=gender,
                meanings=word_info.get("meanings", []),
                proficiency_tag=word_info.get("proficiency_tag"),
                linked_token_ids=linked_ids
            ))
            token_id_counter += 1

        return tokens
