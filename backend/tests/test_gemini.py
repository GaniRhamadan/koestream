"""
LingoStream Universal - Unit Tests untuk GeminiService
"""

import pytest
from app.gemini_service import GeminiService


def test_gemini_service_availability():
    svc = GeminiService.get_instance()
    # Harus mendeteksi API Key yang dikonfigurasi di .env
    assert svc.is_available() is True
    assert svc.client is not None


def test_gemini_service_batch_translate():
    svc = GeminiService.get_instance()
    sentences = [
        {"index": 0, "text": "ありがとう"},
        {"index": 1, "text": "さようなら"}
    ]
    res = svc.batch_translate(sentences, target_lang="ja", native_lang="id")
    assert isinstance(res, dict)
    assert 0 in res
    assert 1 in res
    assert "terima kasih" in res[0].lower() or "makasih" in res[0].lower()


def test_gemini_service_explain_grammar():
    svc = GeminiService.get_instance()
    res = svc.explain_grammar_ai("私は毎日日本語を勉強します。", target_lang="ja", native_lang="id")
    assert res is not None
    assert len(res) > 20
