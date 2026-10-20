"""
LingoStream Universal - Paket Mesin Linguistik Multibahasa
"""

from app.nlp.base import BaseNLPEngine
from app.nlp.japanese import JapaneseNLPEngine
from app.nlp.chinese import ChineseNLPEngine
from app.nlp.korean import KoreanNLPEngine
from app.nlp.arabic import ArabicNLPEngine
from app.nlp.thai import ThaiNLPEngine
from app.nlp.western import WesternNLPEngine

__all__ = [
    "BaseNLPEngine",
    "JapaneseNLPEngine",
    "ChineseNLPEngine",
    "KoreanNLPEngine",
    "ArabicNLPEngine",
    "ThaiNLPEngine",
    "WesternNLPEngine",
]
