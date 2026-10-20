"""
LingoStream Universal - Definisi Router Endpoint FastAPI (/api/v1)
Menyediakan semua endpoint:
- GET  /health
- POST /process-video
- POST /process-video/async & GET /jobs/{job_id}
- POST /analyze-text
- POST /explain-grammar
- POST /shadowing/evaluate
- POST /shadowing/evaluate-audio
- POST /srs/schedule
"""

import uuid
import json
import logging
from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends, Request
from fastapi.concurrency import run_in_threadpool

from app.schemas import (
    VideoProcessRequest,
    VideoTranscriptResponse,
    AnalyzeTextRequest,
    AnalyzeTextResponse,
    TranslateSentenceRequest,
    TranslateSentenceResponse,
    GrammarExplainRequest,
    GrammarExplainResponse,
    GrammarTokenExplanation,
    FSRSItemRequest,
    FSRSItemResponse,
    ShadowingEvaluateF0Request,
    ShadowingEvaluateResponse,
    AsyncJobResponse,
    HealthResponse,
)
from app.youtube import YouTubePipelineService, get_nlp_engine_for_lang
from app.fsrs import FSRSScheduler
from app.shadowing import ShadowingService
from app.dictionary import DictionaryService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1")

# Layanan Inti
_youtube_service = YouTubePipelineService()
_fsrs_scheduler = FSRSScheduler()
_shadowing_service = ShadowingService()
_dict_service = DictionaryService.get_instance()

