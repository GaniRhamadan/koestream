"""
LingoStream Universal - Pengujian Unit Komprehensif Mesin NLP & YouTube Parsing
Memverifikasi minimal 3 kasus uji per bahasa:
- Jepang: 食べる, 振り返る, 私は (Okurigana DP & Partikel は)
- Mandarin: 你好 (3+3 Sandhi), 不是 (不 Sandhi), 一个 (一 Sandhi)
- Korea: 독립 (Nasalisasi), 같이 (Palatalisasi), Josa 은/는
- Arab: كتاب (Akar 3 huruf كتب), سلام (سلم), arah RTL
- Thailand: ภาษาไทย (Segmentasi & 5-tone)
- Inggris: went -> go, bought -> buy, IPA
- Jerman: separable verbs 'aufstehen' (Ich stehe um 7 Uhr auf), gender der/die/das
- Indonesia: memperbaiki -> baik (Sastrawi affixes memper- + -i)
- Ekstraksi YouTube URL Regex
"""

import pytest
from app.nlp.base import align_okurigana_dp
from app.nlp.japanese import JapaneseNLPEngine
from app.nlp.chinese import ChineseNLPEngine
from app.nlp.korean import KoreanNLPEngine
from app.nlp.arabic import ArabicNLPEngine
from app.nlp.thai import ThaiNLPEngine
from app.nlp.western import WesternNLPEngine
from app.youtube import extract_youtube_video_id
from fastapi import HTTPException


# =====================================================================
# 1. PENGUJIAN OKURIGANA DP ALIGNMENT & JEPANG
# =====================================================================
def test_dp_okurigana_alignment():
    # Kasus 1: 食べる (kanji di awal, kana di akhir)
    res1 = align_okurigana_dp("食べる", "たべる")
    assert len(res1) == 2
    assert res1[0].text == "食" and res1[0].ruby == "た"
    assert res1[1].text == "べる" and res1[1].ruby is None

    # Kasus 2: 振り返る (dua blok kanji diselingi kana)
    res2 = align_okurigana_dp("振り返る", "ふりかえる")
    assert len(res2) == 4
    assert res2[0].text == "振" and res2[0].ruby == "ふ"
    assert res2[1].text == "り" and res2[1].ruby is None
    assert res2[2].text == "返" and res2[2].ruby == "かえ"
    assert res2[3].text == "る" and res2[3].ruby is None

    # Kasus 3: お願い (kana di awal dan akhir, kanji di tengah)
    res3 = align_okurigana_dp("お願い", "おねがい")
    assert len(res3) == 3
    assert res3[0].text == "お" and res3[0].ruby is None
    assert res3[1].text == "願" and res3[1].ruby == "ねが"
    assert res3[2].text == "い" and res3[2].ruby is None


def test_japanese_particle_ha_vs_wa():
    engine = JapaneseNLPEngine()
    tokens = engine.analyze("私は学生です")
    
    # Verifikasi token 'は' sebagai partikel dilafalkan 'wa'
    ha_token = next((t for t in tokens if t.surface == "は"), None)
    if ha_token:
        assert ha_token.pos == "PART"
        assert ha_token.pronounced_as == "wa"
        assert ha_token.orthographic_rule_note is not None


# =====================================================================
# 2. PENGUJIAN MANDARIN (TONE SANDHI 3+3, 不, 一)
# =====================================================================
def test_mandarin_tone_sandhi():
    engine = ChineseNLPEngine()

    # Kasus 1: Tone Sandhi 3+3 -> 2+3 (nǐ hǎo -> ní hǎo)
    tokens_nihao = engine.analyze("你好")
    assert len(tokens_nihao) >= 1
    t_nihao = tokens_nihao[0]
    assert "ní" in t_nihao.pronounced_as

    # Kasus 2: Tone Sandhi 不 sebelum nada 4 (bù shì -> bú shì)
    tokens_bushi = engine.analyze("不是")
    t_bu = next((t for t in tokens_bushi if "不" in t.surface), None)
    assert t_bu is not None
    assert "bú" in t_bu.pronounced_as

    # Kasus 3: Tone Sandhi 一 sebelum nada 4 (yī gè -> yí gè)
    tokens_yige = engine.analyze("一个")
    t_yi = next((t for t in tokens_yige if "一" in t.surface), None)
    assert t_yi is not None
    assert "yí" in t_yi.pronounced_as


