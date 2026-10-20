"""
LingoStream Universal - Titik Masuk Utama Server FastAPI (app/main.py)
Menyediakan inisialisasi aplikasi, middleware CORS yang aman, penanganan error terstruktur,
serta registrasi seluruh router API v1.
"""

import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.routes import router as api_v1_router
from app.dictionary import DictionaryService

# Konfigurasi Logging Terstruktur
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("lingostream.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Siklus hidup aplikasi FastAPI: Inisialisasi awal dan pembersihan saat server berhenti.
    """
    logger.info("Memulai server LingoStream Universal...")
    # Inisialisasi layanan kamus SQLite
    DictionaryService.get_instance()
    logger.info("Database cache kamus siap digunakan.")
    yield
    logger.info("Mematikan server LingoStream Universal...")


app = FastAPI(
    title="KoeStream API",
    description="Backend Linguistik Komputasional Multibahasa & Platform Belajar Bahasa Berbasis Video YouTube",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# =====================================================================
# KONFIGURASI KEAMANAN & CORS
# Catatan Keamanan: Jangan kombinasikan allow_origins=['*'] dengan allow_credentials=True
# =====================================================================
raw_origins = os.getenv("ALLOWED_ORIGINS", "*").strip()
if raw_origins == "*":
    allow_origins = ["*"]
    allow_credentials = False
else:
    allow_origins = [orig.strip() for orig in raw_origins.split(",") if orig.strip()]
    allow_credentials = True

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================================================================
# PENANGANAN ERROR TERSTRUKTUR DENGAN FORMAT {detail, code}
# =====================================================================
@app.exception_handler(StarletteHTTPException)
async def custom_http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail,
            "code": f"HTTP_{exc.status_code}",
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    error_messages = []
    for err in exc.errors():
        loc = " -> ".join([str(x) for x in err.get("loc", [])])
        msg = err.get("msg", "Validasi gagal")
        error_messages.append(f"{loc}: {msg}")
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "; ".join(error_messages),
            "code": "VALIDATION_ERROR",
        },
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled Exception pada %s: %s", request.url.path, exc, exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "Terjadi kesalahan internal pada server. Silakan periksa log server.",
            "code": "INTERNAL_SERVER_ERROR",
        },
    )


# Registrasi Router API v1
app.include_router(api_v1_router)


@app.get("/")
async def root():
    return {
        "app": "LingoStream Universal API",
        "status": "online",
        "documentation": "/docs",
        "health": "/api/v1/health",
    }
