# KoeStream (声ストリーム) 🌐🎧

> Platform Belajar Bahasa Imersif Berbasis Video YouTube Multibahasa dengan Analisis Linguistik Komputasional Mendalam, Akselerasi AI Google Gemini, Subtitel Interaktif 3-Tingkat (Ruby, Kanji, Romaji), Algoritma Repetisi Terjarak FSRS v4.5, dan Evaluasi Intonasi Suara Shadowing (Sakoe-Chiba DTW).

---

## 1. Arsitektur Sistem

Aplikasi ini terdiri dari dua komponen utama:
1. **Backend Python FastAPI**:
   - Pipeline ekstraksi transkrip 4 lapis: Subtitel Manual `yt-dlp` -> Auto-Caption `yt-dlp` -> ASR `faster-whisper` (word-timestamps + VAD) -> OCR Hardsub.
   - Mesin linguistik per bahasa: Jepang (`ja`), Mandarin (`zh`), Korea (`ko`), Arab (`ar`), Thai (`th`), Inggris (`en`), Jerman (`de`), Indonesia (`id`).
   - Implementasi matematis FSRS v4.5 (17 bobot resmi, mean reversion difficulty, retrievability decay).
   - Evaluasi kontur nada F0 peniruan suara (Shadowing) dengan Dynamic Time Warping (DTW) berpita Sakoe-Chiba berbobot $O(n \cdot w)$.
2. **Frontend Flutter (Material 3)**:
   - Pemutar YouTube terintegrasi dengan loop kalimat A-B akurat.
   - `UniversalRubySubtitleWidget` dengan penyejajaran DP Okurigana (furigana hanya di atas kanji), pinyin bertanda nada, dan garis bawah kode warna kelas kata (Universal POS).
   - Lembar kamus instan (Dictionary Bottom Sheet) dengan audio TTS, catatan aturan fonologis, dan penyimpanan flashcard SRS.
   - Layar Review Flashcard FSRS v4.5 dengan kartu flip dan persistensi lokal `SharedPreferences`.
   - Layar Shadowing dengan perekam suara mikrofon dan visualisasi kurva nada ganda (CustomPainter).

---

## 2. Struktur Proyek

```text
lingostream_universal/
├── backend/
│   ├── .env.example
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── app/
│   │   ├── __init__.py
│   │   ├── dictionary.py
│   │   ├── fsrs.py
│   │   ├── main.py
│   │   ├── routes.py
│   │   ├── schemas.py
│   │   ├── shadowing.py
│   │   ├── youtube.py
│   │   └── nlp/
│   │       ├── __init__.py
│   │       ├── arabic.py
│   │       ├── base.py
│   │       ├── chinese.py
│   │       ├── japanese.py
│   │       ├── korean.py
│   │       ├── thai.py
│   │       └── western.py
│   └── tests/
│       ├── test_fsrs.py
│       └── test_nlp.py
├── frontend_flutter/
│   ├── analysis_options.yaml
│   ├── pubspec.yaml
│   ├── android/app/src/main/AndroidManifest.xml
│   └── lib/
│       ├── main.dart
│       ├── models/
│       │   └── models.dart
│       ├── screens/
│       │   ├── immersion_screen.dart
│       │   ├── review_screen.dart
│       │   └── shadowing_screen.dart
│       ├── services/
│       │   ├── api_service.dart
│       │   └── storage_service.dart
│       ├── state/
│       │   └── app_state.dart
│       └── widgets/
│           ├── dictionary_sheet.dart
│           └── universal_ruby_subtitle.dart
└── README.md
```

---

## 3. Instalasi & Menjalankan Backend

### Prasyarat
- Python 3.11 atau lebih baru
- `ffmpeg` (diperlukan untuk ekstraksi audio YouTube dan Whisper ASR)
  ```bash
  # Ubuntu / Debian
  sudo apt-get update && sudo apt-get install -y ffmpeg
  # macOS
  brew install ffmpeg
  ```

### Langkah Instalasi
```bash
# 1. Masuk ke direktori backend
cd backend

# 2. Buat virtual environment
python3 -m venv .venv
source .venv/bin/activate  # Di Windows: .venv\Scripts\activate

# 3. Pasang seluruh dependensi
pip install --upgrade pip
pip install -r requirements.txt

# 4. Unduh model spaCy (opsional untuk Bahasa Inggris/Jerman/dll.)
python -m spacy download en_core_web_sm
python -m spacy download de_core_news_sm
```

### Menjalankan Server FastAPI
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
Server akan aktif di `http://localhost:8000`. Dokumentasi interaktif Swagger UI tersedia di `http://localhost:8000/docs`.

### Menjalankan Pengujian Unit (Pytest)
```bash
PYTHONPATH=. pytest tests/test_fsrs.py tests/test_nlp.py -v
```

### Menjalankan via Docker
```bash
cd backend
docker build -t lingostream-backend .
docker run -p 8000:8000 lingostream-backend
```

---

## 4. Instalasi & Menjalankan Frontend Flutter