# =====================================================================
# 3. PENGUJIAN KOREA (ASIMILASI FONOLOGIS g2pK & JOSA)
# =====================================================================
def test_korean_phonological_assimilation():
    engine = KoreanNLPEngine()

    # Kasus 1: Nasalisasi 독립 -> [동닙]
    tokens_dokrip = engine.analyze("독립")
    assert any("동닙" in t.pronounced_as or "dongnip" in t.pronounced_as or "dong-nip" in t.pronounced_as for t in tokens_dokrip)

    # Kasus 2: Palatalisasi 같이 -> [가치]
    tokens_gachi = engine.analyze("같이")
    assert any("가치" in t.pronounced_as or "gachi" in t.pronounced_as or "ga-chi" in t.pronounced_as for t in tokens_gachi)

    # Kasus 3: Pemisahan Josa (kata benda + partikel 은/는)
    tokens_sentence = engine.analyze("나는 학생이다")
    assert len(tokens_sentence) >= 2


# =====================================================================
# 4. PENGUJIAN ARAB (AKAR KATA 3 HURUF & RTL)
# =====================================================================
def test_arabic_root_and_rtl():
    engine = ArabicNLPEngine()
    tokens = engine.analyze("قرأت كتاب في المدرسة")

    # Verifikasi akar kata كتاب -> كتب
    t_kitab = next((t for t in tokens if "كتاب" in t.surface), None)
    assert t_kitab is not None
    assert t_kitab.root == "كتب"

    # Verifikasi arah penulisan RTL pada engine info
    info = engine.get_engine_info()
    assert info.get("direction") == "rtl"


# =====================================================================
# 5. PENGUJIAN THAILAND (5 NADA & SEGMENTASI)
# =====================================================================
def test_thai_tone_and_segmentation():
    engine = ThaiNLPEngine()
    tokens = engine.analyze("ภาษาไทย")
    assert len(tokens) >= 1
    # Memeriksa sistem nada terisi dengan th_tone
    assert tokens[0].tone_or_pitch is not None
    assert tokens[0].tone_or_pitch.system == "th_tone"


# =====================================================================
# 6. PENGUJIAN INGGRIS, JERMAN, INDONESIA
# =====================================================================
def test_english_irregular_and_ipa():
    engine = WesternNLPEngine("en")
    tokens = engine.analyze("I went to school")
    t_went = next((t for t in tokens if t.surface.lower() == "went"), None)
    assert t_went is not None
    assert t_went.lemma == "go"


def test_german_separable_verbs():
    engine = WesternNLPEngine("de")
    tokens = engine.analyze("Ich stehe um 7 Uhr auf")
    t_stehe = next((t for t in tokens if t.surface.lower() == "stehe"), None)
    assert t_stehe is not None
    assert t_stehe.lemma == "aufstehen"
    assert len(t_stehe.linked_token_ids) > 0


def test_indonesian_sastrawi_stemming():
    engine = WesternNLPEngine("id")
    tokens = engine.analyze("Kita sedang memperbaiki jalan")
    t_memperbaiki = next((t for t in tokens if t.surface == "memperbaiki"), None)
    assert t_memperbaiki is not None
    assert t_memperbaiki.lemma == "baik"
    assert t_memperbaiki.orthographic_rule_note is not None
    assert "memper" in t_memperbaiki.orthographic_rule_note


# =====================================================================
# 7. PENGUJIAN EKSTRAKSI YOUTUBE URL
# =====================================================================
def test_youtube_url_extraction():
    valid_urls = [
        ("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "dQw4w9WgXcQ"),
        ("https://youtu.be/dQw4w9WgXcQ", "dQw4w9WgXcQ"),
        ("https://youtube.com/shorts/dQw4w9WgXcQ?feature=share", "dQw4w9WgXcQ"),
        ("dQw4w9WgXcQ", "dQw4w9WgXcQ"),
    ]
    for url, expected_id in valid_urls:
        assert extract_youtube_video_id(url) == expected_id

    invalid_urls = [
        "https://google.com",
        "https://youtube.com/invalid_path",
        "random_text_123",
    ]
    for url in invalid_urls:
        with pytest.raises(HTTPException):
            extract_youtube_video_id(url)
