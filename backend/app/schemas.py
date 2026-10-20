"""
LingoStream Universal - Skema Kontrak Data Pydantic v2
Mendefinisikan kontrak data universal untuk pertukaran data antara backend dan frontend Flutter.
"""

from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field


class DisplayPart(BaseModel):
    """
    Bagian teks untuk perataan okurigana / ruby presisi.
    text: karakter kanji/hanzi/teks dasar
    ruby: anotasi cara baca di atas teks tersebut (None jika hiragana murni atau tidak beranotasi)
    """
    text: str
    ruby: Optional[str] = None


class ToneOrPitch(BaseModel):
    """
    Sistem intonasi dan nada fonologis.
    system: 'jp_pitch' | 'zh_tone' | 'th_tone' | 'stress'
    value: representasi teks nada (contoh: 'atamadaka', 'tone2', 'falling', 'primary_stress')
    pattern: kontur nada numerik [H, L, L] atau nomor nada [2]
    """
    system: Literal["jp_pitch", "zh_tone", "th_tone", "stress"]
    value: str
    pattern: List[int] = Field(default_factory=list)


class UniversalToken(BaseModel):
    """
    Token linguistik universal polimorfik untuk semua bahasa target.
    pos mengikuti himpunan baku Universal POS:
    NOUN, VERB, ADJ, ADV, PRON, DET, ADP, AUX, CONJ, PART, NUM, PUNCT, OTHER
    """
    token_id: int
    surface: str
    display_parts: List[DisplayPart] = Field(default_factory=list)
    phonetic_script: str
    pronounced_as: str
    orthographic_rule_note: Optional[str] = None
    lemma: str
    pos: str
    sub_pos: Optional[str] = None
    inflection_chain: List[str] = Field(default_factory=list)
    root: Optional[str] = None
    gender: Optional[str] = None
    tone_or_pitch: Optional[ToneOrPitch] = None
    proficiency_tag: Optional[str] = None
    meanings: List[str] = Field(default_factory=list)
    linked_token_ids: List[int] = Field(default_factory=list)


class TranscriptSegment(BaseModel):
    """
    Segmen transkrip dengan stempel waktu milidetik dan token terurai.
    """
    index: int
    start_ms: int
    end_ms: int
    original_text: str
    translated_text: str
    translation_failed: bool = False
    is_i_plus_one: bool = False
    tokens: List[UniversalToken] = Field(default_factory=list)


class VideoProcessRequest(BaseModel):
    """
    Permintaan proses video YouTube.
    """
    youtube_url: str
    target_lang: str = "ja"
    native_lang: str = "id"
    known_lemmas: List[str] = Field(default_factory=list)
    max_segments: int = 200
    demo: bool = False


class VideoTranscriptResponse(BaseModel):
    """
    Respons transkrip video lengkap beserta metadata dan pipeline engine yang digunakan.
    """
    video_id: str
    title: str
    channel: str
    language: str
    writing_direction: Literal["ltr", "rtl"] = "ltr"
    source_type: str
    engine_used: Dict[str, str] = Field(default_factory=dict)
    truncated: bool = False
    segments: List[TranscriptSegment] = Field(default_factory=list)


class AnalyzeTextRequest(BaseModel):
    """
    Permintaan analisis teks bebas tanpa video.
    """
    text: str
    target_lang: str = "ja"
    native_lang: str = "id"
    known_lemmas: List[str] = Field(default_factory=list)


class AnalyzeTextResponse(BaseModel):
    """
    Hasil analisis kalimat bebas.
    """
    text: str
    target_lang: str
    writing_direction: Literal["ltr", "rtl"] = "ltr"
    engine_used: Dict[str, str] = Field(default_factory=dict)
    tokens: List[UniversalToken] = Field(default_factory=list)


class GrammarTokenExplanation(BaseModel):
    """
    Uraian tata bahasa per token.
    """
    surface: str
    lemma: str
    pos: str
    rule_note: Optional[str] = None
    meaning: str