### Prasyarat
- Flutter SDK >= 3.22 (Dart >= 3.4)
- Android Studio / VS Code dengan plugin Flutter

### Langkah Menjalankan
```bash
# 1. Masuk ke direktori frontend
cd frontend_flutter

# 2. Ambil paket Flutter
flutter pub get

# 3. Jalankan analisis kode
flutter analyze

# 4. Jalankan aplikasi:
# Untuk Emulator Android (Default API_BASE: http://10.0.2.2:8000)
flutter run

# Untuk Perangkat Fisik (Ganti dengan IP LAN komputer Anda)
flutter run --dart-define=API_BASE=http://192.168.1.10:8000

# Untuk Browser Chrome / Web
flutter run -d chrome --dart-define=API_BASE=http://localhost:8000
```

---

## 5. Daftar Endpoint API & Contoh Pemanggilan cURL

### 1. Health Check
```bash
curl -X GET "http://localhost:8000/api/v1/health"
```

### 2. Memproses Video YouTube
```bash
curl -X POST "http://localhost:8000/api/v1/process-video" \
  -H "Content-Type: application/json" \
  -d '{
    "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "target_lang": "ja",
    "native_lang": "id",
    "demo": true
  }'
```

### 3. Analisis Kalimat Bebas (NLP Tokenizer)
```bash
curl -X POST "http://localhost:8000/api/v1/analyze-text" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "私は毎日日本語を勉強します。",
    "target_lang": "ja",
    "native_lang": "id"
  }'
```

### 4. Eksplanasi Tata Bahasa
```bash
curl -X POST "http://localhost:8000/api/v1/explain-grammar" \
  -H "Content-Type: application/json" \
  -d '{
    "sentence": "Ich stehe um 7 Uhr auf",
    "target_lang": "de",
    "native_lang": "id"
  }'
```

### 5. Penjadwalan Flashcard FSRS v4.5
```bash
curl -X POST "http://localhost:8000/api/v1/srs/schedule" \
  -H "Content-Type: application/json" \
  -d '{
    "card_id": "card_001",
    "rating": 3,
    "state": "new",
    "desired_retention": 0.9
  }'
```

### 6. Evaluasi Shadowing Kontur F0 (DTW)
```bash
curl -X POST "http://localhost:8000/api/v1/shadowing/evaluate" \
  -H "Content-Type: application/json" \
  -d '{
    "native_f0": [120.0, 130.5, 145.0, 140.0, 110.0],
    "user_f0": [118.0, 128.0, 142.0, 138.0, 108.0]
  }'
```

---

## 6. Keterbatasan yang Jujur & Perilaku Fallback

| Fitur / Komponen | Pustaka Utama | Perilaku Saat Pustaka Tidak Terpasang (Fallback) | Status Flag API |
| :--- | :--- | :--- | :--- |
| **ASR Audio YouTube** | `faster-whisper` | Melewati Lapisan 3 dan mencari Lapisan 4 / melempar HTTP 404 jika seluruh lapisan kosong. | `engine_used['pipeline']` mencatat lapisan yang sukses |
| **Tokenisasi Jepang** | `sudachipy` + `sudachidict_core` | Segmentasi berbasis Regex kanji/kana + tabel aturan partikel bawaan. | `engine_used['tokenizer'] = 'regex_fallback'` |
| **Mandarin Tone Sandhi** | `jieba` + `pypinyin` | Segmentasi berbasis karakter dan kamus nada leksikon offline. | `engine_used['segmenter'] = 'char_fallback'` |
| **Morfologi Korea** | `kiwipiepy` + `g2pk2` | Pemisahan spasi + leksikon asimilasi fonologis terkenal (독립 -> 동닙, 같이 -> 가치). | `engine_used['morphology'] = 'regex_fallback'` |
| **Auto-Tashkeel Arab** | `mishkal` / `camel-tools` | Teks Arab dipertahankan apa adanya tanpa harakat karangan. | `engine_used['tashkeel'] = 'none'` |
| **5 Nada Thai** | `pythainlp` | Pemecahan spasi + algoritma pohon keputusan 5 nada fonologis bawaan. | `engine_used['segmenter'] = 'whitespace_fallback'` |
| **Morfologi Barat** | `spacy` | Lemmatization leksikon kata kerja tidak beraturan (`went` -> `go`, separable verbs Jerman). | `engine_used['spacy_model'] = 'rule_fallback'` |
| **Ekstraksi F0 Audio** | `librosa` / `parselmouth` | Algoritma autokorelasi berbobot native Python/NumPy (50-500 Hz). | Evaluasi tetap berjalan presisi |

---

## 7. Kepatuhan & Hak Cipta
Aplikasi LingoStream Universal tidak menyimpan atau mendistribusikan ulang materi video atau audio berhak cipta milik YouTube. File audio sementara yang diunduh untuk keperluan transkripsi ASR (Whisper) **dihapus seketika dari penyimpanan disk** setelah proses transkripsi selesai. Pengguna bertanggung jawab penuh atas kepatuhan terhadap Ketentuan Layanan (Terms of Service) YouTube.