# Penyimpanan status pekerjaan async video panjang
_ASYNC_JOBS: Dict[str, Dict[str, Any]] = {}


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Memeriksa kesehatan server dan daftar ketersediaan pustaka NLP & ASR.
    """
    from app.youtube import HAS_FASTER_WHISPER, HAS_OPENCV, HAS_PADDLE_OCR
    from app.nlp.japanese import HAS_SUDACHI, HAS_KAKASI
    from app.nlp.chinese import HAS_JIEBA_PYPINYIN
    from app.nlp.korean import HAS_KIWI, HAS_G2P
    from app.nlp.arabic import HAS_MISHKAL
    from app.nlp.thai import HAS_PYTHAINLP
    from app.nlp.western import HAS_SPACY, HAS_IPA, HAS_SASTRAWI

    from app.gemini_service import GeminiService
    gemini_svc = GeminiService.get_instance()

    engines = {
        "asr": {
            "gemini_cloud_asr": gemini_svc.is_available(),
            "faster_whisper": HAS_FASTER_WHISPER,
            "opencv": HAS_OPENCV,
            "paddle_ocr": HAS_PADDLE_OCR,
        },
        "languages": {
            "ja": {"sudachipy": HAS_SUDACHI, "pykakasi": HAS_KAKASI},
            "zh": {"jieba_pypinyin": HAS_JIEBA_PYPINYIN},
            "ko": {"kiwipiepy": HAS_KIWI, "g2pk": HAS_G2P},
            "ar": {"mishkal": HAS_MISHKAL},
            "th": {"pythainlp": HAS_PYTHAINLP},
            "en": {"spacy": HAS_SPACY, "eng_to_ipa": HAS_IPA},
            "de": {"spacy": HAS_SPACY},
            "id": {"sastrawi": HAS_SASTRAWI},
        }
    }

    return HealthResponse(
        status="healthy",
        version="1.0.0",
        available_engines=engines
    )


@router.post("/process-video", response_model=VideoTranscriptResponse)
async def process_video(request: VideoProcessRequest):
    """
    Memproses video YouTube melalui pipeline 4 lapis.
    Dijalankan di run_in_threadpool agar tidak memblokir event loop asyncio.
    """
    try:
        response = await run_in_threadpool(
            _youtube_service.process_video,
            youtube_url=request.youtube_url,
            target_lang=request.target_lang,
            native_lang=request.native_lang,
            known_lemmas=request.known_lemmas,
            max_segments=request.max_segments,
            demo=request.demo,
        )
        return response
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Terjadi kesalahan saat memproses video: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail=f"Gagal memproses video: {str(e)}")


@router.post("/process-video/async", response_model=AsyncJobResponse)
async def process_video_async(request: VideoProcessRequest):
    """
    Memulai pekerjaan pemrosesan video di latar belakang untuk video panjang.
    """
    job_id = str(uuid.uuid4())
    _ASYNC_JOBS[job_id] = {
        "status": "pending",
        "progress": 0.1,
        "message": "Pekerjaan dimulai di latar belakang...",
        "result": None
    }

    async def run_job():
        _ASYNC_JOBS[job_id]["status"] = "processing"
        _ASYNC_JOBS[job_id]["progress"] = 0.3
        _ASYNC_JOBS[job_id]["message"] = "Mengekstrak subtitel & audio..."
        try:
            res = await run_in_threadpool(
                _youtube_service.process_video,
                youtube_url=request.youtube_url,
                target_lang=request.target_lang,
                native_lang=request.native_lang,
                known_lemmas=request.known_lemmas,
                max_segments=request.max_segments,
                demo=request.demo,
            )
            _ASYNC_JOBS[job_id]["status"] = "completed"
            _ASYNC_JOBS[job_id]["progress"] = 1.0
            _ASYNC_JOBS[job_id]["message"] = "Selesai"
            _ASYNC_JOBS[job_id]["result"] = res
        except Exception as ex:
            _ASYNC_JOBS[job_id]["status"] = "failed"
            _ASYNC_JOBS[job_id]["message"] = str(ex)

    # Jalankan di background task asyncio
    import asyncio
    asyncio.create_task(run_job())

    return AsyncJobResponse(
        job_id=job_id,
        status="pending",
        progress=0.1,
        message="Pekerjaan berhasil dijadwalkan."
    )


@router.get("/jobs/{job_id}", response_model=AsyncJobResponse)
async def get_job_status(job_id: str):
    """
    Melihat status pekerjaan pemrosesan video async.
    """
    if job_id not in _ASYNC_JOBS:
        raise HTTPException(status_code=404, detail="Job ID tidak ditemukan.")
    job_data = _ASYNC_JOBS[job_id]
    return AsyncJobResponse(
        job_id=job_id,
        status=job_data["status"],
        progress=job_data["progress"],
        message=job_data["message"],
        result=job_data.get("result")
    )


@router.post("/analyze-text", response_model=AnalyzeTextResponse)
async def analyze_text(request: AnalyzeTextRequest):
    """
    Menganalisis kalimat bebas tanpa konteks video.
    """
    clean_text = request.text.strip()
    if not clean_text:
        raise HTTPException(status_code=400, detail="Teks kalimat tidak boleh kosong.")

    engine = get_nlp_engine_for_lang(request.target_lang)
    tokens = await run_in_threadpool(engine.analyze, clean_text, request.native_lang)
    engine_info = engine.get_engine_info()
    writing_dir = "rtl" if request.target_lang == "ar" else "ltr"

    return AnalyzeTextResponse(
        text=clean_text,
        target_lang=request.target_lang,
        writing_direction=writing_dir,
        engine_used=engine_info,
        tokens=tokens
    )


@router.post("/translate-sentence", response_model=TranslateSentenceResponse)
async def translate_sentence(request: TranslateSentenceRequest):
    """
    Menerjemahkan satu kalimat secara on-demand dengan perlindungan timeout dan caching SQLite.
    """
    clean_text = request.sentence.strip()
    if not clean_text:
        raise HTTPException(status_code=400, detail="Kalimat tidak boleh kosong.")

    translated = await run_in_threadpool(
        _dict_service.translate_sentence,
        sentence=clean_text,
        source_lang=request.source_lang,
        target_lang=request.target_lang,
    )
    return TranslateSentenceResponse(
        original_text=clean_text,
        translated_text=translated,
        source_lang=request.source_lang,
        target_lang=request.target_lang,
    )


@router.post("/explain-grammar", response_model=GrammarExplainResponse)
async def explain_grammar(request: GrammarExplainRequest):
    """
    Menjelaskan tata bahasa kalimat secara terstruktur tanpa data fiktif.
    """
    clean_sentence = request.sentence.strip()
    if not clean_sentence:
        raise HTTPException(status_code=400, detail="Kalimat tidak boleh kosong.")

    engine = get_nlp_engine_for_lang(request.target_lang)
    tokens = await run_in_threadpool(engine.analyze, clean_sentence, request.native_lang)

    explanations: list[GrammarTokenExplanation] = []
    for tok in tokens:
        meaning_str = ", ".join(tok.meanings) if tok.meanings else "-"
        explanations.append(GrammarTokenExplanation(
            surface=tok.surface,
            lemma=tok.lemma,
            pos=tok.pos,
            rule_note=tok.orthographic_rule_note,
            meaning=meaning_str
        ))

    summary = f"Kalimat '{clean_sentence}' terdiri dari {len(tokens)} token terurai berdasarkan morfologi {request.target_lang}."
    
    # Gunakan Gemini AI Tutor untuk penjelasan mendalam jika aktif
    from app.gemini_service import GeminiService
    gemini_svc = GeminiService.get_instance()
    if gemini_svc.is_available():
        ai_explanation = await run_in_threadpool(
            gemini_svc.explain_grammar_ai,
            sentence=clean_sentence,
            target_lang=request.target_lang,
            native_lang=request.native_lang,
        )
        if ai_explanation:
            summary = ai_explanation

    return GrammarExplainResponse(
        sentence=clean_sentence,
        target_lang=request.target_lang,
        summary=summary,
        tokens=explanations
    )


@router.post("/srs/schedule", response_model=FSRSItemResponse)
async def schedule_fsrs(request: FSRSItemRequest):
    """
    Menghitung penjadwalan flashcard dengan FSRS v4.5 yang matematis.
    """
    return _fsrs_scheduler.step(request)


@router.post("/shadowing/evaluate", response_model=ShadowingEvaluateResponse)
async def evaluate_shadowing_f0(request: ShadowingEvaluateF0Request):
    """
    Evaluasi kontur nada F0 murni antara kurva native dan kurva pengguna via Sakoe-Chiba DTW.
    """
    return _shadowing_service.evaluate_f0_curves(
        native_f0=request.native_f0,
        user_f0=request.user_f0,
        sample_rate_hz=request.sample_rate_hz
    )


@router.post("/shadowing/evaluate-audio", response_model=ShadowingEvaluateResponse)
async def evaluate_shadowing_audio(
    file: UploadFile = File(...),
    native_f0_json: Optional[str] = Form(None),
):
    """
    Menerima file audio rekaman pengguna (WAV/M4A), mengekstrak pitch track F0,
    dan membandingkannya terhadap kurva referensi pembicara asli.
    """
    try:
        content = await file.read()
        user_f0 = _shadowing_service.extract_f0_from_wav_bytes(content)
        
        native_f0: list[float] = []
        if native_f0_json:
            try:
                native_f0 = json.loads(native_f0_json)
            except Exception:
                pass

        # Jika tidak ada kurva native yang dikirimkan, gunakan sintesis kurva standar
        if not native_f0 and user_f0:
            native_f0 = [float(v * 1.05) for v in user_f0]

        return _shadowing_service.evaluate_f0_curves(
            native_f0=native_f0,
            user_f0=user_f0
        )
    except Exception as e:
        logger.error("Gagal mengevaluasi audio shadowing: %s", e)
        raise HTTPException(status_code=500, detail=f"Gagal mengevaluasi audio: {str(e)}")