class GrammarExplainRequest(BaseModel):
    """
    Permintaan eksplanasi tata bahasa untuk kalimat.
    """
    sentence: str
    target_lang: str
    native_lang: str = "id"


class GrammarExplainResponse(BaseModel):
    """
    Hasil penjelasan tata bahasa terstruktur tanpa data fiktif.
    """
    sentence: str
    target_lang: str
    summary: str
    tokens: List[GrammarTokenExplanation] = Field(default_factory=list)


class TranslateSentenceRequest(BaseModel):
    """
    Permintaan terjemahan kalimat tunggal secara on-demand.
    """
    sentence: str
    source_lang: str
    target_lang: str = "id"


class TranslateSentenceResponse(BaseModel):
    """
    Hasil terjemahan kalimat on-demand.
    """
    original_text: str
    translated_text: str
    source_lang: str
    target_lang: str


class FSRSItemRequest(BaseModel):
    """
    Permintaan perhitungan penjadwalan FSRS v4.5 untuk flashcard.
    rating: 1 (Again), 2 (Hard), 3 (Good), 4 (Easy)
    """
    card_id: Optional[str] = None
    rating: int = Field(ge=1, le=4)
    state: str = "new"  # 'new' | 'learning' | 'review' | 'relearning'
    step: int = 0
    stability: float = 0.0
    difficulty: float = 0.0
    elapsed_days: float = 0.0
    scheduled_days: int = 0
    reps: int = 0
    lapses: int = 0
    last_review: Optional[str] = None
    desired_retention: float = 0.9


class FSRSPreview(BaseModel):
    """
    Pratinjau interval dan stabilitas untuk tiap rating FSRS (1..4).
    """
    rating: int
    interval_days: int
    due_date: str
    stability: float
    difficulty: float
    state: str


class FSRSItemResponse(BaseModel):
    """
    Hasil kalkulasi FSRS v4.5 dengan status terkini dan pratinjau keempat opsi rating.
    """
    card_id: Optional[str] = None
    rating: int
    state: str
    step: int
    stability: float
    difficulty: float
    elapsed_days: float
    scheduled_days: int
    reps: int
    lapses: int
    due_date: str
    retrievability: float
    previews: Dict[int, FSRSPreview] = Field(default_factory=dict)


class ShadowingEvaluateF0Request(BaseModel):
    """
    Evaluasi kontur nada F0 murni dengan dynamic time warping.
    """
    native_f0: List[float]
    user_f0: List[float]
    sample_rate_hz: float = 100.0


class ShadowingTimeSegmentFeedback(BaseModel):
    """
    Umpan balik per bagian waktu dari rekaman shadowing.
    """
    start_pct: float
    end_pct: float
    score: float
    feedback: str


class ShadowingEvaluateResponse(BaseModel):
    """
    Hasil evaluasi intonasi shadowing dengan skor 0-100 dan kurva ternormalisasi.
    """
    score: float
    normalized_native_curve: List[float] = Field(default_factory=list)
    normalized_user_curve: List[float] = Field(default_factory=list)
    feedback: str
    segment_feedbacks: List[ShadowingTimeSegmentFeedback] = Field(default_factory=list)


class AsyncJobResponse(BaseModel):
    """
    Status pekerjaan latar belakang untuk pemrosesan video panjang.
    """
    job_id: str
    status: Literal["pending", "processing", "completed", "failed"]
    progress: float = 0.0
    message: str
    result: Optional[VideoTranscriptResponse] = None


class HealthResponse(BaseModel):
    """
    Status kesehatan server dan daftar ketersediaan pustaka NLP/ASR.
    """
    status: str
    version: str
    available_engines: Dict[str, Any] = Field(default_factory=dict)


class ErrorResponse(BaseModel):
    """
    Format error standar terstruktur.
    """
    detail: str
    code: str
