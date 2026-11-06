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

    # Otomatis aktifkan port forwarding adb reverse jika HP Android terhubung via USB
    try:
        import subprocess
        res = subprocess.run(
            ["adb", "reverse", "tcp:8000", "tcp:8000"],
            capture_output=True,
            text=True,
            timeout=2
        )
        if res.returncode == 0:
            logger.info("Otomatis mengaktifkan: adb reverse tcp:8000 tcp:8000 (Android terhubung).")
    except Exception as e:
        logger.debug("ADB reverse lewati: %s", e)

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

# Middleware Header Keamanan (Anti-XSS, Anti-MIME Sniff, Anti-Clickjacking, Anti-Ad Sandbox)
@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "no-referrer-when-downgrade"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' https://www.youtube.com https://www.youtube-nocookie.com https://s.ytimg.com; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com data:; "
        "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://open.spotify.com; "
        "img-src 'self' data: blob: https:; "
        "media-src 'self' blob: data: https:; "
        "connect-src 'self' http: https: ws: wss:; "
        "object-src 'none'; "
        "base-uri 'self';"
    )
    path = request.url.path.lower()
    if path == "/" or path.endswith(".html") or path.endswith(".js") or path.endswith(".css"):
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"

    return response

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

# Penyajian File Cache (Audio MP3 & Transkrip JSON)
# Mendukung pengecekan ganda di backend/cache maupun root/cache dengan dukungan streaming audio range
from fastapi.responses import FileResponse

@app.api_route("/cache/{filename:path}", methods=["GET", "HEAD"])
async def serve_cached_file(filename: str):
    clean_name = os.path.basename(filename)
    cand_backend = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "cache", clean_name))
    cand_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "cache", clean_name))

    for cand in [cand_backend, cand_root]:
        if os.path.isfile(cand):
            return FileResponse(cand)

    raise HTTPException(status_code=404, detail="File cache audio tidak ditemukan.")

web_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend_web"))
if os.path.exists(web_dir):
    from fastapi.staticfiles import StaticFiles
    app.mount("/", StaticFiles(directory=web_dir, html=True), name="frontend_web")
else:
    @app.get("/")
    async def root():
        return {
            "app": "KoeStream Universal API",
            "status": "online",
            "documentation": "/docs",
            "health": "/api/v1/health",
        }
