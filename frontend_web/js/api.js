/**
 * KoeStream Universal - API Service Module
 * Handles API calls to FastAPI backend with full offline fallback capabilities.
 */

// Curated Playlist inspired by Spotify Liked Songs ("Lagu yang Disukai")
window.KOESTREAM_PLAYLIST = [
  {
    id: '2BlDX1yfT0ea5wo0vjCKKa',
    title: '光るなら (Hikaru Nara)',
    artist: 'Goose house',
    album: '光るなら (Shigatsu wa Kimi no Uso OP)',
    duration: '04:12',
    type: 'spotify',
    url: 'https://open.spotify.com/track/2BlDX1yfT0ea5wo0vjCKKa',
    artwork: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d0000b2730735b9b1d06b65bbd8814825',
    language: 'ja',
    langName: 'Jepang (日本語)',
    description: 'Lagu tema pembuka anime Shigatsu wa Kimi no Uso karya Goose house rilis resmi Spotify.'
  },
  {
    id: '4Mo0vn7a03pJ19uESUrH5a',
    title: '可愛くてごめん',
    artist: 'HoneyWorks feat. ちゅーたん',
    album: '可愛くてごめん',
    duration: '03:39',
    type: 'spotify',
    url: 'https://open.spotify.com/track/4Mo0vn7a03pJ19uESUrH5a',
    artwork: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e0266e246eec1f1fb552ed0f017',
    language: 'ja',
    langName: 'Jepang (日本語)',
    description: 'Lagu J-Pop viral HoneyWorks dengan lirik ceria percakapan Jepang sehari-hari.'
  },
  {
    id: '1HNvADmPBGAExeyIHkcJtd',
    title: 'スパークル (Sparkle)',
    artist: 'RADWIMPS',
    album: 'Human Bloom (Kimi no Na wa)',
    duration: '06:50',
    type: 'spotify',
    url: 'https://open.spotify.com/track/1HNvADmPBGAExeyIHkcJtd',
    artwork: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e0285b0876389c92ac31f514593',
    language: 'ja',
    langName: 'Jepang (日本語)',
    description: 'Soundtrack legendaris anime Your Name karya Makoto Shinkai & RADWIMPS versi Spotify.'
  },
  {
    id: '0ofhAOxE9vBKTcPU2UQIAV',
    title: '夜に駆ける (Yoru ni Kakeru)',
    artist: 'YOASOBI',
    album: 'THE BOOK',
    duration: '04:21',
    type: 'spotify',
    url: 'https://open.spotify.com/track/0ofhAOxE9vBKTcPU2UQIAV',
    artwork: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02baf89eb11ec7c657805d2da0',
    language: 'ja',
    langName: 'Jepang (日本語)',
    description: 'Lagu debut fenomena global YOASOBI rilis resmi Spotify.'
  },
  {
    id: '4GfK1qOF3uBWidbPlTCQRL',
    title: 'Monokrom',
    artist: 'Tulus',
    album: 'Monokrom',
    duration: '03:34',
    type: 'spotify',
    url: 'https://open.spotify.com/track/4GfK1qOF3uBWidbPlTCQRL',
    artwork: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02fdb8b5fa2f0fcf71d18f50c0',
    language: 'id',
    langName: 'Indonesia',
    description: 'Karya nostalgia Tulus dengan lirik puitis dan hangat tentang kenangan masa lalu.'
  },
  {
    id: 'fairytale_rybak',
    title: 'Fairytale',
    artist: 'Alexander Rybak',
    album: 'Fairytales',
    duration: '03:03',
    type: 'spotify',
    url: 'https://open.spotify.com/track/4Pj9wjcbbJq5m8yK7aE9p7',
    artwork: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e0281b37805fa6054fa82649ea2',
    language: 'en',
    langName: 'Inggris',
    description: 'Lagu pemenang Eurovision legendaris dari Alexander Rybak dengan melodi biola energik.'
  },
  {
    id: 'by4SYYWlhEs',
    title: '夜に駆ける (MV Resmi)',
    artist: 'YOASOBI',
    album: 'YouTube Official MV',
    duration: '04:21',
    type: 'youtube',
    url: 'https://www.youtube.com/watch?v=by4SYYWlhEs',
    artwork: 'https://img.youtube.com/vi/by4SYYWlhEs/mqdefault.jpg',
    language: 'ja',
    langName: 'Jepang (日本語)',
    description: 'Video musik animasi resmi YOASOBI di YouTube dengan visual cerita novel.'
  },
  {
    id: 'SnXkhkEvNIM',
    title: '光るなら (Acoustic Session)',
    artist: 'Goose house',
    album: 'YouTube Live Studio',
    duration: '04:19',
    type: 'youtube',
    url: 'https://www.youtube.com/watch?v=SnXkhkEvNIM',
    artwork: 'https://img.youtube.com/vi/SnXkhkEvNIM/mqdefault.jpg',
    language: 'ja',
    langName: 'Jepang (日本語)',
    description: 'Video sesi akustik live santai Goose house di YouTube (aransemen berbeda dari studio).'
  },
  {
    id: '9bZkp7q19f0',
    title: '日常会話 - カフェでの待ち合わせ',
    artist: 'Anime Immersion Audio #04',
    album: 'Anime Nihongo Vol. 1',
    duration: '00:45',
    type: 'youtube',
    url: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
    artwork: 'https://img.youtube.com/vi/9bZkp7q19f0/mqdefault.jpg',
    language: 'ja',
    langName: 'Jepang (日本語)',
    description: 'Dialog percakapan anime dasar untuk mengasah pendengaran dan penguasaan partikel.'
  }
];

class ApiService {
  constructor() {
    let defaultBase = 'http://localhost:8000';
    if (typeof window !== 'undefined' && window.location && window.location.origin) {
      const origin = window.location.origin;
      if (origin.startsWith('http://') || origin.startsWith('https://')) {
        defaultBase = origin;
      }
    }
    this.baseUrl = localStorage.getItem('koestream_api_base_url') || defaultBase;
  }

  setBaseUrl(url) {
    this.baseUrl = url.replace(/\/+$/, '');
    localStorage.setItem('koestream_api_base_url', this.baseUrl);
  }

  async processMedia(url, targetLang = 'ja', nativeLang = 'id', knownLemmas = [], demo = false) {
    if (demo) {
      return this.getDemoData(url, targetLang, nativeLang);
    }

    const controller = new AbortController();
    // Berikan batas waktu 120 detik untuk pemrosesan video berdurasi panjang atau ASR Whisper
    const timer = setTimeout(() => controller.abort(), 120000);

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/process-video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          media_url: url,
          youtube_url: url,
          target_lang: targetLang,
          native_lang: nativeLang,
          known_lemmas: knownLemmas,
          demo: false
        })
      });
      clearTimeout(timer);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server backend mengembalikan status HTTP ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      clearTimeout(timer);
      console.warn('API call failed or timed out:', err);

      // JANGAN PERNAH menukar video asli user dengan data demo jika demo bernilai false!
      // Berikan pesan kesalahan yang jelas dan dapat ditindaklanjuti oleh user.
      if (!demo) {
        if (err.name === 'AbortError') {
          throw new Error('Proses video melebihi batas waktu (120 detik). Pemrosesan subtitel atau audio ASR membutuhkan waktu, silakan klik Coba Lagi.');
        }
        if (err.message && err.message.includes('Failed to fetch')) {
          throw new Error(`Gagal terhubung ke backend (${this.baseUrl}). Pastikan server FastAPI di komputer aktif dan port 8000 dapat diakses.`);
        }
        throw err;
      }

      // Fallback offline hanya jika dipanggil dengan parameter demo=true
      const fallback = this.getDemoData(url, targetLang, nativeLang);
      fallback._fromFallback = true;
      return fallback;
    }
  }

  async translateSentence(sentence, targetLang, nativeLang = 'id') {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/translate-sentence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sentence,
          source_lang: targetLang,
          target_lang: nativeLang
        })
      });
      if (response.ok) {
        const data = await response.json();
        return data.translated_text;
      }
    } catch (e) {
      console.debug('Translate sentence failed:', e);
    }
    return '';
  }

  async explainGrammar(sentence, targetLang, nativeLang = 'id') {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8500);
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/explain-grammar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sentence,
          target_lang: targetLang,
          native_lang: nativeLang
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      clearTimeout(timeoutId);
      console.warn('Explain grammar request timed out or failed:', e);
    }

    // Offline structured fallback
    return {
      sentence,
      target_lang: targetLang,
      summary: `### Eksplanasi Tata Bahasa (${targetLang ? targetLang.toUpperCase() : 'JA'})\n` +
               `Analisis linguistik terurai untuk kalimat: **"${sentence}"**.\n\n` +
               `*Tips: Silakan periksa kembali koneksi backend API Anda jika membutuhkan ulasan AI mendalam.*`,
      tokens: []
    };
  }

  getDemoData(url, targetLang = 'ja', nativeLang = 'id') {
    const isSpotify = url.includes('spotify') || url.includes('open.spotify.com');
    const u = url.toLowerCase();

    // Check specific track requests
    const isMonokrom = u.includes('4gfk1qof3ubwidbpltcqrl') || u.includes('monokrom');
    const isSparkle = u.includes('1hnvadmpbgaexeyihkcjtd') || u.includes('sparkle');
    const isYoasobi = (u.includes('by4syywlhes') || u.includes('yoasobi') || u.includes('0ofhaoxe9vbktcpu2uqiavz')) && !u.includes('kawaikute');
    const isFairytale = u.includes('fairytale');

    if (isMonokrom) {
      return {
        video_id: 'v52e0rY35eQ',
        title: 'Monokrom',
        channel: 'Tulus',
        language: 'id',
        writing_direction: 'ltr',
        source_type: 'spotify',
        spotify_id: '4GfK1qOF3uBWidbPlTCQRL',
        spotify_embed_url: 'https://open.spotify.com/embed/track/4GfK1qOF3uBWidbPlTCQRL',
        thumbnail_url: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02fdb8b5fa2f0fcf71d18f50c0',
        artist: 'Tulus',
        segments: [
          {
            index: 0,
            start_ms: 1400,
            end_ms: 7800,
            original_text: 'Lembaran foto hitam putih',
            translated_text: 'Lembaran foto hitam putih',
            tokens: [
              { token_id: 0, surface: 'Lembaran', display_parts: [{ text: 'Lembaran', ruby: null }], phonetic_script: 'lembaran', pronounced_as: 'lembaran', lemma: 'lembar', pos: 'NOUN', meanings: ['helai', 'lembaran kertas'] },
              { token_id: 1, surface: 'foto', display_parts: [{ text: 'foto', ruby: null }], phonetic_script: 'foto', pronounced_as: 'foto', lemma: 'foto', pos: 'NOUN', meanings: ['potret', 'gambar kamera'] },
              { token_id: 2, surface: 'hitam', display_parts: [{ text: 'hitam', ruby: null }], phonetic_script: 'hitam', pronounced_as: 'hitam', lemma: 'hitam', pos: 'ADJ', meanings: ['warna gelap/hitam'] },
              { token_id: 3, surface: 'putih', display_parts: [{ text: 'putih', ruby: null }], phonetic_script: 'putih', pronounced_as: 'putih', lemma: 'putih', pos: 'ADJ', meanings: ['warna putih'] }
            ]
          },
          {
            index: 1,
            start_ms: 7800,
            end_ms: 13500,
            original_text: 'Aku coba ingat kembali warna bajumu kala itu',
            translated_text: 'Aku mencoba mengingat kembali warna bajumu saat itu',
            tokens: [
              { token_id: 0, surface: 'Aku', display_parts: [{ text: 'Aku', ruby: null }], phonetic_script: 'aku', pronounced_as: 'aku', lemma: 'aku', pos: 'PRON', meanings: ['saya'] },
              { token_id: 1, surface: 'coba', display_parts: [{ text: 'coba', ruby: null }], phonetic_script: 'coba', pronounced_as: 'coba', lemma: 'coba', pos: 'VERB', meanings: ['mencoba'] },
              { token_id: 2, surface: 'ingat', display_parts: [{ text: 'ingat', ruby: null }], phonetic_script: 'ingat', pronounced_as: 'ingat', lemma: 'ingat', pos: 'VERB', meanings: ['mengingat'] },
              { token_id: 3, surface: 'kembali', display_parts: [{ text: 'kembali', ruby: null }], phonetic_script: 'kembali', pronounced_as: 'kembali', lemma: 'kembali', pos: 'ADV', meanings: ['ulang', 'lagi'] },
              { token_id: 4, surface: 'warna', display_parts: [{ text: 'warna', ruby: null }], phonetic_script: 'warna', pronounced_as: 'warna', lemma: 'warna', pos: 'NOUN', meanings: ['rona', 'corak'] },
              { token_id: 5, surface: 'bajumu', display_parts: [{ text: 'bajumu', ruby: null }], phonetic_script: 'bajumu', pronounced_as: 'bajumu', lemma: 'baju', pos: 'NOUN', meanings: ['pakaianmu'] },
              { token_id: 6, surface: 'kala', display_parts: [{ text: 'kala', ruby: null }], phonetic_script: 'kala', pronounced_as: 'kala', lemma: 'kala', pos: 'ADV', meanings: ['waktu', 'saat'] },
              { token_id: 7, surface: 'itu', display_parts: [{ text: 'itu', ruby: null }], phonetic_script: 'itu', pronounced_as: 'itu', lemma: 'itu', pos: 'DET', meanings: ['penunjuk waktu lampau'] }
            ]
          },
          {
            index: 2,
            start_ms: 13500,
            end_ms: 18200,
            original_text: 'Kali ke berapa di hari itu',
            translated_text: 'Sudah kali ke berapa di hari tersebut',
            tokens: [
              { token_id: 0, surface: 'Kali', display_parts: [{ text: 'Kali', ruby: null }], phonetic_script: 'kali', pronounced_as: 'kali', lemma: 'kali', pos: 'NOUN', meanings: ['urutan pengulangan'] },
              { token_id: 1, surface: 'ke', display_parts: [{ text: 'ke', ruby: null }], phonetic_script: 'ke', pronounced_as: 'ke', lemma: 'ke', pos: 'PART', meanings: ['awalan bilangan'] },
              { token_id: 2, surface: 'berapa', display_parts: [{ text: 'berapa', ruby: null }], phonetic_script: 'berapa', pronounced_as: 'berapa', lemma: 'berapa', pos: 'PRON', meanings: ['kata tanya jumlah'] },
              { token_id: 3, surface: 'di', display_parts: [{ text: 'di', ruby: null }], phonetic_script: 'di', pronounced_as: 'di', lemma: 'di', pos: 'ADP', meanings: ['pada'] },
              { token_id: 4, surface: 'hari', display_parts: [{ text: 'hari', ruby: null }], phonetic_script: 'hari', pronounced_as: 'hari', lemma: 'hari', pos: 'NOUN', meanings: ['waktu siang/hari'] },
              { token_id: 5, surface: 'itu', display_parts: [{ text: 'itu', ruby: null }], phonetic_script: 'itu', pronounced_as: 'itu', lemma: 'itu', pos: 'DET', meanings: ['itu'] }
            ]
          },
          {
            index: 3,
            start_ms: 18200,
            end_ms: 23500,
            original_text: 'Ibu mendongeng tentang mawar merah dan cinta',
            translated_text: 'Ibu bercerita tentang setangkai mawar merah dan cinta',
            tokens: [
              { token_id: 0, surface: 'Ibu', display_parts: [{ text: 'Ibu', ruby: null }], phonetic_script: 'ibu', pronounced_as: 'ibu', lemma: 'ibu', pos: 'NOUN', meanings: ['orang tua perempuan', 'bunda'] },
              { token_id: 1, surface: 'mendongeng', display_parts: [{ text: 'mendongeng', ruby: null }], phonetic_script: 'mendongeng', pronounced_as: 'mendongeng', lemma: 'dongeng', pos: 'VERB', meanings: ['menceritakan kisah'] },
              { token_id: 2, surface: 'tentang', display_parts: [{ text: 'tentang', ruby: null }], phonetic_script: 'tentang', pronounced_as: 'tentang', lemma: 'tentang', pos: 'ADP', meanings: ['mengenai', 'perihal'] },
              { token_id: 3, surface: 'mawar', display_parts: [{ text: 'mawar', ruby: null }], phonetic_script: 'mawar', pronounced_as: 'mawar', lemma: 'mawar', pos: 'NOUN', meanings: ['bunga mawar'] },
              { token_id: 4, surface: 'merah', display_parts: [{ text: 'merah', ruby: null }], phonetic_script: 'merah', pronounced_as: 'merah', lemma: 'merah', pos: 'ADJ', meanings: ['warna merah'] },
              { token_id: 5, surface: 'dan', display_parts: [{ text: 'dan', ruby: null }], phonetic_script: 'dan', pronounced_as: 'dan', lemma: 'dan', pos: 'CONJ', meanings: ['kata hubung'] },
              { token_id: 6, surface: 'cinta', display_parts: [{ text: 'cinta', ruby: null }], phonetic_script: 'cinta', pronounced_as: 'cinta', lemma: 'cinta', pos: 'NOUN', meanings: ['kasih sayang'] }
            ]
          }
        ]
      };
    }

    if (isSparkle) {
      return {
        "video_id": "-pHfPJGatgE",
        "title": "スパークル (Sparkle) - Original Version",
        "channel": "RADWIMPS",
        "language": "ja",
        "writing_direction": "ltr",
        "source_type": "spotify",
        "spotify_id": "1HNvADmPBGAExeyIHkcJtd",
        "spotify_embed_url": "https://open.spotify.com/embed/track/1HNvADmPBGAExeyIHkcJtd?utm_source=generator&theme=0",
        "thumbnail_url": "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e0285b0876389c92ac31f514593",
        "artist": "RADWIMPS",
        "duration_ms": 410000,
        "duration": 410,
        "audio_url": null,
        "engine_used": {
                "pipeline": "spotify_lrclib_synced",
                "nlp": "ja",
                "tokenizer": "sudachipy_mode_c",
                "phonetics": "pykakasi",
                "pitch": "real_ojad_lexicon"
        },
        "truncated": false,
        "segments": [
                {
                        "index": 0,
                        "start_ms": 20090,
                        "end_ms": 23830,
                        "original_text": "まだこの世界は",
                        "translated_text": "Dunia ini masih saja",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "まだ",
                                        "display_parts": [
                                                {
                                                        "text": "まだ",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "mada",
                                        "pronounced_as": "mada",
                                        "orthographic_rule_note": null,
                                        "lemma": "まだ",
                                        "pos": "ADV",
                                        "sub_pos": "*",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "tetap"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "この",
                                        "display_parts": [
                                                {
                                                        "text": "この",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "kono",
                                        "pronounced_as": "kono",
                                        "orthographic_rule_note": null,
                                        "lemma": "この",
                                        "pos": "DET",
                                        "sub_pos": "*",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "ini"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "世界",
                                        "display_parts": [
                                                {
                                                        "text": "世界",
                                                        "ruby": "せかい"
                                                }
                                        ],
                                        "phonetic_script": "sekai",
                                        "pronounced_as": "sekai",
                                        "orthographic_rule_note": null,
                                        "lemma": "世界",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "dunia"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 3,
                                        "surface": "は",
                                        "display_parts": [
                                                {
                                                        "text": "は",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "ha",
                                        "pronounced_as": "wa",
                                        "orthographic_rule_note": "Partikel は dilafalkan 'wa'",
                                        "lemma": "は",
                                        "pos": "PART",
                                        "sub_pos": "係助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "gigi"
                                        ],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 1,
                        "start_ms": 23830,
                        "end_ms": 27720,
                        "original_text": "僕を飼いならしてたいみたいだ",
                        "translated_text": "Bagaikan mengendalikan diriku",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "僕",
                                        "display_parts": [
                                                {
                                                        "text": "僕",
                                                        "ruby": "ぼく"
                                                }
                                        ],
                                        "phonetic_script": "boku",
                                        "pronounced_as": "boku",
                                        "orthographic_rule_note": null,
                                        "lemma": "僕",
                                        "pos": "PRON",
                                        "sub_pos": "*",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "SAYA"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "を",
                                        "display_parts": [
                                                {
                                                        "text": "を",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "o",
                                        "pronounced_as": "o",
                                        "orthographic_rule_note": "Partikel を dilafalkan 'o'",
                                        "lemma": "を",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "dari"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "飼いならし",
                                        "display_parts": [
                                                {
                                                        "text": "飼",
                                                        "ruby": "か"
                                                },
                                                {
                                                        "text": "いならし",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "kainarashi",
                                        "pronounced_as": "kainarashi",
                                        "orthographic_rule_note": null,
                                        "lemma": "飼いならす",
                                        "pos": "VERB",
                                        "sub_pos": "一般",
                                        "inflection_chain": [
                                                "Bentuk Ren'youkei (Masu-stem)"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "jinak"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 3,
                                        "surface": "て",
                                        "display_parts": [
                                                {
                                                        "text": "て",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "te",
                                        "pronounced_as": "te",
                                        "orthographic_rule_note": null,
                                        "lemma": "てる",
                                        "pos": "AUX",
                                        "sub_pos": "*",
                                        "inflection_chain": [
                                                "Bentuk Ren'youkei (Masu-stem)"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Teru"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 4,
                                        "surface": "たい",
                                        "display_parts": [
                                                {
                                                        "text": "たい",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "tai",
                                        "pronounced_as": "tai",
                                        "orthographic_rule_note": null,
                                        "lemma": "たい",
                                        "pos": "AUX",
                                        "sub_pos": "*",
                                        "inflection_chain": [
                                                "助動詞-タイ: 終止形-一般"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "ikan air tawar"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 5,
                                        "surface": "みたい",
                                        "display_parts": [
                                                {
                                                        "text": "みたい",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "mitai",
                                        "pronounced_as": "mitai",
                                        "orthographic_rule_note": null,
                                        "lemma": "みたい",
                                        "pos": "ADJ",
                                        "sub_pos": "助動詞語幹",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "saya ingin"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 6,
                                        "surface": "だ",
                                        "display_parts": [
                                                {
                                                        "text": "だ",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "da",
                                        "pronounced_as": "da",
                                        "orthographic_rule_note": null,
                                        "lemma": "だ",
                                        "pos": "AUX",
                                        "sub_pos": "*",
                                        "inflection_chain": [
                                                "助動詞-ダ: 終止形-一般"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "adalah"
                                        ],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 2,
                        "start_ms": 27720,
                        "end_ms": 31670,
                        "original_text": "望み通りいいだろう",
                        "translated_text": "Tapi ini seperti yang kuinginkan",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "望み",
                                        "display_parts": [
                                                {
                                                        "text": "望",
                                                        "ruby": "のぞ"
                                                },
                                                {
                                                        "text": "み",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "nozomi",
                                        "pronounced_as": "nozomi",
                                        "orthographic_rule_note": null,
                                        "lemma": "望み",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "harapan"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "通り",
                                        "display_parts": [
                                                {
                                                        "text": "通",
                                                        "ruby": "とお"
                                                },
                                                {
                                                        "text": "り",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "toori",
                                        "pronounced_as": "toori",
                                        "orthographic_rule_note": null,
                                        "lemma": "通り",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "jalan"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "いい",
                                        "display_parts": [
                                                {
                                                        "text": "いい",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "ii",
                                        "pronounced_as": "ii",
                                        "orthographic_rule_note": null,
                                        "lemma": "いい",
                                        "pos": "ADJ",
                                        "sub_pos": "非自立可能",
                                        "inflection_chain": [
                                                "形容詞: 終止形-一般"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Bagus"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 3,
                                        "surface": "だろう",
                                        "display_parts": [
                                                {
                                                        "text": "だろう",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "darou",
                                        "pronounced_as": "darou",
                                        "orthographic_rule_note": null,
                                        "lemma": "だ",
                                        "pos": "AUX",
                                        "sub_pos": "*",
                                        "inflection_chain": [
                                                "助動詞-ダ: 意志推量形"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "adalah"
                                        ],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 3,
                        "start_ms": 31670,
                        "end_ms": 35690,
                        "original_text": "美しくもがくよ",
                        "translated_text": "Sebuah perjuangan yang indah",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "美しくも",
                                        "display_parts": [
                                                {
                                                        "text": "美",
                                                        "ruby": "い"
                                                },
                                                {
                                                        "text": "しくも",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "ishikumo",
                                        "pronounced_as": "ishikumo",
                                        "orthographic_rule_note": null,
                                        "lemma": "美しくも",
                                        "pos": "ADV",
                                        "sub_pos": "*",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Cantik juga"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "がく",
                                        "display_parts": [
                                                {
                                                        "text": "がく",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "gaku",
                                        "pronounced_as": "gaku",
                                        "orthographic_rule_note": null,
                                        "lemma": "がく",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "bingkai"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "よ",
                                        "display_parts": [
                                                {
                                                        "text": "よ",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "yo",
                                        "pronounced_as": "yo",
                                        "orthographic_rule_note": null,
                                        "lemma": "よ",
                                        "pos": "PART",
                                        "sub_pos": "終助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Yo"
                                        ],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 4,
                        "start_ms": 35690,
                        "end_ms": 39300,
                        "original_text": "互いの砂時計",
                        "translated_text": "Dengan memandang jam pasir masing-masing",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "互い",
                                        "display_parts": [
                                                {
                                                        "text": "互",
                                                        "ruby": "たが"
                                                },
                                                {
                                                        "text": "い",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "tagai",
                                        "pronounced_as": "tagai",
                                        "orthographic_rule_note": null,
                                        "lemma": "互い",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "satu sama lain"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "の",
                                        "display_parts": [
                                                {
                                                        "text": "の",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "no",
                                        "pronounced_as": "no",
                                        "orthographic_rule_note": null,
                                        "lemma": "の",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "dari"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "砂時計",
                                        "display_parts": [
                                                {
                                                        "text": "砂時計",
                                                        "ruby": "すなどけい"
                                                }
                                        ],
                                        "phonetic_script": "sunadokei",
                                        "pronounced_as": "sunadokei",
                                        "orthographic_rule_note": null,
                                        "lemma": "砂時計",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "jam pasir"
                                        ],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 5,
                        "start_ms": 39300,
                        "end_ms": 43210,
                        "original_text": "眺めながらキスをしようよ",
                        "translated_text": "Mari kita saling berciuman",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "眺め",
                                        "display_parts": [
                                                {
                                                        "text": "眺",
                                                        "ruby": "なが"
                                                },
                                                {
                                                        "text": "め",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "nagame",
                                        "pronounced_as": "nagame",
                                        "orthographic_rule_note": null,
                                        "lemma": "眺める",
                                        "pos": "VERB",
                                        "sub_pos": "一般",
                                        "inflection_chain": [
                                                "Bentuk Ren'youkei (Masu-stem)"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "lihat"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "ながら",
                                        "display_parts": [
                                                {
                                                        "text": "ながら",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "nagara",
                                        "pronounced_as": "nagara",
                                        "orthographic_rule_note": null,
                                        "lemma": "ながら",
                                        "pos": "PART",
                                        "sub_pos": "接続助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Ketika"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "キス",
                                        "display_parts": [
                                                {
                                                        "text": "キス",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "kisu",
                                        "pronounced_as": "kisu",
                                        "orthographic_rule_note": null,
                                        "lemma": "キス",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "ciuman"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 3,
                                        "surface": "を",
                                        "display_parts": [
                                                {
                                                        "text": "を",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "o",
                                        "pronounced_as": "o",
                                        "orthographic_rule_note": "Partikel を dilafalkan 'o'",
                                        "lemma": "を",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "dari"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 4,
                                        "surface": "しよう",
                                        "display_parts": [
                                                {
                                                        "text": "しよう",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "shiyou",
                                        "pronounced_as": "shiyou",
                                        "orthographic_rule_note": null,
                                        "lemma": "する",
                                        "pos": "VERB",
                                        "sub_pos": "非自立可能",
                                        "inflection_chain": [
                                                "サ行変格: 意志推量形"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Mengerjakan"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 5,
                                        "surface": "よ",
                                        "display_parts": [
                                                {
                                                        "text": "よ",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "yo",
                                        "pronounced_as": "yo",
                                        "orthographic_rule_note": null,
                                        "lemma": "よ",
                                        "pos": "PART",
                                        "sub_pos": "終助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Yo"
                                        ],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 6,
                        "start_ms": 43210,
                        "end_ms": 47220,
                        "original_text": "「さよなら」から一番 遠い",
                        "translated_text": "Mari bertemu di tempat",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "「",
                                        "display_parts": [
                                                {
                                                        "text": "「",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "「",
                                        "pronounced_as": "「",
                                        "orthographic_rule_note": null,
                                        "lemma": "「",
                                        "pos": "PUNCT",
                                        "sub_pos": "括弧開",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "\""
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "さよなら",
                                        "display_parts": [
                                                {
                                                        "text": "さよなら",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "sayonara",
                                        "pronounced_as": "sayonara",
                                        "orthographic_rule_note": null,
                                        "lemma": "さよなら",
                                        "pos": "OTHER",
                                        "sub_pos": "一般",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "selamat tinggal"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "」",
                                        "display_parts": [
                                                {
                                                        "text": "」",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "」",
                                        "pronounced_as": "」",
                                        "orthographic_rule_note": null,
                                        "lemma": "」",
                                        "pos": "PUNCT",
                                        "sub_pos": "括弧閉",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "”"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 3,
                                        "surface": "から",
                                        "display_parts": [
                                                {
                                                        "text": "から",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "kara",
                                        "pronounced_as": "kara",
                                        "orthographic_rule_note": null,
                                        "lemma": "から",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "dari"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 4,
                                        "surface": "一番",
                                        "display_parts": [
                                                {
                                                        "text": "一番",
                                                        "ruby": "いちばん"
                                                }
                                        ],
                                        "phonetic_script": "ichiban",
                                        "pronounced_as": "ichiban",
                                        "orthographic_rule_note": null,
                                        "lemma": "一番",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "nomor satu"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 5,
                                        "surface": "遠い",
                                        "display_parts": [
                                                {
                                                        "text": "遠",
                                                        "ruby": "とお"
                                                },
                                                {
                                                        "text": "い",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "tooi",
                                        "pronounced_as": "tooi",
                                        "orthographic_rule_note": null,
                                        "lemma": "遠い",
                                        "pos": "ADJ",
                                        "sub_pos": "一般",
                                        "inflection_chain": [
                                                "形容詞: 終止形-一般"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "jauh"
                                        ],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 7,
                        "start_ms": 47220,
                        "end_ms": 66520,
                        "original_text": "場所で待ち合わせよう",
                        "translated_text": "Yang paling jauh dari kata perpisahan",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "場所",
                                        "display_parts": [
                                                {
                                                        "text": "場所",
                                                        "ruby": "ばしょ"
                                                }
                                        ],
                                        "phonetic_script": "basho",
                                        "pronounced_as": "basho",
                                        "orthographic_rule_note": null,
                                        "lemma": "場所",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "tempat"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "で",
                                        "display_parts": [
                                                {
                                                        "text": "で",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "de",
                                        "pronounced_as": "de",
                                        "orthographic_rule_note": null,
                                        "lemma": "で",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "di dalam"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "待ち合わせよう",
                                        "display_parts": [
                                                {
                                                        "text": "待",
                                                        "ruby": "ま"
                                                },
                                                {
                                                        "text": "ち",
                                                        "ruby": null
                                                },
                                                {
                                                        "text": "合",
                                                        "ruby": "あ"
                                                },
                                                {
                                                        "text": "わせよう",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "machiawaseyou",
                                        "pronounced_as": "machiawaseyou",
                                        "orthographic_rule_note": null,
                                        "lemma": "待ち合わせる",
                                        "pos": "VERB",
                                        "sub_pos": "一般",
                                        "inflection_chain": [
                                                "下一段-サ行: 意志推量形"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "bertemu"
                                        ],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 8,
                        "start_ms": 66520,
                        "end_ms": 70300,
                        "original_text": "ついに時はきた",
                        "translated_text": "Sampailah tiba waktunya",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "ついに",
                                        "display_parts": [
                                                {
                                                        "text": "ついに",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "tsuini",
                                        "pronounced_as": "tsuini",
                                        "orthographic_rule_note": null,
                                        "lemma": "ついに",
                                        "pos": "ADV",
                                        "sub_pos": "*",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "時",
                                        "display_parts": [
                                                {
                                                        "text": "時",
                                                        "ruby": "とき"
                                                }
                                        ],
                                        "phonetic_script": "toki",
                                        "pronounced_as": "toki",
                                        "orthographic_rule_note": null,
                                        "lemma": "時",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "は",
                                        "display_parts": [
                                                {
                                                        "text": "は",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "ha",
                                        "pronounced_as": "wa",
                                        "orthographic_rule_note": "Partikel は dilafalkan 'wa'",
                                        "lemma": "は",
                                        "pos": "PART",
                                        "sub_pos": "係助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "gigi"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 3,
                                        "surface": "き",
                                        "display_parts": [
                                                {
                                                        "text": "き",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "ki",
                                        "pronounced_as": "ki",
                                        "orthographic_rule_note": null,
                                        "lemma": "くる",
                                        "pos": "VERB",
                                        "sub_pos": "非自立可能",
                                        "inflection_chain": [
                                                "Bentuk Ren'youkei (Masu-stem)"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Datang"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 4,
                                        "surface": "た",
                                        "display_parts": [
                                                {
                                                        "text": "た",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "ta",
                                        "pronounced_as": "ta",
                                        "orthographic_rule_note": null,
                                        "lemma": "た",
                                        "pos": "AUX",
                                        "sub_pos": "*",
                                        "inflection_chain": [
                                                "助動詞-タ: 終止形-一般"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Ta"
                                        ],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 9,
                        "start_ms": 70300,
                        "end_ms": 74390,
                        "original_text": "昨日までは序章の序章で",
                        "translated_text": "Hari kemarin hanyalah permulaan yang terus berulang Permulaan itu dapat kulewati saja",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "昨日",
                                        "display_parts": [
                                                {
                                                        "text": "昨日",
                                                        "ruby": "きのう"
                                                }
                                        ],
                                        "phonetic_script": "kinou",
                                        "pronounced_as": "kinou",
                                        "orthographic_rule_note": null,
                                        "lemma": "昨日",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": {
                                                "system": "jp_pitch",
                                                "value": "nakadaka",
                                                "pattern": [
                                                        0,
                                                        1,
                                                        0
                                                ]
                                        },
                                        "proficiency_tag": "JLPT N5",
                                        "meanings": [
                                                "kemarin"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "まで",
                                        "display_parts": [
                                                {
                                                        "text": "まで",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "made",
                                        "pronounced_as": "made",
                                        "orthographic_rule_note": null,
                                        "lemma": "まで",
                                        "pos": "PART",
                                        "sub_pos": "副助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "は",
                                        "display_parts": [
                                                {
                                                        "text": "は",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "ha",
                                        "pronounced_as": "wa",
                                        "orthographic_rule_note": "Partikel は dilafalkan 'wa'",
                                        "lemma": "は",
                                        "pos": "PART",
                                        "sub_pos": "係助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "gigi"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 3,
                                        "surface": "序章",
                                        "display_parts": [
                                                {
                                                        "text": "序章",
                                                        "ruby": "じょしょう"
                                                }
                                        ],
                                        "phonetic_script": "joshou",
                                        "pronounced_as": "joshou",
                                        "orthographic_rule_note": null,
                                        "lemma": "序章",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 4,
                                        "surface": "の",
                                        "display_parts": [
                                                {
                                                        "text": "の",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "no",
                                        "pronounced_as": "no",
                                        "orthographic_rule_note": null,
                                        "lemma": "の",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "dari"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 5,
                                        "surface": "序章",
                                        "display_parts": [
                                                {
                                                        "text": "序章",
                                                        "ruby": "じょしょう"
                                                }
                                        ],
                                        "phonetic_script": "joshou",
                                        "pronounced_as": "joshou",
                                        "orthographic_rule_note": null,
                                        "lemma": "序章",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 6,
                                        "surface": "で",
                                        "display_parts": [
                                                {
                                                        "text": "で",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "de",
                                        "pronounced_as": "de",
                                        "orthographic_rule_note": null,
                                        "lemma": "だ",
                                        "pos": "AUX",
                                        "sub_pos": "*",
                                        "inflection_chain": [
                                                "Bentuk Ren'youkei (Masu-stem)"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "adalah"
                                        ],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 10,
                        "start_ms": 74390,
                        "end_ms": 78160,
                        "original_text": "飛ばし読みでいいから",
                        "translated_text": "Hari kemarin hanyalah permulaan yang terus berulang Permulaan itu dapat kulewati saja",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "飛ばし読み",
                                        "display_parts": [
                                                {
                                                        "text": "飛",
                                                        "ruby": "と"
                                                },
                                                {
                                                        "text": "ばし",
                                                        "ruby": null
                                                },
                                                {
                                                        "text": "読",
                                                        "ruby": "よ"
                                                },
                                                {
                                                        "text": "み",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "tobashiyomi",
                                        "pronounced_as": "tobashiyomi",
                                        "orthographic_rule_note": null,
                                        "lemma": "飛ばし読み",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "で",
                                        "display_parts": [
                                                {
                                                        "text": "で",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "de",
                                        "pronounced_as": "de",
                                        "orthographic_rule_note": null,
                                        "lemma": "で",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "di dalam"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "いい",
                                        "display_parts": [
                                                {
                                                        "text": "いい",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "ii",
                                        "pronounced_as": "ii",
                                        "orthographic_rule_note": null,
                                        "lemma": "いい",
                                        "pos": "ADJ",
                                        "sub_pos": "非自立可能",
                                        "inflection_chain": [
                                                "形容詞: 終止形-一般"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Bagus"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 3,
                                        "surface": "から",
                                        "display_parts": [
                                                {
                                                        "text": "から",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "kara",
                                        "pronounced_as": "kara",
                                        "orthographic_rule_note": null,
                                        "lemma": "から",
                                        "pos": "PART",
                                        "sub_pos": "接続助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "dari"
                                        ],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 11,
                        "start_ms": 78160,
                        "end_ms": 81860,
                        "original_text": "ここからが僕だよ",
                        "translated_text": "Dari sini adalah awal ceritaku",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "ここ",
                                        "display_parts": [
                                                {
                                                        "text": "ここ",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "koko",
                                        "pronounced_as": "koko",
                                        "orthographic_rule_note": null,
                                        "lemma": "ここ",
                                        "pos": "PRON",
                                        "sub_pos": "*",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "から",
                                        "display_parts": [
                                                {
                                                        "text": "から",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "kara",
                                        "pronounced_as": "kara",
                                        "orthographic_rule_note": null,
                                        "lemma": "から",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "dari"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "が",
                                        "display_parts": [
                                                {
                                                        "text": "が",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "ga",
                                        "pronounced_as": "ga",
                                        "orthographic_rule_note": null,
                                        "lemma": "が",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Tetapi"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 3,
                                        "surface": "僕",
                                        "display_parts": [
                                                {
                                                        "text": "僕",
                                                        "ruby": "ぼく"
                                                }
                                        ],
                                        "phonetic_script": "boku",
                                        "pronounced_as": "boku",
                                        "orthographic_rule_note": null,
                                        "lemma": "僕",
                                        "pos": "PRON",
                                        "sub_pos": "*",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "SAYA"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 4,
                                        "surface": "だ",
                                        "display_parts": [
                                                {
                                                        "text": "だ",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "da",
                                        "pronounced_as": "da",
                                        "orthographic_rule_note": null,
                                        "lemma": "だ",
                                        "pos": "AUX",
                                        "sub_pos": "*",
                                        "inflection_chain": [
                                                "助動詞-ダ: 終止形-一般"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "adalah"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 5,
                                        "surface": "よ",
                                        "display_parts": [
                                                {
                                                        "text": "よ",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "yo",
                                        "pronounced_as": "yo",
                                        "orthographic_rule_note": null,
                                        "lemma": "よ",
                                        "pos": "PART",
                                        "sub_pos": "終助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Yo"
                                        ],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 12,
                        "start_ms": 81860,
                        "end_ms": 85840,
                        "original_text": "経験と知識と",
                        "translated_text": "Gunakan pengalaman,",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "経験",
                                        "display_parts": [
                                                {
                                                        "text": "経験",
                                                        "ruby": "けいけん"
                                                }
                                        ],
                                        "phonetic_script": "keiken",
                                        "pronounced_as": "keiken",
                                        "orthographic_rule_note": null,
                                        "lemma": "経験",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "と",
                                        "display_parts": [
                                                {
                                                        "text": "と",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "to",
                                        "pronounced_as": "to",
                                        "orthographic_rule_note": null,
                                        "lemma": "と",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Dan"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "知識",
                                        "display_parts": [
                                                {
                                                        "text": "知識",
                                                        "ruby": "ちしき"
                                                }
                                        ],
                                        "phonetic_script": "chishiki",
                                        "pronounced_as": "chishiki",
                                        "orthographic_rule_note": null,
                                        "lemma": "知識",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 3,
                                        "surface": "と",
                                        "display_parts": [
                                                {
                                                        "text": "と",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "to",
                                        "pronounced_as": "to",
                                        "orthographic_rule_note": null,
                                        "lemma": "と",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Dan"
                                        ],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 13,
                        "start_ms": 85840,
                        "end_ms": 89710,
                        "original_text": "カビの生えかかった勇気を持って",
                        "translated_text": "Kebijaksanaan, dan sedikit keberanian",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "カビ",
                                        "display_parts": [
                                                {
                                                        "text": "カビ",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "kabi",
                                        "pronounced_as": "kabi",
                                        "orthographic_rule_note": null,
                                        "lemma": "カビ",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "の",
                                        "display_parts": [
                                                {
                                                        "text": "の",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "no",
                                        "pronounced_as": "no",
                                        "orthographic_rule_note": null,
                                        "lemma": "の",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "dari"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "生え",
                                        "display_parts": [
                                                {
                                                        "text": "生",
                                                        "ruby": "は"
                                                },
                                                {
                                                        "text": "え",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "hae",
                                        "pronounced_as": "hae",
                                        "orthographic_rule_note": null,
                                        "lemma": "生える",
                                        "pos": "VERB",
                                        "sub_pos": "一般",
                                        "inflection_chain": [
                                                "Bentuk Ren'youkei (Masu-stem)"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 3,
                                        "surface": "かかっ",
                                        "display_parts": [
                                                {
                                                        "text": "かかっ",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "kaka",
                                        "pronounced_as": "kaka",
                                        "orthographic_rule_note": null,
                                        "lemma": "かかる",
                                        "pos": "VERB",
                                        "sub_pos": "非自立可能",
                                        "inflection_chain": [
                                                "Bentuk Ren'youkei (Masu-stem)"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 4,
                                        "surface": "た",
                                        "display_parts": [
                                                {
                                                        "text": "た",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "ta",
                                        "pronounced_as": "ta",
                                        "orthographic_rule_note": null,
                                        "lemma": "た",
                                        "pos": "AUX",
                                        "sub_pos": "*",
                                        "inflection_chain": [
                                                "助動詞-タ: 連体形-一般"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Ta"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 5,
                                        "surface": "勇気",
                                        "display_parts": [
                                                {
                                                        "text": "勇気",
                                                        "ruby": "ゆうき"
                                                }
                                        ],
                                        "phonetic_script": "yuuki",
                                        "pronounced_as": "yuuki",
                                        "orthographic_rule_note": null,
                                        "lemma": "勇気",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 6,
                                        "surface": "を",
                                        "display_parts": [
                                                {
                                                        "text": "を",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "o",
                                        "pronounced_as": "o",
                                        "orthographic_rule_note": "Partikel を dilafalkan 'o'",
                                        "lemma": "を",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "dari"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 7,
                                        "surface": "持っ",
                                        "display_parts": [
                                                {
                                                        "text": "持",
                                                        "ruby": "も"
                                                },
                                                {
                                                        "text": "っ",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "mo",
                                        "pronounced_as": "mo",
                                        "orthographic_rule_note": null,
                                        "lemma": "持つ",
                                        "pos": "VERB",
                                        "sub_pos": "一般",
                                        "inflection_chain": [
                                                "Bentuk Ren'youkei (Masu-stem)"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "memiliki"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 8,
                                        "surface": "て",
                                        "display_parts": [
                                                {
                                                        "text": "て",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "te",
                                        "pronounced_as": "te",
                                        "orthographic_rule_note": null,
                                        "lemma": "て",
                                        "pos": "PART",
                                        "sub_pos": "接続助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "tangan"
                                        ],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 14,
                        "start_ms": 89710,
                        "end_ms": 93770,
                        "original_text": "いまだかつてないスピードで",
                        "translated_text": "Kini dengan laju yang tak beraturan Aku menyelam menuju dirimu",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "いまだ",
                                        "display_parts": [
                                                {
                                                        "text": "いまだ",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "imada",
                                        "pronounced_as": "imada",
                                        "orthographic_rule_note": null,
                                        "lemma": "いまだ",
                                        "pos": "ADV",
                                        "sub_pos": "*",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "かつて",
                                        "display_parts": [
                                                {
                                                        "text": "かつて",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "katsute",
                                        "pronounced_as": "katsute",
                                        "orthographic_rule_note": null,
                                        "lemma": "かつて",
                                        "pos": "ADV",
                                        "sub_pos": "*",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "ない",
                                        "display_parts": [
                                                {
                                                        "text": "ない",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "nai",
                                        "pronounced_as": "nai",
                                        "orthographic_rule_note": null,
                                        "lemma": "ない",
                                        "pos": "ADJ",
                                        "sub_pos": "非自立可能",
                                        "inflection_chain": [
                                                "形容詞: 連体形-一般"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "tidak punya"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 3,
                                        "surface": "スピード",
                                        "display_parts": [
                                                {
                                                        "text": "スピード",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "supiido",
                                        "pronounced_as": "supiido",
                                        "orthographic_rule_note": null,
                                        "lemma": "スピード",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 4,
                                        "surface": "で",
                                        "display_parts": [
                                                {
                                                        "text": "で",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "de",
                                        "pronounced_as": "de",
                                        "orthographic_rule_note": null,
                                        "lemma": "だ",
                                        "pos": "AUX",
                                        "sub_pos": "*",
                                        "inflection_chain": [
                                                "Bentuk Ren'youkei (Masu-stem)"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "adalah"
                                        ],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 15,
                        "start_ms": 93770,
                        "end_ms": 97010,
                        "original_text": "君のもとへダイブを",
                        "translated_text": "Kini dengan laju yang tak beraturan Aku menyelam menuju dirimu",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "君",
                                        "display_parts": [
                                                {
                                                        "text": "君",
                                                        "ruby": "きみ"
                                                }
                                        ],
                                        "phonetic_script": "kimi",
                                        "pronounced_as": "kimi",
                                        "orthographic_rule_note": null,
                                        "lemma": "君",
                                        "pos": "PRON",
                                        "sub_pos": "*",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Anda"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "の",
                                        "display_parts": [
                                                {
                                                        "text": "の",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "no",
                                        "pronounced_as": "no",
                                        "orthographic_rule_note": null,
                                        "lemma": "の",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "dari"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "もと",
                                        "display_parts": [
                                                {
                                                        "text": "もと",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "moto",
                                        "pronounced_as": "moto",
                                        "orthographic_rule_note": null,
                                        "lemma": "もと",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 3,
                                        "surface": "へ",
                                        "display_parts": [
                                                {
                                                        "text": "へ",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "he",
                                        "pronounced_as": "e",
                                        "orthographic_rule_note": "Partikel へ dilafalkan 'e'",
                                        "lemma": "へ",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 4,
                                        "surface": "ダイブ",
                                        "display_parts": [
                                                {
                                                        "text": "ダイブ",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "daibu",
                                        "pronounced_as": "daibu",
                                        "orthographic_rule_note": null,
                                        "lemma": "ダイブ",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 5,
                                        "surface": "を",
                                        "display_parts": [
                                                {
                                                        "text": "を",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "o",
                                        "pronounced_as": "o",
                                        "orthographic_rule_note": "Partikel を dilafalkan 'o'",
                                        "lemma": "を",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "dari"
                                        ],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 16,
                        "start_ms": 97010,
                        "end_ms": 100820,
                        "original_text": "まどろみの中で 生温いコーラに",
                        "translated_text": "Didalam lelapku, dengan kola yang hangat Aku bermimpi tentang suatu tempat yang berbeda dari sini",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "まどろみ",
                                        "display_parts": [
                                                {
                                                        "text": "まどろみ",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "madoromi",
                                        "pronounced_as": "madoromi",
                                        "orthographic_rule_note": null,
                                        "lemma": "まどろむ",
                                        "pos": "VERB",
                                        "sub_pos": "一般",
                                        "inflection_chain": [
                                                "Bentuk Ren'youkei (Masu-stem)"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "の",
                                        "display_parts": [
                                                {
                                                        "text": "の",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "no",
                                        "pronounced_as": "no",
                                        "orthographic_rule_note": null,
                                        "lemma": "の",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "dari"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "中",
                                        "display_parts": [
                                                {
                                                        "text": "中",
                                                        "ruby": "なか"
                                                }
                                        ],
                                        "phonetic_script": "naka",
                                        "pronounced_as": "naka",
                                        "orthographic_rule_note": null,
                                        "lemma": "中",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 3,
                                        "surface": "で",
                                        "display_parts": [
                                                {
                                                        "text": "で",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "de",
                                        "pronounced_as": "de",
                                        "orthographic_rule_note": null,
                                        "lemma": "で",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "di dalam"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 4,
                                        "surface": "生温い",
                                        "display_parts": [
                                                {
                                                        "text": "生温",
                                                        "ruby": "なまぬる"
                                                },
                                                {
                                                        "text": "い",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "namanurui",
                                        "pronounced_as": "namanurui",
                                        "orthographic_rule_note": null,
                                        "lemma": "生温い",
                                        "pos": "ADJ",
                                        "sub_pos": "一般",
                                        "inflection_chain": [
                                                "形容詞: 連体形-一般"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 5,
                                        "surface": "コーラ",
                                        "display_parts": [
                                                {
                                                        "text": "コーラ",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "koora",
                                        "pronounced_as": "koora",
                                        "orthographic_rule_note": null,
                                        "lemma": "コーラ",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 6,
                                        "surface": "に",
                                        "display_parts": [
                                                {
                                                        "text": "に",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "ni",
                                        "pronounced_as": "ni",
                                        "orthographic_rule_note": null,
                                        "lemma": "に",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "ke"
                                        ],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 17,
                        "start_ms": 100820,
                        "end_ms": 104740,
                        "original_text": "ここでないどっかを 夢見たよ",
                        "translated_text": "Didalam lelapku, dengan kola yang hangat Aku bermimpi tentang suatu tempat yang berbeda dari sini",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "ここ",
                                        "display_parts": [
                                                {
                                                        "text": "ここ",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "koko",
                                        "pronounced_as": "koko",
                                        "orthographic_rule_note": null,
                                        "lemma": "ここ",
                                        "pos": "PRON",
                                        "sub_pos": "*",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "で",
                                        "display_parts": [
                                                {
                                                        "text": "で",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "de",
                                        "pronounced_as": "de",
                                        "orthographic_rule_note": null,
                                        "lemma": "だ",
                                        "pos": "AUX",
                                        "sub_pos": "*",
                                        "inflection_chain": [
                                                "Bentuk Ren'youkei (Masu-stem)"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "adalah"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "ない",
                                        "display_parts": [
                                                {
                                                        "text": "ない",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "nai",
                                        "pronounced_as": "nai",
                                        "orthographic_rule_note": null,
                                        "lemma": "ない",
                                        "pos": "ADJ",
                                        "sub_pos": "非自立可能",
                                        "inflection_chain": [
                                                "形容詞: 連体形-一般"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "tidak punya"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 3,
                                        "surface": "どっ",
                                        "display_parts": [
                                                {
                                                        "text": "どっ",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "do",
                                        "pronounced_as": "do",
                                        "orthographic_rule_note": null,
                                        "lemma": "どっ",
                                        "pos": "PRON",
                                        "sub_pos": "*",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 4,
                                        "surface": "か",
                                        "display_parts": [
                                                {
                                                        "text": "か",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "ka",
                                        "pronounced_as": "ka",
                                        "orthographic_rule_note": null,
                                        "lemma": "か",
                                        "pos": "PART",
                                        "sub_pos": "副助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "nyamuk"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 5,
                                        "surface": "を",
                                        "display_parts": [
                                                {
                                                        "text": "を",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "o",
                                        "pronounced_as": "o",
                                        "orthographic_rule_note": "Partikel を dilafalkan 'o'",
                                        "lemma": "を",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "dari"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 6,
                                        "surface": "夢見",
                                        "display_parts": [
                                                {
                                                        "text": "夢見",
                                                        "ruby": "ゆめみ"
                                                }
                                        ],
                                        "phonetic_script": "yumemi",
                                        "pronounced_as": "yumemi",
                                        "orthographic_rule_note": null,
                                        "lemma": "夢見る",
                                        "pos": "VERB",
                                        "sub_pos": "一般",
                                        "inflection_chain": [
                                                "Bentuk Ren'youkei (Masu-stem)"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 7,
                                        "surface": "た",
                                        "display_parts": [
                                                {
                                                        "text": "た",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "ta",
                                        "pronounced_as": "ta",
                                        "orthographic_rule_note": null,
                                        "lemma": "た",
                                        "pos": "AUX",
                                        "sub_pos": "*",
                                        "inflection_chain": [
                                                "助動詞-タ: 終止形-一般"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Ta"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 8,
                                        "surface": "よ",
                                        "display_parts": [
                                                {
                                                        "text": "よ",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "yo",
                                        "pronounced_as": "yo",
                                        "orthographic_rule_note": null,
                                        "lemma": "よ",
                                        "pos": "PART",
                                        "sub_pos": "終助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Yo"
                                        ],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 18,
                        "start_ms": 104740,
                        "end_ms": 108540,
                        "original_text": "教室の窓の外に",
                        "translated_text": "Di luar jendela kelasku",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "教室",
                                        "display_parts": [
                                                {
                                                        "text": "教室",
                                                        "ruby": "きょうしつ"
                                                }
                                        ],
                                        "phonetic_script": "kyoushitsu",
                                        "pronounced_as": "kyoushitsu",
                                        "orthographic_rule_note": null,
                                        "lemma": "教室",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "の",
                                        "display_parts": [
                                                {
                                                        "text": "の",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "no",
                                        "pronounced_as": "no",
                                        "orthographic_rule_note": null,
                                        "lemma": "の",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "dari"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "窓",
                                        "display_parts": [
                                                {
                                                        "text": "窓",
                                                        "ruby": "まど"
                                                }
                                        ],
                                        "phonetic_script": "mado",
                                        "pronounced_as": "mado",
                                        "orthographic_rule_note": null,
                                        "lemma": "窓",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 3,
                                        "surface": "の",
                                        "display_parts": [
                                                {
                                                        "text": "の",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "no",
                                        "pronounced_as": "no",
                                        "orthographic_rule_note": null,
                                        "lemma": "の",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "dari"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 4,
                                        "surface": "外",
                                        "display_parts": [
                                                {
                                                        "text": "外",
                                                        "ruby": "そと"
                                                }
                                        ],
                                        "phonetic_script": "soto",
                                        "pronounced_as": "soto",
                                        "orthographic_rule_note": null,
                                        "lemma": "外",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 5,
                                        "surface": "に",
                                        "display_parts": [
                                                {
                                                        "text": "に",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "ni",
                                        "pronounced_as": "ni",
                                        "orthographic_rule_note": null,
                                        "lemma": "に",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "ke"
                                        ],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 19,
                        "start_ms": 108540,
                        "end_ms": 119810,
                        "original_text": "電車に揺られ 運ばれる朝に",
                        "translated_text": "Di pagi hari yang dihabiskan dengan berlalunya kereta",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "電車",
                                        "display_parts": [
                                                {
                                                        "text": "電車",
                                                        "ruby": "でんしゃ"
                                                }
                                        ],
                                        "phonetic_script": "densha",
                                        "pronounced_as": "densha",
                                        "orthographic_rule_note": null,
                                        "lemma": "電車",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "に",
                                        "display_parts": [
                                                {
                                                        "text": "に",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "ni",
                                        "pronounced_as": "ni",
                                        "orthographic_rule_note": null,
                                        "lemma": "に",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "ke"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "揺られ",
                                        "display_parts": [
                                                {
                                                        "text": "揺",
                                                        "ruby": "ゆ"
                                                },
                                                {
                                                        "text": "られ",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "yurare",
                                        "pronounced_as": "yurare",
                                        "orthographic_rule_note": null,
                                        "lemma": "揺られる",
                                        "pos": "VERB",
                                        "sub_pos": "一般",
                                        "inflection_chain": [
                                                "Bentuk Ren'youkei (Masu-stem)"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 3,
                                        "surface": "運ば",
                                        "display_parts": [
                                                {
                                                        "text": "運",
                                                        "ruby": "はこ"
                                                },
                                                {
                                                        "text": "ば",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "hakoba",
                                        "pronounced_as": "hakoba",
                                        "orthographic_rule_note": null,
                                        "lemma": "運ぶ",
                                        "pos": "VERB",
                                        "sub_pos": "一般",
                                        "inflection_chain": [
                                                "Bentuk Negatif/Mizenkei"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "membawa"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 4,
                                        "surface": "れる",
                                        "display_parts": [
                                                {
                                                        "text": "れる",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "reru",
                                        "pronounced_as": "reru",
                                        "orthographic_rule_note": null,
                                        "lemma": "れる",
                                        "pos": "AUX",
                                        "sub_pos": "*",
                                        "inflection_chain": [
                                                "助動詞-レル: 連体形-一般"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "bisa"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 5,
                                        "surface": "朝",
                                        "display_parts": [
                                                {
                                                        "text": "朝",
                                                        "ruby": "あさ"
                                                }
                                        ],
                                        "phonetic_script": "asa",
                                        "pronounced_as": "asa",
                                        "orthographic_rule_note": null,
                                        "lemma": "朝",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 6,
                                        "surface": "に",
                                        "display_parts": [
                                                {
                                                        "text": "に",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "ni",
                                        "pronounced_as": "ni",
                                        "orthographic_rule_note": null,
                                        "lemma": "に",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "ke"
                                        ],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 20,
                        "start_ms": 119810,
                        "end_ms": 123750,
                        "original_text": "運命だとか未来とか",
                        "translated_text": "Takdir dan masa depan yang kita gapai Tak akan menjangkau tempat Dimana kita berdua saling jatuh cinta",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "運命",
                                        "display_parts": [
                                                {
                                                        "text": "運命",
                                                        "ruby": "うんめい"
                                                }
                                        ],
                                        "phonetic_script": "ummei",
                                        "pronounced_as": "ummei",
                                        "orthographic_rule_note": null,
                                        "lemma": "運命",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "だ",
                                        "display_parts": [
                                                {
                                                        "text": "だ",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "da",
                                        "pronounced_as": "da",
                                        "orthographic_rule_note": null,
                                        "lemma": "だ",
                                        "pos": "AUX",
                                        "sub_pos": "*",
                                        "inflection_chain": [
                                                "助動詞-ダ: 終止形-一般"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "adalah"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "と",
                                        "display_parts": [
                                                {
                                                        "text": "と",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "to",
                                        "pronounced_as": "to",
                                        "orthographic_rule_note": null,
                                        "lemma": "と",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Dan"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 3,
                                        "surface": "か",
                                        "display_parts": [
                                                {
                                                        "text": "か",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "ka",
                                        "pronounced_as": "ka",
                                        "orthographic_rule_note": null,
                                        "lemma": "か",
                                        "pos": "PART",
                                        "sub_pos": "副助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "nyamuk"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 4,
                                        "surface": "未来",
                                        "display_parts": [
                                                {
                                                        "text": "未来",
                                                        "ruby": "みらい"
                                                }
                                        ],
                                        "phonetic_script": "mirai",
                                        "pronounced_as": "mirai",
                                        "orthographic_rule_note": null,
                                        "lemma": "未来",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 5,
                                        "surface": "と",
                                        "display_parts": [
                                                {
                                                        "text": "と",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "to",
                                        "pronounced_as": "to",
                                        "orthographic_rule_note": null,
                                        "lemma": "と",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Dan"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 6,
                                        "surface": "か",
                                        "display_parts": [
                                                {
                                                        "text": "か",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "ka",
                                        "pronounced_as": "ka",
                                        "orthographic_rule_note": null,
                                        "lemma": "か",
                                        "pos": "PART",
                                        "sub_pos": "副助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "nyamuk"
                                        ],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 21,
                        "start_ms": 123750,
                        "end_ms": 127780,
                        "original_text": "って言葉がどれだけ手を",
                        "translated_text": "Takdir dan masa depan yang kita gapai Tak akan menjangkau tempat Dimana kita berdua saling jatuh cinta",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "って",
                                        "display_parts": [
                                                {
                                                        "text": "って",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "tte",
                                        "pronounced_as": "tte",
                                        "orthographic_rule_note": null,
                                        "lemma": "って",
                                        "pos": "PART",
                                        "sub_pos": "副助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Itu saja"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "言葉",
                                        "display_parts": [
                                                {
                                                        "text": "言葉",
                                                        "ruby": "ことば"
                                                }
                                        ],
                                        "phonetic_script": "kotoba",
                                        "pronounced_as": "kotoba",
                                        "orthographic_rule_note": null,
                                        "lemma": "言葉",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "kata-kata"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "が",
                                        "display_parts": [
                                                {
                                                        "text": "が",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "ga",
                                        "pronounced_as": "ga",
                                        "orthographic_rule_note": null,
                                        "lemma": "が",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Tetapi"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 3,
                                        "surface": "どれ",
                                        "display_parts": [
                                                {
                                                        "text": "どれ",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "dore",
                                        "pronounced_as": "dore",
                                        "orthographic_rule_note": null,
                                        "lemma": "どれ",
                                        "pos": "PRON",
                                        "sub_pos": "*",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 4,
                                        "surface": "だけ",
                                        "display_parts": [
                                                {
                                                        "text": "だけ",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "dake",
                                        "pronounced_as": "dake",
                                        "orthographic_rule_note": null,
                                        "lemma": "だけ",
                                        "pos": "PART",
                                        "sub_pos": "副助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "hanya"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 5,
                                        "surface": "手",
                                        "display_parts": [
                                                {
                                                        "text": "手",
                                                        "ruby": "て"
                                                }
                                        ],
                                        "phonetic_script": "te",
                                        "pronounced_as": "te",
                                        "orthographic_rule_note": null,
                                        "lemma": "手",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 6,
                                        "surface": "を",
                                        "display_parts": [
                                                {
                                                        "text": "を",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "o",
                                        "pronounced_as": "o",
                                        "orthographic_rule_note": "Partikel を dilafalkan 'o'",
                                        "lemma": "を",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "dari"
                                        ],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 22,
                        "start_ms": 127780,
                        "end_ms": 131630,
                        "original_text": "伸ばそうと届かない",
                        "translated_text": "Takdir dan masa depan yang kita gapai Tak akan menjangkau tempat Dimana kita berdua saling jatuh cinta",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "伸ばそう",
                                        "display_parts": [
                                                {
                                                        "text": "伸",
                                                        "ruby": "の"
                                                },
                                                {
                                                        "text": "ばそう",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "nobasou",
                                        "pronounced_as": "nobasou",
                                        "orthographic_rule_note": null,
                                        "lemma": "伸ばす",
                                        "pos": "VERB",
                                        "sub_pos": "一般",
                                        "inflection_chain": [
                                                "五段-サ行: 意志推量形"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "と",
                                        "display_parts": [
                                                {
                                                        "text": "と",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "to",
                                        "pronounced_as": "to",
                                        "orthographic_rule_note": null,
                                        "lemma": "と",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Dan"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "届か",
                                        "display_parts": [
                                                {
                                                        "text": "届",
                                                        "ruby": "とど"
                                                },
                                                {
                                                        "text": "か",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "todoka",
                                        "pronounced_as": "todoka",
                                        "orthographic_rule_note": null,
                                        "lemma": "届く",
                                        "pos": "VERB",
                                        "sub_pos": "一般",
                                        "inflection_chain": [
                                                "Bentuk Negatif/Mizenkei"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "mencapai"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 3,
                                        "surface": "ない",
                                        "display_parts": [
                                                {
                                                        "text": "ない",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "nai",
                                        "pronounced_as": "nai",
                                        "orthographic_rule_note": null,
                                        "lemma": "ない",
                                        "pos": "AUX",
                                        "sub_pos": "*",
                                        "inflection_chain": [
                                                "助動詞-ナイ: 終止形-一般"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "tidak punya"
                                        ],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 23,
                        "start_ms": 131630,
                        "end_ms": 135560,
                        "original_text": "場所で僕ら恋をする",
                        "translated_text": "Takdir dan masa depan yang kita gapai Tak akan menjangkau tempat Dimana kita berdua saling jatuh cinta",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "場所",
                                        "display_parts": [
                                                {
                                                        "text": "場所",
                                                        "ruby": "ばしょ"
                                                }
                                        ],
                                        "phonetic_script": "basho",
                                        "pronounced_as": "basho",
                                        "orthographic_rule_note": null,
                                        "lemma": "場所",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "tempat"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "で",
                                        "display_parts": [
                                                {
                                                        "text": "で",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "de",
                                        "pronounced_as": "de",
                                        "orthographic_rule_note": null,
                                        "lemma": "で",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "di dalam"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "僕",
                                        "display_parts": [
                                                {
                                                        "text": "僕",
                                                        "ruby": "ぼく"
                                                }
                                        ],
                                        "phonetic_script": "boku",
                                        "pronounced_as": "boku",
                                        "orthographic_rule_note": null,
                                        "lemma": "僕",
                                        "pos": "PRON",
                                        "sub_pos": "*",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "SAYA"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 3,
                                        "surface": "ら",
                                        "display_parts": [
                                                {
                                                        "text": "ら",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "ra",
                                        "pronounced_as": "ra",
                                        "orthographic_rule_note": null,
                                        "lemma": "ら",
                                        "pos": "OTHER",
                                        "sub_pos": "名詞的",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "dan lainnya"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 4,
                                        "surface": "恋",
                                        "display_parts": [
                                                {
                                                        "text": "恋",
                                                        "ruby": "こい"
                                                }
                                        ],
                                        "phonetic_script": "koi",
                                        "pronounced_as": "koi",
                                        "orthographic_rule_note": null,
                                        "lemma": "恋",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 5,
                                        "surface": "を",
                                        "display_parts": [
                                                {
                                                        "text": "を",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "o",
                                        "pronounced_as": "o",
                                        "orthographic_rule_note": "Partikel を dilafalkan 'o'",
                                        "lemma": "を",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "dari"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 6,
                                        "surface": "する",
                                        "display_parts": [
                                                {
                                                        "text": "する",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "suru",
                                        "pronounced_as": "suru",
                                        "orthographic_rule_note": null,
                                        "lemma": "する",
                                        "pos": "VERB",
                                        "sub_pos": "非自立可能",
                                        "inflection_chain": [
                                                "サ行変格: 終止形-一般"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Mengerjakan"
                                        ],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 24,
                        "start_ms": 135560,
                        "end_ms": 139350,
                        "original_text": "時計の針も二人を",
                        "translated_text": "Bahkan jarum jam pun terus bergerak",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "時計",
                                        "display_parts": [
                                                {
                                                        "text": "時計",
                                                        "ruby": "とけい"
                                                }
                                        ],
                                        "phonetic_script": "tokei",
                                        "pronounced_as": "tokei",
                                        "orthographic_rule_note": null,
                                        "lemma": "時計",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "の",
                                        "display_parts": [
                                                {
                                                        "text": "の",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "no",
                                        "pronounced_as": "no",
                                        "orthographic_rule_note": null,
                                        "lemma": "の",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "dari"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "針",
                                        "display_parts": [
                                                {
                                                        "text": "針",
                                                        "ruby": "はり"
                                                }
                                        ],
                                        "phonetic_script": "hari",
                                        "pronounced_as": "hari",
                                        "orthographic_rule_note": null,
                                        "lemma": "針",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 3,
                                        "surface": "も",
                                        "display_parts": [
                                                {
                                                        "text": "も",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "mo",
                                        "pronounced_as": "mo",
                                        "orthographic_rule_note": null,
                                        "lemma": "も",
                                        "pos": "PART",
                                        "sub_pos": "係助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "juga"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 4,
                                        "surface": "二人",
                                        "display_parts": [
                                                {
                                                        "text": "二人",
                                                        "ruby": "ふたり"
                                                }
                                        ],
                                        "phonetic_script": "futari",
                                        "pronounced_as": "futari",
                                        "orthographic_rule_note": null,
                                        "lemma": "二人",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "dua orang"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 5,
                                        "surface": "を",
                                        "display_parts": [
                                                {
                                                        "text": "を",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "o",
                                        "pronounced_as": "o",
                                        "orthographic_rule_note": "Partikel を dilafalkan 'o'",
                                        "lemma": "を",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "dari"
                                        ],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 25,
                        "start_ms": 139350,
                        "end_ms": 143490,
                        "original_text": "横目に見ながら進む",
                        "translated_text": "seraya memperhatikan kita berdua",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "横目",
                                        "display_parts": [
                                                {
                                                        "text": "横目",
                                                        "ruby": "よこめ"
                                                }
                                        ],
                                        "phonetic_script": "yokome",
                                        "pronounced_as": "yokome",
                                        "orthographic_rule_note": null,
                                        "lemma": "横目",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "に",
                                        "display_parts": [
                                                {
                                                        "text": "に",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "ni",
                                        "pronounced_as": "ni",
                                        "orthographic_rule_note": null,
                                        "lemma": "に",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "ke"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "見",
                                        "display_parts": [
                                                {
                                                        "text": "見",
                                                        "ruby": "み"
                                                }
                                        ],
                                        "phonetic_script": "mi",
                                        "pronounced_as": "mi",
                                        "orthographic_rule_note": null,
                                        "lemma": "見る",
                                        "pos": "VERB",
                                        "sub_pos": "非自立可能",
                                        "inflection_chain": [
                                                "Bentuk Ren'youkei (Masu-stem)"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": {
                                                "system": "jp_pitch",
                                                "value": "atamadaka",
                                                "pattern": [
                                                        1,
                                                        0
                                                ]
                                        },
                                        "proficiency_tag": "JLPT N5",
                                        "meanings": [
                                                "melihat",
                                                "menonton"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 3,
                                        "surface": "ながら",
                                        "display_parts": [
                                                {
                                                        "text": "ながら",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "nagara",
                                        "pronounced_as": "nagara",
                                        "orthographic_rule_note": null,
                                        "lemma": "ながら",
                                        "pos": "PART",
                                        "sub_pos": "接続助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Ketika"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 4,
                                        "surface": "進む",
                                        "display_parts": [
                                                {
                                                        "text": "進",
                                                        "ruby": "すす"
                                                },
                                                {
                                                        "text": "む",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "susumu",
                                        "pronounced_as": "susumu",
                                        "orthographic_rule_note": null,
                                        "lemma": "進む",
                                        "pos": "VERB",
                                        "sub_pos": "一般",
                                        "inflection_chain": [
                                                "五段-マ行: 終止形-一般"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 26,
                        "start_ms": 143490,
                        "end_ms": 146720,
                        "original_text": "こんな世界を二人で",
                        "translated_text": "Di dunia seperti ini kita berdua Bersama selalu tidak, selama mungkin",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "こんな",
                                        "display_parts": [
                                                {
                                                        "text": "こんな",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "konna",
                                        "pronounced_as": "konna",
                                        "orthographic_rule_note": null,
                                        "lemma": "こんな",
                                        "pos": "DET",
                                        "sub_pos": "*",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "世界",
                                        "display_parts": [
                                                {
                                                        "text": "世界",
                                                        "ruby": "せかい"
                                                }
                                        ],
                                        "phonetic_script": "sekai",
                                        "pronounced_as": "sekai",
                                        "orthographic_rule_note": null,
                                        "lemma": "世界",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "dunia"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "を",
                                        "display_parts": [
                                                {
                                                        "text": "を",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "o",
                                        "pronounced_as": "o",
                                        "orthographic_rule_note": "Partikel を dilafalkan 'o'",
                                        "lemma": "を",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "dari"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 3,
                                        "surface": "二人",
                                        "display_parts": [
                                                {
                                                        "text": "二人",
                                                        "ruby": "ふたり"
                                                }
                                        ],
                                        "phonetic_script": "futari",
                                        "pronounced_as": "futari",
                                        "orthographic_rule_note": null,
                                        "lemma": "二人",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "dua orang"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 4,
                                        "surface": "で",
                                        "display_parts": [
                                                {
                                                        "text": "で",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "de",
                                        "pronounced_as": "de",
                                        "orthographic_rule_note": null,
                                        "lemma": "で",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "di dalam"
                                        ],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 27,
                        "start_ms": 146720,
                        "end_ms": 148870,
                        "original_text": "一生 いや",
                        "translated_text": "Di dunia seperti ini kita berdua Bersama selalu tidak, selama mungkin",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "一生",
                                        "display_parts": [
                                                {
                                                        "text": "一生",
                                                        "ruby": "いっしょう"
                                                }
                                        ],
                                        "phonetic_script": "isshou",
                                        "pronounced_as": "isshou",
                                        "orthographic_rule_note": null,
                                        "lemma": "一生",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "いや",
                                        "display_parts": [
                                                {
                                                        "text": "いや",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "iya",
                                        "pronounced_as": "iya",
                                        "orthographic_rule_note": null,
                                        "lemma": "いや",
                                        "pos": "OTHER",
                                        "sub_pos": "一般",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 28,
                        "start_ms": 148870,
                        "end_ms": 151180,
                        "original_text": "何章でも",
                        "translated_text": "Di dunia seperti ini kita berdua Bersama selalu tidak, selama mungkin",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "何",
                                        "display_parts": [
                                                {
                                                        "text": "何",
                                                        "ruby": "なん"
                                                }
                                        ],
                                        "phonetic_script": "nan",
                                        "pronounced_as": "nan",
                                        "orthographic_rule_note": null,
                                        "lemma": "何",
                                        "pos": "PRON",
                                        "sub_pos": "*",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Apa"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "章",
                                        "display_parts": [
                                                {
                                                        "text": "章",
                                                        "ruby": "しょう"
                                                }
                                        ],
                                        "phonetic_script": "shou",
                                        "pronounced_as": "shou",
                                        "orthographic_rule_note": null,
                                        "lemma": "章",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "で",
                                        "display_parts": [
                                                {
                                                        "text": "で",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "de",
                                        "pronounced_as": "de",
                                        "orthographic_rule_note": null,
                                        "lemma": "で",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "di dalam"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 3,
                                        "surface": "も",
                                        "display_parts": [
                                                {
                                                        "text": "も",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "mo",
                                        "pronounced_as": "mo",
                                        "orthographic_rule_note": null,
                                        "lemma": "も",
                                        "pos": "PART",
                                        "sub_pos": "係助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "juga"
                                        ],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 29,
                        "start_ms": 151180,
                        "end_ms": 159350,
                        "original_text": "生き抜いていこう",
                        "translated_text": "Dimana kita akan terus hidup",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "生き",
                                        "display_parts": [
                                                {
                                                        "text": "生",
                                                        "ruby": "い"
                                                },
                                                {
                                                        "text": "き",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "iki",
                                        "pronounced_as": "iki",
                                        "orthographic_rule_note": null,
                                        "lemma": "生きる",
                                        "pos": "VERB",
                                        "sub_pos": "一般",
                                        "inflection_chain": [
                                                "Bentuk Ren'youkei (Masu-stem)"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "hidup"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "抜い",
                                        "display_parts": [
                                                {
                                                        "text": "抜",
                                                        "ruby": "ぬ"
                                                },
                                                {
                                                        "text": "い",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "nui",
                                        "pronounced_as": "nui",
                                        "orthographic_rule_note": null,
                                        "lemma": "抜く",
                                        "pos": "VERB",
                                        "sub_pos": "非自立可能",
                                        "inflection_chain": [
                                                "Bentuk Ren'youkei (Masu-stem)"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "て",
                                        "display_parts": [
                                                {
                                                        "text": "て",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "te",
                                        "pronounced_as": "te",
                                        "orthographic_rule_note": null,
                                        "lemma": "て",
                                        "pos": "PART",
                                        "sub_pos": "接続助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "tangan"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 3,
                                        "surface": "いこう",
                                        "display_parts": [
                                                {
                                                        "text": "いこう",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "ikou",
                                        "pronounced_as": "ikou",
                                        "orthographic_rule_note": null,
                                        "lemma": "いく",
                                        "pos": "VERB",
                                        "sub_pos": "非自立可能",
                                        "inflection_chain": [
                                                "五段-カ行: 意志推量形"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 30,
                        "start_ms": 159350,
                        "end_ms": 163460,
                        "original_text": "「初めまして」なんてさ",
                        "translated_text": "Mengirim kata-kata ''senang bertemu denganmu''",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "「",
                                        "display_parts": [
                                                {
                                                        "text": "「",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "「",
                                        "pronounced_as": "「",
                                        "orthographic_rule_note": null,
                                        "lemma": "「",
                                        "pos": "PUNCT",
                                        "sub_pos": "括弧開",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "\""
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "初めまして",
                                        "display_parts": [
                                                {
                                                        "text": "初",
                                                        "ruby": "はじ"
                                                },
                                                {
                                                        "text": "めまして",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "hajimemashite",
                                        "pronounced_as": "hajimemashite",
                                        "orthographic_rule_note": null,
                                        "lemma": "初めまして",
                                        "pos": "OTHER",
                                        "sub_pos": "一般",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "」",
                                        "display_parts": [
                                                {
                                                        "text": "」",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "」",
                                        "pronounced_as": "」",
                                        "orthographic_rule_note": null,
                                        "lemma": "」",
                                        "pos": "PUNCT",
                                        "sub_pos": "括弧閉",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "”"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 3,
                                        "surface": "なんて",
                                        "display_parts": [
                                                {
                                                        "text": "なんて",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "nante",
                                        "pronounced_as": "nante",
                                        "orthographic_rule_note": null,
                                        "lemma": "なんて",
                                        "pos": "PART",
                                        "sub_pos": "副助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 4,
                                        "surface": "さ",
                                        "display_parts": [
                                                {
                                                        "text": "さ",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "sa",
                                        "pronounced_as": "sa",
                                        "orthographic_rule_note": null,
                                        "lemma": "さ",
                                        "pos": "PART",
                                        "sub_pos": "終助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "perbedaan"
                                        ],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 31,
                        "start_ms": 163460,
                        "end_ms": 167100,
                        "original_text": "遥か彼方へと追いやって",
                        "translated_text": "Jauh ke dalam jarak",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "遥か",
                                        "display_parts": [
                                                {
                                                        "text": "遥",
                                                        "ruby": "はる"
                                                },
                                                {
                                                        "text": "か",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "haruka",
                                        "pronounced_as": "haruka",
                                        "orthographic_rule_note": null,
                                        "lemma": "遥か",
                                        "pos": "ADV",
                                        "sub_pos": "*",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "彼方",
                                        "display_parts": [
                                                {
                                                        "text": "彼方",
                                                        "ruby": "かなた"
                                                }
                                        ],
                                        "phonetic_script": "kanata",
                                        "pronounced_as": "kanata",
                                        "orthographic_rule_note": null,
                                        "lemma": "彼方",
                                        "pos": "PRON",
                                        "sub_pos": "*",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "へ",
                                        "display_parts": [
                                                {
                                                        "text": "へ",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "he",
                                        "pronounced_as": "e",
                                        "orthographic_rule_note": "Partikel へ dilafalkan 'e'",
                                        "lemma": "へ",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 3,
                                        "surface": "と",
                                        "display_parts": [
                                                {
                                                        "text": "と",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "to",
                                        "pronounced_as": "to",
                                        "orthographic_rule_note": null,
                                        "lemma": "と",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Dan"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 4,
                                        "surface": "追いやっ",
                                        "display_parts": [
                                                {
                                                        "text": "追",
                                                        "ruby": "お"
                                                },
                                                {
                                                        "text": "いやっ",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "oiya",
                                        "pronounced_as": "oiya",
                                        "orthographic_rule_note": null,
                                        "lemma": "追いやる",
                                        "pos": "VERB",
                                        "sub_pos": "一般",
                                        "inflection_chain": [
                                                "Bentuk Ren'youkei (Masu-stem)"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 5,
                                        "surface": "て",
                                        "display_parts": [
                                                {
                                                        "text": "て",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "te",
                                        "pronounced_as": "te",
                                        "orthographic_rule_note": null,
                                        "lemma": "て",
                                        "pos": "PART",
                                        "sub_pos": "接続助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "tangan"
                                        ],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 32,
                        "start_ms": 167100,
                        "end_ms": 171070,
                        "original_text": "千年周期を",
                        "translated_text": "Kita hidup seribu tahun",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "千",
                                        "display_parts": [
                                                {
                                                        "text": "千",
                                                        "ruby": "せん"
                                                }
                                        ],
                                        "phonetic_script": "sen",
                                        "pronounced_as": "sen",
                                        "orthographic_rule_note": null,
                                        "lemma": "千",
                                        "pos": "NOUN",
                                        "sub_pos": "数詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "年",
                                        "display_parts": [
                                                {
                                                        "text": "年",
                                                        "ruby": "ねん"
                                                }
                                        ],
                                        "phonetic_script": "nen",
                                        "pronounced_as": "nen",
                                        "orthographic_rule_note": null,
                                        "lemma": "年",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "周期",
                                        "display_parts": [
                                                {
                                                        "text": "周期",
                                                        "ruby": "しゅうき"
                                                }
                                        ],
                                        "phonetic_script": "shuuki",
                                        "pronounced_as": "shuuki",
                                        "orthographic_rule_note": null,
                                        "lemma": "周期",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 3,
                                        "surface": "を",
                                        "display_parts": [
                                                {
                                                        "text": "を",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "o",
                                        "pronounced_as": "o",
                                        "orthographic_rule_note": "Partikel を dilafalkan 'o'",
                                        "lemma": "を",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "dari"
                                        ],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 33,
                        "start_ms": 171070,
                        "end_ms": 190330,
                        "original_text": "一日で行き来しよう",
                        "translated_text": "Setiap harinya di dunia",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "一",
                                        "display_parts": [
                                                {
                                                        "text": "一",
                                                        "ruby": "いち"
                                                }
                                        ],
                                        "phonetic_script": "ichi",
                                        "pronounced_as": "ichi",
                                        "orthographic_rule_note": null,
                                        "lemma": "一",
                                        "pos": "NOUN",
                                        "sub_pos": "数詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "日",
                                        "display_parts": [
                                                {
                                                        "text": "日",
                                                        "ruby": "にち"
                                                }
                                        ],
                                        "phonetic_script": "nichi",
                                        "pronounced_as": "nichi",
                                        "orthographic_rule_note": null,
                                        "lemma": "日",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "hari"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "で",
                                        "display_parts": [
                                                {
                                                        "text": "で",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "de",
                                        "pronounced_as": "de",
                                        "orthographic_rule_note": null,
                                        "lemma": "で",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "di dalam"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 3,
                                        "surface": "行き来",
                                        "display_parts": [
                                                {
                                                        "text": "行",
                                                        "ruby": "い"
                                                },
                                                {
                                                        "text": "き",
                                                        "ruby": null
                                                },
                                                {
                                                        "text": "来",
                                                        "ruby": "き"
                                                }
                                        ],
                                        "phonetic_script": "ikiki",
                                        "pronounced_as": "ikiki",
                                        "orthographic_rule_note": null,
                                        "lemma": "行き来",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 4,
                                        "surface": "しよう",
                                        "display_parts": [
                                                {
                                                        "text": "しよう",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "shiyou",
                                        "pronounced_as": "shiyou",
                                        "orthographic_rule_note": null,
                                        "lemma": "する",
                                        "pos": "VERB",
                                        "sub_pos": "非自立可能",
                                        "inflection_chain": [
                                                "サ行変格: 意志推量形"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Mengerjakan"
                                        ],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 34,
                        "start_ms": 190330,
                        "end_ms": 194200,
                        "original_text": "辞書にある言葉で",
                        "translated_text": "Aku benci dunia yang tercipta",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "辞書",
                                        "display_parts": [
                                                {
                                                        "text": "辞書",
                                                        "ruby": "じしょ"
                                                }
                                        ],
                                        "phonetic_script": "jisho",
                                        "pronounced_as": "jisho",
                                        "orthographic_rule_note": null,
                                        "lemma": "辞書",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "に",
                                        "display_parts": [
                                                {
                                                        "text": "に",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "ni",
                                        "pronounced_as": "ni",
                                        "orthographic_rule_note": null,
                                        "lemma": "に",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "ke"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "ある",
                                        "display_parts": [
                                                {
                                                        "text": "ある",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "aru",
                                        "pronounced_as": "aru",
                                        "orthographic_rule_note": null,
                                        "lemma": "ある",
                                        "pos": "VERB",
                                        "sub_pos": "非自立可能",
                                        "inflection_chain": [
                                                "五段-ラ行: 連体形-一般"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "menjadi"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 3,
                                        "surface": "言葉",
                                        "display_parts": [
                                                {
                                                        "text": "言葉",
                                                        "ruby": "ことば"
                                                }
                                        ],
                                        "phonetic_script": "kotoba",
                                        "pronounced_as": "kotoba",
                                        "orthographic_rule_note": null,
                                        "lemma": "言葉",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "kata-kata"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 4,
                                        "surface": "で",
                                        "display_parts": [
                                                {
                                                        "text": "で",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "de",
                                        "pronounced_as": "de",
                                        "orthographic_rule_note": null,
                                        "lemma": "だ",
                                        "pos": "AUX",
                                        "sub_pos": "*",
                                        "inflection_chain": [
                                                "Bentuk Ren'youkei (Masu-stem)"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "adalah"
                                        ],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 35,
                        "start_ms": 194200,
                        "end_ms": 197970,
                        "original_text": "出来上がった世界を憎んだ",
                        "translated_text": "Dari kata-kata yang kau temukan di dalam kamus",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "出来上がっ",
                                        "display_parts": [
                                                {
                                                        "text": "出来上",
                                                        "ruby": "できあ"
                                                },
                                                {
                                                        "text": "がっ",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "dekiaga",
                                        "pronounced_as": "dekiaga",
                                        "orthographic_rule_note": null,
                                        "lemma": "出来上がる",
                                        "pos": "VERB",
                                        "sub_pos": "一般",
                                        "inflection_chain": [
                                                "Bentuk Ren'youkei (Masu-stem)"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "た",
                                        "display_parts": [
                                                {
                                                        "text": "た",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "ta",
                                        "pronounced_as": "ta",
                                        "orthographic_rule_note": null,
                                        "lemma": "た",
                                        "pos": "AUX",
                                        "sub_pos": "*",
                                        "inflection_chain": [
                                                "助動詞-タ: 連体形-一般"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Ta"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "世界",
                                        "display_parts": [
                                                {
                                                        "text": "世界",
                                                        "ruby": "せかい"
                                                }
                                        ],
                                        "phonetic_script": "sekai",
                                        "pronounced_as": "sekai",
                                        "orthographic_rule_note": null,
                                        "lemma": "世界",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "dunia"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 3,
                                        "surface": "を",
                                        "display_parts": [
                                                {
                                                        "text": "を",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "o",
                                        "pronounced_as": "o",
                                        "orthographic_rule_note": "Partikel を dilafalkan 'o'",
                                        "lemma": "を",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "dari"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 4,
                                        "surface": "憎ん",
                                        "display_parts": [
                                                {
                                                        "text": "憎",
                                                        "ruby": "にく"
                                                },
                                                {
                                                        "text": "ん",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "nikun",
                                        "pronounced_as": "nikun",
                                        "orthographic_rule_note": null,
                                        "lemma": "憎む",
                                        "pos": "VERB",
                                        "sub_pos": "一般",
                                        "inflection_chain": [
                                                "Bentuk Ren'youkei (Masu-stem)"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 5,
                                        "surface": "だ",
                                        "display_parts": [
                                                {
                                                        "text": "だ",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "da",
                                        "pronounced_as": "da",
                                        "orthographic_rule_note": null,
                                        "lemma": "だ",
                                        "pos": "AUX",
                                        "sub_pos": "*",
                                        "inflection_chain": [
                                                "助動詞-タ: 終止形-一般"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "adalah"
                                        ],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 36,
                        "start_ms": 197970,
                        "end_ms": 201850,
                        "original_text": "万華鏡の中で",
                        "translated_text": "Di suatu pagi di bulan agustus",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "万華鏡",
                                        "display_parts": [
                                                {
                                                        "text": "万華鏡",
                                                        "ruby": "まんげきょう"
                                                }
                                        ],
                                        "phonetic_script": "mangekyou",
                                        "pronounced_as": "mangekyou",
                                        "orthographic_rule_note": null,
                                        "lemma": "万華鏡",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "の",
                                        "display_parts": [
                                                {
                                                        "text": "の",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "no",
                                        "pronounced_as": "no",
                                        "orthographic_rule_note": null,
                                        "lemma": "の",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "dari"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "中",
                                        "display_parts": [
                                                {
                                                        "text": "中",
                                                        "ruby": "なか"
                                                }
                                        ],
                                        "phonetic_script": "naka",
                                        "pronounced_as": "naka",
                                        "orthographic_rule_note": null,
                                        "lemma": "中",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 3,
                                        "surface": "で",
                                        "display_parts": [
                                                {
                                                        "text": "で",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "de",
                                        "pronounced_as": "de",
                                        "orthographic_rule_note": null,
                                        "lemma": "で",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "di dalam"
                                        ],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 37,
                        "start_ms": 201850,
                        "end_ms": 205620,
                        "original_text": "八月のある朝",
                        "translated_text": "Ku terjebak dalam kegelisahan",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "八",
                                        "display_parts": [
                                                {
                                                        "text": "八",
                                                        "ruby": "はち"
                                                }
                                        ],
                                        "phonetic_script": "hachi",
                                        "pronounced_as": "hachi",
                                        "orthographic_rule_note": null,
                                        "lemma": "八",
                                        "pos": "NOUN",
                                        "sub_pos": "数詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "月",
                                        "display_parts": [
                                                {
                                                        "text": "月",
                                                        "ruby": "がつ"
                                                }
                                        ],
                                        "phonetic_script": "gatsu",
                                        "pronounced_as": "gatsu",
                                        "orthographic_rule_note": null,
                                        "lemma": "月",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "の",
                                        "display_parts": [
                                                {
                                                        "text": "の",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "no",
                                        "pronounced_as": "no",
                                        "orthographic_rule_note": null,
                                        "lemma": "の",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "dari"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 3,
                                        "surface": "ある",
                                        "display_parts": [
                                                {
                                                        "text": "ある",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "aru",
                                        "pronounced_as": "aru",
                                        "orthographic_rule_note": null,
                                        "lemma": "ある",
                                        "pos": "VERB",
                                        "sub_pos": "非自立可能",
                                        "inflection_chain": [
                                                "五段-ラ行: 連体形-一般"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "menjadi"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 4,
                                        "surface": "朝",
                                        "display_parts": [
                                                {
                                                        "text": "朝",
                                                        "ruby": "あさ"
                                                }
                                        ],
                                        "phonetic_script": "asa",
                                        "pronounced_as": "asa",
                                        "orthographic_rule_note": null,
                                        "lemma": "朝",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 38,
                        "start_ms": 205620,
                        "end_ms": 209500,
                        "original_text": "君は僕の前で",
                        "translated_text": "Kau selalu berikan senyum itu",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "君",
                                        "display_parts": [
                                                {
                                                        "text": "君",
                                                        "ruby": "きみ"
                                                }
                                        ],
                                        "phonetic_script": "kimi",
                                        "pronounced_as": "kimi",
                                        "orthographic_rule_note": null,
                                        "lemma": "君",
                                        "pos": "PRON",
                                        "sub_pos": "*",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Anda"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "は",
                                        "display_parts": [
                                                {
                                                        "text": "は",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "ha",
                                        "pronounced_as": "wa",
                                        "orthographic_rule_note": "Partikel は dilafalkan 'wa'",
                                        "lemma": "は",
                                        "pos": "PART",
                                        "sub_pos": "係助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "gigi"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "僕",
                                        "display_parts": [
                                                {
                                                        "text": "僕",
                                                        "ruby": "ぼく"
                                                }
                                        ],
                                        "phonetic_script": "boku",
                                        "pronounced_as": "boku",
                                        "orthographic_rule_note": null,
                                        "lemma": "僕",
                                        "pos": "PRON",
                                        "sub_pos": "*",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "SAYA"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 3,
                                        "surface": "の",
                                        "display_parts": [
                                                {
                                                        "text": "の",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "no",
                                        "pronounced_as": "no",
                                        "orthographic_rule_note": null,
                                        "lemma": "の",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "dari"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 4,
                                        "surface": "前",
                                        "display_parts": [
                                                {
                                                        "text": "前",
                                                        "ruby": "まえ"
                                                }
                                        ],
                                        "phonetic_script": "mae",
                                        "pronounced_as": "mae",
                                        "orthographic_rule_note": null,
                                        "lemma": "前",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 5,
                                        "surface": "で",
                                        "display_parts": [
                                                {
                                                        "text": "で",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "de",
                                        "pronounced_as": "de",
                                        "orthographic_rule_note": null,
                                        "lemma": "で",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "di dalam"
                                        ],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 39,
                        "start_ms": 209500,
                        "end_ms": 213450,
                        "original_text": "ハニかんでは澄ましてみせた",
                        "translated_text": "Tiap kali bertemu denganku Senyuman yang seperti",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "ハニかん",
                                        "display_parts": [
                                                {
                                                        "text": "ハニかん",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "hanikan",
                                        "pronounced_as": "hanikan",
                                        "orthographic_rule_note": null,
                                        "lemma": "ハニかむ",
                                        "pos": "VERB",
                                        "sub_pos": "一般",
                                        "inflection_chain": [
                                                "Bentuk Ren'youkei (Masu-stem)"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "で",
                                        "display_parts": [
                                                {
                                                        "text": "で",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "de",
                                        "pronounced_as": "de",
                                        "orthographic_rule_note": null,
                                        "lemma": "で",
                                        "pos": "PART",
                                        "sub_pos": "接続助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "di dalam"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "は",
                                        "display_parts": [
                                                {
                                                        "text": "は",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "ha",
                                        "pronounced_as": "wa",
                                        "orthographic_rule_note": "Partikel は dilafalkan 'wa'",
                                        "lemma": "は",
                                        "pos": "PART",
                                        "sub_pos": "係助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "gigi"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 3,
                                        "surface": "澄まし",
                                        "display_parts": [
                                                {
                                                        "text": "澄",
                                                        "ruby": "す"
                                                },
                                                {
                                                        "text": "まし",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "sumashi",
                                        "pronounced_as": "sumashi",
                                        "orthographic_rule_note": null,
                                        "lemma": "澄ます",
                                        "pos": "VERB",
                                        "sub_pos": "一般",
                                        "inflection_chain": [
                                                "Bentuk Ren'youkei (Masu-stem)"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 4,
                                        "surface": "て",
                                        "display_parts": [
                                                {
                                                        "text": "て",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "te",
                                        "pronounced_as": "te",
                                        "orthographic_rule_note": null,
                                        "lemma": "て",
                                        "pos": "PART",
                                        "sub_pos": "接続助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "tangan"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 5,
                                        "surface": "みせ",
                                        "display_parts": [
                                                {
                                                        "text": "みせ",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "mise",
                                        "pronounced_as": "mise",
                                        "orthographic_rule_note": null,
                                        "lemma": "みせる",
                                        "pos": "VERB",
                                        "sub_pos": "非自立可能",
                                        "inflection_chain": [
                                                "Bentuk Ren'youkei (Masu-stem)"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 6,
                                        "surface": "た",
                                        "display_parts": [
                                                {
                                                        "text": "た",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "ta",
                                        "pronounced_as": "ta",
                                        "orthographic_rule_note": null,
                                        "lemma": "た",
                                        "pos": "AUX",
                                        "sub_pos": "*",
                                        "inflection_chain": [
                                                "助動詞-タ: 終止形-一般"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Ta"
                                        ],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 40,
                        "start_ms": 213450,
                        "end_ms": 217310,
                        "original_text": "この世界の教科書",
                        "translated_text": "Tiap kali bertemu denganku Senyuman yang seperti",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "この",
                                        "display_parts": [
                                                {
                                                        "text": "この",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "kono",
                                        "pronounced_as": "kono",
                                        "orthographic_rule_note": null,
                                        "lemma": "この",
                                        "pos": "DET",
                                        "sub_pos": "*",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "ini"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "世界",
                                        "display_parts": [
                                                {
                                                        "text": "世界",
                                                        "ruby": "せかい"
                                                }
                                        ],
                                        "phonetic_script": "sekai",
                                        "pronounced_as": "sekai",
                                        "orthographic_rule_note": null,
                                        "lemma": "世界",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "dunia"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "の",
                                        "display_parts": [
                                                {
                                                        "text": "の",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "no",
                                        "pronounced_as": "no",
                                        "orthographic_rule_note": null,
                                        "lemma": "の",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "dari"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 3,
                                        "surface": "教科書",
                                        "display_parts": [
                                                {
                                                        "text": "教科書",
                                                        "ruby": "きょうかしょ"
                                                }
                                        ],
                                        "phonetic_script": "kyoukasho",
                                        "pronounced_as": "kyoukasho",
                                        "orthographic_rule_note": null,
                                        "lemma": "教科書",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 41,
                        "start_ms": 217310,
                        "end_ms": 220870,
                        "original_text": "のような笑顔で",
                        "translated_text": "Buku catatan duniaku",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "の",
                                        "display_parts": [
                                                {
                                                        "text": "の",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "no",
                                        "pronounced_as": "no",
                                        "orthographic_rule_note": null,
                                        "lemma": "の",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "dari"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "よう",
                                        "display_parts": [
                                                {
                                                        "text": "よう",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "you",
                                        "pronounced_as": "you",
                                        "orthographic_rule_note": null,
                                        "lemma": "よう",
                                        "pos": "ADJ",
                                        "sub_pos": "助動詞語幹",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Yo"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "な",
                                        "display_parts": [
                                                {
                                                        "text": "な",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "na",
                                        "pronounced_as": "na",
                                        "orthographic_rule_note": null,
                                        "lemma": "だ",
                                        "pos": "AUX",
                                        "sub_pos": "*",
                                        "inflection_chain": [
                                                "助動詞-ダ: 連体形-一般"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "adalah"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 3,
                                        "surface": "笑顔",
                                        "display_parts": [
                                                {
                                                        "text": "笑顔",
                                                        "ruby": "えがお"
                                                }
                                        ],
                                        "phonetic_script": "egao",
                                        "pronounced_as": "egao",
                                        "orthographic_rule_note": null,
                                        "lemma": "笑顔",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 4,
                                        "surface": "で",
                                        "display_parts": [
                                                {
                                                        "text": "で",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "de",
                                        "pronounced_as": "de",
                                        "orthographic_rule_note": null,
                                        "lemma": "だ",
                                        "pos": "AUX",
                                        "sub_pos": "*",
                                        "inflection_chain": [
                                                "Bentuk Ren'youkei (Masu-stem)"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "adalah"
                                        ],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 42,
                        "start_ms": 220870,
                        "end_ms": 224810,
                        "original_text": "嘘みたいな日々を 規格外の意味も",
                        "translated_text": "Walaupun akan berakhir menyedihkan Ku harap semua itu hanya mimpi Tapi sekarang kau sedang berdiri",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "嘘",
                                        "display_parts": [
                                                {
                                                        "text": "嘘",
                                                        "ruby": "うそ"
                                                }
                                        ],
                                        "phonetic_script": "uso",
                                        "pronounced_as": "uso",
                                        "orthographic_rule_note": null,
                                        "lemma": "嘘",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "みたい",
                                        "display_parts": [
                                                {
                                                        "text": "みたい",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "mitai",
                                        "pronounced_as": "mitai",
                                        "orthographic_rule_note": null,
                                        "lemma": "みたい",
                                        "pos": "ADJ",
                                        "sub_pos": "助動詞語幹",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "saya ingin"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "な",
                                        "display_parts": [
                                                {
                                                        "text": "な",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "na",
                                        "pronounced_as": "na",
                                        "orthographic_rule_note": null,
                                        "lemma": "だ",
                                        "pos": "AUX",
                                        "sub_pos": "*",
                                        "inflection_chain": [
                                                "助動詞-ダ: 連体形-一般"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "adalah"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 3,
                                        "surface": "日々",
                                        "display_parts": [
                                                {
                                                        "text": "日々",
                                                        "ruby": "ひび"
                                                }
                                        ],
                                        "phonetic_script": "hibi",
                                        "pronounced_as": "hibi",
                                        "orthographic_rule_note": null,
                                        "lemma": "日々",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 4,
                                        "surface": "を",
                                        "display_parts": [
                                                {
                                                        "text": "を",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "o",
                                        "pronounced_as": "o",
                                        "orthographic_rule_note": "Partikel を dilafalkan 'o'",
                                        "lemma": "を",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "dari"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 5,
                                        "surface": "規格外",
                                        "display_parts": [
                                                {
                                                        "text": "規格外",
                                                        "ruby": "きかくがい"
                                                }
                                        ],
                                        "phonetic_script": "kikakugai",
                                        "pronounced_as": "kikakugai",
                                        "orthographic_rule_note": null,
                                        "lemma": "規格外",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 6,
                                        "surface": "の",
                                        "display_parts": [
                                                {
                                                        "text": "の",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "no",
                                        "pronounced_as": "no",
                                        "orthographic_rule_note": null,
                                        "lemma": "の",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "dari"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 7,
                                        "surface": "意味",
                                        "display_parts": [
                                                {
                                                        "text": "意味",
                                                        "ruby": "いみ"
                                                }
                                        ],
                                        "phonetic_script": "imi",
                                        "pronounced_as": "imi",
                                        "orthographic_rule_note": null,
                                        "lemma": "意味",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 8,
                                        "surface": "も",
                                        "display_parts": [
                                                {
                                                        "text": "も",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "mo",
                                        "pronounced_as": "mo",
                                        "orthographic_rule_note": null,
                                        "lemma": "も",
                                        "pos": "PART",
                                        "sub_pos": "係助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "juga"
                                        ],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 43,
                        "start_ms": 224810,
                        "end_ms": 228660,
                        "original_text": "悲劇だっていいから 望んだよ",
                        "translated_text": "Walaupun akan berakhir menyedihkan Ku harap semua itu hanya mimpi Tapi sekarang kau sedang berdiri",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "悲劇",
                                        "display_parts": [
                                                {
                                                        "text": "悲劇",
                                                        "ruby": "ひげき"
                                                }
                                        ],
                                        "phonetic_script": "higeki",
                                        "pronounced_as": "higeki",
                                        "orthographic_rule_note": null,
                                        "lemma": "悲劇",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "だ",
                                        "display_parts": [
                                                {
                                                        "text": "だ",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "da",
                                        "pronounced_as": "da",
                                        "orthographic_rule_note": null,
                                        "lemma": "だ",
                                        "pos": "AUX",
                                        "sub_pos": "*",
                                        "inflection_chain": [
                                                "助動詞-ダ: 終止形-一般"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "adalah"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "って",
                                        "display_parts": [
                                                {
                                                        "text": "って",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "tte",
                                        "pronounced_as": "tte",
                                        "orthographic_rule_note": null,
                                        "lemma": "って",
                                        "pos": "PART",
                                        "sub_pos": "副助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Itu saja"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 3,
                                        "surface": "いい",
                                        "display_parts": [
                                                {
                                                        "text": "いい",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "ii",
                                        "pronounced_as": "ii",
                                        "orthographic_rule_note": null,
                                        "lemma": "いい",
                                        "pos": "ADJ",
                                        "sub_pos": "非自立可能",
                                        "inflection_chain": [
                                                "形容詞: 終止形-一般"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Bagus"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 4,
                                        "surface": "から",
                                        "display_parts": [
                                                {
                                                        "text": "から",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "kara",
                                        "pronounced_as": "kara",
                                        "orthographic_rule_note": null,
                                        "lemma": "から",
                                        "pos": "PART",
                                        "sub_pos": "接続助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "dari"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 5,
                                        "surface": "望ん",
                                        "display_parts": [
                                                {
                                                        "text": "望",
                                                        "ruby": "のぞ"
                                                },
                                                {
                                                        "text": "ん",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "nozon",
                                        "pronounced_as": "nozon",
                                        "orthographic_rule_note": null,
                                        "lemma": "望む",
                                        "pos": "VERB",
                                        "sub_pos": "一般",
                                        "inflection_chain": [
                                                "Bentuk Ren'youkei (Masu-stem)"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 6,
                                        "surface": "だ",
                                        "display_parts": [
                                                {
                                                        "text": "だ",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "da",
                                        "pronounced_as": "da",
                                        "orthographic_rule_note": null,
                                        "lemma": "だ",
                                        "pos": "AUX",
                                        "sub_pos": "*",
                                        "inflection_chain": [
                                                "助動詞-タ: 終止形-一般"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "adalah"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 7,
                                        "surface": "よ",
                                        "display_parts": [
                                                {
                                                        "text": "よ",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "yo",
                                        "pronounced_as": "yo",
                                        "orthographic_rule_note": null,
                                        "lemma": "よ",
                                        "pos": "PART",
                                        "sub_pos": "終助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Yo"
                                        ],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 44,
                        "start_ms": 228660,
                        "end_ms": 232480,
                        "original_text": "そしたらドアの外に",
                        "translated_text": "Walaupun akan berakhir menyedihkan Ku harap semua itu hanya mimpi Tapi sekarang kau sedang berdiri",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "そ",
                                        "display_parts": [
                                                {
                                                        "text": "そ",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "so",
                                        "pronounced_as": "so",
                                        "orthographic_rule_note": null,
                                        "lemma": "そ",
                                        "pos": "ADV",
                                        "sub_pos": "*",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "し",
                                        "display_parts": [
                                                {
                                                        "text": "し",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "shi",
                                        "pronounced_as": "shi",
                                        "orthographic_rule_note": null,
                                        "lemma": "する",
                                        "pos": "VERB",
                                        "sub_pos": "非自立可能",
                                        "inflection_chain": [
                                                "Bentuk Ren'youkei (Masu-stem)"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Mengerjakan"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "たら",
                                        "display_parts": [
                                                {
                                                        "text": "たら",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "tara",
                                        "pronounced_as": "tara",
                                        "orthographic_rule_note": null,
                                        "lemma": "た",
                                        "pos": "AUX",
                                        "sub_pos": "*",
                                        "inflection_chain": [
                                                "Bentuk Pengandaian (Ba-form)"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Ta"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 3,
                                        "surface": "ドア",
                                        "display_parts": [
                                                {
                                                        "text": "ドア",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "doa",
                                        "pronounced_as": "doa",
                                        "orthographic_rule_note": null,
                                        "lemma": "ドア",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 4,
                                        "surface": "の",
                                        "display_parts": [
                                                {
                                                        "text": "の",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "no",
                                        "pronounced_as": "no",
                                        "orthographic_rule_note": null,
                                        "lemma": "の",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "dari"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 5,
                                        "surface": "外",
                                        "display_parts": [
                                                {
                                                        "text": "外",
                                                        "ruby": "そと"
                                                }
                                        ],
                                        "phonetic_script": "soto",
                                        "pronounced_as": "soto",
                                        "orthographic_rule_note": null,
                                        "lemma": "外",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 6,
                                        "surface": "に",
                                        "display_parts": [
                                                {
                                                        "text": "に",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "ni",
                                        "pronounced_as": "ni",
                                        "orthographic_rule_note": null,
                                        "lemma": "に",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "ke"
                                        ],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 45,
                        "start_ms": 232480,
                        "end_ms": 243790,
                        "original_text": "君が全部抱えて 立ってたよ",
                        "translated_text": "Di balik pintu itu sambil membawa koper",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "君",
                                        "display_parts": [
                                                {
                                                        "text": "君",
                                                        "ruby": "きみ"
                                                }
                                        ],
                                        "phonetic_script": "kimi",
                                        "pronounced_as": "kimi",
                                        "orthographic_rule_note": null,
                                        "lemma": "君",
                                        "pos": "PRON",
                                        "sub_pos": "*",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Anda"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "が",
                                        "display_parts": [
                                                {
                                                        "text": "が",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "ga",
                                        "pronounced_as": "ga",
                                        "orthographic_rule_note": null,
                                        "lemma": "が",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Tetapi"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "全部",
                                        "display_parts": [
                                                {
                                                        "text": "全部",
                                                        "ruby": "ぜんぶ"
                                                }
                                        ],
                                        "phonetic_script": "zembu",
                                        "pronounced_as": "zembu",
                                        "orthographic_rule_note": null,
                                        "lemma": "全部",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 3,
                                        "surface": "抱え",
                                        "display_parts": [
                                                {
                                                        "text": "抱",
                                                        "ruby": "かか"
                                                },
                                                {
                                                        "text": "え",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "kakae",
                                        "pronounced_as": "kakae",
                                        "orthographic_rule_note": null,
                                        "lemma": "抱える",
                                        "pos": "VERB",
                                        "sub_pos": "一般",
                                        "inflection_chain": [
                                                "Bentuk Ren'youkei (Masu-stem)"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 4,
                                        "surface": "て",
                                        "display_parts": [
                                                {
                                                        "text": "て",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "te",
                                        "pronounced_as": "te",
                                        "orthographic_rule_note": null,
                                        "lemma": "て",
                                        "pos": "PART",
                                        "sub_pos": "接続助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "tangan"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 5,
                                        "surface": "立っ",
                                        "display_parts": [
                                                {
                                                        "text": "立",
                                                        "ruby": "た"
                                                },
                                                {
                                                        "text": "っ",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "ta",
                                        "pronounced_as": "ta",
                                        "orthographic_rule_note": null,
                                        "lemma": "立つ",
                                        "pos": "VERB",
                                        "sub_pos": "一般",
                                        "inflection_chain": [
                                                "Bentuk Ren'youkei (Masu-stem)"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 6,
                                        "surface": "て",
                                        "display_parts": [
                                                {
                                                        "text": "て",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "te",
                                        "pronounced_as": "te",
                                        "orthographic_rule_note": null,
                                        "lemma": "てる",
                                        "pos": "AUX",
                                        "sub_pos": "*",
                                        "inflection_chain": [
                                                "Bentuk Ren'youkei (Masu-stem)"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Teru"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 7,
                                        "surface": "た",
                                        "display_parts": [
                                                {
                                                        "text": "た",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "ta",
                                        "pronounced_as": "ta",
                                        "orthographic_rule_note": null,
                                        "lemma": "た",
                                        "pos": "AUX",
                                        "sub_pos": "*",
                                        "inflection_chain": [
                                                "助動詞-タ: 終止形-一般"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Ta"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 8,
                                        "surface": "よ",
                                        "display_parts": [
                                                {
                                                        "text": "よ",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "yo",
                                        "pronounced_as": "yo",
                                        "orthographic_rule_note": null,
                                        "lemma": "よ",
                                        "pos": "PART",
                                        "sub_pos": "終助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Yo"
                                        ],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 46,
                        "start_ms": 243790,
                        "end_ms": 247570,
                        "original_text": "運命だとか未来とか",
                        "translated_text": "Takdir dan masa depan yang kita gapai Tak akan menjangkau tempat Akankah kita bahagia di tempat itu",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "運命",
                                        "display_parts": [
                                                {
                                                        "text": "運命",
                                                        "ruby": "うんめい"
                                                }
                                        ],
                                        "phonetic_script": "ummei",
                                        "pronounced_as": "ummei",
                                        "orthographic_rule_note": null,
                                        "lemma": "運命",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "だ",
                                        "display_parts": [
                                                {
                                                        "text": "だ",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "da",
                                        "pronounced_as": "da",
                                        "orthographic_rule_note": null,
                                        "lemma": "だ",
                                        "pos": "AUX",
                                        "sub_pos": "*",
                                        "inflection_chain": [
                                                "助動詞-ダ: 終止形-一般"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "adalah"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "と",
                                        "display_parts": [
                                                {
                                                        "text": "と",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "to",
                                        "pronounced_as": "to",
                                        "orthographic_rule_note": null,
                                        "lemma": "と",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Dan"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 3,
                                        "surface": "か",
                                        "display_parts": [
                                                {
                                                        "text": "か",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "ka",
                                        "pronounced_as": "ka",
                                        "orthographic_rule_note": null,
                                        "lemma": "か",
                                        "pos": "PART",
                                        "sub_pos": "副助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "nyamuk"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 4,
                                        "surface": "未来",
                                        "display_parts": [
                                                {
                                                        "text": "未来",
                                                        "ruby": "みらい"
                                                }
                                        ],
                                        "phonetic_script": "mirai",
                                        "pronounced_as": "mirai",
                                        "orthographic_rule_note": null,
                                        "lemma": "未来",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 5,
                                        "surface": "と",
                                        "display_parts": [
                                                {
                                                        "text": "と",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "to",
                                        "pronounced_as": "to",
                                        "orthographic_rule_note": null,
                                        "lemma": "と",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Dan"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 6,
                                        "surface": "か",
                                        "display_parts": [
                                                {
                                                        "text": "か",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "ka",
                                        "pronounced_as": "ka",
                                        "orthographic_rule_note": null,
                                        "lemma": "か",
                                        "pos": "PART",
                                        "sub_pos": "副助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "nyamuk"
                                        ],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 47,
                        "start_ms": 247570,
                        "end_ms": 251700,
                        "original_text": "って言葉がどれだけ手を",
                        "translated_text": "Takdir dan masa depan yang kita gapai Tak akan menjangkau tempat Akankah kita bahagia di tempat itu",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "って",
                                        "display_parts": [
                                                {
                                                        "text": "って",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "tte",
                                        "pronounced_as": "tte",
                                        "orthographic_rule_note": null,
                                        "lemma": "って",
                                        "pos": "PART",
                                        "sub_pos": "副助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Itu saja"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "言葉",
                                        "display_parts": [
                                                {
                                                        "text": "言葉",
                                                        "ruby": "ことば"
                                                }
                                        ],
                                        "phonetic_script": "kotoba",
                                        "pronounced_as": "kotoba",
                                        "orthographic_rule_note": null,
                                        "lemma": "言葉",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "kata-kata"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "が",
                                        "display_parts": [
                                                {
                                                        "text": "が",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "ga",
                                        "pronounced_as": "ga",
                                        "orthographic_rule_note": null,
                                        "lemma": "が",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Tetapi"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 3,
                                        "surface": "どれ",
                                        "display_parts": [
                                                {
                                                        "text": "どれ",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "dore",
                                        "pronounced_as": "dore",
                                        "orthographic_rule_note": null,
                                        "lemma": "どれ",
                                        "pos": "PRON",
                                        "sub_pos": "*",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 4,
                                        "surface": "だけ",
                                        "display_parts": [
                                                {
                                                        "text": "だけ",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "dake",
                                        "pronounced_as": "dake",
                                        "orthographic_rule_note": null,
                                        "lemma": "だけ",
                                        "pos": "PART",
                                        "sub_pos": "副助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "hanya"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 5,
                                        "surface": "手",
                                        "display_parts": [
                                                {
                                                        "text": "手",
                                                        "ruby": "て"
                                                }
                                        ],
                                        "phonetic_script": "te",
                                        "pronounced_as": "te",
                                        "orthographic_rule_note": null,
                                        "lemma": "手",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 6,
                                        "surface": "を",
                                        "display_parts": [
                                                {
                                                        "text": "を",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "o",
                                        "pronounced_as": "o",
                                        "orthographic_rule_note": "Partikel を dilafalkan 'o'",
                                        "lemma": "を",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "dari"
                                        ],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 48,
                        "start_ms": 251700,
                        "end_ms": 255430,
                        "original_text": "伸ばそうと届かない",
                        "translated_text": "Takdir dan masa depan yang kita gapai Tak akan menjangkau tempat Akankah kita bahagia di tempat itu",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "伸ばそう",
                                        "display_parts": [
                                                {
                                                        "text": "伸",
                                                        "ruby": "の"
                                                },
                                                {
                                                        "text": "ばそう",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "nobasou",
                                        "pronounced_as": "nobasou",
                                        "orthographic_rule_note": null,
                                        "lemma": "伸ばす",
                                        "pos": "VERB",
                                        "sub_pos": "一般",
                                        "inflection_chain": [
                                                "五段-サ行: 意志推量形"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "と",
                                        "display_parts": [
                                                {
                                                        "text": "と",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "to",
                                        "pronounced_as": "to",
                                        "orthographic_rule_note": null,
                                        "lemma": "と",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Dan"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "届か",
                                        "display_parts": [
                                                {
                                                        "text": "届",
                                                        "ruby": "とど"
                                                },
                                                {
                                                        "text": "か",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "todoka",
                                        "pronounced_as": "todoka",
                                        "orthographic_rule_note": null,
                                        "lemma": "届く",
                                        "pos": "VERB",
                                        "sub_pos": "一般",
                                        "inflection_chain": [
                                                "Bentuk Negatif/Mizenkei"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "mencapai"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 3,
                                        "surface": "ない",
                                        "display_parts": [
                                                {
                                                        "text": "ない",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "nai",
                                        "pronounced_as": "nai",
                                        "orthographic_rule_note": null,
                                        "lemma": "ない",
                                        "pos": "AUX",
                                        "sub_pos": "*",
                                        "inflection_chain": [
                                                "助動詞-ナイ: 終止形-一般"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "tidak punya"
                                        ],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 49,
                        "start_ms": 255430,
                        "end_ms": 259420,
                        "original_text": "場所で",
                        "translated_text": "Tak peduli seberapa jauh jaraknya?",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "場所",
                                        "display_parts": [
                                                {
                                                        "text": "場所",
                                                        "ruby": "ばしょ"
                                                }
                                        ],
                                        "phonetic_script": "basho",
                                        "pronounced_as": "basho",
                                        "orthographic_rule_note": null,
                                        "lemma": "場所",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "tempat"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "で",
                                        "display_parts": [
                                                {
                                                        "text": "で",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "de",
                                        "pronounced_as": "de",
                                        "orthographic_rule_note": null,
                                        "lemma": "だ",
                                        "pos": "AUX",
                                        "sub_pos": "*",
                                        "inflection_chain": [
                                                "Bentuk Ren'youkei (Masu-stem)"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "adalah"
                                        ],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 50,
                        "start_ms": 259420,
                        "end_ms": 261310,
                        "original_text": "僕ら",
                        "translated_text": "Tak peduli seberapa jauh jaraknya?",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "僕",
                                        "display_parts": [
                                                {
                                                        "text": "僕",
                                                        "ruby": "ぼく"
                                                }
                                        ],
                                        "phonetic_script": "boku",
                                        "pronounced_as": "boku",
                                        "orthographic_rule_note": null,
                                        "lemma": "僕",
                                        "pos": "PRON",
                                        "sub_pos": "*",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "SAYA"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "ら",
                                        "display_parts": [
                                                {
                                                        "text": "ら",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "ra",
                                        "pronounced_as": "ra",
                                        "orthographic_rule_note": null,
                                        "lemma": "ら",
                                        "pos": "OTHER",
                                        "sub_pos": "名詞的",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "dan lainnya"
                                        ],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 51,
                        "start_ms": 261310,
                        "end_ms": 267380,
                        "original_text": "遊ぼうか",
                        "translated_text": "Tak peduli seberapa jauh jaraknya?",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "遊ぼう",
                                        "display_parts": [
                                                {
                                                        "text": "遊",
                                                        "ruby": "あそ"
                                                },
                                                {
                                                        "text": "ぼう",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "asobou",
                                        "pronounced_as": "asobou",
                                        "orthographic_rule_note": null,
                                        "lemma": "遊ぶ",
                                        "pos": "VERB",
                                        "sub_pos": "一般",
                                        "inflection_chain": [
                                                "五段-バ行: 意志推量形"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "か",
                                        "display_parts": [
                                                {
                                                        "text": "か",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "ka",
                                        "pronounced_as": "ka",
                                        "orthographic_rule_note": null,
                                        "lemma": "か",
                                        "pos": "PART",
                                        "sub_pos": "終助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "nyamuk"
                                        ],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 52,
                        "start_ms": 267380,
                        "end_ms": 270800,
                        "original_text": "愛し方さえも",
                        "translated_text": "Caramu mencintai",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "愛し",
                                        "display_parts": [
                                                {
                                                        "text": "愛",
                                                        "ruby": "あい"
                                                },
                                                {
                                                        "text": "し",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "aishi",
                                        "pronounced_as": "aishi",
                                        "orthographic_rule_note": null,
                                        "lemma": "愛する",
                                        "pos": "VERB",
                                        "sub_pos": "一般",
                                        "inflection_chain": [
                                                "Bentuk Ren'youkei (Masu-stem)"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Cinta"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "方",
                                        "display_parts": [
                                                {
                                                        "text": "方",
                                                        "ruby": "かた"
                                                }
                                        ],
                                        "phonetic_script": "kata",
                                        "pronounced_as": "kata",
                                        "orthographic_rule_note": null,
                                        "lemma": "方",
                                        "pos": "OTHER",
                                        "sub_pos": "名詞的",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "さえ",
                                        "display_parts": [
                                                {
                                                        "text": "さえ",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "sae",
                                        "pronounced_as": "sae",
                                        "orthographic_rule_note": null,
                                        "lemma": "さえ",
                                        "pos": "PART",
                                        "sub_pos": "副助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 3,
                                        "surface": "も",
                                        "display_parts": [
                                                {
                                                        "text": "も",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "mo",
                                        "pronounced_as": "mo",
                                        "orthographic_rule_note": null,
                                        "lemma": "も",
                                        "pos": "PART",
                                        "sub_pos": "係助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "juga"
                                        ],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 53,
                        "start_ms": 270800,
                        "end_ms": 275150,
                        "original_text": "君の匂いがした",
                        "translated_text": "Tercium seperti aromamu",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "君",
                                        "display_parts": [
                                                {
                                                        "text": "君",
                                                        "ruby": "きみ"
                                                }
                                        ],
                                        "phonetic_script": "kimi",
                                        "pronounced_as": "kimi",
                                        "orthographic_rule_note": null,
                                        "lemma": "君",
                                        "pos": "PRON",
                                        "sub_pos": "*",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Anda"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "の",
                                        "display_parts": [
                                                {
                                                        "text": "の",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "no",
                                        "pronounced_as": "no",
                                        "orthographic_rule_note": null,
                                        "lemma": "の",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "dari"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "匂い",
                                        "display_parts": [
                                                {
                                                        "text": "匂",
                                                        "ruby": "にお"
                                                },
                                                {
                                                        "text": "い",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "nioi",
                                        "pronounced_as": "nioi",
                                        "orthographic_rule_note": null,
                                        "lemma": "匂い",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 3,
                                        "surface": "が",
                                        "display_parts": [
                                                {
                                                        "text": "が",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "ga",
                                        "pronounced_as": "ga",
                                        "orthographic_rule_note": null,
                                        "lemma": "が",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Tetapi"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 4,
                                        "surface": "し",
                                        "display_parts": [
                                                {
                                                        "text": "し",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "shi",
                                        "pronounced_as": "shi",
                                        "orthographic_rule_note": null,
                                        "lemma": "する",
                                        "pos": "VERB",
                                        "sub_pos": "非自立可能",
                                        "inflection_chain": [
                                                "Bentuk Ren'youkei (Masu-stem)"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Mengerjakan"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 5,
                                        "surface": "た",
                                        "display_parts": [
                                                {
                                                        "text": "た",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "ta",
                                        "pronounced_as": "ta",
                                        "orthographic_rule_note": null,
                                        "lemma": "た",
                                        "pos": "AUX",
                                        "sub_pos": "*",
                                        "inflection_chain": [
                                                "助動詞-タ: 終止形-一般"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Ta"
                                        ],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 54,
                        "start_ms": 275150,
                        "end_ms": 278450,
                        "original_text": "歩き方さえも",
                        "translated_text": "Bahkan caramu berjalan",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "歩き",
                                        "display_parts": [
                                                {
                                                        "text": "歩",
                                                        "ruby": "ある"
                                                },
                                                {
                                                        "text": "き",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "aruki",
                                        "pronounced_as": "aruki",
                                        "orthographic_rule_note": null,
                                        "lemma": "歩く",
                                        "pos": "VERB",
                                        "sub_pos": "一般",
                                        "inflection_chain": [
                                                "Bentuk Ren'youkei (Masu-stem)"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "方",
                                        "display_parts": [
                                                {
                                                        "text": "方",
                                                        "ruby": "かた"
                                                }
                                        ],
                                        "phonetic_script": "kata",
                                        "pronounced_as": "kata",
                                        "orthographic_rule_note": null,
                                        "lemma": "方",
                                        "pos": "OTHER",
                                        "sub_pos": "名詞的",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "さえ",
                                        "display_parts": [
                                                {
                                                        "text": "さえ",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "sae",
                                        "pronounced_as": "sae",
                                        "orthographic_rule_note": null,
                                        "lemma": "さえ",
                                        "pos": "PART",
                                        "sub_pos": "副助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 3,
                                        "surface": "も",
                                        "display_parts": [
                                                {
                                                        "text": "も",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "mo",
                                        "pronounced_as": "mo",
                                        "orthographic_rule_note": null,
                                        "lemma": "も",
                                        "pos": "PART",
                                        "sub_pos": "係助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "juga"
                                        ],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 55,
                        "start_ms": 278450,
                        "end_ms": 282360,
                        "original_text": "その笑い声がした",
                        "translated_text": "Terdengar seperti suara tawa mu",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "その",
                                        "display_parts": [
                                                {
                                                        "text": "その",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "sono",
                                        "pronounced_as": "sono",
                                        "orthographic_rule_note": null,
                                        "lemma": "その",
                                        "pos": "DET",
                                        "sub_pos": "*",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "itu"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "笑い声",
                                        "display_parts": [
                                                {
                                                        "text": "笑",
                                                        "ruby": "わら"
                                                },
                                                {
                                                        "text": "い",
                                                        "ruby": null
                                                },
                                                {
                                                        "text": "声",
                                                        "ruby": "ごえ"
                                                }
                                        ],
                                        "phonetic_script": "waraigoe",
                                        "pronounced_as": "waraigoe",
                                        "orthographic_rule_note": null,
                                        "lemma": "笑い声",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "が",
                                        "display_parts": [
                                                {
                                                        "text": "が",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "ga",
                                        "pronounced_as": "ga",
                                        "orthographic_rule_note": null,
                                        "lemma": "が",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Tetapi"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 3,
                                        "surface": "し",
                                        "display_parts": [
                                                {
                                                        "text": "し",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "shi",
                                        "pronounced_as": "shi",
                                        "orthographic_rule_note": null,
                                        "lemma": "する",
                                        "pos": "VERB",
                                        "sub_pos": "非自立可能",
                                        "inflection_chain": [
                                                "Bentuk Ren'youkei (Masu-stem)"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Mengerjakan"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 4,
                                        "surface": "た",
                                        "display_parts": [
                                                {
                                                        "text": "た",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "ta",
                                        "pronounced_as": "ta",
                                        "orthographic_rule_note": null,
                                        "lemma": "た",
                                        "pos": "AUX",
                                        "sub_pos": "*",
                                        "inflection_chain": [
                                                "助動詞-タ: 終止形-一般"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Ta"
                                        ],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 56,
                        "start_ms": 282360,
                        "end_ms": 286550,
                        "original_text": "いつか消えてなくなる",
                        "translated_text": "Suatu saat akan menghilang",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "いつ",
                                        "display_parts": [
                                                {
                                                        "text": "いつ",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "itsu",
                                        "pronounced_as": "itsu",
                                        "orthographic_rule_note": null,
                                        "lemma": "いつ",
                                        "pos": "PRON",
                                        "sub_pos": "*",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Kapan"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "か",
                                        "display_parts": [
                                                {
                                                        "text": "か",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "ka",
                                        "pronounced_as": "ka",
                                        "orthographic_rule_note": null,
                                        "lemma": "か",
                                        "pos": "PART",
                                        "sub_pos": "副助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "nyamuk"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "消え",
                                        "display_parts": [
                                                {
                                                        "text": "消",
                                                        "ruby": "き"
                                                },
                                                {
                                                        "text": "え",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "kie",
                                        "pronounced_as": "kie",
                                        "orthographic_rule_note": null,
                                        "lemma": "消える",
                                        "pos": "VERB",
                                        "sub_pos": "一般",
                                        "inflection_chain": [
                                                "Bentuk Ren'youkei (Masu-stem)"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 3,
                                        "surface": "て",
                                        "display_parts": [
                                                {
                                                        "text": "て",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "te",
                                        "pronounced_as": "te",
                                        "orthographic_rule_note": null,
                                        "lemma": "て",
                                        "pos": "PART",
                                        "sub_pos": "接続助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "tangan"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 4,
                                        "surface": "なくなる",
                                        "display_parts": [
                                                {
                                                        "text": "なくなる",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "nakunaru",
                                        "pronounced_as": "nakunaru",
                                        "orthographic_rule_note": null,
                                        "lemma": "なくなる",
                                        "pos": "VERB",
                                        "sub_pos": "一般",
                                        "inflection_chain": [
                                                "五段-ラ行: 終止形-一般"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 57,
                        "start_ms": 286550,
                        "end_ms": 290380,
                        "original_text": "君のすべてを",
                        "translated_text": "Semuanya tentang dirimu",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "君",
                                        "display_parts": [
                                                {
                                                        "text": "君",
                                                        "ruby": "きみ"
                                                }
                                        ],
                                        "phonetic_script": "kimi",
                                        "pronounced_as": "kimi",
                                        "orthographic_rule_note": null,
                                        "lemma": "君",
                                        "pos": "PRON",
                                        "sub_pos": "*",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Anda"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "の",
                                        "display_parts": [
                                                {
                                                        "text": "の",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "no",
                                        "pronounced_as": "no",
                                        "orthographic_rule_note": null,
                                        "lemma": "の",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "dari"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "すべて",
                                        "display_parts": [
                                                {
                                                        "text": "すべて",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "subete",
                                        "pronounced_as": "subete",
                                        "orthographic_rule_note": null,
                                        "lemma": "すべて",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 3,
                                        "surface": "を",
                                        "display_parts": [
                                                {
                                                        "text": "を",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "o",
                                        "pronounced_as": "o",
                                        "orthographic_rule_note": "Partikel を dilafalkan 'o'",
                                        "lemma": "を",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "dari"
                                        ],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 58,
                        "start_ms": 290380,
                        "end_ms": 293120,
                        "original_text": "この眼に焼き付けて",
                        "translated_text": "Segala hal tantangmu di dalam mata ini harus segera ku hapuskan Ini bukanlah yang terbaik",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "この",
                                        "display_parts": [
                                                {
                                                        "text": "この",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "kono",
                                        "pronounced_as": "kono",
                                        "orthographic_rule_note": null,
                                        "lemma": "この",
                                        "pos": "DET",
                                        "sub_pos": "*",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "ini"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "眼",
                                        "display_parts": [
                                                {
                                                        "text": "眼",
                                                        "ruby": "め"
                                                }
                                        ],
                                        "phonetic_script": "me",
                                        "pronounced_as": "me",
                                        "orthographic_rule_note": null,
                                        "lemma": "眼",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "に",
                                        "display_parts": [
                                                {
                                                        "text": "に",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "ni",
                                        "pronounced_as": "ni",
                                        "orthographic_rule_note": null,
                                        "lemma": "に",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "ke"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 3,
                                        "surface": "焼き付け",
                                        "display_parts": [
                                                {
                                                        "text": "焼",
                                                        "ruby": "や"
                                                },
                                                {
                                                        "text": "き",
                                                        "ruby": null
                                                },
                                                {
                                                        "text": "付",
                                                        "ruby": "つ"
                                                },
                                                {
                                                        "text": "け",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "yakitsuke",
                                        "pronounced_as": "yakitsuke",
                                        "orthographic_rule_note": null,
                                        "lemma": "焼き付ける",
                                        "pos": "VERB",
                                        "sub_pos": "一般",
                                        "inflection_chain": [
                                                "Bentuk Ren'youkei (Masu-stem)"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 4,
                                        "surface": "て",
                                        "display_parts": [
                                                {
                                                        "text": "て",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "te",
                                        "pronounced_as": "te",
                                        "orthographic_rule_note": null,
                                        "lemma": "て",
                                        "pos": "PART",
                                        "sub_pos": "接続助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "tangan"
                                        ],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 59,
                        "start_ms": 293120,
                        "end_ms": 298120,
                        "original_text": "おくことはもう権利なんかじゃない",
                        "translated_text": "Segala hal tantangmu di dalam mata ini harus segera ku hapuskan Ini bukanlah yang terbaik",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "おく",
                                        "display_parts": [
                                                {
                                                        "text": "おく",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "oku",
                                        "pronounced_as": "oku",
                                        "orthographic_rule_note": null,
                                        "lemma": "おく",
                                        "pos": "VERB",
                                        "sub_pos": "非自立可能",
                                        "inflection_chain": [
                                                "五段-カ行: 連体形-一般"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "こと",
                                        "display_parts": [
                                                {
                                                        "text": "こと",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "koto",
                                        "pronounced_as": "koto",
                                        "orthographic_rule_note": null,
                                        "lemma": "こと",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "benda"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "は",
                                        "display_parts": [
                                                {
                                                        "text": "は",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "ha",
                                        "pronounced_as": "wa",
                                        "orthographic_rule_note": "Partikel は dilafalkan 'wa'",
                                        "lemma": "は",
                                        "pos": "PART",
                                        "sub_pos": "係助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "gigi"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 3,
                                        "surface": "もう",
                                        "display_parts": [
                                                {
                                                        "text": "もう",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "mou",
                                        "pronounced_as": "mou",
                                        "orthographic_rule_note": null,
                                        "lemma": "もう",
                                        "pos": "ADV",
                                        "sub_pos": "*",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 4,
                                        "surface": "権利",
                                        "display_parts": [
                                                {
                                                        "text": "権利",
                                                        "ruby": "けんり"
                                                }
                                        ],
                                        "phonetic_script": "kenri",
                                        "pronounced_as": "kenri",
                                        "orthographic_rule_note": null,
                                        "lemma": "権利",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 5,
                                        "surface": "なんか",
                                        "display_parts": [
                                                {
                                                        "text": "なんか",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "nanka",
                                        "pronounced_as": "nanka",
                                        "orthographic_rule_note": null,
                                        "lemma": "なんか",
                                        "pos": "PART",
                                        "sub_pos": "副助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 6,
                                        "surface": "じゃ",
                                        "display_parts": [
                                                {
                                                        "text": "じゃ",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "ja",
                                        "pronounced_as": "ja",
                                        "orthographic_rule_note": null,
                                        "lemma": "だ",
                                        "pos": "AUX",
                                        "sub_pos": "*",
                                        "inflection_chain": [
                                                "Bentuk Ren'youkei (Masu-stem)"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "adalah"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 7,
                                        "surface": "ない",
                                        "display_parts": [
                                                {
                                                        "text": "ない",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "nai",
                                        "pronounced_as": "nai",
                                        "orthographic_rule_note": null,
                                        "lemma": "ない",
                                        "pos": "ADJ",
                                        "sub_pos": "非自立可能",
                                        "inflection_chain": [
                                                "形容詞: 終止形-一般"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "tidak punya"
                                        ],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 60,
                        "start_ms": 298120,
                        "end_ms": 321130,
                        "original_text": "義務だと思うんだ",
                        "translated_text": "Tapi kuanggap ini keharusan",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "義務",
                                        "display_parts": [
                                                {
                                                        "text": "義務",
                                                        "ruby": "ぎむ"
                                                }
                                        ],
                                        "phonetic_script": "gimu",
                                        "pronounced_as": "gimu",
                                        "orthographic_rule_note": null,
                                        "lemma": "義務",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "だ",
                                        "display_parts": [
                                                {
                                                        "text": "だ",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "da",
                                        "pronounced_as": "da",
                                        "orthographic_rule_note": null,
                                        "lemma": "だ",
                                        "pos": "AUX",
                                        "sub_pos": "*",
                                        "inflection_chain": [
                                                "助動詞-ダ: 終止形-一般"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "adalah"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "と",
                                        "display_parts": [
                                                {
                                                        "text": "と",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "to",
                                        "pronounced_as": "to",
                                        "orthographic_rule_note": null,
                                        "lemma": "と",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Dan"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 3,
                                        "surface": "思う",
                                        "display_parts": [
                                                {
                                                        "text": "思",
                                                        "ruby": "おも"
                                                },
                                                {
                                                        "text": "う",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "omou",
                                        "pronounced_as": "omou",
                                        "orthographic_rule_note": null,
                                        "lemma": "思う",
                                        "pos": "VERB",
                                        "sub_pos": "一般",
                                        "inflection_chain": [
                                                "五段-ワア行: 連体形-一般"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 4,
                                        "surface": "ん",
                                        "display_parts": [
                                                {
                                                        "text": "ん",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "n",
                                        "pronounced_as": "n",
                                        "orthographic_rule_note": null,
                                        "lemma": "ん",
                                        "pos": "PART",
                                        "sub_pos": "準体助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Ya"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 5,
                                        "surface": "だ",
                                        "display_parts": [
                                                {
                                                        "text": "だ",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "da",
                                        "pronounced_as": "da",
                                        "orthographic_rule_note": null,
                                        "lemma": "だ",
                                        "pos": "AUX",
                                        "sub_pos": "*",
                                        "inflection_chain": [
                                                "助動詞-ダ: 終止形-一般"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "adalah"
                                        ],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 61,
                        "start_ms": 321130,
                        "end_ms": 325180,
                        "original_text": "運命だとか未来とか",
                        "translated_text": "Takdir dan masa depan yang kita gapai Tak akan menjangkau tempat",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "運命",
                                        "display_parts": [
                                                {
                                                        "text": "運命",
                                                        "ruby": "うんめい"
                                                }
                                        ],
                                        "phonetic_script": "ummei",
                                        "pronounced_as": "ummei",
                                        "orthographic_rule_note": null,
                                        "lemma": "運命",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "だ",
                                        "display_parts": [
                                                {
                                                        "text": "だ",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "da",
                                        "pronounced_as": "da",
                                        "orthographic_rule_note": null,
                                        "lemma": "だ",
                                        "pos": "AUX",
                                        "sub_pos": "*",
                                        "inflection_chain": [
                                                "助動詞-ダ: 終止形-一般"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "adalah"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "と",
                                        "display_parts": [
                                                {
                                                        "text": "と",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "to",
                                        "pronounced_as": "to",
                                        "orthographic_rule_note": null,
                                        "lemma": "と",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Dan"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 3,
                                        "surface": "か",
                                        "display_parts": [
                                                {
                                                        "text": "か",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "ka",
                                        "pronounced_as": "ka",
                                        "orthographic_rule_note": null,
                                        "lemma": "か",
                                        "pos": "PART",
                                        "sub_pos": "副助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "nyamuk"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 4,
                                        "surface": "未来",
                                        "display_parts": [
                                                {
                                                        "text": "未来",
                                                        "ruby": "みらい"
                                                }
                                        ],
                                        "phonetic_script": "mirai",
                                        "pronounced_as": "mirai",
                                        "orthographic_rule_note": null,
                                        "lemma": "未来",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 5,
                                        "surface": "と",
                                        "display_parts": [
                                                {
                                                        "text": "と",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "to",
                                        "pronounced_as": "to",
                                        "orthographic_rule_note": null,
                                        "lemma": "と",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Dan"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 6,
                                        "surface": "か",
                                        "display_parts": [
                                                {
                                                        "text": "か",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "ka",
                                        "pronounced_as": "ka",
                                        "orthographic_rule_note": null,
                                        "lemma": "か",
                                        "pos": "PART",
                                        "sub_pos": "副助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "nyamuk"
                                        ],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 62,
                        "start_ms": 325180,
                        "end_ms": 329030,
                        "original_text": "って言葉がどれだけ手を",
                        "translated_text": "Takdir dan masa depan yang kita gapai Tak akan menjangkau tempat",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "って",
                                        "display_parts": [
                                                {
                                                        "text": "って",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "tte",
                                        "pronounced_as": "tte",
                                        "orthographic_rule_note": null,
                                        "lemma": "って",
                                        "pos": "PART",
                                        "sub_pos": "副助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Itu saja"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "言葉",
                                        "display_parts": [
                                                {
                                                        "text": "言葉",
                                                        "ruby": "ことば"
                                                }
                                        ],
                                        "phonetic_script": "kotoba",
                                        "pronounced_as": "kotoba",
                                        "orthographic_rule_note": null,
                                        "lemma": "言葉",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "kata-kata"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "が",
                                        "display_parts": [
                                                {
                                                        "text": "が",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "ga",
                                        "pronounced_as": "ga",
                                        "orthographic_rule_note": null,
                                        "lemma": "が",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Tetapi"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 3,
                                        "surface": "どれ",
                                        "display_parts": [
                                                {
                                                        "text": "どれ",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "dore",
                                        "pronounced_as": "dore",
                                        "orthographic_rule_note": null,
                                        "lemma": "どれ",
                                        "pos": "PRON",
                                        "sub_pos": "*",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 4,
                                        "surface": "だけ",
                                        "display_parts": [
                                                {
                                                        "text": "だけ",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "dake",
                                        "pronounced_as": "dake",
                                        "orthographic_rule_note": null,
                                        "lemma": "だけ",
                                        "pos": "PART",
                                        "sub_pos": "副助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "hanya"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 5,
                                        "surface": "手",
                                        "display_parts": [
                                                {
                                                        "text": "手",
                                                        "ruby": "て"
                                                }
                                        ],
                                        "phonetic_script": "te",
                                        "pronounced_as": "te",
                                        "orthographic_rule_note": null,
                                        "lemma": "手",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 6,
                                        "surface": "を",
                                        "display_parts": [
                                                {
                                                        "text": "を",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "o",
                                        "pronounced_as": "o",
                                        "orthographic_rule_note": "Partikel を dilafalkan 'o'",
                                        "lemma": "を",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "dari"
                                        ],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 63,
                        "start_ms": 329030,
                        "end_ms": 333000,
                        "original_text": "伸ばそうと届かない",
                        "translated_text": "Dimana kita berdua saling jatuh cinta Bahkan jarum jam pun terus bergerak",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "伸ばそう",
                                        "display_parts": [
                                                {
                                                        "text": "伸",
                                                        "ruby": "の"
                                                },
                                                {
                                                        "text": "ばそう",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "nobasou",
                                        "pronounced_as": "nobasou",
                                        "orthographic_rule_note": null,
                                        "lemma": "伸ばす",
                                        "pos": "VERB",
                                        "sub_pos": "一般",
                                        "inflection_chain": [
                                                "五段-サ行: 意志推量形"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "と",
                                        "display_parts": [
                                                {
                                                        "text": "と",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "to",
                                        "pronounced_as": "to",
                                        "orthographic_rule_note": null,
                                        "lemma": "と",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Dan"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "届か",
                                        "display_parts": [
                                                {
                                                        "text": "届",
                                                        "ruby": "とど"
                                                },
                                                {
                                                        "text": "か",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "todoka",
                                        "pronounced_as": "todoka",
                                        "orthographic_rule_note": null,
                                        "lemma": "届く",
                                        "pos": "VERB",
                                        "sub_pos": "一般",
                                        "inflection_chain": [
                                                "Bentuk Negatif/Mizenkei"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "mencapai"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 3,
                                        "surface": "ない",
                                        "display_parts": [
                                                {
                                                        "text": "ない",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "nai",
                                        "pronounced_as": "nai",
                                        "orthographic_rule_note": null,
                                        "lemma": "ない",
                                        "pos": "AUX",
                                        "sub_pos": "*",
                                        "inflection_chain": [
                                                "助動詞-ナイ: 終止形-一般"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "tidak punya"
                                        ],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 64,
                        "start_ms": 333000,
                        "end_ms": 336920,
                        "original_text": "場所で僕ら恋をする",
                        "translated_text": "Dimana kita berdua saling jatuh cinta Bahkan jarum jam pun terus bergerak",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "場所",
                                        "display_parts": [
                                                {
                                                        "text": "場所",
                                                        "ruby": "ばしょ"
                                                }
                                        ],
                                        "phonetic_script": "basho",
                                        "pronounced_as": "basho",
                                        "orthographic_rule_note": null,
                                        "lemma": "場所",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "tempat"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "で",
                                        "display_parts": [
                                                {
                                                        "text": "で",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "de",
                                        "pronounced_as": "de",
                                        "orthographic_rule_note": null,
                                        "lemma": "で",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "di dalam"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "僕",
                                        "display_parts": [
                                                {
                                                        "text": "僕",
                                                        "ruby": "ぼく"
                                                }
                                        ],
                                        "phonetic_script": "boku",
                                        "pronounced_as": "boku",
                                        "orthographic_rule_note": null,
                                        "lemma": "僕",
                                        "pos": "PRON",
                                        "sub_pos": "*",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "SAYA"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 3,
                                        "surface": "ら",
                                        "display_parts": [
                                                {
                                                        "text": "ら",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "ra",
                                        "pronounced_as": "ra",
                                        "orthographic_rule_note": null,
                                        "lemma": "ら",
                                        "pos": "OTHER",
                                        "sub_pos": "名詞的",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "dan lainnya"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 4,
                                        "surface": "恋",
                                        "display_parts": [
                                                {
                                                        "text": "恋",
                                                        "ruby": "こい"
                                                }
                                        ],
                                        "phonetic_script": "koi",
                                        "pronounced_as": "koi",
                                        "orthographic_rule_note": null,
                                        "lemma": "恋",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 5,
                                        "surface": "を",
                                        "display_parts": [
                                                {
                                                        "text": "を",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "o",
                                        "pronounced_as": "o",
                                        "orthographic_rule_note": "Partikel を dilafalkan 'o'",
                                        "lemma": "を",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "dari"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 6,
                                        "surface": "する",
                                        "display_parts": [
                                                {
                                                        "text": "する",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "suru",
                                        "pronounced_as": "suru",
                                        "orthographic_rule_note": null,
                                        "lemma": "する",
                                        "pos": "VERB",
                                        "sub_pos": "非自立可能",
                                        "inflection_chain": [
                                                "サ行変格: 終止形-一般"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Mengerjakan"
                                        ],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 65,
                        "start_ms": 336920,
                        "end_ms": 340630,
                        "original_text": "時計の針も二人を",
                        "translated_text": "Dimana kita berdua saling jatuh cinta Bahkan jarum jam pun terus bergerak",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "時計",
                                        "display_parts": [
                                                {
                                                        "text": "時計",
                                                        "ruby": "とけい"
                                                }
                                        ],
                                        "phonetic_script": "tokei",
                                        "pronounced_as": "tokei",
                                        "orthographic_rule_note": null,
                                        "lemma": "時計",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "の",
                                        "display_parts": [
                                                {
                                                        "text": "の",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "no",
                                        "pronounced_as": "no",
                                        "orthographic_rule_note": null,
                                        "lemma": "の",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "dari"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "針",
                                        "display_parts": [
                                                {
                                                        "text": "針",
                                                        "ruby": "はり"
                                                }
                                        ],
                                        "phonetic_script": "hari",
                                        "pronounced_as": "hari",
                                        "orthographic_rule_note": null,
                                        "lemma": "針",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 3,
                                        "surface": "も",
                                        "display_parts": [
                                                {
                                                        "text": "も",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "mo",
                                        "pronounced_as": "mo",
                                        "orthographic_rule_note": null,
                                        "lemma": "も",
                                        "pos": "PART",
                                        "sub_pos": "係助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "juga"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 4,
                                        "surface": "二人",
                                        "display_parts": [
                                                {
                                                        "text": "二人",
                                                        "ruby": "ふたり"
                                                }
                                        ],
                                        "phonetic_script": "futari",
                                        "pronounced_as": "futari",
                                        "orthographic_rule_note": null,
                                        "lemma": "二人",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "dua orang"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 5,
                                        "surface": "を",
                                        "display_parts": [
                                                {
                                                        "text": "を",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "o",
                                        "pronounced_as": "o",
                                        "orthographic_rule_note": "Partikel を dilafalkan 'o'",
                                        "lemma": "を",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "dari"
                                        ],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 66,
                        "start_ms": 340630,
                        "end_ms": 344780,
                        "original_text": "横目に見ながら進む",
                        "translated_text": "Seraya memperhatikan kita berdua",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "横目",
                                        "display_parts": [
                                                {
                                                        "text": "横目",
                                                        "ruby": "よこめ"
                                                }
                                        ],
                                        "phonetic_script": "yokome",
                                        "pronounced_as": "yokome",
                                        "orthographic_rule_note": null,
                                        "lemma": "横目",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "に",
                                        "display_parts": [
                                                {
                                                        "text": "に",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "ni",
                                        "pronounced_as": "ni",
                                        "orthographic_rule_note": null,
                                        "lemma": "に",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "ke"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "見",
                                        "display_parts": [
                                                {
                                                        "text": "見",
                                                        "ruby": "み"
                                                }
                                        ],
                                        "phonetic_script": "mi",
                                        "pronounced_as": "mi",
                                        "orthographic_rule_note": null,
                                        "lemma": "見る",
                                        "pos": "VERB",
                                        "sub_pos": "非自立可能",
                                        "inflection_chain": [
                                                "Bentuk Ren'youkei (Masu-stem)"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": {
                                                "system": "jp_pitch",
                                                "value": "atamadaka",
                                                "pattern": [
                                                        1,
                                                        0
                                                ]
                                        },
                                        "proficiency_tag": "JLPT N5",
                                        "meanings": [
                                                "melihat",
                                                "menonton"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 3,
                                        "surface": "ながら",
                                        "display_parts": [
                                                {
                                                        "text": "ながら",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "nagara",
                                        "pronounced_as": "nagara",
                                        "orthographic_rule_note": null,
                                        "lemma": "ながら",
                                        "pos": "PART",
                                        "sub_pos": "接続助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Ketika"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 4,
                                        "surface": "進む",
                                        "display_parts": [
                                                {
                                                        "text": "進",
                                                        "ruby": "すす"
                                                },
                                                {
                                                        "text": "む",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "susumu",
                                        "pronounced_as": "susumu",
                                        "orthographic_rule_note": null,
                                        "lemma": "進む",
                                        "pos": "VERB",
                                        "sub_pos": "一般",
                                        "inflection_chain": [
                                                "五段-マ行: 終止形-一般"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 67,
                        "start_ms": 344780,
                        "end_ms": 348170,
                        "original_text": "そんな世界を二人で",
                        "translated_text": "Di dunia seperti itu, kita berdua Bersama selalu Tidak, selama mungkin",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "そんな",
                                        "display_parts": [
                                                {
                                                        "text": "そんな",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "sonna",
                                        "pronounced_as": "sonna",
                                        "orthographic_rule_note": null,
                                        "lemma": "そんな",
                                        "pos": "DET",
                                        "sub_pos": "*",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "世界",
                                        "display_parts": [
                                                {
                                                        "text": "世界",
                                                        "ruby": "せかい"
                                                }
                                        ],
                                        "phonetic_script": "sekai",
                                        "pronounced_as": "sekai",
                                        "orthographic_rule_note": null,
                                        "lemma": "世界",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "dunia"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "を",
                                        "display_parts": [
                                                {
                                                        "text": "を",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "o",
                                        "pronounced_as": "o",
                                        "orthographic_rule_note": "Partikel を dilafalkan 'o'",
                                        "lemma": "を",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "dari"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 3,
                                        "surface": "二人",
                                        "display_parts": [
                                                {
                                                        "text": "二人",
                                                        "ruby": "ふたり"
                                                }
                                        ],
                                        "phonetic_script": "futari",
                                        "pronounced_as": "futari",
                                        "orthographic_rule_note": null,
                                        "lemma": "二人",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "dua orang"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 4,
                                        "surface": "で",
                                        "display_parts": [
                                                {
                                                        "text": "で",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "de",
                                        "pronounced_as": "de",
                                        "orthographic_rule_note": null,
                                        "lemma": "で",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "di dalam"
                                        ],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 68,
                        "start_ms": 348170,
                        "end_ms": 350050,
                        "original_text": "一生 いや",
                        "translated_text": "Di dunia seperti itu, kita berdua Bersama selalu Tidak, selama mungkin",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "一生",
                                        "display_parts": [
                                                {
                                                        "text": "一生",
                                                        "ruby": "いっしょう"
                                                }
                                        ],
                                        "phonetic_script": "isshou",
                                        "pronounced_as": "isshou",
                                        "orthographic_rule_note": null,
                                        "lemma": "一生",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "いや",
                                        "display_parts": [
                                                {
                                                        "text": "いや",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "iya",
                                        "pronounced_as": "iya",
                                        "orthographic_rule_note": null,
                                        "lemma": "いや",
                                        "pos": "OTHER",
                                        "sub_pos": "一般",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 69,
                        "start_ms": 350050,
                        "end_ms": 352390,
                        "original_text": "何章でも",
                        "translated_text": "Di dunia seperti itu, kita berdua Bersama selalu Tidak, selama mungkin",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "何",
                                        "display_parts": [
                                                {
                                                        "text": "何",
                                                        "ruby": "なん"
                                                }
                                        ],
                                        "phonetic_script": "nan",
                                        "pronounced_as": "nan",
                                        "orthographic_rule_note": null,
                                        "lemma": "何",
                                        "pos": "PRON",
                                        "sub_pos": "*",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "Apa"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "章",
                                        "display_parts": [
                                                {
                                                        "text": "章",
                                                        "ruby": "しょう"
                                                }
                                        ],
                                        "phonetic_script": "shou",
                                        "pronounced_as": "shou",
                                        "orthographic_rule_note": null,
                                        "lemma": "章",
                                        "pos": "NOUN",
                                        "sub_pos": "普通名詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "で",
                                        "display_parts": [
                                                {
                                                        "text": "で",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "de",
                                        "pronounced_as": "de",
                                        "orthographic_rule_note": null,
                                        "lemma": "で",
                                        "pos": "PART",
                                        "sub_pos": "格助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "di dalam"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 3,
                                        "surface": "も",
                                        "display_parts": [
                                                {
                                                        "text": "も",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "mo",
                                        "pronounced_as": "mo",
                                        "orthographic_rule_note": null,
                                        "lemma": "も",
                                        "pos": "PART",
                                        "sub_pos": "係助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "juga"
                                        ],
                                        "linked_token_ids": []
                                }
                        ]
                },
                {
                        "index": 70,
                        "start_ms": 352390,
                        "end_ms": 356390,
                        "original_text": "生き抜いていこう",
                        "translated_text": "Dimana kita akan terus hidup",
                        "translation_failed": false,
                        "is_i_plus_one": false,
                        "tokens": [
                                {
                                        "token_id": 0,
                                        "surface": "生き",
                                        "display_parts": [
                                                {
                                                        "text": "生",
                                                        "ruby": "い"
                                                },
                                                {
                                                        "text": "き",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "iki",
                                        "pronounced_as": "iki",
                                        "orthographic_rule_note": null,
                                        "lemma": "生きる",
                                        "pos": "VERB",
                                        "sub_pos": "一般",
                                        "inflection_chain": [
                                                "Bentuk Ren'youkei (Masu-stem)"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "hidup"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 1,
                                        "surface": "抜い",
                                        "display_parts": [
                                                {
                                                        "text": "抜",
                                                        "ruby": "ぬ"
                                                },
                                                {
                                                        "text": "い",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "nui",
                                        "pronounced_as": "nui",
                                        "orthographic_rule_note": null,
                                        "lemma": "抜く",
                                        "pos": "VERB",
                                        "sub_pos": "非自立可能",
                                        "inflection_chain": [
                                                "Bentuk Ren'youkei (Masu-stem)"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 2,
                                        "surface": "て",
                                        "display_parts": [
                                                {
                                                        "text": "て",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "te",
                                        "pronounced_as": "te",
                                        "orthographic_rule_note": null,
                                        "lemma": "て",
                                        "pos": "PART",
                                        "sub_pos": "接続助詞",
                                        "inflection_chain": [],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [
                                                "tangan"
                                        ],
                                        "linked_token_ids": []
                                },
                                {
                                        "token_id": 3,
                                        "surface": "いこう",
                                        "display_parts": [
                                                {
                                                        "text": "いこう",
                                                        "ruby": null
                                                }
                                        ],
                                        "phonetic_script": "ikou",
                                        "pronounced_as": "ikou",
                                        "orthographic_rule_note": null,
                                        "lemma": "いく",
                                        "pos": "VERB",
                                        "sub_pos": "非自立可能",
                                        "inflection_chain": [
                                                "五段-カ行: 意志推量形"
                                        ],
                                        "root": null,
                                        "gender": null,
                                        "tone_or_pitch": null,
                                        "proficiency_tag": null,
                                        "meanings": [],
                                        "linked_token_ids": []
                                }
                        ]
                }
        ]
};
    }

    if (isFairytale) {
      return {
        video_id: 'uiH4BFTtrF8',
        title: 'Fairytale',
        channel: 'Alexander Rybak',
        language: 'en',
        writing_direction: 'ltr',
        source_type: 'spotify',
        spotify_id: '4Mo0vn7a03pJ19uESUrH5a',
        spotify_embed_url: 'https://open.spotify.com/embed/track/4Mo0vn7a03pJ19uESUrH5a',
        thumbnail_url: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e0281b37805fa6054fa82649ea2',
        artist: 'Alexander Rybak',
        segments: [
          {
            index: 0,
            start_ms: 12000,
            end_ms: 17500,
            original_text: 'Years ago, when I was younger, I kinda liked a girl I knew',
            translated_text: 'Bertahun-tahun lalu ketika aku masih muda, aku menyukai seorang gadis yang kukenal',
            tokens: [
              { token_id: 0, surface: 'Years', display_parts: [{ text: 'Years', ruby: null }], phonetic_script: 'jɪərz', pronounced_as: 'years', lemma: 'year', pos: 'NOUN', meanings: ['tahun'] },
              { token_id: 1, surface: 'ago', display_parts: [{ text: 'ago', ruby: null }], phonetic_script: 'əˈɡəʊ', pronounced_as: 'ago', lemma: 'ago', pos: 'ADV', meanings: ['yang lalu'] },
              { token_id: 2, surface: 'younger', display_parts: [{ text: 'younger', ruby: null }], phonetic_script: 'ˈjʌŋɡə', pronounced_as: 'younger', lemma: 'young', pos: 'ADJ', meanings: ['lebih muda'] },
              { token_id: 3, surface: 'liked', display_parts: [{ text: 'liked', ruby: null }], phonetic_script: 'laɪkt', pronounced_as: 'liked', lemma: 'like', pos: 'VERB', meanings: ['menyukai'] }
            ]
          },
          {
            index: 1,
            start_ms: 17500,
            end_ms: 23000,
            original_text: 'She was mine and we were sweethearts, that was then, but then it’s true',
            translated_text: 'Dia milikku dan kami adalah kekasih, itu dulu, tapi memang benar adanya',
            tokens: [
              { token_id: 0, surface: 'mine', display_parts: [{ text: 'mine', ruby: null }], phonetic_script: 'maɪn', pronounced_as: 'mine', lemma: 'mine', pos: 'PRON', meanings: ['milikku'] },
              { token_id: 1, surface: 'sweethearts', display_parts: [{ text: 'sweethearts', ruby: null }], phonetic_script: 'ˈswiːthɑːts', pronounced_as: 'sweethearts', lemma: 'sweetheart', pos: 'NOUN', meanings: ['kekasih hati'] }
            ]
          },
          {
            index: 2,
            start_ms: 23000,
            end_ms: 32000,
            original_text: 'I’m in love with a fairytale, even though it hurts',
            translated_text: 'Aku jatuh cinta pada sebuah dongeng, meskipun itu menyakitkan',
            tokens: [
              { token_id: 0, surface: 'love', display_parts: [{ text: 'love', ruby: null }], phonetic_script: 'lʌv', pronounced_as: 'love', lemma: 'love', pos: 'NOUN', meanings: ['cinta'] },
              { token_id: 1, surface: 'fairytale', display_parts: [{ text: 'fairytale', ruby: null }], phonetic_script: 'ˈfeəriteɪl', pronounced_as: 'fairytale', lemma: 'fairytale', pos: 'NOUN', meanings: ['dongeng', 'kisah peri'] },
              { token_id: 2, surface: 'hurts', display_parts: [{ text: 'hurts', ruby: null }], phonetic_script: 'hɜːts', pronounced_as: 'hurts', lemma: 'hurt', pos: 'VERB', meanings: ['terasa sakit', 'melukai'] }
            ]
          }
        ]
      };
    }

    // Default Featured Spotify Track: 可愛くてごめん (HoneyWorks, ちゅーたん CV: 早見沙織)
    if (isSpotify && !isYoasobi) {
      return {
  "video_id": "K4xLi8IF1FM",
  "title": "可愛くてごめん feat. ちゅーたん(CV:早見沙織)",
  "channel": "HoneyWorks OFFICIAL",
  "language": "ja",
  "writing_direction": "ltr",
  "source_type": "spotify",
  "spotify_id": "4Mo0vn7a03pJ19uESUrH5a",
  "spotify_embed_url": "https://open.spotify.com/embed/track/4Mo0vn7a03pJ19uESUrH5a?utm_source=generator&theme=0",
  "thumbnail_url": "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e0266e246eec1f1fb552ed0f017",
  "artist": "HoneyWorks, ちゅーたん(CV:早見沙織)",
  "duration_ms": 221000,
  "duration": 221,
  "audio_url": null,
  "engine_used": {
    "pipeline": "spotify_lrclib_synced",
    "nlp": "ja",
    "tokenizer": "sudachipy_mode_c",
    "phonetics": "pykakasi",
    "pitch": "real_ojad_lexicon"
  },
  "truncated": false,
  "segments": [
    {
      "index": 0,
      "start_ms": 11620,
      "end_ms": 14660,
      "original_text": "私が私の事を愛して",
      "translated_text": "aku mencintaiku",
      "translation_failed": false,
      "is_i_plus_one": false,
      "tokens": [
        {
          "token_id": 0,
          "surface": "私",
          "display_parts": [
            {
              "text": "私",
              "ruby": "わたくし"
            }
          ],
          "phonetic_script": "watakushi",
          "pronounced_as": "watakushi",
          "orthographic_rule_note": null,
          "lemma": "私",
          "pos": "PRON",
          "sub_pos": "*",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": {
            "system": "jp_pitch",
            "value": "atamadaka",
            "pattern": [
              1,
              0,
              0
            ]
          },
          "proficiency_tag": "JLPT N5",
          "meanings": [
            "saya",
            "aku"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 1,
          "surface": "が",
          "display_parts": [
            {
              "text": "が",
              "ruby": null
            }
          ],
          "phonetic_script": "ga",
          "pronounced_as": "ga",
          "orthographic_rule_note": null,
          "lemma": "が",
          "pos": "PART",
          "sub_pos": "格助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Tetapi"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 2,
          "surface": "私",
          "display_parts": [
            {
              "text": "私",
              "ruby": "わたくし"
            }
          ],
          "phonetic_script": "watakushi",
          "pronounced_as": "watakushi",
          "orthographic_rule_note": null,
          "lemma": "私",
          "pos": "PRON",
          "sub_pos": "*",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": {
            "system": "jp_pitch",
            "value": "atamadaka",
            "pattern": [
              1,
              0,
              0
            ]
          },
          "proficiency_tag": "JLPT N5",
          "meanings": [
            "saya",
            "aku"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 3,
          "surface": "の",
          "display_parts": [
            {
              "text": "の",
              "ruby": null
            }
          ],
          "phonetic_script": "no",
          "pronounced_as": "no",
          "orthographic_rule_note": null,
          "lemma": "の",
          "pos": "PART",
          "sub_pos": "格助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "dari"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 4,
          "surface": "事",
          "display_parts": [
            {
              "text": "事",
              "ruby": "こと"
            }
          ],
          "phonetic_script": "koto",
          "pronounced_as": "koto",
          "orthographic_rule_note": null,
          "lemma": "事",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "kasus"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 5,
          "surface": "を",
          "display_parts": [
            {
              "text": "を",
              "ruby": null
            }
          ],
          "phonetic_script": "o",
          "pronounced_as": "o",
          "orthographic_rule_note": "Partikel を dilafalkan 'o'",
          "lemma": "を",
          "pos": "PART",
          "sub_pos": "格助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "dari"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 6,
          "surface": "愛し",
          "display_parts": [
            {
              "text": "愛",
              "ruby": "あい"
            },
            {
              "text": "し",
              "ruby": null
            }
          ],
          "phonetic_script": "aishi",
          "pronounced_as": "aishi",
          "orthographic_rule_note": null,
          "lemma": "愛する",
          "pos": "VERB",
          "sub_pos": "一般",
          "inflection_chain": [
            "Bentuk Ren'youkei (Masu-stem)"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Cinta"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 7,
          "surface": "て",
          "display_parts": [
            {
              "text": "て",
              "ruby": null
            }
          ],
          "phonetic_script": "te",
          "pronounced_as": "te",
          "orthographic_rule_note": null,
          "lemma": "て",
          "pos": "PART",
          "sub_pos": "接続助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "tangan"
          ],
          "linked_token_ids": []
        }
      ]
    },
    {
      "index": 1,
      "start_ms": 14660,
      "end_ms": 17850,
      "original_text": "何が悪いの？ 嫉妬でしょうか？",
      "translated_text": "Ada apa? Apakah itu cemburu?",
      "translation_failed": false,
      "is_i_plus_one": false,
      "tokens": [
        {
          "token_id": 0,
          "surface": "何",
          "display_parts": [
            {
              "text": "何",
              "ruby": "なん"
            }
          ],
          "phonetic_script": "nan",
          "pronounced_as": "nan",
          "orthographic_rule_note": null,
          "lemma": "何",
          "pos": "PRON",
          "sub_pos": "*",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Apa"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 1,
          "surface": "が",
          "display_parts": [
            {
              "text": "が",
              "ruby": null
            }
          ],
          "phonetic_script": "ga",
          "pronounced_as": "ga",
          "orthographic_rule_note": null,
          "lemma": "が",
          "pos": "PART",
          "sub_pos": "格助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Tetapi"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 2,
          "surface": "悪い",
          "display_parts": [
            {
              "text": "悪",
              "ruby": "わる"
            },
            {
              "text": "い",
              "ruby": null
            }
          ],
          "phonetic_script": "warui",
          "pronounced_as": "warui",
          "orthographic_rule_note": null,
          "lemma": "悪い",
          "pos": "ADJ",
          "sub_pos": "一般",
          "inflection_chain": [
            "形容詞: 連体形-一般"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "buruk"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 3,
          "surface": "の",
          "display_parts": [
            {
              "text": "の",
              "ruby": null
            }
          ],
          "phonetic_script": "no",
          "pronounced_as": "no",
          "orthographic_rule_note": null,
          "lemma": "の",
          "pos": "PART",
          "sub_pos": "終助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "dari"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 4,
          "surface": "？",
          "display_parts": [
            {
              "text": "？",
              "ruby": null
            }
          ],
          "phonetic_script": "?",
          "pronounced_as": "?",
          "orthographic_rule_note": null,
          "lemma": "?",
          "pos": "PUNCT",
          "sub_pos": "句点",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "?"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 5,
          "surface": "嫉妬",
          "display_parts": [
            {
              "text": "嫉妬",
              "ruby": "しっと"
            }
          ],
          "phonetic_script": "shitto",
          "pronounced_as": "shitto",
          "orthographic_rule_note": null,
          "lemma": "嫉妬",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "iri"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 6,
          "surface": "でしょう",
          "display_parts": [
            {
              "text": "でしょう",
              "ruby": null
            }
          ],
          "phonetic_script": "deshou",
          "pronounced_as": "deshou",
          "orthographic_rule_note": null,
          "lemma": "です",
          "pos": "AUX",
          "sub_pos": "*",
          "inflection_chain": [
            "助動詞-デス: 意志推量形"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "adalah"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 7,
          "surface": "か",
          "display_parts": [
            {
              "text": "か",
              "ruby": null
            }
          ],
          "phonetic_script": "ka",
          "pronounced_as": "ka",
          "orthographic_rule_note": null,
          "lemma": "か",
          "pos": "PART",
          "sub_pos": "終助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "nyamuk"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 8,
          "surface": "？",
          "display_parts": [
            {
              "text": "？",
              "ruby": null
            }
          ],
          "phonetic_script": "?",
          "pronounced_as": "?",
          "orthographic_rule_note": null,
          "lemma": "?",
          "pos": "PUNCT",
          "sub_pos": "句点",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "?"
          ],
          "linked_token_ids": []
        }
      ]
    },
    {
      "index": 2,
      "start_ms": 17850,
      "end_ms": 20880,
      "original_text": "痛いだとか変わってるとか",
      "translated_text": "Apakah itu menyakitkan atau berubah?",
      "translation_failed": false,
      "is_i_plus_one": false,
      "tokens": [
        {
          "token_id": 0,
          "surface": "痛い",
          "display_parts": [
            {
              "text": "痛",
              "ruby": "いた"
            },
            {
              "text": "い",
              "ruby": null
            }
          ],
          "phonetic_script": "itai",
          "pronounced_as": "itai",
          "orthographic_rule_note": null,
          "lemma": "痛い",
          "pos": "ADJ",
          "sub_pos": "一般",
          "inflection_chain": [
            "形容詞: 終止形-一般"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "itu menyakitkan"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 1,
          "surface": "だ",
          "display_parts": [
            {
              "text": "だ",
              "ruby": null
            }
          ],
          "phonetic_script": "da",
          "pronounced_as": "da",
          "orthographic_rule_note": null,
          "lemma": "だ",
          "pos": "AUX",
          "sub_pos": "*",
          "inflection_chain": [
            "助動詞-ダ: 終止形-一般"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "adalah"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 2,
          "surface": "と",
          "display_parts": [
            {
              "text": "と",
              "ruby": null
            }
          ],
          "phonetic_script": "to",
          "pronounced_as": "to",
          "orthographic_rule_note": null,
          "lemma": "と",
          "pos": "PART",
          "sub_pos": "格助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Dan"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 3,
          "surface": "か",
          "display_parts": [
            {
              "text": "か",
              "ruby": null
            }
          ],
          "phonetic_script": "ka",
          "pronounced_as": "ka",
          "orthographic_rule_note": null,
          "lemma": "か",
          "pos": "PART",
          "sub_pos": "副助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "nyamuk"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 4,
          "surface": "変わっ",
          "display_parts": [
            {
              "text": "変",
              "ruby": "か"
            },
            {
              "text": "わっ",
              "ruby": null
            }
          ],
          "phonetic_script": "kawa",
          "pronounced_as": "kawa",
          "orthographic_rule_note": null,
          "lemma": "変わる",
          "pos": "VERB",
          "sub_pos": "一般",
          "inflection_chain": [
            "Bentuk Ren'youkei (Masu-stem)"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "mengubah"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 5,
          "surface": "てる",
          "display_parts": [
            {
              "text": "てる",
              "ruby": null
            }
          ],
          "phonetic_script": "teru",
          "pronounced_as": "teru",
          "orthographic_rule_note": null,
          "lemma": "てる",
          "pos": "AUX",
          "sub_pos": "*",
          "inflection_chain": [
            "下一段-タ行: 終止形-一般"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Teru"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 6,
          "surface": "と",
          "display_parts": [
            {
              "text": "と",
              "ruby": null
            }
          ],
          "phonetic_script": "to",
          "pronounced_as": "to",
          "orthographic_rule_note": null,
          "lemma": "と",
          "pos": "PART",
          "sub_pos": "格助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Dan"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 7,
          "surface": "か",
          "display_parts": [
            {
              "text": "か",
              "ruby": null
            }
          ],
          "phonetic_script": "ka",
          "pronounced_as": "ka",
          "orthographic_rule_note": null,
          "lemma": "か",
          "pos": "PART",
          "sub_pos": "副助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "nyamuk"
          ],
          "linked_token_ids": []
        }
      ]
    },
    {
      "index": 3,
      "start_ms": 20880,
      "end_ms": 23170,
      "original_text": "届きませんね そのリプライ",
      "translated_text": "Saya tidak dapat mencapai jawaban itu.",
      "translation_failed": false,
      "is_i_plus_one": false,
      "tokens": [
        {
          "token_id": 0,
          "surface": "届き",
          "display_parts": [
            {
              "text": "届",
              "ruby": "とど"
            },
            {
              "text": "き",
              "ruby": null
            }
          ],
          "phonetic_script": "todoki",
          "pronounced_as": "todoki",
          "orthographic_rule_note": null,
          "lemma": "届く",
          "pos": "VERB",
          "sub_pos": "一般",
          "inflection_chain": [
            "Bentuk Ren'youkei (Masu-stem)"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "mencapai"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 1,
          "surface": "ませ",
          "display_parts": [
            {
              "text": "ませ",
              "ruby": null
            }
          ],
          "phonetic_script": "mase",
          "pronounced_as": "mase",
          "orthographic_rule_note": null,
          "lemma": "ます",
          "pos": "AUX",
          "sub_pos": "*",
          "inflection_chain": [
            "Bentuk Negatif/Mizenkei"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "masu"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 2,
          "surface": "ん",
          "display_parts": [
            {
              "text": "ん",
              "ruby": null
            }
          ],
          "phonetic_script": "n",
          "pronounced_as": "n",
          "orthographic_rule_note": null,
          "lemma": "ぬ",
          "pos": "AUX",
          "sub_pos": "*",
          "inflection_chain": [
            "助動詞-ヌ: 終止形-撥音便"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Tidak"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 3,
          "surface": "ね",
          "display_parts": [
            {
              "text": "ね",
              "ruby": null
            }
          ],
          "phonetic_script": "ne",
          "pronounced_as": "ne",
          "orthographic_rule_note": null,
          "lemma": "ね",
          "pos": "PART",
          "sub_pos": "終助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Hai"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 4,
          "surface": "その",
          "display_parts": [
            {
              "text": "その",
              "ruby": null
            }
          ],
          "phonetic_script": "sono",
          "pronounced_as": "sono",
          "orthographic_rule_note": null,
          "lemma": "その",
          "pos": "DET",
          "sub_pos": "*",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "itu"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 5,
          "surface": "リプライ",
          "display_parts": [
            {
              "text": "リプライ",
              "ruby": null
            }
          ],
          "phonetic_script": "ripurai",
          "pronounced_as": "ripurai",
          "orthographic_rule_note": null,
          "lemma": "リプライ",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "membalas"
          ],
          "linked_token_ids": []
        }
      ]
    },
    {
      "index": 4,
      "start_ms": 23170,
      "end_ms": 29860,
      "original_text": "大好きなお洋服 大好きなお化粧で",
      "translated_text": "Dengan pakaian kesukaanku dan riasan kesukaanku",
      "translation_failed": false,
      "is_i_plus_one": false,
      "tokens": [
        {
          "token_id": 0,
          "surface": "大好き",
          "display_parts": [
            {
              "text": "大好",
              "ruby": "だいす"
            },
            {
              "text": "き",
              "ruby": null
            }
          ],
          "phonetic_script": "daisuki",
          "pronounced_as": "daisuki",
          "orthographic_rule_note": null,
          "lemma": "大好き",
          "pos": "ADJ",
          "sub_pos": "一般",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "sangat suka"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 1,
          "surface": "な",
          "display_parts": [
            {
              "text": "な",
              "ruby": null
            }
          ],
          "phonetic_script": "na",
          "pronounced_as": "na",
          "orthographic_rule_note": null,
          "lemma": "だ",
          "pos": "AUX",
          "sub_pos": "*",
          "inflection_chain": [
            "助動詞-ダ: 連体形-一般"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "adalah"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 2,
          "surface": "お",
          "display_parts": [
            {
              "text": "お",
              "ruby": null
            }
          ],
          "phonetic_script": "o",
          "pronounced_as": "o",
          "orthographic_rule_note": null,
          "lemma": "お",
          "pos": "OTHER",
          "sub_pos": "*",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Oh"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 3,
          "surface": "洋服",
          "display_parts": [
            {
              "text": "洋服",
              "ruby": "ようふく"
            }
          ],
          "phonetic_script": "youfuku",
          "pronounced_as": "youfuku",
          "orthographic_rule_note": null,
          "lemma": "洋服",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "pakaian"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 4,
          "surface": "大好き",
          "display_parts": [
            {
              "text": "大好",
              "ruby": "だいす"
            },
            {
              "text": "き",
              "ruby": null
            }
          ],
          "phonetic_script": "daisuki",
          "pronounced_as": "daisuki",
          "orthographic_rule_note": null,
          "lemma": "大好き",
          "pos": "ADJ",
          "sub_pos": "一般",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "sangat suka"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 5,
          "surface": "な",
          "display_parts": [
            {
              "text": "な",
              "ruby": null
            }
          ],
          "phonetic_script": "na",
          "pronounced_as": "na",
          "orthographic_rule_note": null,
          "lemma": "だ",
          "pos": "AUX",
          "sub_pos": "*",
          "inflection_chain": [
            "助動詞-ダ: 連体形-一般"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "adalah"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 6,
          "surface": "お",
          "display_parts": [
            {
              "text": "お",
              "ruby": null
            }
          ],
          "phonetic_script": "o",
          "pronounced_as": "o",
          "orthographic_rule_note": null,
          "lemma": "お",
          "pos": "OTHER",
          "sub_pos": "*",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Oh"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 7,
          "surface": "化粧",
          "display_parts": [
            {
              "text": "化粧",
              "ruby": "けしょう"
            }
          ],
          "phonetic_script": "keshou",
          "pronounced_as": "keshou",
          "orthographic_rule_note": null,
          "lemma": "化粧",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "rias"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 8,
          "surface": "で",
          "display_parts": [
            {
              "text": "で",
              "ruby": null
            }
          ],
          "phonetic_script": "de",
          "pronounced_as": "de",
          "orthographic_rule_note": null,
          "lemma": "だ",
          "pos": "AUX",
          "sub_pos": "*",
          "inflection_chain": [
            "Bentuk Ren'youkei (Masu-stem)"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "adalah"
          ],
          "linked_token_ids": []
        }
      ]
    },
    {
      "index": 5,
      "start_ms": 29860,
      "end_ms": 34080,
      "original_text": "お決まりのハーフツイン巻いて",
      "translated_text": "Bungkus dengan setengah kembaran biasa",
      "translation_failed": false,
      "is_i_plus_one": false,
      "tokens": [
        {
          "token_id": 0,
          "surface": "お",
          "display_parts": [
            {
              "text": "お",
              "ruby": null
            }
          ],
          "phonetic_script": "o",
          "pronounced_as": "o",
          "orthographic_rule_note": null,
          "lemma": "お",
          "pos": "OTHER",
          "sub_pos": "*",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Oh"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 1,
          "surface": "決まり",
          "display_parts": [
            {
              "text": "決",
              "ruby": "き"
            },
            {
              "text": "まり",
              "ruby": null
            }
          ],
          "phonetic_script": "kimari",
          "pronounced_as": "kimari",
          "orthographic_rule_note": null,
          "lemma": "決まり",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "aturan"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 2,
          "surface": "の",
          "display_parts": [
            {
              "text": "の",
              "ruby": null
            }
          ],
          "phonetic_script": "no",
          "pronounced_as": "no",
          "orthographic_rule_note": null,
          "lemma": "の",
          "pos": "PART",
          "sub_pos": "格助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "dari"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 3,
          "surface": "ハーフ",
          "display_parts": [
            {
              "text": "ハーフ",
              "ruby": null
            }
          ],
          "phonetic_script": "haafu",
          "pronounced_as": "haafu",
          "orthographic_rule_note": null,
          "lemma": "ハーフ",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [],
          "linked_token_ids": []
        },
        {
          "token_id": 4,
          "surface": "ツイン",
          "display_parts": [
            {
              "text": "ツイン",
              "ruby": null
            }
          ],
          "phonetic_script": "tsuin",
          "pronounced_as": "tsuin",
          "orthographic_rule_note": null,
          "lemma": "ツイン",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "kembar"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 5,
          "surface": "巻い",
          "display_parts": [
            {
              "text": "巻",
              "ruby": "ま"
            },
            {
              "text": "い",
              "ruby": null
            }
          ],
          "phonetic_script": "mai",
          "pronounced_as": "mai",
          "orthographic_rule_note": null,
          "lemma": "巻く",
          "pos": "VERB",
          "sub_pos": "一般",
          "inflection_chain": [
            "Bentuk Ren'youkei (Masu-stem)"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "gulungan"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 6,
          "surface": "て",
          "display_parts": [
            {
              "text": "て",
              "ruby": null
            }
          ],
          "phonetic_script": "te",
          "pronounced_as": "te",
          "orthographic_rule_note": null,
          "lemma": "て",
          "pos": "PART",
          "sub_pos": "接続助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "tangan"
          ],
          "linked_token_ids": []
        }
      ]
    },
    {
      "index": 6,
      "start_ms": 34080,
      "end_ms": 39060,
      "original_text": "お出かけしよ 日傘持って ぼっちだって",
      "translated_text": "Ayo keluar, ambil payung, padahal aku sendirian",
      "translation_failed": false,
      "is_i_plus_one": false,
      "tokens": [
        {
          "token_id": 0,
          "surface": "お出かけ",
          "display_parts": [
            {
              "text": "お",
              "ruby": null
            },
            {
              "text": "出",
              "ruby": "で"
            },
            {
              "text": "かけ",
              "ruby": null
            }
          ],
          "phonetic_script": "odekake",
          "pronounced_as": "odekake",
          "orthographic_rule_note": null,
          "lemma": "お出かけ",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Keluar"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 1,
          "surface": "しよ",
          "display_parts": [
            {
              "text": "しよ",
              "ruby": null
            }
          ],
          "phonetic_script": "shiyo",
          "pronounced_as": "shiyo",
          "orthographic_rule_note": null,
          "lemma": "する",
          "pos": "VERB",
          "sub_pos": "非自立可能",
          "inflection_chain": [
            "サ行変格: 意志推量形"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Mengerjakan"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 2,
          "surface": "日傘",
          "display_parts": [
            {
              "text": "日傘",
              "ruby": "ひがさ"
            }
          ],
          "phonetic_script": "higasa",
          "pronounced_as": "higasa",
          "orthographic_rule_note": null,
          "lemma": "日傘",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "payung"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 3,
          "surface": "持っ",
          "display_parts": [
            {
              "text": "持",
              "ruby": "も"
            },
            {
              "text": "っ",
              "ruby": null
            }
          ],
          "phonetic_script": "mo",
          "pronounced_as": "mo",
          "orthographic_rule_note": null,
          "lemma": "持つ",
          "pos": "VERB",
          "sub_pos": "一般",
          "inflection_chain": [
            "Bentuk Ren'youkei (Masu-stem)"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "memiliki"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 4,
          "surface": "て",
          "display_parts": [
            {
              "text": "て",
              "ruby": null
            }
          ],
          "phonetic_script": "te",
          "pronounced_as": "te",
          "orthographic_rule_note": null,
          "lemma": "て",
          "pos": "PART",
          "sub_pos": "接続助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "tangan"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 5,
          "surface": "ぼっち",
          "display_parts": [
            {
              "text": "ぼっち",
              "ruby": null
            }
          ],
          "phonetic_script": "bocchi",
          "pronounced_as": "bocchi",
          "orthographic_rule_note": null,
          "lemma": "ぼっち",
          "pos": "OTHER",
          "sub_pos": "名詞的",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [],
          "linked_token_ids": []
        },
        {
          "token_id": 6,
          "surface": "だ",
          "display_parts": [
            {
              "text": "だ",
              "ruby": null
            }
          ],
          "phonetic_script": "da",
          "pronounced_as": "da",
          "orthographic_rule_note": null,
          "lemma": "だ",
          "pos": "AUX",
          "sub_pos": "*",
          "inflection_chain": [
            "助動詞-ダ: 終止形-一般"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "adalah"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 7,
          "surface": "って",
          "display_parts": [
            {
              "text": "って",
              "ruby": null
            }
          ],
          "phonetic_script": "tte",
          "pronounced_as": "tte",
          "orthographic_rule_note": null,
          "lemma": "って",
          "pos": "PART",
          "sub_pos": "副助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Itu saja"
          ],
          "linked_token_ids": []
        }
      ]
    },
    {
      "index": 7,
      "start_ms": 39060,
      "end_ms": 41820,
      "original_text": "幸せだもん！",
      "translated_text": "saya senang!",
      "translation_failed": false,
      "is_i_plus_one": false,
      "tokens": [
        {
          "token_id": 0,
          "surface": "幸せ",
          "display_parts": [
            {
              "text": "幸",
              "ruby": "しあわ"
            },
            {
              "text": "せ",
              "ruby": null
            }
          ],
          "phonetic_script": "shiawase",
          "pronounced_as": "shiawase",
          "orthographic_rule_note": null,
          "lemma": "幸せ",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "kebahagiaan"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 1,
          "surface": "だ",
          "display_parts": [
            {
              "text": "だ",
              "ruby": null
            }
          ],
          "phonetic_script": "da",
          "pronounced_as": "da",
          "orthographic_rule_note": null,
          "lemma": "だ",
          "pos": "AUX",
          "sub_pos": "*",
          "inflection_chain": [
            "助動詞-ダ: 終止形-一般"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "adalah"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 2,
          "surface": "もん",
          "display_parts": [
            {
              "text": "もん",
              "ruby": null
            }
          ],
          "phonetic_script": "mon",
          "pronounced_as": "mon",
          "orthographic_rule_note": null,
          "lemma": "もん",
          "pos": "PART",
          "sub_pos": "終助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Senin"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 3,
          "surface": "！",
          "display_parts": [
            {
              "text": "！",
              "ruby": null
            }
          ],
          "phonetic_script": "!",
          "pronounced_as": "!",
          "orthographic_rule_note": null,
          "lemma": "!",
          "pos": "PUNCT",
          "sub_pos": "句点",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "!"
          ],
          "linked_token_ids": []
        }
      ]
    },
    {
      "index": 8,
      "start_ms": 41820,
      "end_ms": 44720,
      "original_text": "チュ！ 可愛くてごめん",
      "translated_text": "Chu! Maaf karena bersikap manis",
      "translation_failed": false,
      "is_i_plus_one": false,
      "tokens": [
        {
          "token_id": 0,
          "surface": "チュ",
          "display_parts": [
            {
              "text": "チュ",
              "ruby": null
            }
          ],
          "phonetic_script": "chu",
          "pronounced_as": "chu",
          "orthographic_rule_note": null,
          "lemma": "チュ",
          "pos": "NOUN",
          "sub_pos": "固有名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [],
          "linked_token_ids": []
        },
        {
          "token_id": 1,
          "surface": "！",
          "display_parts": [
            {
              "text": "！",
              "ruby": null
            }
          ],
          "phonetic_script": "!",
          "pronounced_as": "!",
          "orthographic_rule_note": null,
          "lemma": "!",
          "pos": "PUNCT",
          "sub_pos": "句点",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "!"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 2,
          "surface": "可愛く",
          "display_parts": [
            {
              "text": "可愛",
              "ruby": "かわい"
            },
            {
              "text": "く",
              "ruby": null
            }
          ],
          "phonetic_script": "kawaiku",
          "pronounced_as": "kawaiku",
          "orthographic_rule_note": null,
          "lemma": "可愛い",
          "pos": "ADJ",
          "sub_pos": "一般",
          "inflection_chain": [
            "Bentuk Ren'youkei (Masu-stem)"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "imut-imut"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 3,
          "surface": "て",
          "display_parts": [
            {
              "text": "て",
              "ruby": null
            }
          ],
          "phonetic_script": "te",
          "pronounced_as": "te",
          "orthographic_rule_note": null,
          "lemma": "て",
          "pos": "PART",
          "sub_pos": "接続助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "tangan"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 4,
          "surface": "ごめん",
          "display_parts": [
            {
              "text": "ごめん",
              "ruby": null
            }
          ],
          "phonetic_script": "gomen",
          "pronounced_as": "gomen",
          "orthographic_rule_note": null,
          "lemma": "ごめん",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Maaf"
          ],
          "linked_token_ids": []
        }
      ]
    },
    {
      "index": 9,
      "start_ms": 44720,
      "end_ms": 47450,
      "original_text": "生まれてきちゃってごめん",
      "translated_text": "maaf aku dilahirkan",
      "translation_failed": false,
      "is_i_plus_one": false,
      "tokens": [
        {
          "token_id": 0,
          "surface": "生まれ",
          "display_parts": [
            {
              "text": "生",
              "ruby": "う"
            },
            {
              "text": "まれ",
              "ruby": null
            }
          ],
          "phonetic_script": "umare",
          "pronounced_as": "umare",
          "orthographic_rule_note": null,
          "lemma": "生まれる",
          "pos": "VERB",
          "sub_pos": "一般",
          "inflection_chain": [
            "Bentuk Ren'youkei (Masu-stem)"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "dilahirkan"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 1,
          "surface": "て",
          "display_parts": [
            {
              "text": "て",
              "ruby": null
            }
          ],
          "phonetic_script": "te",
          "pronounced_as": "te",
          "orthographic_rule_note": null,
          "lemma": "て",
          "pos": "PART",
          "sub_pos": "接続助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "tangan"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 2,
          "surface": "き",
          "display_parts": [
            {
              "text": "き",
              "ruby": null
            }
          ],
          "phonetic_script": "ki",
          "pronounced_as": "ki",
          "orthographic_rule_note": null,
          "lemma": "くる",
          "pos": "VERB",
          "sub_pos": "非自立可能",
          "inflection_chain": [
            "Bentuk Ren'youkei (Masu-stem)"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Datang"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 3,
          "surface": "ちゃっ",
          "display_parts": [
            {
              "text": "ちゃっ",
              "ruby": null
            }
          ],
          "phonetic_script": "cha",
          "pronounced_as": "cha",
          "orthographic_rule_note": null,
          "lemma": "ちゃう",
          "pos": "AUX",
          "sub_pos": "*",
          "inflection_chain": [
            "Bentuk Ren'youkei (Masu-stem)"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Ayo pergi"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 4,
          "surface": "て",
          "display_parts": [
            {
              "text": "て",
              "ruby": null
            }
          ],
          "phonetic_script": "te",
          "pronounced_as": "te",
          "orthographic_rule_note": null,
          "lemma": "て",
          "pos": "PART",
          "sub_pos": "接続助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "tangan"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 5,
          "surface": "ごめん",
          "display_parts": [
            {
              "text": "ごめん",
              "ruby": null
            }
          ],
          "phonetic_script": "gomen",
          "pronounced_as": "gomen",
          "orthographic_rule_note": null,
          "lemma": "ごめん",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Maaf"
          ],
          "linked_token_ids": []
        }
      ]
    },
    {
      "index": 10,
      "start_ms": 47450,
      "end_ms": 50950,
      "original_text": "チュ！ あざとくてごめん",
      "translated_text": "Chu! Maaf karena bersikap kasar",
      "translation_failed": false,
      "is_i_plus_one": false,
      "tokens": [
        {
          "token_id": 0,
          "surface": "チュ",
          "display_parts": [
            {
              "text": "チュ",
              "ruby": null
            }
          ],
          "phonetic_script": "chu",
          "pronounced_as": "chu",
          "orthographic_rule_note": null,
          "lemma": "チュ",
          "pos": "NOUN",
          "sub_pos": "固有名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [],
          "linked_token_ids": []
        },
        {
          "token_id": 1,
          "surface": "！",
          "display_parts": [
            {
              "text": "！",
              "ruby": null
            }
          ],
          "phonetic_script": "!",
          "pronounced_as": "!",
          "orthographic_rule_note": null,
          "lemma": "!",
          "pos": "PUNCT",
          "sub_pos": "句点",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "!"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 2,
          "surface": "あざとく",
          "display_parts": [
            {
              "text": "あざとく",
              "ruby": null
            }
          ],
          "phonetic_script": "azatoku",
          "pronounced_as": "azatoku",
          "orthographic_rule_note": null,
          "lemma": "あざとい",
          "pos": "ADJ",
          "sub_pos": "一般",
          "inflection_chain": [
            "Bentuk Ren'youkei (Masu-stem)"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Azatoi"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 3,
          "surface": "て",
          "display_parts": [
            {
              "text": "て",
              "ruby": null
            }
          ],
          "phonetic_script": "te",
          "pronounced_as": "te",
          "orthographic_rule_note": null,
          "lemma": "て",
          "pos": "PART",
          "sub_pos": "接続助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "tangan"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 4,
          "surface": "ごめん",
          "display_parts": [
            {
              "text": "ごめん",
              "ruby": null
            }
          ],
          "phonetic_script": "gomen",
          "pronounced_as": "gomen",
          "orthographic_rule_note": null,
          "lemma": "ごめん",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Maaf"
          ],
          "linked_token_ids": []
        }
      ]
    },
    {
      "index": 11,
      "start_ms": 50950,
      "end_ms": 53980,
      "original_text": "気になっちゃうよね？ ごめん",
      "translated_text": "Apakah kamu penasaran? Maaf",
      "translation_failed": false,
      "is_i_plus_one": false,
      "tokens": [
        {
          "token_id": 0,
          "surface": "気",
          "display_parts": [
            {
              "text": "気",
              "ruby": "き"
            }
          ],
          "phonetic_script": "ki",
          "pronounced_as": "ki",
          "orthographic_rule_note": null,
          "lemma": "気",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "udara"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 1,
          "surface": "に",
          "display_parts": [
            {
              "text": "に",
              "ruby": null
            }
          ],
          "phonetic_script": "ni",
          "pronounced_as": "ni",
          "orthographic_rule_note": null,
          "lemma": "に",
          "pos": "PART",
          "sub_pos": "格助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "ke"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 2,
          "surface": "なっ",
          "display_parts": [
            {
              "text": "なっ",
              "ruby": null
            }
          ],
          "phonetic_script": "na",
          "pronounced_as": "na",
          "orthographic_rule_note": null,
          "lemma": "なる",
          "pos": "VERB",
          "sub_pos": "非自立可能",
          "inflection_chain": [
            "Bentuk Ren'youkei (Masu-stem)"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Menjadi"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 3,
          "surface": "ちゃう",
          "display_parts": [
            {
              "text": "ちゃう",
              "ruby": null
            }
          ],
          "phonetic_script": "chau",
          "pronounced_as": "chau",
          "orthographic_rule_note": null,
          "lemma": "ちゃう",
          "pos": "AUX",
          "sub_pos": "*",
          "inflection_chain": [
            "五段-ワア行: 終止形-一般"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Ayo pergi"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 4,
          "surface": "よ",
          "display_parts": [
            {
              "text": "よ",
              "ruby": null
            }
          ],
          "phonetic_script": "yo",
          "pronounced_as": "yo",
          "orthographic_rule_note": null,
          "lemma": "よ",
          "pos": "PART",
          "sub_pos": "終助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Yo"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 5,
          "surface": "ね",
          "display_parts": [
            {
              "text": "ね",
              "ruby": null
            }
          ],
          "phonetic_script": "ne",
          "pronounced_as": "ne",
          "orthographic_rule_note": null,
          "lemma": "ね",
          "pos": "PART",
          "sub_pos": "終助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Hai"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 6,
          "surface": "？",
          "display_parts": [
            {
              "text": "？",
              "ruby": null
            }
          ],
          "phonetic_script": "?",
          "pronounced_as": "?",
          "orthographic_rule_note": null,
          "lemma": "?",
          "pos": "PUNCT",
          "sub_pos": "句点",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "?"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 7,
          "surface": "ごめん",
          "display_parts": [
            {
              "text": "ごめん",
              "ruby": null
            }
          ],
          "phonetic_script": "gomen",
          "pronounced_as": "gomen",
          "orthographic_rule_note": null,
          "lemma": "ごめん",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Maaf"
          ],
          "linked_token_ids": []
        }
      ]
    },
    {
      "index": 12,
      "start_ms": 53980,
      "end_ms": 57360,
      "original_text": "チュ！ 可愛くてごめん",
      "translated_text": "Chu! Maaf karena bersikap manis",
      "translation_failed": false,
      "is_i_plus_one": false,
      "tokens": [
        {
          "token_id": 0,
          "surface": "チュ",
          "display_parts": [
            {
              "text": "チュ",
              "ruby": null
            }
          ],
          "phonetic_script": "chu",
          "pronounced_as": "chu",
          "orthographic_rule_note": null,
          "lemma": "チュ",
          "pos": "NOUN",
          "sub_pos": "固有名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [],
          "linked_token_ids": []
        },
        {
          "token_id": 1,
          "surface": "！",
          "display_parts": [
            {
              "text": "！",
              "ruby": null
            }
          ],
          "phonetic_script": "!",
          "pronounced_as": "!",
          "orthographic_rule_note": null,
          "lemma": "!",
          "pos": "PUNCT",
          "sub_pos": "句点",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "!"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 2,
          "surface": "可愛く",
          "display_parts": [
            {
              "text": "可愛",
              "ruby": "かわい"
            },
            {
              "text": "く",
              "ruby": null
            }
          ],
          "phonetic_script": "kawaiku",
          "pronounced_as": "kawaiku",
          "orthographic_rule_note": null,
          "lemma": "可愛い",
          "pos": "ADJ",
          "sub_pos": "一般",
          "inflection_chain": [
            "Bentuk Ren'youkei (Masu-stem)"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "imut-imut"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 3,
          "surface": "て",
          "display_parts": [
            {
              "text": "て",
              "ruby": null
            }
          ],
          "phonetic_script": "te",
          "pronounced_as": "te",
          "orthographic_rule_note": null,
          "lemma": "て",
          "pos": "PART",
          "sub_pos": "接続助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "tangan"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 4,
          "surface": "ごめん",
          "display_parts": [
            {
              "text": "ごめん",
              "ruby": null
            }
          ],
          "phonetic_script": "gomen",
          "pronounced_as": "gomen",
          "orthographic_rule_note": null,
          "lemma": "ごめん",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Maaf"
          ],
          "linked_token_ids": []
        }
      ]
    },
    {
      "index": 13,
      "start_ms": 57360,
      "end_ms": 60400,
      "original_text": "努力しちゃっててごめん",
      "translated_text": "Maaf karena sudah berusaha keras",
      "translation_failed": false,
      "is_i_plus_one": false,
      "tokens": [
        {
          "token_id": 0,
          "surface": "努力",
          "display_parts": [
            {
              "text": "努力",
              "ruby": "どりょく"
            }
          ],
          "phonetic_script": "doryoku",
          "pronounced_as": "doryoku",
          "orthographic_rule_note": null,
          "lemma": "努力",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "upaya"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 1,
          "surface": "し",
          "display_parts": [
            {
              "text": "し",
              "ruby": null
            }
          ],
          "phonetic_script": "shi",
          "pronounced_as": "shi",
          "orthographic_rule_note": null,
          "lemma": "する",
          "pos": "VERB",
          "sub_pos": "非自立可能",
          "inflection_chain": [
            "Bentuk Ren'youkei (Masu-stem)"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Mengerjakan"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 2,
          "surface": "ちゃっ",
          "display_parts": [
            {
              "text": "ちゃっ",
              "ruby": null
            }
          ],
          "phonetic_script": "cha",
          "pronounced_as": "cha",
          "orthographic_rule_note": null,
          "lemma": "ちゃう",
          "pos": "AUX",
          "sub_pos": "*",
          "inflection_chain": [
            "Bentuk Ren'youkei (Masu-stem)"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Ayo pergi"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 3,
          "surface": "て",
          "display_parts": [
            {
              "text": "て",
              "ruby": null
            }
          ],
          "phonetic_script": "te",
          "pronounced_as": "te",
          "orthographic_rule_note": null,
          "lemma": "てる",
          "pos": "AUX",
          "sub_pos": "*",
          "inflection_chain": [
            "Bentuk Ren'youkei (Masu-stem)"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Teru"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 4,
          "surface": "て",
          "display_parts": [
            {
              "text": "て",
              "ruby": null
            }
          ],
          "phonetic_script": "te",
          "pronounced_as": "te",
          "orthographic_rule_note": null,
          "lemma": "て",
          "pos": "PART",
          "sub_pos": "接続助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "tangan"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 5,
          "surface": "ごめん",
          "display_parts": [
            {
              "text": "ごめん",
              "ruby": null
            }
          ],
          "phonetic_script": "gomen",
          "pronounced_as": "gomen",
          "orthographic_rule_note": null,
          "lemma": "ごめん",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Maaf"
          ],
          "linked_token_ids": []
        }
      ]
    },
    {
      "index": 14,
      "start_ms": 60400,
      "end_ms": 63120,
      "original_text": "チュ！ 尊くてごめん",
      "translated_text": "Chu! Maaf karena begitu berharga",
      "translation_failed": false,
      "is_i_plus_one": false,
      "tokens": [
        {
          "token_id": 0,
          "surface": "チュ",
          "display_parts": [
            {
              "text": "チュ",
              "ruby": null
            }
          ],
          "phonetic_script": "chu",
          "pronounced_as": "chu",
          "orthographic_rule_note": null,
          "lemma": "チュ",
          "pos": "NOUN",
          "sub_pos": "固有名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [],
          "linked_token_ids": []
        },
        {
          "token_id": 1,
          "surface": "！",
          "display_parts": [
            {
              "text": "！",
              "ruby": null
            }
          ],
          "phonetic_script": "!",
          "pronounced_as": "!",
          "orthographic_rule_note": null,
          "lemma": "!",
          "pos": "PUNCT",
          "sub_pos": "句点",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "!"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 2,
          "surface": "尊く",
          "display_parts": [
            {
              "text": "尊",
              "ruby": "とうと"
            },
            {
              "text": "く",
              "ruby": null
            }
          ],
          "phonetic_script": "toutoku",
          "pronounced_as": "toutoku",
          "orthographic_rule_note": null,
          "lemma": "尊い",
          "pos": "ADJ",
          "sub_pos": "一般",
          "inflection_chain": [
            "Bentuk Ren'youkei (Masu-stem)"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "berharga"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 3,
          "surface": "て",
          "display_parts": [
            {
              "text": "て",
              "ruby": null
            }
          ],
          "phonetic_script": "te",
          "pronounced_as": "te",
          "orthographic_rule_note": null,
          "lemma": "て",
          "pos": "PART",
          "sub_pos": "接続助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "tangan"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 4,
          "surface": "ごめん",
          "display_parts": [
            {
              "text": "ごめん",
              "ruby": null
            }
          ],
          "phonetic_script": "gomen",
          "pronounced_as": "gomen",
          "orthographic_rule_note": null,
          "lemma": "ごめん",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Maaf"
          ],
          "linked_token_ids": []
        }
      ]
    },
    {
      "index": 15,
      "start_ms": 63120,
      "end_ms": 66090,
      "original_text": "女子力高くてごめん",
      "translated_text": "Maaf karena terlalu feminin",
      "translation_failed": false,
      "is_i_plus_one": false,
      "tokens": [
        {
          "token_id": 0,
          "surface": "女子力",
          "display_parts": [
            {
              "text": "女子力",
              "ruby": "じょしりょく"
            }
          ],
          "phonetic_script": "joshiryoku",
          "pronounced_as": "joshiryoku",
          "orthographic_rule_note": null,
          "lemma": "女子力",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "kekuatan gadis"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 1,
          "surface": "高く",
          "display_parts": [
            {
              "text": "高",
              "ruby": "たか"
            },
            {
              "text": "く",
              "ruby": null
            }
          ],
          "phonetic_script": "takaku",
          "pronounced_as": "takaku",
          "orthographic_rule_note": null,
          "lemma": "高い",
          "pos": "ADJ",
          "sub_pos": "一般",
          "inflection_chain": [
            "Bentuk Ren'youkei (Masu-stem)"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "mahal"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 2,
          "surface": "て",
          "display_parts": [
            {
              "text": "て",
              "ruby": null
            }
          ],
          "phonetic_script": "te",
          "pronounced_as": "te",
          "orthographic_rule_note": null,
          "lemma": "て",
          "pos": "PART",
          "sub_pos": "接続助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "tangan"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 3,
          "surface": "ごめん",
          "display_parts": [
            {
              "text": "ごめん",
              "ruby": null
            }
          ],
          "phonetic_script": "gomen",
          "pronounced_as": "gomen",
          "orthographic_rule_note": null,
          "lemma": "ごめん",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Maaf"
          ],
          "linked_token_ids": []
        }
      ]
    },
    {
      "index": 16,
      "start_ms": 66090,
      "end_ms": 80530,
      "original_text": "ムカついちゃうよね？ ざまあ",
      "translated_text": "Itu menjengkelkan, bukan? Zamaa",
      "translation_failed": false,
      "is_i_plus_one": false,
      "tokens": [
        {
          "token_id": 0,
          "surface": "ムカつい",
          "display_parts": [
            {
              "text": "ムカつい",
              "ruby": null
            }
          ],
          "phonetic_script": "mukatsui",
          "pronounced_as": "mukatsui",
          "orthographic_rule_note": null,
          "lemma": "ムカつく",
          "pos": "VERB",
          "sub_pos": "一般",
          "inflection_chain": [
            "Bentuk Ren'youkei (Masu-stem)"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [],
          "linked_token_ids": []
        },
        {
          "token_id": 1,
          "surface": "ちゃう",
          "display_parts": [
            {
              "text": "ちゃう",
              "ruby": null
            }
          ],
          "phonetic_script": "chau",
          "pronounced_as": "chau",
          "orthographic_rule_note": null,
          "lemma": "ちゃう",
          "pos": "AUX",
          "sub_pos": "*",
          "inflection_chain": [
            "五段-ワア行: 終止形-一般"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Ayo pergi"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 2,
          "surface": "よ",
          "display_parts": [
            {
              "text": "よ",
              "ruby": null
            }
          ],
          "phonetic_script": "yo",
          "pronounced_as": "yo",
          "orthographic_rule_note": null,
          "lemma": "よ",
          "pos": "PART",
          "sub_pos": "終助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Yo"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 3,
          "surface": "ね",
          "display_parts": [
            {
              "text": "ね",
              "ruby": null
            }
          ],
          "phonetic_script": "ne",
          "pronounced_as": "ne",
          "orthographic_rule_note": null,
          "lemma": "ね",
          "pos": "PART",
          "sub_pos": "終助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Hai"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 4,
          "surface": "？",
          "display_parts": [
            {
              "text": "？",
              "ruby": null
            }
          ],
          "phonetic_script": "?",
          "pronounced_as": "?",
          "orthographic_rule_note": null,
          "lemma": "?",
          "pos": "PUNCT",
          "sub_pos": "句点",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "?"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 5,
          "surface": "ざま",
          "display_parts": [
            {
              "text": "ざま",
              "ruby": null
            }
          ],
          "phonetic_script": "zama",
          "pronounced_as": "zama",
          "orthographic_rule_note": null,
          "lemma": "ざま",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [],
          "linked_token_ids": []
        },
        {
          "token_id": 6,
          "surface": "あ",
          "display_parts": [
            {
              "text": "あ",
              "ruby": null
            }
          ],
          "phonetic_script": "a",
          "pronounced_as": "a",
          "orthographic_rule_note": null,
          "lemma": "あ",
          "pos": "OTHER",
          "sub_pos": "フィラー",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [],
          "linked_token_ids": []
        }
      ]
    },
    {
      "index": 17,
      "start_ms": 80530,
      "end_ms": 84480,
      "original_text": "貴女は貴女の事だけどうぞ",
      "translated_text": "Urus saja urusanmu sendiri.",
      "translation_failed": false,
      "is_i_plus_one": false,
      "tokens": [
        {
          "token_id": 0,
          "surface": "貴女",
          "display_parts": [
            {
              "text": "貴女",
              "ruby": "きじょ"
            }
          ],
          "phonetic_script": "kijo",
          "pronounced_as": "kijo",
          "orthographic_rule_note": null,
          "lemma": "貴女",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [],
          "linked_token_ids": []
        },
        {
          "token_id": 1,
          "surface": "は",
          "display_parts": [
            {
              "text": "は",
              "ruby": null
            }
          ],
          "phonetic_script": "ha",
          "pronounced_as": "wa",
          "orthographic_rule_note": "Partikel は dilafalkan 'wa'",
          "lemma": "は",
          "pos": "PART",
          "sub_pos": "係助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "gigi"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 2,
          "surface": "貴女",
          "display_parts": [
            {
              "text": "貴女",
              "ruby": "きじょ"
            }
          ],
          "phonetic_script": "kijo",
          "pronounced_as": "kijo",
          "orthographic_rule_note": null,
          "lemma": "貴女",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [],
          "linked_token_ids": []
        },
        {
          "token_id": 3,
          "surface": "の",
          "display_parts": [
            {
              "text": "の",
              "ruby": null
            }
          ],
          "phonetic_script": "no",
          "pronounced_as": "no",
          "orthographic_rule_note": null,
          "lemma": "の",
          "pos": "PART",
          "sub_pos": "格助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "dari"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 4,
          "surface": "事",
          "display_parts": [
            {
              "text": "事",
              "ruby": "こと"
            }
          ],
          "phonetic_script": "koto",
          "pronounced_as": "koto",
          "orthographic_rule_note": null,
          "lemma": "事",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "kasus"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 5,
          "surface": "だけ",
          "display_parts": [
            {
              "text": "だけ",
              "ruby": null
            }
          ],
          "phonetic_script": "dake",
          "pronounced_as": "dake",
          "orthographic_rule_note": null,
          "lemma": "だけ",
          "pos": "PART",
          "sub_pos": "副助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "hanya"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 6,
          "surface": "どうぞ",
          "display_parts": [
            {
              "text": "どうぞ",
              "ruby": null
            }
          ],
          "phonetic_script": "douzo",
          "pronounced_as": "douzo",
          "orthographic_rule_note": null,
          "lemma": "どうぞ",
          "pos": "ADV",
          "sub_pos": "*",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [],
          "linked_token_ids": []
        }
      ]
    },
    {
      "index": 18,
      "start_ms": 84480,
      "end_ms": 87550,
      "original_text": "私に干渉しないでください",
      "translated_text": "jangan ganggu aku",
      "translation_failed": false,
      "is_i_plus_one": false,
      "tokens": [
        {
          "token_id": 0,
          "surface": "私",
          "display_parts": [
            {
              "text": "私",
              "ruby": "わたくし"
            }
          ],
          "phonetic_script": "watakushi",
          "pronounced_as": "watakushi",
          "orthographic_rule_note": null,
          "lemma": "私",
          "pos": "PRON",
          "sub_pos": "*",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": {
            "system": "jp_pitch",
            "value": "atamadaka",
            "pattern": [
              1,
              0,
              0
            ]
          },
          "proficiency_tag": "JLPT N5",
          "meanings": [
            "saya",
            "aku"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 1,
          "surface": "に",
          "display_parts": [
            {
              "text": "に",
              "ruby": null
            }
          ],
          "phonetic_script": "ni",
          "pronounced_as": "ni",
          "orthographic_rule_note": null,
          "lemma": "に",
          "pos": "PART",
          "sub_pos": "格助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "ke"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 2,
          "surface": "干渉",
          "display_parts": [
            {
              "text": "干渉",
              "ruby": "かんしょう"
            }
          ],
          "phonetic_script": "kanshou",
          "pronounced_as": "kanshou",
          "orthographic_rule_note": null,
          "lemma": "干渉",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "gangguan"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 3,
          "surface": "し",
          "display_parts": [
            {
              "text": "し",
              "ruby": null
            }
          ],
          "phonetic_script": "shi",
          "pronounced_as": "shi",
          "orthographic_rule_note": null,
          "lemma": "する",
          "pos": "VERB",
          "sub_pos": "非自立可能",
          "inflection_chain": [
            "Bentuk Negatif/Mizenkei"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Mengerjakan"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 4,
          "surface": "ない",
          "display_parts": [
            {
              "text": "ない",
              "ruby": null
            }
          ],
          "phonetic_script": "nai",
          "pronounced_as": "nai",
          "orthographic_rule_note": null,
          "lemma": "ない",
          "pos": "AUX",
          "sub_pos": "*",
          "inflection_chain": [
            "助動詞-ナイ: 終止形-一般"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "tidak punya"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 5,
          "surface": "で",
          "display_parts": [
            {
              "text": "で",
              "ruby": null
            }
          ],
          "phonetic_script": "de",
          "pronounced_as": "de",
          "orthographic_rule_note": null,
          "lemma": "で",
          "pos": "PART",
          "sub_pos": "接続助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "di dalam"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 6,
          "surface": "ください",
          "display_parts": [
            {
              "text": "ください",
              "ruby": null
            }
          ],
          "phonetic_script": "kudasai",
          "pronounced_as": "kudasai",
          "orthographic_rule_note": null,
          "lemma": "くださる",
          "pos": "VERB",
          "sub_pos": "非自立可能",
          "inflection_chain": [
            "Bentuk Perintah (Imperative)"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "berikan padaku"
          ],
          "linked_token_ids": []
        }
      ]
    },
    {
      "index": 19,
      "start_ms": 87550,
      "end_ms": 90240,
      "original_text": "類は友を呼ぶと言うけど",
      "translated_text": "Mereka bilang aku menelepon teman-temanku",
      "translation_failed": false,
      "is_i_plus_one": false,
      "tokens": [
        {
          "token_id": 0,
          "surface": "類",
          "display_parts": [
            {
              "text": "類",
              "ruby": "るい"
            }
          ],
          "phonetic_script": "rui",
          "pronounced_as": "rui",
          "orthographic_rule_note": null,
          "lemma": "類",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [],
          "linked_token_ids": []
        },
        {
          "token_id": 1,
          "surface": "は",
          "display_parts": [
            {
              "text": "は",
              "ruby": null
            }
          ],
          "phonetic_script": "ha",
          "pronounced_as": "wa",
          "orthographic_rule_note": "Partikel は dilafalkan 'wa'",
          "lemma": "は",
          "pos": "PART",
          "sub_pos": "係助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "gigi"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 2,
          "surface": "友",
          "display_parts": [
            {
              "text": "友",
              "ruby": "とも"
            }
          ],
          "phonetic_script": "tomo",
          "pronounced_as": "tomo",
          "orthographic_rule_note": null,
          "lemma": "友",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [],
          "linked_token_ids": []
        },
        {
          "token_id": 3,
          "surface": "を",
          "display_parts": [
            {
              "text": "を",
              "ruby": null
            }
          ],
          "phonetic_script": "o",
          "pronounced_as": "o",
          "orthographic_rule_note": "Partikel を dilafalkan 'o'",
          "lemma": "を",
          "pos": "PART",
          "sub_pos": "格助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "dari"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 4,
          "surface": "呼ぶ",
          "display_parts": [
            {
              "text": "呼",
              "ruby": "よ"
            },
            {
              "text": "ぶ",
              "ruby": null
            }
          ],
          "phonetic_script": "yobu",
          "pronounced_as": "yobu",
          "orthographic_rule_note": null,
          "lemma": "呼ぶ",
          "pos": "VERB",
          "sub_pos": "一般",
          "inflection_chain": [
            "五段-バ行: 終止形-一般"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "panggilan"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 5,
          "surface": "と",
          "display_parts": [
            {
              "text": "と",
              "ruby": null
            }
          ],
          "phonetic_script": "to",
          "pronounced_as": "to",
          "orthographic_rule_note": null,
          "lemma": "と",
          "pos": "PART",
          "sub_pos": "格助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Dan"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 6,
          "surface": "言う",
          "display_parts": [
            {
              "text": "言",
              "ruby": "ゆ"
            },
            {
              "text": "う",
              "ruby": null
            }
          ],
          "phonetic_script": "yuu",
          "pronounced_as": "yuu",
          "orthographic_rule_note": null,
          "lemma": "言う",
          "pos": "VERB",
          "sub_pos": "一般",
          "inflection_chain": [
            "五段-ワア行: 終止形-一般"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "mengatakan"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 7,
          "surface": "けど",
          "display_parts": [
            {
              "text": "けど",
              "ruby": null
            }
          ],
          "phonetic_script": "kedo",
          "pronounced_as": "kedo",
          "orthographic_rule_note": null,
          "lemma": "けど",
          "pos": "PART",
          "sub_pos": "接続助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Tetapi"
          ],
          "linked_token_ids": []
        }
      ]
    },
    {
      "index": 20,
      "start_ms": 90240,
      "end_ms": 93170,
      "original_text": "届きませんね その陰口",
      "translated_text": "Aku tidak bisa menghubungimu, gosip itu",
      "translation_failed": false,
      "is_i_plus_one": false,
      "tokens": [
        {
          "token_id": 0,
          "surface": "届き",
          "display_parts": [
            {
              "text": "届",
              "ruby": "とど"
            },
            {
              "text": "き",
              "ruby": null
            }
          ],
          "phonetic_script": "todoki",
          "pronounced_as": "todoki",
          "orthographic_rule_note": null,
          "lemma": "届く",
          "pos": "VERB",
          "sub_pos": "一般",
          "inflection_chain": [
            "Bentuk Ren'youkei (Masu-stem)"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "mencapai"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 1,
          "surface": "ませ",
          "display_parts": [
            {
              "text": "ませ",
              "ruby": null
            }
          ],
          "phonetic_script": "mase",
          "pronounced_as": "mase",
          "orthographic_rule_note": null,
          "lemma": "ます",
          "pos": "AUX",
          "sub_pos": "*",
          "inflection_chain": [
            "Bentuk Negatif/Mizenkei"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "masu"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 2,
          "surface": "ん",
          "display_parts": [
            {
              "text": "ん",
              "ruby": null
            }
          ],
          "phonetic_script": "n",
          "pronounced_as": "n",
          "orthographic_rule_note": null,
          "lemma": "ぬ",
          "pos": "AUX",
          "sub_pos": "*",
          "inflection_chain": [
            "助動詞-ヌ: 終止形-撥音便"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Tidak"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 3,
          "surface": "ね",
          "display_parts": [
            {
              "text": "ね",
              "ruby": null
            }
          ],
          "phonetic_script": "ne",
          "pronounced_as": "ne",
          "orthographic_rule_note": null,
          "lemma": "ね",
          "pos": "PART",
          "sub_pos": "終助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Hai"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 4,
          "surface": "その",
          "display_parts": [
            {
              "text": "その",
              "ruby": null
            }
          ],
          "phonetic_script": "sono",
          "pronounced_as": "sono",
          "orthographic_rule_note": null,
          "lemma": "その",
          "pos": "DET",
          "sub_pos": "*",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "itu"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 5,
          "surface": "陰口",
          "display_parts": [
            {
              "text": "陰口",
              "ruby": "かげぐち"
            }
          ],
          "phonetic_script": "kageguchi",
          "pronounced_as": "kageguchi",
          "orthographic_rule_note": null,
          "lemma": "陰口",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Memfitnah"
          ],
          "linked_token_ids": []
        }
      ]
    },
    {
      "index": 21,
      "start_ms": 93170,
      "end_ms": 98780,
      "original_text": "重い厚底ブーツ お気に入りのリュックで",
      "translated_text": "Sepatu bot platform berat dan ransel favorit Anda",
      "translation_failed": false,
      "is_i_plus_one": false,
      "tokens": [
        {
          "token_id": 0,
          "surface": "重い",
          "display_parts": [
            {
              "text": "重",
              "ruby": "おも"
            },
            {
              "text": "い",
              "ruby": null
            }
          ],
          "phonetic_script": "omoi",
          "pronounced_as": "omoi",
          "orthographic_rule_note": null,
          "lemma": "重い",
          "pos": "ADJ",
          "sub_pos": "一般",
          "inflection_chain": [
            "形容詞: 連体形-一般"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "berat"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 1,
          "surface": "厚底",
          "display_parts": [
            {
              "text": "厚底",
              "ruby": "あつぞこ"
            }
          ],
          "phonetic_script": "atsuzoko",
          "pronounced_as": "atsuzoko",
          "orthographic_rule_note": null,
          "lemma": "厚底",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [],
          "linked_token_ids": []
        },
        {
          "token_id": 2,
          "surface": "ブーツ",
          "display_parts": [
            {
              "text": "ブーツ",
              "ruby": null
            }
          ],
          "phonetic_script": "buutsu",
          "pronounced_as": "buutsu",
          "orthographic_rule_note": null,
          "lemma": "ブーツ",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [],
          "linked_token_ids": []
        },
        {
          "token_id": 3,
          "surface": "お気に入り",
          "display_parts": [
            {
              "text": "お",
              "ruby": null
            },
            {
              "text": "気",
              "ruby": "き"
            },
            {
              "text": "に",
              "ruby": null
            },
            {
              "text": "入",
              "ruby": "い"
            },
            {
              "text": "り",
              "ruby": null
            }
          ],
          "phonetic_script": "okiniiri",
          "pronounced_as": "okiniiri",
          "orthographic_rule_note": null,
          "lemma": "お気に入り",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "favorit"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 4,
          "surface": "の",
          "display_parts": [
            {
              "text": "の",
              "ruby": null
            }
          ],
          "phonetic_script": "no",
          "pronounced_as": "no",
          "orthographic_rule_note": null,
          "lemma": "の",
          "pos": "PART",
          "sub_pos": "格助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "dari"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 5,
          "surface": "リュック",
          "display_parts": [
            {
              "text": "リュック",
              "ruby": null
            }
          ],
          "phonetic_script": "ryukku",
          "pronounced_as": "ryukku",
          "orthographic_rule_note": null,
          "lemma": "リュック",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "ransel"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 6,
          "surface": "で",
          "display_parts": [
            {
              "text": "で",
              "ruby": null
            }
          ],
          "phonetic_script": "de",
          "pronounced_as": "de",
          "orthographic_rule_note": null,
          "lemma": "だ",
          "pos": "AUX",
          "sub_pos": "*",
          "inflection_chain": [
            "Bentuk Ren'youkei (Masu-stem)"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "adalah"
          ],
          "linked_token_ids": []
        }
      ]
    },
    {
      "index": 22,
      "start_ms": 98780,
      "end_ms": 101860,
      "original_text": "崩せない前髪くしでといて",
      "translated_text": "Sisir poni Anda agar tidak berantakan",
      "translation_failed": false,
      "is_i_plus_one": false,
      "tokens": [
        {
          "token_id": 0,
          "surface": "崩せ",
          "display_parts": [
            {
              "text": "崩",
              "ruby": "くず"
            },
            {
              "text": "せ",
              "ruby": null
            }
          ],
          "phonetic_script": "kuzuse",
          "pronounced_as": "kuzuse",
          "orthographic_rule_note": null,
          "lemma": "崩せる",
          "pos": "VERB",
          "sub_pos": "一般",
          "inflection_chain": [
            "Bentuk Negatif/Mizenkei"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Dapat dipecah"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 1,
          "surface": "ない",
          "display_parts": [
            {
              "text": "ない",
              "ruby": null
            }
          ],
          "phonetic_script": "nai",
          "pronounced_as": "nai",
          "orthographic_rule_note": null,
          "lemma": "ない",
          "pos": "AUX",
          "sub_pos": "*",
          "inflection_chain": [
            "助動詞-ナイ: 連体形-一般"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "tidak punya"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 2,
          "surface": "前髪",
          "display_parts": [
            {
              "text": "前髪",
              "ruby": "まえがみ"
            }
          ],
          "phonetic_script": "maegami",
          "pronounced_as": "maegami",
          "orthographic_rule_note": null,
          "lemma": "前髪",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "poni"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 3,
          "surface": "くし",
          "display_parts": [
            {
              "text": "くし",
              "ruby": null
            }
          ],
          "phonetic_script": "kushi",
          "pronounced_as": "kushi",
          "orthographic_rule_note": null,
          "lemma": "くし",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [],
          "linked_token_ids": []
        },
        {
          "token_id": 4,
          "surface": "で",
          "display_parts": [
            {
              "text": "で",
              "ruby": null
            }
          ],
          "phonetic_script": "de",
          "pronounced_as": "de",
          "orthographic_rule_note": null,
          "lemma": "で",
          "pos": "PART",
          "sub_pos": "格助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "di dalam"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 5,
          "surface": "とい",
          "display_parts": [
            {
              "text": "とい",
              "ruby": null
            }
          ],
          "phonetic_script": "toi",
          "pronounced_as": "toi",
          "orthographic_rule_note": null,
          "lemma": "とく",
          "pos": "VERB",
          "sub_pos": "一般",
          "inflection_chain": [
            "Bentuk Ren'youkei (Masu-stem)"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "kebajikan"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 6,
          "surface": "て",
          "display_parts": [
            {
              "text": "て",
              "ruby": null
            }
          ],
          "phonetic_script": "te",
          "pronounced_as": "te",
          "orthographic_rule_note": null,
          "lemma": "て",
          "pos": "PART",
          "sub_pos": "接続助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "tangan"
          ],
          "linked_token_ids": []
        }
      ]
    },
    {
      "index": 23,
      "start_ms": 101860,
      "end_ms": 107860,
      "original_text": "お出かけしよ 軽い女？ ふざけんな",
      "translated_text": "Ayo keluar, gadis ringan? Jangan konyol",
      "translation_failed": false,
      "is_i_plus_one": false,
      "tokens": [
        {
          "token_id": 0,
          "surface": "お出かけ",
          "display_parts": [
            {
              "text": "お",
              "ruby": null
            },
            {
              "text": "出",
              "ruby": "で"
            },
            {
              "text": "かけ",
              "ruby": null
            }
          ],
          "phonetic_script": "odekake",
          "pronounced_as": "odekake",
          "orthographic_rule_note": null,
          "lemma": "お出かけ",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Keluar"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 1,
          "surface": "しよ",
          "display_parts": [
            {
              "text": "しよ",
              "ruby": null
            }
          ],
          "phonetic_script": "shiyo",
          "pronounced_as": "shiyo",
          "orthographic_rule_note": null,
          "lemma": "する",
          "pos": "VERB",
          "sub_pos": "非自立可能",
          "inflection_chain": [
            "サ行変格: 意志推量形"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Mengerjakan"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 2,
          "surface": "軽い",
          "display_parts": [
            {
              "text": "軽",
              "ruby": "かる"
            },
            {
              "text": "い",
              "ruby": null
            }
          ],
          "phonetic_script": "karui",
          "pronounced_as": "karui",
          "orthographic_rule_note": null,
          "lemma": "軽い",
          "pos": "ADJ",
          "sub_pos": "一般",
          "inflection_chain": [
            "形容詞: 連体形-一般"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "lampu"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 3,
          "surface": "女",
          "display_parts": [
            {
              "text": "女",
              "ruby": "おんな"
            }
          ],
          "phonetic_script": "onna",
          "pronounced_as": "onna",
          "orthographic_rule_note": null,
          "lemma": "女",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "wanita"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 4,
          "surface": "？",
          "display_parts": [
            {
              "text": "？",
              "ruby": null
            }
          ],
          "phonetic_script": "?",
          "pronounced_as": "?",
          "orthographic_rule_note": null,
          "lemma": "?",
          "pos": "PUNCT",
          "sub_pos": "句点",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "?"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 5,
          "surface": "ふざけん",
          "display_parts": [
            {
              "text": "ふざけん",
              "ruby": null
            }
          ],
          "phonetic_script": "fuzaken",
          "pronounced_as": "fuzaken",
          "orthographic_rule_note": null,
          "lemma": "ふざける",
          "pos": "VERB",
          "sub_pos": "一般",
          "inflection_chain": [
            "下一段-カ行: 終止形-撥音便"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "bercanda"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 6,
          "surface": "な",
          "display_parts": [
            {
              "text": "な",
              "ruby": null
            }
          ],
          "phonetic_script": "na",
          "pronounced_as": "na",
          "orthographic_rule_note": null,
          "lemma": "な",
          "pos": "PART",
          "sub_pos": "終助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [],
          "linked_token_ids": []
        }
      ]
    },
    {
      "index": 24,
      "start_ms": 107860,
      "end_ms": 110960,
      "original_text": "重すぎるっつーの！",
      "translated_text": "Itu terlalu berat!",
      "translation_failed": false,
      "is_i_plus_one": false,
      "tokens": [
        {
          "token_id": 0,
          "surface": "重",
          "display_parts": [
            {
              "text": "重",
              "ruby": "おも"
            }
          ],
          "phonetic_script": "omo",
          "pronounced_as": "omo",
          "orthographic_rule_note": null,
          "lemma": "重い",
          "pos": "ADJ",
          "sub_pos": "一般",
          "inflection_chain": [
            "形容詞: 語幹-一般"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "berat"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 1,
          "surface": "すぎる",
          "display_parts": [
            {
              "text": "すぎる",
              "ruby": null
            }
          ],
          "phonetic_script": "sugiru",
          "pronounced_as": "sugiru",
          "orthographic_rule_note": null,
          "lemma": "すぎる",
          "pos": "VERB",
          "sub_pos": "非自立可能",
          "inflection_chain": [
            "上一段-ガ行: 終止形-一般"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "terlalu banyak"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 2,
          "surface": "っつー",
          "display_parts": [
            {
              "text": "っつー",
              "ruby": null
            }
          ],
          "phonetic_script": "ttsuu",
          "pronounced_as": "ttsuu",
          "orthographic_rule_note": null,
          "lemma": "っつー",
          "pos": "AUX",
          "sub_pos": "*",
          "inflection_chain": [
            "五段-ワア行: 連体形-一般"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [],
          "linked_token_ids": []
        },
        {
          "token_id": 3,
          "surface": "の",
          "display_parts": [
            {
              "text": "の",
              "ruby": null
            }
          ],
          "phonetic_script": "no",
          "pronounced_as": "no",
          "orthographic_rule_note": null,
          "lemma": "の",
          "pos": "PART",
          "sub_pos": "終助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "dari"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 4,
          "surface": "！",
          "display_parts": [
            {
              "text": "！",
              "ruby": null
            }
          ],
          "phonetic_script": "!",
          "pronounced_as": "!",
          "orthographic_rule_note": null,
          "lemma": "!",
          "pos": "PUNCT",
          "sub_pos": "句点",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "!"
          ],
          "linked_token_ids": []
        }
      ]
    },
    {
      "index": 25,
      "start_ms": 110960,
      "end_ms": 113650,
      "original_text": "チュ！ 可愛くてごめん",
      "translated_text": "Chu! Maaf karena bersikap manis",
      "translation_failed": false,
      "is_i_plus_one": false,
      "tokens": [
        {
          "token_id": 0,
          "surface": "チュ",
          "display_parts": [
            {
              "text": "チュ",
              "ruby": null
            }
          ],
          "phonetic_script": "chu",
          "pronounced_as": "chu",
          "orthographic_rule_note": null,
          "lemma": "チュ",
          "pos": "NOUN",
          "sub_pos": "固有名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [],
          "linked_token_ids": []
        },
        {
          "token_id": 1,
          "surface": "！",
          "display_parts": [
            {
              "text": "！",
              "ruby": null
            }
          ],
          "phonetic_script": "!",
          "pronounced_as": "!",
          "orthographic_rule_note": null,
          "lemma": "!",
          "pos": "PUNCT",
          "sub_pos": "句点",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "!"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 2,
          "surface": "可愛く",
          "display_parts": [
            {
              "text": "可愛",
              "ruby": "かわい"
            },
            {
              "text": "く",
              "ruby": null
            }
          ],
          "phonetic_script": "kawaiku",
          "pronounced_as": "kawaiku",
          "orthographic_rule_note": null,
          "lemma": "可愛い",
          "pos": "ADJ",
          "sub_pos": "一般",
          "inflection_chain": [
            "Bentuk Ren'youkei (Masu-stem)"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "imut-imut"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 3,
          "surface": "て",
          "display_parts": [
            {
              "text": "て",
              "ruby": null
            }
          ],
          "phonetic_script": "te",
          "pronounced_as": "te",
          "orthographic_rule_note": null,
          "lemma": "て",
          "pos": "PART",
          "sub_pos": "接続助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "tangan"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 4,
          "surface": "ごめん",
          "display_parts": [
            {
              "text": "ごめん",
              "ruby": null
            }
          ],
          "phonetic_script": "gomen",
          "pronounced_as": "gomen",
          "orthographic_rule_note": null,
          "lemma": "ごめん",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Maaf"
          ],
          "linked_token_ids": []
        }
      ]
    },
    {
      "index": 26,
      "start_ms": 113650,
      "end_ms": 117070,
      "original_text": "この時代生きてごめん",
      "translated_text": "Saya minta maaf karena hidup di era ini",
      "translation_failed": false,
      "is_i_plus_one": false,
      "tokens": [
        {
          "token_id": 0,
          "surface": "この",
          "display_parts": [
            {
              "text": "この",
              "ruby": null
            }
          ],
          "phonetic_script": "kono",
          "pronounced_as": "kono",
          "orthographic_rule_note": null,
          "lemma": "この",
          "pos": "DET",
          "sub_pos": "*",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "ini"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 1,
          "surface": "時代",
          "display_parts": [
            {
              "text": "時代",
              "ruby": "じだい"
            }
          ],
          "phonetic_script": "jidai",
          "pronounced_as": "jidai",
          "orthographic_rule_note": null,
          "lemma": "時代",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "era"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 2,
          "surface": "生き",
          "display_parts": [
            {
              "text": "生",
              "ruby": "い"
            },
            {
              "text": "き",
              "ruby": null
            }
          ],
          "phonetic_script": "iki",
          "pronounced_as": "iki",
          "orthographic_rule_note": null,
          "lemma": "生きる",
          "pos": "VERB",
          "sub_pos": "一般",
          "inflection_chain": [
            "Bentuk Ren'youkei (Masu-stem)"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "hidup"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 3,
          "surface": "て",
          "display_parts": [
            {
              "text": "て",
              "ruby": null
            }
          ],
          "phonetic_script": "te",
          "pronounced_as": "te",
          "orthographic_rule_note": null,
          "lemma": "て",
          "pos": "PART",
          "sub_pos": "接続助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "tangan"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 4,
          "surface": "ごめん",
          "display_parts": [
            {
              "text": "ごめん",
              "ruby": null
            }
          ],
          "phonetic_script": "gomen",
          "pronounced_as": "gomen",
          "orthographic_rule_note": null,
          "lemma": "ごめん",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Maaf"
          ],
          "linked_token_ids": []
        }
      ]
    },
    {
      "index": 27,
      "start_ms": 117070,
      "end_ms": 119730,
      "original_text": "チュ！ 目立っててごめん",
      "translated_text": "Chu! Maaf karena menonjol",
      "translation_failed": false,
      "is_i_plus_one": false,
      "tokens": [
        {
          "token_id": 0,
          "surface": "チュ",
          "display_parts": [
            {
              "text": "チュ",
              "ruby": null
            }
          ],
          "phonetic_script": "chu",
          "pronounced_as": "chu",
          "orthographic_rule_note": null,
          "lemma": "チュ",
          "pos": "NOUN",
          "sub_pos": "固有名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [],
          "linked_token_ids": []
        },
        {
          "token_id": 1,
          "surface": "！",
          "display_parts": [
            {
              "text": "！",
              "ruby": null
            }
          ],
          "phonetic_script": "!",
          "pronounced_as": "!",
          "orthographic_rule_note": null,
          "lemma": "!",
          "pos": "PUNCT",
          "sub_pos": "句点",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "!"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 2,
          "surface": "目立っ",
          "display_parts": [
            {
              "text": "目立",
              "ruby": "めだ"
            },
            {
              "text": "っ",
              "ruby": null
            }
          ],
          "phonetic_script": "meda",
          "pronounced_as": "meda",
          "orthographic_rule_note": null,
          "lemma": "目立つ",
          "pos": "VERB",
          "sub_pos": "一般",
          "inflection_chain": [
            "Bentuk Ren'youkei (Masu-stem)"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [],
          "linked_token_ids": []
        },
        {
          "token_id": 3,
          "surface": "て",
          "display_parts": [
            {
              "text": "て",
              "ruby": null
            }
          ],
          "phonetic_script": "te",
          "pronounced_as": "te",
          "orthographic_rule_note": null,
          "lemma": "てる",
          "pos": "AUX",
          "sub_pos": "*",
          "inflection_chain": [
            "Bentuk Ren'youkei (Masu-stem)"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Teru"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 4,
          "surface": "て",
          "display_parts": [
            {
              "text": "て",
              "ruby": null
            }
          ],
          "phonetic_script": "te",
          "pronounced_as": "te",
          "orthographic_rule_note": null,
          "lemma": "て",
          "pos": "PART",
          "sub_pos": "接続助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "tangan"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 5,
          "surface": "ごめん",
          "display_parts": [
            {
              "text": "ごめん",
              "ruby": null
            }
          ],
          "phonetic_script": "gomen",
          "pronounced_as": "gomen",
          "orthographic_rule_note": null,
          "lemma": "ごめん",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Maaf"
          ],
          "linked_token_ids": []
        }
      ]
    },
    {
      "index": 28,
      "start_ms": 119730,
      "end_ms": 123190,
      "original_text": "意識しちゃうよね？ ごめん",
      "translated_text": "Anda menjadi sadar, bukan? Maaf",
      "translation_failed": false,
      "is_i_plus_one": false,
      "tokens": [
        {
          "token_id": 0,
          "surface": "意識",
          "display_parts": [
            {
              "text": "意識",
              "ruby": "いしき"
            }
          ],
          "phonetic_script": "ishiki",
          "pronounced_as": "ishiki",
          "orthographic_rule_note": null,
          "lemma": "意識",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "kesadaran"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 1,
          "surface": "し",
          "display_parts": [
            {
              "text": "し",
              "ruby": null
            }
          ],
          "phonetic_script": "shi",
          "pronounced_as": "shi",
          "orthographic_rule_note": null,
          "lemma": "する",
          "pos": "VERB",
          "sub_pos": "非自立可能",
          "inflection_chain": [
            "Bentuk Ren'youkei (Masu-stem)"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Mengerjakan"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 2,
          "surface": "ちゃう",
          "display_parts": [
            {
              "text": "ちゃう",
              "ruby": null
            }
          ],
          "phonetic_script": "chau",
          "pronounced_as": "chau",
          "orthographic_rule_note": null,
          "lemma": "ちゃう",
          "pos": "AUX",
          "sub_pos": "*",
          "inflection_chain": [
            "五段-ワア行: 終止形-一般"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Ayo pergi"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 3,
          "surface": "よ",
          "display_parts": [
            {
              "text": "よ",
              "ruby": null
            }
          ],
          "phonetic_script": "yo",
          "pronounced_as": "yo",
          "orthographic_rule_note": null,
          "lemma": "よ",
          "pos": "PART",
          "sub_pos": "終助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Yo"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 4,
          "surface": "ね",
          "display_parts": [
            {
              "text": "ね",
              "ruby": null
            }
          ],
          "phonetic_script": "ne",
          "pronounced_as": "ne",
          "orthographic_rule_note": null,
          "lemma": "ね",
          "pos": "PART",
          "sub_pos": "終助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Hai"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 5,
          "surface": "？",
          "display_parts": [
            {
              "text": "？",
              "ruby": null
            }
          ],
          "phonetic_script": "?",
          "pronounced_as": "?",
          "orthographic_rule_note": null,
          "lemma": "?",
          "pos": "PUNCT",
          "sub_pos": "句点",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "?"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 6,
          "surface": "ごめん",
          "display_parts": [
            {
              "text": "ごめん",
              "ruby": null
            }
          ],
          "phonetic_script": "gomen",
          "pronounced_as": "gomen",
          "orthographic_rule_note": null,
          "lemma": "ごめん",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Maaf"
          ],
          "linked_token_ids": []
        }
      ]
    },
    {
      "index": 29,
      "start_ms": 123190,
      "end_ms": 126330,
      "original_text": "チュ！ 可愛くてごめん",
      "translated_text": "Chu! Maaf karena bersikap manis",
      "translation_failed": false,
      "is_i_plus_one": false,
      "tokens": [
        {
          "token_id": 0,
          "surface": "チュ",
          "display_parts": [
            {
              "text": "チュ",
              "ruby": null
            }
          ],
          "phonetic_script": "chu",
          "pronounced_as": "chu",
          "orthographic_rule_note": null,
          "lemma": "チュ",
          "pos": "NOUN",
          "sub_pos": "固有名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [],
          "linked_token_ids": []
        },
        {
          "token_id": 1,
          "surface": "！",
          "display_parts": [
            {
              "text": "！",
              "ruby": null
            }
          ],
          "phonetic_script": "!",
          "pronounced_as": "!",
          "orthographic_rule_note": null,
          "lemma": "!",
          "pos": "PUNCT",
          "sub_pos": "句点",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "!"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 2,
          "surface": "可愛く",
          "display_parts": [
            {
              "text": "可愛",
              "ruby": "かわい"
            },
            {
              "text": "く",
              "ruby": null
            }
          ],
          "phonetic_script": "kawaiku",
          "pronounced_as": "kawaiku",
          "orthographic_rule_note": null,
          "lemma": "可愛い",
          "pos": "ADJ",
          "sub_pos": "一般",
          "inflection_chain": [
            "Bentuk Ren'youkei (Masu-stem)"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "imut-imut"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 3,
          "surface": "て",
          "display_parts": [
            {
              "text": "て",
              "ruby": null
            }
          ],
          "phonetic_script": "te",
          "pronounced_as": "te",
          "orthographic_rule_note": null,
          "lemma": "て",
          "pos": "PART",
          "sub_pos": "接続助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "tangan"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 4,
          "surface": "ごめん",
          "display_parts": [
            {
              "text": "ごめん",
              "ruby": null
            }
          ],
          "phonetic_script": "gomen",
          "pronounced_as": "gomen",
          "orthographic_rule_note": null,
          "lemma": "ごめん",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Maaf"
          ],
          "linked_token_ids": []
        }
      ]
    },
    {
      "index": 30,
      "start_ms": 126330,
      "end_ms": 129350,
      "original_text": "自分磨きしてごめん",
      "translated_text": "Maaf karena telah memperbaiki diriku sendiri",
      "translation_failed": false,
      "is_i_plus_one": false,
      "tokens": [
        {
          "token_id": 0,
          "surface": "自分",
          "display_parts": [
            {
              "text": "自分",
              "ruby": "じぶん"
            }
          ],
          "phonetic_script": "jibun",
          "pronounced_as": "jibun",
          "orthographic_rule_note": null,
          "lemma": "自分",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "saya sendiri"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 1,
          "surface": "磨き",
          "display_parts": [
            {
              "text": "磨",
              "ruby": "みが"
            },
            {
              "text": "き",
              "ruby": null
            }
          ],
          "phonetic_script": "migaki",
          "pronounced_as": "migaki",
          "orthographic_rule_note": null,
          "lemma": "磨き",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Polandia"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 2,
          "surface": "し",
          "display_parts": [
            {
              "text": "し",
              "ruby": null
            }
          ],
          "phonetic_script": "shi",
          "pronounced_as": "shi",
          "orthographic_rule_note": null,
          "lemma": "する",
          "pos": "VERB",
          "sub_pos": "非自立可能",
          "inflection_chain": [
            "Bentuk Ren'youkei (Masu-stem)"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Mengerjakan"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 3,
          "surface": "て",
          "display_parts": [
            {
              "text": "て",
              "ruby": null
            }
          ],
          "phonetic_script": "te",
          "pronounced_as": "te",
          "orthographic_rule_note": null,
          "lemma": "て",
          "pos": "PART",
          "sub_pos": "接続助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "tangan"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 4,
          "surface": "ごめん",
          "display_parts": [
            {
              "text": "ごめん",
              "ruby": null
            }
          ],
          "phonetic_script": "gomen",
          "pronounced_as": "gomen",
          "orthographic_rule_note": null,
          "lemma": "ごめん",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Maaf"
          ],
          "linked_token_ids": []
        }
      ]
    },
    {
      "index": 31,
      "start_ms": 129350,
      "end_ms": 131740,
      "original_text": "チュ！ ぶりっ子でごめん",
      "translated_text": "Chu! Maaf karena sedikit pemalu",
      "translation_failed": false,
      "is_i_plus_one": false,
      "tokens": [
        {
          "token_id": 0,
          "surface": "チュ",
          "display_parts": [
            {
              "text": "チュ",
              "ruby": null
            }
          ],
          "phonetic_script": "chu",
          "pronounced_as": "chu",
          "orthographic_rule_note": null,
          "lemma": "チュ",
          "pos": "NOUN",
          "sub_pos": "固有名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [],
          "linked_token_ids": []
        },
        {
          "token_id": 1,
          "surface": "！",
          "display_parts": [
            {
              "text": "！",
              "ruby": null
            }
          ],
          "phonetic_script": "!",
          "pronounced_as": "!",
          "orthographic_rule_note": null,
          "lemma": "!",
          "pos": "PUNCT",
          "sub_pos": "句点",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "!"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 2,
          "surface": "ぶり",
          "display_parts": [
            {
              "text": "ぶり",
              "ruby": null
            }
          ],
          "phonetic_script": "buri",
          "pronounced_as": "buri",
          "orthographic_rule_note": null,
          "lemma": "ぶり",
          "pos": "OTHER",
          "sub_pos": "名詞的",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [],
          "linked_token_ids": []
        },
        {
          "token_id": 3,
          "surface": "っ子",
          "display_parts": [
            {
              "text": "っ",
              "ruby": null
            },
            {
              "text": "子",
              "ruby": "こ"
            }
          ],
          "phonetic_script": "kko",
          "pronounced_as": "kko",
          "orthographic_rule_note": null,
          "lemma": "っ子",
          "pos": "OTHER",
          "sub_pos": "名詞的",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [],
          "linked_token_ids": []
        },
        {
          "token_id": 4,
          "surface": "で",
          "display_parts": [
            {
              "text": "で",
              "ruby": null
            }
          ],
          "phonetic_script": "de",
          "pronounced_as": "de",
          "orthographic_rule_note": null,
          "lemma": "で",
          "pos": "PART",
          "sub_pos": "格助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "di dalam"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 5,
          "surface": "ごめん",
          "display_parts": [
            {
              "text": "ごめん",
              "ruby": null
            }
          ],
          "phonetic_script": "gomen",
          "pronounced_as": "gomen",
          "orthographic_rule_note": null,
          "lemma": "ごめん",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Maaf"
          ],
          "linked_token_ids": []
        }
      ]
    },
    {
      "index": 32,
      "start_ms": 131740,
      "end_ms": 134680,
      "original_text": "虜にしちゃってごめん",
      "translated_text": "Maaf telah memikatmu",
      "translation_failed": false,
      "is_i_plus_one": false,
      "tokens": [
        {
          "token_id": 0,
          "surface": "虜",
          "display_parts": [
            {
              "text": "虜",
              "ruby": "とりこ"
            }
          ],
          "phonetic_script": "toriko",
          "pronounced_as": "toriko",
          "orthographic_rule_note": null,
          "lemma": "虜",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [],
          "linked_token_ids": []
        },
        {
          "token_id": 1,
          "surface": "に",
          "display_parts": [
            {
              "text": "に",
              "ruby": null
            }
          ],
          "phonetic_script": "ni",
          "pronounced_as": "ni",
          "orthographic_rule_note": null,
          "lemma": "に",
          "pos": "PART",
          "sub_pos": "格助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "ke"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 2,
          "surface": "し",
          "display_parts": [
            {
              "text": "し",
              "ruby": null
            }
          ],
          "phonetic_script": "shi",
          "pronounced_as": "shi",
          "orthographic_rule_note": null,
          "lemma": "する",
          "pos": "VERB",
          "sub_pos": "非自立可能",
          "inflection_chain": [
            "Bentuk Ren'youkei (Masu-stem)"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Mengerjakan"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 3,
          "surface": "ちゃっ",
          "display_parts": [
            {
              "text": "ちゃっ",
              "ruby": null
            }
          ],
          "phonetic_script": "cha",
          "pronounced_as": "cha",
          "orthographic_rule_note": null,
          "lemma": "ちゃう",
          "pos": "AUX",
          "sub_pos": "*",
          "inflection_chain": [
            "Bentuk Ren'youkei (Masu-stem)"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Ayo pergi"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 4,
          "surface": "て",
          "display_parts": [
            {
              "text": "て",
              "ruby": null
            }
          ],
          "phonetic_script": "te",
          "pronounced_as": "te",
          "orthographic_rule_note": null,
          "lemma": "て",
          "pos": "PART",
          "sub_pos": "接続助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "tangan"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 5,
          "surface": "ごめん",
          "display_parts": [
            {
              "text": "ごめん",
              "ruby": null
            }
          ],
          "phonetic_script": "gomen",
          "pronounced_as": "gomen",
          "orthographic_rule_note": null,
          "lemma": "ごめん",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Maaf"
          ],
          "linked_token_ids": []
        }
      ]
    },
    {
      "index": 33,
      "start_ms": 134680,
      "end_ms": 138040,
      "original_text": "ムカついちゃうでしょ？ ざまあ",
      "translated_text": "Itu menjengkelkan, bukan? Zamaa",
      "translation_failed": false,
      "is_i_plus_one": false,
      "tokens": [
        {
          "token_id": 0,
          "surface": "ムカつい",
          "display_parts": [
            {
              "text": "ムカつい",
              "ruby": null
            }
          ],
          "phonetic_script": "mukatsui",
          "pronounced_as": "mukatsui",
          "orthographic_rule_note": null,
          "lemma": "ムカつく",
          "pos": "VERB",
          "sub_pos": "一般",
          "inflection_chain": [
            "Bentuk Ren'youkei (Masu-stem)"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [],
          "linked_token_ids": []
        },
        {
          "token_id": 1,
          "surface": "ちゃう",
          "display_parts": [
            {
              "text": "ちゃう",
              "ruby": null
            }
          ],
          "phonetic_script": "chau",
          "pronounced_as": "chau",
          "orthographic_rule_note": null,
          "lemma": "ちゃう",
          "pos": "AUX",
          "sub_pos": "*",
          "inflection_chain": [
            "五段-ワア行: 終止形-一般"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Ayo pergi"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 2,
          "surface": "でしょ",
          "display_parts": [
            {
              "text": "でしょ",
              "ruby": null
            }
          ],
          "phonetic_script": "desho",
          "pronounced_as": "desho",
          "orthographic_rule_note": null,
          "lemma": "です",
          "pos": "AUX",
          "sub_pos": "*",
          "inflection_chain": [
            "助動詞-デス: 意志推量形"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "adalah"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 3,
          "surface": "？",
          "display_parts": [
            {
              "text": "？",
              "ruby": null
            }
          ],
          "phonetic_script": "?",
          "pronounced_as": "?",
          "orthographic_rule_note": null,
          "lemma": "?",
          "pos": "PUNCT",
          "sub_pos": "句点",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "?"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 4,
          "surface": "ざま",
          "display_parts": [
            {
              "text": "ざま",
              "ruby": null
            }
          ],
          "phonetic_script": "zama",
          "pronounced_as": "zama",
          "orthographic_rule_note": null,
          "lemma": "ざま",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [],
          "linked_token_ids": []
        },
        {
          "token_id": 5,
          "surface": "あ",
          "display_parts": [
            {
              "text": "あ",
              "ruby": null
            }
          ],
          "phonetic_script": "a",
          "pronounced_as": "a",
          "orthographic_rule_note": null,
          "lemma": "あ",
          "pos": "OTHER",
          "sub_pos": "フィラー",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [],
          "linked_token_ids": []
        }
      ]
    },
    {
      "index": 34,
      "start_ms": 138040,
      "end_ms": 140720,
      "original_text": "趣味の違い 変わり者と",
      "translated_text": "Hobi dan keanehan yang berbeda",
      "translation_failed": false,
      "is_i_plus_one": false,
      "tokens": [
        {
          "token_id": 0,
          "surface": "趣味",
          "display_parts": [
            {
              "text": "趣味",
              "ruby": "しゅみ"
            }
          ],
          "phonetic_script": "shumi",
          "pronounced_as": "shumi",
          "orthographic_rule_note": null,
          "lemma": "趣味",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [],
          "linked_token_ids": []
        },
        {
          "token_id": 1,
          "surface": "の",
          "display_parts": [
            {
              "text": "の",
              "ruby": null
            }
          ],
          "phonetic_script": "no",
          "pronounced_as": "no",
          "orthographic_rule_note": null,
          "lemma": "の",
          "pos": "PART",
          "sub_pos": "格助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "dari"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 2,
          "surface": "違い",
          "display_parts": [
            {
              "text": "違",
              "ruby": "ちが"
            },
            {
              "text": "い",
              "ruby": null
            }
          ],
          "phonetic_script": "chigai",
          "pronounced_as": "chigai",
          "orthographic_rule_note": null,
          "lemma": "違い",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [],
          "linked_token_ids": []
        },
        {
          "token_id": 3,
          "surface": "変わり者",
          "display_parts": [
            {
              "text": "変",
              "ruby": "か"
            },
            {
              "text": "わり",
              "ruby": null
            },
            {
              "text": "者",
              "ruby": "もの"
            }
          ],
          "phonetic_script": "kawarimono",
          "pronounced_as": "kawarimono",
          "orthographic_rule_note": null,
          "lemma": "変わり者",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "eksentrik"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 4,
          "surface": "と",
          "display_parts": [
            {
              "text": "と",
              "ruby": null
            }
          ],
          "phonetic_script": "to",
          "pronounced_as": "to",
          "orthographic_rule_note": null,
          "lemma": "と",
          "pos": "PART",
          "sub_pos": "格助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Dan"
          ],
          "linked_token_ids": []
        }
      ]
    },
    {
      "index": 35,
      "start_ms": 140720,
      "end_ms": 142540,
      "original_text": "バカにされても",
      "translated_text": "Bahkan jika kamu mengolok-olokku",
      "translation_failed": false,
      "is_i_plus_one": false,
      "tokens": [
        {
          "token_id": 0,
          "surface": "バカ",
          "display_parts": [
            {
              "text": "バカ",
              "ruby": null
            }
          ],
          "phonetic_script": "baka",
          "pronounced_as": "baka",
          "orthographic_rule_note": null,
          "lemma": "バカ",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "bodoh"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 1,
          "surface": "に",
          "display_parts": [
            {
              "text": "に",
              "ruby": null
            }
          ],
          "phonetic_script": "ni",
          "pronounced_as": "ni",
          "orthographic_rule_note": null,
          "lemma": "だ",
          "pos": "AUX",
          "sub_pos": "*",
          "inflection_chain": [
            "Bentuk Ren'youkei (Masu-stem)"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "adalah"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 2,
          "surface": "さ",
          "display_parts": [
            {
              "text": "さ",
              "ruby": null
            }
          ],
          "phonetic_script": "sa",
          "pronounced_as": "sa",
          "orthographic_rule_note": null,
          "lemma": "する",
          "pos": "VERB",
          "sub_pos": "非自立可能",
          "inflection_chain": [
            "Bentuk Negatif/Mizenkei"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Mengerjakan"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 3,
          "surface": "れ",
          "display_parts": [
            {
              "text": "れ",
              "ruby": null
            }
          ],
          "phonetic_script": "re",
          "pronounced_as": "re",
          "orthographic_rule_note": null,
          "lemma": "れる",
          "pos": "AUX",
          "sub_pos": "*",
          "inflection_chain": [
            "Bentuk Ren'youkei (Masu-stem)"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "bisa"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 4,
          "surface": "て",
          "display_parts": [
            {
              "text": "て",
              "ruby": null
            }
          ],
          "phonetic_script": "te",
          "pronounced_as": "te",
          "orthographic_rule_note": null,
          "lemma": "て",
          "pos": "PART",
          "sub_pos": "接続助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "tangan"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 5,
          "surface": "も",
          "display_parts": [
            {
              "text": "も",
              "ruby": null
            }
          ],
          "phonetic_script": "mo",
          "pronounced_as": "mo",
          "orthographic_rule_note": null,
          "lemma": "も",
          "pos": "PART",
          "sub_pos": "係助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "juga"
          ],
          "linked_token_ids": []
        }
      ]
    },
    {
      "index": 36,
      "start_ms": 142540,
      "end_ms": 146700,
      "original_text": "曲げたくない 怖くもない",
      "translated_text": "Saya tidak ingin membungkuk, saya tidak takut",
      "translation_failed": false,
      "is_i_plus_one": false,
      "tokens": [
        {
          "token_id": 0,
          "surface": "曲げ",
          "display_parts": [
            {
              "text": "曲",
              "ruby": "ま"
            },
            {
              "text": "げ",
              "ruby": null
            }
          ],
          "phonetic_script": "mage",
          "pronounced_as": "mage",
          "orthographic_rule_note": null,
          "lemma": "曲げる",
          "pos": "VERB",
          "sub_pos": "一般",
          "inflection_chain": [
            "Bentuk Ren'youkei (Masu-stem)"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "membengkokkan"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 1,
          "surface": "たく",
          "display_parts": [
            {
              "text": "たく",
              "ruby": null
            }
          ],
          "phonetic_script": "taku",
          "pronounced_as": "taku",
          "orthographic_rule_note": null,
          "lemma": "たい",
          "pos": "AUX",
          "sub_pos": "*",
          "inflection_chain": [
            "Bentuk Ren'youkei (Masu-stem)"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "ikan air tawar"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 2,
          "surface": "ない",
          "display_parts": [
            {
              "text": "ない",
              "ruby": null
            }
          ],
          "phonetic_script": "nai",
          "pronounced_as": "nai",
          "orthographic_rule_note": null,
          "lemma": "ない",
          "pos": "ADJ",
          "sub_pos": "非自立可能",
          "inflection_chain": [
            "形容詞: 終止形-一般"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "tidak punya"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 3,
          "surface": "怖く",
          "display_parts": [
            {
              "text": "怖",
              "ruby": "こわ"
            },
            {
              "text": "く",
              "ruby": null
            }
          ],
          "phonetic_script": "kowaku",
          "pronounced_as": "kowaku",
          "orthographic_rule_note": null,
          "lemma": "怖い",
          "pos": "ADJ",
          "sub_pos": "一般",
          "inflection_chain": [
            "Bentuk Ren'youkei (Masu-stem)"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "takut"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 4,
          "surface": "も",
          "display_parts": [
            {
              "text": "も",
              "ruby": null
            }
          ],
          "phonetic_script": "mo",
          "pronounced_as": "mo",
          "orthographic_rule_note": null,
          "lemma": "も",
          "pos": "PART",
          "sub_pos": "係助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "juga"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 5,
          "surface": "ない",
          "display_parts": [
            {
              "text": "ない",
              "ruby": null
            }
          ],
          "phonetic_script": "nai",
          "pronounced_as": "nai",
          "orthographic_rule_note": null,
          "lemma": "ない",
          "pos": "ADJ",
          "sub_pos": "非自立可能",
          "inflection_chain": [
            "形容詞: 終止形-一般"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "tidak punya"
          ],
          "linked_token_ids": []
        }
      ]
    },
    {
      "index": 37,
      "start_ms": 146700,
      "end_ms": 149780,
      "original_text": "あんたらごとき",
      "translated_text": "Seperti kamu",
      "translation_failed": false,
      "is_i_plus_one": false,
      "tokens": [
        {
          "token_id": 0,
          "surface": "あんた",
          "display_parts": [
            {
              "text": "あんた",
              "ruby": null
            }
          ],
          "phonetic_script": "anta",
          "pronounced_as": "anta",
          "orthographic_rule_note": null,
          "lemma": "あんた",
          "pos": "PRON",
          "sub_pos": "*",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Anda"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 1,
          "surface": "ら",
          "display_parts": [
            {
              "text": "ら",
              "ruby": null
            }
          ],
          "phonetic_script": "ra",
          "pronounced_as": "ra",
          "orthographic_rule_note": null,
          "lemma": "ら",
          "pos": "OTHER",
          "sub_pos": "名詞的",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "dan lainnya"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 2,
          "surface": "ごとき",
          "display_parts": [
            {
              "text": "ごとき",
              "ruby": null
            }
          ],
          "phonetic_script": "gotoki",
          "pronounced_as": "gotoki",
          "orthographic_rule_note": null,
          "lemma": "ごとし",
          "pos": "AUX",
          "sub_pos": "*",
          "inflection_chain": [
            "文語助動詞-ゴトシ: 連体形-一般"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "benda"
          ],
          "linked_token_ids": []
        }
      ]
    },
    {
      "index": 38,
      "start_ms": 149780,
      "end_ms": 152670,
      "original_text": "自分の味方は自分でありたい",
      "translated_text": "Saya ingin menjadi sekutu saya sendiri",
      "translation_failed": false,
      "is_i_plus_one": false,
      "tokens": [
        {
          "token_id": 0,
          "surface": "自分",
          "display_parts": [
            {
              "text": "自分",
              "ruby": "じぶん"
            }
          ],
          "phonetic_script": "jibun",
          "pronounced_as": "jibun",
          "orthographic_rule_note": null,
          "lemma": "自分",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "saya sendiri"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 1,
          "surface": "の",
          "display_parts": [
            {
              "text": "の",
              "ruby": null
            }
          ],
          "phonetic_script": "no",
          "pronounced_as": "no",
          "orthographic_rule_note": null,
          "lemma": "の",
          "pos": "PART",
          "sub_pos": "格助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "dari"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 2,
          "surface": "味方",
          "display_parts": [
            {
              "text": "味方",
              "ruby": "みかた"
            }
          ],
          "phonetic_script": "mikata",
          "pronounced_as": "mikata",
          "orthographic_rule_note": null,
          "lemma": "味方",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Sekutu"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 3,
          "surface": "は",
          "display_parts": [
            {
              "text": "は",
              "ruby": null
            }
          ],
          "phonetic_script": "ha",
          "pronounced_as": "wa",
          "orthographic_rule_note": "Partikel は dilafalkan 'wa'",
          "lemma": "は",
          "pos": "PART",
          "sub_pos": "係助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "gigi"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 4,
          "surface": "自分",
          "display_parts": [
            {
              "text": "自分",
              "ruby": "じぶん"
            }
          ],
          "phonetic_script": "jibun",
          "pronounced_as": "jibun",
          "orthographic_rule_note": null,
          "lemma": "自分",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "saya sendiri"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 5,
          "surface": "で",
          "display_parts": [
            {
              "text": "で",
              "ruby": null
            }
          ],
          "phonetic_script": "de",
          "pronounced_as": "de",
          "orthographic_rule_note": null,
          "lemma": "だ",
          "pos": "AUX",
          "sub_pos": "*",
          "inflection_chain": [
            "Bentuk Ren'youkei (Masu-stem)"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "adalah"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 6,
          "surface": "あり",
          "display_parts": [
            {
              "text": "あり",
              "ruby": null
            }
          ],
          "phonetic_script": "ari",
          "pronounced_as": "ari",
          "orthographic_rule_note": null,
          "lemma": "ある",
          "pos": "VERB",
          "sub_pos": "非自立可能",
          "inflection_chain": [
            "Bentuk Ren'youkei (Masu-stem)"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "menjadi"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 7,
          "surface": "たい",
          "display_parts": [
            {
              "text": "たい",
              "ruby": null
            }
          ],
          "phonetic_script": "tai",
          "pronounced_as": "tai",
          "orthographic_rule_note": null,
          "lemma": "たい",
          "pos": "AUX",
          "sub_pos": "*",
          "inflection_chain": [
            "助動詞-タイ: 終止形-一般"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "ikan air tawar"
          ],
          "linked_token_ids": []
        }
      ]
    },
    {
      "index": 39,
      "start_ms": 152670,
      "end_ms": 155920,
      "original_text": "一番大切にしてあげたい",
      "translated_text": "Saya ingin sangat menghargainya",
      "translation_failed": false,
      "is_i_plus_one": false,
      "tokens": [
        {
          "token_id": 0,
          "surface": "一番",
          "display_parts": [
            {
              "text": "一番",
              "ruby": "いちばん"
            }
          ],
          "phonetic_script": "ichiban",
          "pronounced_as": "ichiban",
          "orthographic_rule_note": null,
          "lemma": "一番",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "nomor satu"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 1,
          "surface": "大切",
          "display_parts": [
            {
              "text": "大切",
              "ruby": "たいせつ"
            }
          ],
          "phonetic_script": "taisetsu",
          "pronounced_as": "taisetsu",
          "orthographic_rule_note": null,
          "lemma": "大切",
          "pos": "ADJ",
          "sub_pos": "一般",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "penting"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 2,
          "surface": "に",
          "display_parts": [
            {
              "text": "に",
              "ruby": null
            }
          ],
          "phonetic_script": "ni",
          "pronounced_as": "ni",
          "orthographic_rule_note": null,
          "lemma": "だ",
          "pos": "AUX",
          "sub_pos": "*",
          "inflection_chain": [
            "Bentuk Ren'youkei (Masu-stem)"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "adalah"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 3,
          "surface": "し",
          "display_parts": [
            {
              "text": "し",
              "ruby": null
            }
          ],
          "phonetic_script": "shi",
          "pronounced_as": "shi",
          "orthographic_rule_note": null,
          "lemma": "する",
          "pos": "VERB",
          "sub_pos": "非自立可能",
          "inflection_chain": [
            "Bentuk Ren'youkei (Masu-stem)"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Mengerjakan"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 4,
          "surface": "て",
          "display_parts": [
            {
              "text": "て",
              "ruby": null
            }
          ],
          "phonetic_script": "te",
          "pronounced_as": "te",
          "orthographic_rule_note": null,
          "lemma": "て",
          "pos": "PART",
          "sub_pos": "接続助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "tangan"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 5,
          "surface": "あげ",
          "display_parts": [
            {
              "text": "あげ",
              "ruby": null
            }
          ],
          "phonetic_script": "age",
          "pronounced_as": "age",
          "orthographic_rule_note": null,
          "lemma": "あげる",
          "pos": "VERB",
          "sub_pos": "非自立可能",
          "inflection_chain": [
            "Bentuk Ren'youkei (Masu-stem)"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "memberi"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 6,
          "surface": "たい",
          "display_parts": [
            {
              "text": "たい",
              "ruby": null
            }
          ],
          "phonetic_script": "tai",
          "pronounced_as": "tai",
          "orthographic_rule_note": null,
          "lemma": "たい",
          "pos": "AUX",
          "sub_pos": "*",
          "inflection_chain": [
            "助動詞-タイ: 終止形-一般"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "ikan air tawar"
          ],
          "linked_token_ids": []
        }
      ]
    },
    {
      "index": 40,
      "start_ms": 155920,
      "end_ms": 158640,
      "original_text": "理不尽な我慢はさせたくない",
      "translated_text": "Saya tidak ingin Anda menanggung kesabaran yang tidak masuk akal.",
      "translation_failed": false,
      "is_i_plus_one": false,
      "tokens": [
        {
          "token_id": 0,
          "surface": "理不尽",
          "display_parts": [
            {
              "text": "理不尽",
              "ruby": "りふじん"
            }
          ],
          "phonetic_script": "rifujin",
          "pronounced_as": "rifujin",
          "orthographic_rule_note": null,
          "lemma": "理不尽",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "tidak masuk akal"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 1,
          "surface": "な",
          "display_parts": [
            {
              "text": "な",
              "ruby": null
            }
          ],
          "phonetic_script": "na",
          "pronounced_as": "na",
          "orthographic_rule_note": null,
          "lemma": "だ",
          "pos": "AUX",
          "sub_pos": "*",
          "inflection_chain": [
            "助動詞-ダ: 連体形-一般"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "adalah"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 2,
          "surface": "我慢",
          "display_parts": [
            {
              "text": "我慢",
              "ruby": "がまん"
            }
          ],
          "phonetic_script": "gaman",
          "pronounced_as": "gaman",
          "orthographic_rule_note": null,
          "lemma": "我慢",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [],
          "linked_token_ids": []
        },
        {
          "token_id": 3,
          "surface": "は",
          "display_parts": [
            {
              "text": "は",
              "ruby": null
            }
          ],
          "phonetic_script": "ha",
          "pronounced_as": "wa",
          "orthographic_rule_note": "Partikel は dilafalkan 'wa'",
          "lemma": "は",
          "pos": "PART",
          "sub_pos": "係助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "gigi"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 4,
          "surface": "さ",
          "display_parts": [
            {
              "text": "さ",
              "ruby": null
            }
          ],
          "phonetic_script": "sa",
          "pronounced_as": "sa",
          "orthographic_rule_note": null,
          "lemma": "する",
          "pos": "VERB",
          "sub_pos": "非自立可能",
          "inflection_chain": [
            "Bentuk Negatif/Mizenkei"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Mengerjakan"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 5,
          "surface": "せ",
          "display_parts": [
            {
              "text": "せ",
              "ruby": null
            }
          ],
          "phonetic_script": "se",
          "pronounced_as": "se",
          "orthographic_rule_note": null,
          "lemma": "せる",
          "pos": "AUX",
          "sub_pos": "*",
          "inflection_chain": [
            "Bentuk Ren'youkei (Masu-stem)"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "membiarkan"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 6,
          "surface": "たく",
          "display_parts": [
            {
              "text": "たく",
              "ruby": null
            }
          ],
          "phonetic_script": "taku",
          "pronounced_as": "taku",
          "orthographic_rule_note": null,
          "lemma": "たい",
          "pos": "AUX",
          "sub_pos": "*",
          "inflection_chain": [
            "Bentuk Ren'youkei (Masu-stem)"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "ikan air tawar"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 7,
          "surface": "ない",
          "display_parts": [
            {
              "text": "ない",
              "ruby": null
            }
          ],
          "phonetic_script": "nai",
          "pronounced_as": "nai",
          "orthographic_rule_note": null,
          "lemma": "ない",
          "pos": "ADJ",
          "sub_pos": "非自立可能",
          "inflection_chain": [
            "形容詞: 終止形-一般"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "tidak punya"
          ],
          "linked_token_ids": []
        }
      ]
    },
    {
      "index": 41,
      "start_ms": 158640,
      "end_ms": 173930,
      "original_text": "「それが私」",
      "translated_text": "“Itu aku.”",
      "translation_failed": false,
      "is_i_plus_one": false,
      "tokens": [
        {
          "token_id": 0,
          "surface": "「",
          "display_parts": [
            {
              "text": "「",
              "ruby": null
            }
          ],
          "phonetic_script": "「",
          "pronounced_as": "「",
          "orthographic_rule_note": null,
          "lemma": "「",
          "pos": "PUNCT",
          "sub_pos": "括弧開",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "\""
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 1,
          "surface": "それ",
          "display_parts": [
            {
              "text": "それ",
              "ruby": null
            }
          ],
          "phonetic_script": "sore",
          "pronounced_as": "sore",
          "orthographic_rule_note": null,
          "lemma": "それ",
          "pos": "PRON",
          "sub_pos": "*",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "itu"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 2,
          "surface": "が",
          "display_parts": [
            {
              "text": "が",
              "ruby": null
            }
          ],
          "phonetic_script": "ga",
          "pronounced_as": "ga",
          "orthographic_rule_note": null,
          "lemma": "が",
          "pos": "PART",
          "sub_pos": "格助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Tetapi"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 3,
          "surface": "私",
          "display_parts": [
            {
              "text": "私",
              "ruby": "わたくし"
            }
          ],
          "phonetic_script": "watakushi",
          "pronounced_as": "watakushi",
          "orthographic_rule_note": null,
          "lemma": "私",
          "pos": "PRON",
          "sub_pos": "*",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": {
            "system": "jp_pitch",
            "value": "atamadaka",
            "pattern": [
              1,
              0,
              0
            ]
          },
          "proficiency_tag": "JLPT N5",
          "meanings": [
            "saya",
            "aku"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 4,
          "surface": "」",
          "display_parts": [
            {
              "text": "」",
              "ruby": null
            }
          ],
          "phonetic_script": "」",
          "pronounced_as": "」",
          "orthographic_rule_note": null,
          "lemma": "」",
          "pos": "PUNCT",
          "sub_pos": "括弧閉",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "”"
          ],
          "linked_token_ids": []
        }
      ]
    },
    {
      "index": 42,
      "start_ms": 173930,
      "end_ms": 176410,
      "original_text": "チュ！ 可愛くてごめん",
      "translated_text": "Chu! Maaf karena bersikap manis",
      "translation_failed": false,
      "is_i_plus_one": false,
      "tokens": [
        {
          "token_id": 0,
          "surface": "チュ",
          "display_parts": [
            {
              "text": "チュ",
              "ruby": null
            }
          ],
          "phonetic_script": "chu",
          "pronounced_as": "chu",
          "orthographic_rule_note": null,
          "lemma": "チュ",
          "pos": "NOUN",
          "sub_pos": "固有名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [],
          "linked_token_ids": []
        },
        {
          "token_id": 1,
          "surface": "！",
          "display_parts": [
            {
              "text": "！",
              "ruby": null
            }
          ],
          "phonetic_script": "!",
          "pronounced_as": "!",
          "orthographic_rule_note": null,
          "lemma": "!",
          "pos": "PUNCT",
          "sub_pos": "句点",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "!"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 2,
          "surface": "可愛く",
          "display_parts": [
            {
              "text": "可愛",
              "ruby": "かわい"
            },
            {
              "text": "く",
              "ruby": null
            }
          ],
          "phonetic_script": "kawaiku",
          "pronounced_as": "kawaiku",
          "orthographic_rule_note": null,
          "lemma": "可愛い",
          "pos": "ADJ",
          "sub_pos": "一般",
          "inflection_chain": [
            "Bentuk Ren'youkei (Masu-stem)"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "imut-imut"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 3,
          "surface": "て",
          "display_parts": [
            {
              "text": "て",
              "ruby": null
            }
          ],
          "phonetic_script": "te",
          "pronounced_as": "te",
          "orthographic_rule_note": null,
          "lemma": "て",
          "pos": "PART",
          "sub_pos": "接続助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "tangan"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 4,
          "surface": "ごめん",
          "display_parts": [
            {
              "text": "ごめん",
              "ruby": null
            }
          ],
          "phonetic_script": "gomen",
          "pronounced_as": "gomen",
          "orthographic_rule_note": null,
          "lemma": "ごめん",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Maaf"
          ],
          "linked_token_ids": []
        }
      ]
    },
    {
      "index": 43,
      "start_ms": 176410,
      "end_ms": 179890,
      "original_text": "生まれてきちゃってごめん",
      "translated_text": "maaf aku dilahirkan",
      "translation_failed": false,
      "is_i_plus_one": false,
      "tokens": [
        {
          "token_id": 0,
          "surface": "生まれ",
          "display_parts": [
            {
              "text": "生",
              "ruby": "う"
            },
            {
              "text": "まれ",
              "ruby": null
            }
          ],
          "phonetic_script": "umare",
          "pronounced_as": "umare",
          "orthographic_rule_note": null,
          "lemma": "生まれる",
          "pos": "VERB",
          "sub_pos": "一般",
          "inflection_chain": [
            "Bentuk Ren'youkei (Masu-stem)"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "dilahirkan"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 1,
          "surface": "て",
          "display_parts": [
            {
              "text": "て",
              "ruby": null
            }
          ],
          "phonetic_script": "te",
          "pronounced_as": "te",
          "orthographic_rule_note": null,
          "lemma": "て",
          "pos": "PART",
          "sub_pos": "接続助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "tangan"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 2,
          "surface": "き",
          "display_parts": [
            {
              "text": "き",
              "ruby": null
            }
          ],
          "phonetic_script": "ki",
          "pronounced_as": "ki",
          "orthographic_rule_note": null,
          "lemma": "くる",
          "pos": "VERB",
          "sub_pos": "非自立可能",
          "inflection_chain": [
            "Bentuk Ren'youkei (Masu-stem)"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Datang"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 3,
          "surface": "ちゃっ",
          "display_parts": [
            {
              "text": "ちゃっ",
              "ruby": null
            }
          ],
          "phonetic_script": "cha",
          "pronounced_as": "cha",
          "orthographic_rule_note": null,
          "lemma": "ちゃう",
          "pos": "AUX",
          "sub_pos": "*",
          "inflection_chain": [
            "Bentuk Ren'youkei (Masu-stem)"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Ayo pergi"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 4,
          "surface": "て",
          "display_parts": [
            {
              "text": "て",
              "ruby": null
            }
          ],
          "phonetic_script": "te",
          "pronounced_as": "te",
          "orthographic_rule_note": null,
          "lemma": "て",
          "pos": "PART",
          "sub_pos": "接続助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "tangan"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 5,
          "surface": "ごめん",
          "display_parts": [
            {
              "text": "ごめん",
              "ruby": null
            }
          ],
          "phonetic_script": "gomen",
          "pronounced_as": "gomen",
          "orthographic_rule_note": null,
          "lemma": "ごめん",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Maaf"
          ],
          "linked_token_ids": []
        }
      ]
    },
    {
      "index": 44,
      "start_ms": 179890,
      "end_ms": 184820,
      "original_text": "チュ！ あざとくてごめん",
      "translated_text": "Chu! Maaf karena bersikap kasar",
      "translation_failed": false,
      "is_i_plus_one": false,
      "tokens": [
        {
          "token_id": 0,
          "surface": "チュ",
          "display_parts": [
            {
              "text": "チュ",
              "ruby": null
            }
          ],
          "phonetic_script": "chu",
          "pronounced_as": "chu",
          "orthographic_rule_note": null,
          "lemma": "チュ",
          "pos": "NOUN",
          "sub_pos": "固有名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [],
          "linked_token_ids": []
        },
        {
          "token_id": 1,
          "surface": "！",
          "display_parts": [
            {
              "text": "！",
              "ruby": null
            }
          ],
          "phonetic_script": "!",
          "pronounced_as": "!",
          "orthographic_rule_note": null,
          "lemma": "!",
          "pos": "PUNCT",
          "sub_pos": "句点",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "!"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 2,
          "surface": "あざとく",
          "display_parts": [
            {
              "text": "あざとく",
              "ruby": null
            }
          ],
          "phonetic_script": "azatoku",
          "pronounced_as": "azatoku",
          "orthographic_rule_note": null,
          "lemma": "あざとい",
          "pos": "ADJ",
          "sub_pos": "一般",
          "inflection_chain": [
            "Bentuk Ren'youkei (Masu-stem)"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Azatoi"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 3,
          "surface": "て",
          "display_parts": [
            {
              "text": "て",
              "ruby": null
            }
          ],
          "phonetic_script": "te",
          "pronounced_as": "te",
          "orthographic_rule_note": null,
          "lemma": "て",
          "pos": "PART",
          "sub_pos": "接続助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "tangan"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 4,
          "surface": "ごめん",
          "display_parts": [
            {
              "text": "ごめん",
              "ruby": null
            }
          ],
          "phonetic_script": "gomen",
          "pronounced_as": "gomen",
          "orthographic_rule_note": null,
          "lemma": "ごめん",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Maaf"
          ],
          "linked_token_ids": []
        }
      ]
    },
    {
      "index": 45,
      "start_ms": 184820,
      "end_ms": 188440,
      "original_text": "人生楽しんでごめん",
      "translated_text": "Maaf karena menikmati hidup",
      "translation_failed": false,
      "is_i_plus_one": false,
      "tokens": [
        {
          "token_id": 0,
          "surface": "人生",
          "display_parts": [
            {
              "text": "人生",
              "ruby": "じんせい"
            }
          ],
          "phonetic_script": "jinsei",
          "pronounced_as": "jinsei",
          "orthographic_rule_note": null,
          "lemma": "人生",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "kehidupan"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 1,
          "surface": "楽しん",
          "display_parts": [
            {
              "text": "楽",
              "ruby": "たの"
            },
            {
              "text": "しん",
              "ruby": null
            }
          ],
          "phonetic_script": "tanoshin",
          "pronounced_as": "tanoshin",
          "orthographic_rule_note": null,
          "lemma": "楽しむ",
          "pos": "VERB",
          "sub_pos": "一般",
          "inflection_chain": [
            "Bentuk Ren'youkei (Masu-stem)"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "menikmati"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 2,
          "surface": "で",
          "display_parts": [
            {
              "text": "で",
              "ruby": null
            }
          ],
          "phonetic_script": "de",
          "pronounced_as": "de",
          "orthographic_rule_note": null,
          "lemma": "で",
          "pos": "PART",
          "sub_pos": "接続助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "di dalam"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 3,
          "surface": "ごめん",
          "display_parts": [
            {
              "text": "ごめん",
              "ruby": null
            }
          ],
          "phonetic_script": "gomen",
          "pronounced_as": "gomen",
          "orthographic_rule_note": null,
          "lemma": "ごめん",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Maaf"
          ],
          "linked_token_ids": []
        }
      ]
    },
    {
      "index": 46,
      "start_ms": 188440,
      "end_ms": 190970,
      "original_text": "チュ！ 可愛くてごめん",
      "translated_text": "Chu! Maaf karena bersikap manis",
      "translation_failed": false,
      "is_i_plus_one": false,
      "tokens": [
        {
          "token_id": 0,
          "surface": "チュ",
          "display_parts": [
            {
              "text": "チュ",
              "ruby": null
            }
          ],
          "phonetic_script": "chu",
          "pronounced_as": "chu",
          "orthographic_rule_note": null,
          "lemma": "チュ",
          "pos": "NOUN",
          "sub_pos": "固有名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [],
          "linked_token_ids": []
        },
        {
          "token_id": 1,
          "surface": "！",
          "display_parts": [
            {
              "text": "！",
              "ruby": null
            }
          ],
          "phonetic_script": "!",
          "pronounced_as": "!",
          "orthographic_rule_note": null,
          "lemma": "!",
          "pos": "PUNCT",
          "sub_pos": "句点",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "!"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 2,
          "surface": "可愛く",
          "display_parts": [
            {
              "text": "可愛",
              "ruby": "かわい"
            },
            {
              "text": "く",
              "ruby": null
            }
          ],
          "phonetic_script": "kawaiku",
          "pronounced_as": "kawaiku",
          "orthographic_rule_note": null,
          "lemma": "可愛い",
          "pos": "ADJ",
          "sub_pos": "一般",
          "inflection_chain": [
            "Bentuk Ren'youkei (Masu-stem)"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "imut-imut"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 3,
          "surface": "て",
          "display_parts": [
            {
              "text": "て",
              "ruby": null
            }
          ],
          "phonetic_script": "te",
          "pronounced_as": "te",
          "orthographic_rule_note": null,
          "lemma": "て",
          "pos": "PART",
          "sub_pos": "接続助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "tangan"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 4,
          "surface": "ごめん",
          "display_parts": [
            {
              "text": "ごめん",
              "ruby": null
            }
          ],
          "phonetic_script": "gomen",
          "pronounced_as": "gomen",
          "orthographic_rule_note": null,
          "lemma": "ごめん",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Maaf"
          ],
          "linked_token_ids": []
        }
      ]
    },
    {
      "index": 47,
      "start_ms": 190970,
      "end_ms": 194060,
      "original_text": "努力しちゃっててごめん",
      "translated_text": "Maaf karena sudah berusaha keras",
      "translation_failed": false,
      "is_i_plus_one": false,
      "tokens": [
        {
          "token_id": 0,
          "surface": "努力",
          "display_parts": [
            {
              "text": "努力",
              "ruby": "どりょく"
            }
          ],
          "phonetic_script": "doryoku",
          "pronounced_as": "doryoku",
          "orthographic_rule_note": null,
          "lemma": "努力",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "upaya"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 1,
          "surface": "し",
          "display_parts": [
            {
              "text": "し",
              "ruby": null
            }
          ],
          "phonetic_script": "shi",
          "pronounced_as": "shi",
          "orthographic_rule_note": null,
          "lemma": "する",
          "pos": "VERB",
          "sub_pos": "非自立可能",
          "inflection_chain": [
            "Bentuk Ren'youkei (Masu-stem)"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Mengerjakan"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 2,
          "surface": "ちゃっ",
          "display_parts": [
            {
              "text": "ちゃっ",
              "ruby": null
            }
          ],
          "phonetic_script": "cha",
          "pronounced_as": "cha",
          "orthographic_rule_note": null,
          "lemma": "ちゃう",
          "pos": "AUX",
          "sub_pos": "*",
          "inflection_chain": [
            "Bentuk Ren'youkei (Masu-stem)"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Ayo pergi"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 3,
          "surface": "て",
          "display_parts": [
            {
              "text": "て",
              "ruby": null
            }
          ],
          "phonetic_script": "te",
          "pronounced_as": "te",
          "orthographic_rule_note": null,
          "lemma": "てる",
          "pos": "AUX",
          "sub_pos": "*",
          "inflection_chain": [
            "Bentuk Ren'youkei (Masu-stem)"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Teru"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 4,
          "surface": "て",
          "display_parts": [
            {
              "text": "て",
              "ruby": null
            }
          ],
          "phonetic_script": "te",
          "pronounced_as": "te",
          "orthographic_rule_note": null,
          "lemma": "て",
          "pos": "PART",
          "sub_pos": "接続助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "tangan"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 5,
          "surface": "ごめん",
          "display_parts": [
            {
              "text": "ごめん",
              "ruby": null
            }
          ],
          "phonetic_script": "gomen",
          "pronounced_as": "gomen",
          "orthographic_rule_note": null,
          "lemma": "ごめん",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Maaf"
          ],
          "linked_token_ids": []
        }
      ]
    },
    {
      "index": 48,
      "start_ms": 194060,
      "end_ms": 196930,
      "original_text": "チュ！ 尊くてごめん",
      "translated_text": "Chu! Maaf karena begitu berharga",
      "translation_failed": false,
      "is_i_plus_one": false,
      "tokens": [
        {
          "token_id": 0,
          "surface": "チュ",
          "display_parts": [
            {
              "text": "チュ",
              "ruby": null
            }
          ],
          "phonetic_script": "chu",
          "pronounced_as": "chu",
          "orthographic_rule_note": null,
          "lemma": "チュ",
          "pos": "NOUN",
          "sub_pos": "固有名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [],
          "linked_token_ids": []
        },
        {
          "token_id": 1,
          "surface": "！",
          "display_parts": [
            {
              "text": "！",
              "ruby": null
            }
          ],
          "phonetic_script": "!",
          "pronounced_as": "!",
          "orthographic_rule_note": null,
          "lemma": "!",
          "pos": "PUNCT",
          "sub_pos": "句点",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "!"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 2,
          "surface": "尊く",
          "display_parts": [
            {
              "text": "尊",
              "ruby": "とうと"
            },
            {
              "text": "く",
              "ruby": null
            }
          ],
          "phonetic_script": "toutoku",
          "pronounced_as": "toutoku",
          "orthographic_rule_note": null,
          "lemma": "尊い",
          "pos": "ADJ",
          "sub_pos": "一般",
          "inflection_chain": [
            "Bentuk Ren'youkei (Masu-stem)"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "berharga"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 3,
          "surface": "て",
          "display_parts": [
            {
              "text": "て",
              "ruby": null
            }
          ],
          "phonetic_script": "te",
          "pronounced_as": "te",
          "orthographic_rule_note": null,
          "lemma": "て",
          "pos": "PART",
          "sub_pos": "接続助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "tangan"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 4,
          "surface": "ごめん",
          "display_parts": [
            {
              "text": "ごめん",
              "ruby": null
            }
          ],
          "phonetic_script": "gomen",
          "pronounced_as": "gomen",
          "orthographic_rule_note": null,
          "lemma": "ごめん",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Maaf"
          ],
          "linked_token_ids": []
        }
      ]
    },
    {
      "index": 49,
      "start_ms": 196930,
      "end_ms": 199920,
      "original_text": "女子力高くてごめん",
      "translated_text": "Maaf karena terlalu feminin",
      "translation_failed": false,
      "is_i_plus_one": false,
      "tokens": [
        {
          "token_id": 0,
          "surface": "女子力",
          "display_parts": [
            {
              "text": "女子力",
              "ruby": "じょしりょく"
            }
          ],
          "phonetic_script": "joshiryoku",
          "pronounced_as": "joshiryoku",
          "orthographic_rule_note": null,
          "lemma": "女子力",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "kekuatan gadis"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 1,
          "surface": "高く",
          "display_parts": [
            {
              "text": "高",
              "ruby": "たか"
            },
            {
              "text": "く",
              "ruby": null
            }
          ],
          "phonetic_script": "takaku",
          "pronounced_as": "takaku",
          "orthographic_rule_note": null,
          "lemma": "高い",
          "pos": "ADJ",
          "sub_pos": "一般",
          "inflection_chain": [
            "Bentuk Ren'youkei (Masu-stem)"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "mahal"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 2,
          "surface": "て",
          "display_parts": [
            {
              "text": "て",
              "ruby": null
            }
          ],
          "phonetic_script": "te",
          "pronounced_as": "te",
          "orthographic_rule_note": null,
          "lemma": "て",
          "pos": "PART",
          "sub_pos": "接続助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "tangan"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 3,
          "surface": "ごめん",
          "display_parts": [
            {
              "text": "ごめん",
              "ruby": null
            }
          ],
          "phonetic_script": "gomen",
          "pronounced_as": "gomen",
          "orthographic_rule_note": null,
          "lemma": "ごめん",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Maaf"
          ],
          "linked_token_ids": []
        }
      ]
    },
    {
      "index": 50,
      "start_ms": 199920,
      "end_ms": 203920,
      "original_text": "ムカついちゃうよね？ ざまあ",
      "translated_text": "Itu menjengkelkan, bukan? Zamaa",
      "translation_failed": false,
      "is_i_plus_one": false,
      "tokens": [
        {
          "token_id": 0,
          "surface": "ムカつい",
          "display_parts": [
            {
              "text": "ムカつい",
              "ruby": null
            }
          ],
          "phonetic_script": "mukatsui",
          "pronounced_as": "mukatsui",
          "orthographic_rule_note": null,
          "lemma": "ムカつく",
          "pos": "VERB",
          "sub_pos": "一般",
          "inflection_chain": [
            "Bentuk Ren'youkei (Masu-stem)"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [],
          "linked_token_ids": []
        },
        {
          "token_id": 1,
          "surface": "ちゃう",
          "display_parts": [
            {
              "text": "ちゃう",
              "ruby": null
            }
          ],
          "phonetic_script": "chau",
          "pronounced_as": "chau",
          "orthographic_rule_note": null,
          "lemma": "ちゃう",
          "pos": "AUX",
          "sub_pos": "*",
          "inflection_chain": [
            "五段-ワア行: 終止形-一般"
          ],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Ayo pergi"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 2,
          "surface": "よ",
          "display_parts": [
            {
              "text": "よ",
              "ruby": null
            }
          ],
          "phonetic_script": "yo",
          "pronounced_as": "yo",
          "orthographic_rule_note": null,
          "lemma": "よ",
          "pos": "PART",
          "sub_pos": "終助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Yo"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 3,
          "surface": "ね",
          "display_parts": [
            {
              "text": "ね",
              "ruby": null
            }
          ],
          "phonetic_script": "ne",
          "pronounced_as": "ne",
          "orthographic_rule_note": null,
          "lemma": "ね",
          "pos": "PART",
          "sub_pos": "終助詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "Hai"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 4,
          "surface": "？",
          "display_parts": [
            {
              "text": "？",
              "ruby": null
            }
          ],
          "phonetic_script": "?",
          "pronounced_as": "?",
          "orthographic_rule_note": null,
          "lemma": "?",
          "pos": "PUNCT",
          "sub_pos": "句点",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [
            "?"
          ],
          "linked_token_ids": []
        },
        {
          "token_id": 5,
          "surface": "ざま",
          "display_parts": [
            {
              "text": "ざま",
              "ruby": null
            }
          ],
          "phonetic_script": "zama",
          "pronounced_as": "zama",
          "orthographic_rule_note": null,
          "lemma": "ざま",
          "pos": "NOUN",
          "sub_pos": "普通名詞",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [],
          "linked_token_ids": []
        },
        {
          "token_id": 6,
          "surface": "あ",
          "display_parts": [
            {
              "text": "あ",
              "ruby": null
            }
          ],
          "phonetic_script": "a",
          "pronounced_as": "a",
          "orthographic_rule_note": null,
          "lemma": "あ",
          "pos": "OTHER",
          "sub_pos": "フィラー",
          "inflection_chain": [],
          "root": null,
          "gender": null,
          "tone_or_pitch": null,
          "proficiency_tag": null,
          "meanings": [],
          "linked_token_ids": []
        }
      ]
    }
  ]
};
    }

    if (isSpotify && isYoasobi) {
      return {
        video_id: 'by4SYYWlhEs',
        title: '夜に駆ける (Yoru ni Kakeru)',
        channel: 'YOASOBI',
        language: 'ja',
        writing_direction: 'ltr',
        source_type: 'spotify',
        duration_ms: 261000,
        duration: 261,
        spotify_id: '4Mo0vn7a03pJ19uESUrH5a',
        spotify_embed_url: 'https://open.spotify.com/embed/track/4Mo0vn7a03pJ19uESUrH5a',
        thumbnail_url: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02baf89eb11ec7c657805d2da0',
        artist: 'YOASOBI',
        segments: [
          {
            index: 0,
            start_ms: 1400,
            end_ms: 5800,
            original_text: '沈むように溶けてゆくように',
            translated_text: 'Seolah tenggelam dan seolah meleleh',
            tokens: [
              {
                token_id: 0,
                surface: '沈む',
                display_parts: [{ text: '沈', ruby: 'しず' }, { text: 'む', ruby: null }],
                phonetic_script: 'shizumu',
                pronounced_as: 'shizumu',
                lemma: '沈む',
                pos: 'VERB',
                meanings: ['tenggelam', 'tenggelam ke bawah']
              },
              {
                token_id: 1,
                surface: 'ように',
                display_parts: [{ text: 'ように', ruby: null }],
                phonetic_script: 'youni',
                pronounced_as: 'youni',
                lemma: 'ようだ',
                pos: 'AUX',
                meanings: ['seperti', 'seolah-olah']
              },
              {
                token_id: 2,
                surface: '溶けて',
                display_parts: [{ text: '溶', ruby: 'と' }, { text: 'けて', ruby: null }],
                phonetic_script: 'tokete',
                pronounced_as: 'tokete',
                lemma: '溶ける',
                pos: 'VERB',
                meanings: ['meleleh', 'larut']
              },
              {
                token_id: 3,
                surface: 'ゆく',
                display_parts: [{ text: 'ゆく', ruby: null }],
                phonetic_script: 'yuku',
                pronounced_as: 'yuku',
                lemma: 'いく',
                pos: 'VERB',
                meanings: ['pergi', 'berlalu']
              },
              {
                token_id: 4,
                surface: 'ように',
                display_parts: [{ text: 'ように', ruby: null }],
                phonetic_script: 'youni',
                pronounced_as: 'youni',
                lemma: 'ようだ',
                pos: 'AUX',
                meanings: ['seperti', 'seolah']
              }
            ]
          },
          {
            index: 1,
            start_ms: 5800,
            end_ms: 10500,
            original_text: '二人だけの空が広がる夜に',
            translated_text: 'Pada malam saat langit terbentang hanya untuk kita berdua',
            tokens: [
              {
                token_id: 0,
                surface: '二人',
                display_parts: [{ text: '二人', ruby: 'ふたり' }],
                phonetic_script: 'futari',
                pronounced_as: 'futari',
                lemma: '二人',
                pos: 'NOUN',
                meanings: ['dua orang', 'kita berdua']
              },
              {
                token_id: 1,
                surface: 'だけ',
                display_parts: [{ text: 'だけ', ruby: null }],
                phonetic_script: 'dake',
                pronounced_as: 'dake',
                lemma: 'だけ',
                pos: 'PART',
                meanings: ['hanya', 'saja']
              },
              {
                token_id: 2,
                surface: 'の',
                display_parts: [{ text: 'の', ruby: null }],
                phonetic_script: 'no',
                pronounced_as: 'no',
                lemma: 'の',
                pos: 'PART',
                meanings: ['partikel kepemilikan']
              },
              {
                token_id: 3,
                surface: '空',
                display_parts: [{ text: '空', ruby: 'そら' }],
                phonetic_script: 'sora',
                pronounced_as: 'sora',
                lemma: '空',
                pos: 'NOUN',
                meanings: ['langit', 'angkasa']
              },
              {
                token_id: 4,
                surface: 'が',
                display_parts: [{ text: 'が', ruby: null }],
                phonetic_script: 'ga',
                pronounced_as: 'ga',
                lemma: 'が',
                pos: 'PART',
                meanings: ['partikel subjek']
              },
              {
                token_id: 5,
                surface: '広がる',
                display_parts: [{ text: '広', ruby: 'ひろ' }, { text: 'がる', ruby: null }],
                phonetic_script: 'hirogaru',
                pronounced_as: 'hirogaru',
                lemma: '広がる',
                pos: 'VERB',
                meanings: ['membentang', 'meluas']
              },
              {
                token_id: 6,
                surface: '夜',
                display_parts: [{ text: '夜', ruby: 'よる' }],
                phonetic_script: 'yoru',
                pronounced_as: 'yoru',
                lemma: '夜',
                pos: 'NOUN',
                meanings: ['malam', 'malam hari']
              },
              {
                token_id: 7,
                surface: 'に',
                display_parts: [{ text: 'に', ruby: null }],
                phonetic_script: 'ni',
                pronounced_as: 'ni',
                lemma: 'に',
                pos: 'PART',
                meanings: ['pada', 'di']
              }
            ]
          },
          {
            index: 2,
            start_ms: 10500,
            end_ms: 17200,
            original_text: '「さよなら」だけだった その一言で全てが伝わった',
            translated_text: 'Hanya ada kata "selamat tinggal", dalam sepatah kata itu segalanya tersampaikan',
            tokens: [
              {
                token_id: 0,
                surface: 'さよなら',
                display_parts: [{ text: 'さよなら', ruby: null }],
                phonetic_script: 'sayonara',
                pronounced_as: 'sayonara',
                lemma: 'さよなら',
                pos: 'NOUN',
                meanings: ['selamat tinggal', 'perpisahan']
              },
              {
                token_id: 1,
                surface: 'だけ',
                display_parts: [{ text: 'だけ', ruby: null }],
                phonetic_script: 'dake',
                pronounced_as: 'dake',
                lemma: 'だけ',
                pos: 'PART',
                meanings: ['hanya']
              },
              {
                token_id: 2,
                surface: 'だった',
                display_parts: [{ text: 'だった', ruby: null }],
                phonetic_script: 'datta',
                pronounced_as: 'datta',
                lemma: 'だ',
                pos: 'AUX',
                meanings: ['bentuk lampau dari adalah']
              },
              {
                token_id: 3,
                surface: 'その',
                display_parts: [{ text: 'その', ruby: null }],
                phonetic_script: 'sono',
                pronounced_as: 'sono',
                lemma: 'その',
                pos: 'ADJ',
                meanings: ['itu']
              },
              {
                token_id: 4,
                surface: '一言',
                display_parts: [{ text: '一言', ruby: 'ひとこと' }],
                phonetic_script: 'hitokoto',
                pronounced_as: 'hitokoto',
                lemma: '一言',
                pos: 'NOUN',
                meanings: ['sepatah kata', 'satu kalimat']
              },
              {
                token_id: 5,
                surface: 'で',
                display_parts: [{ text: 'で', ruby: null }],
                phonetic_script: 'de',
                pronounced_as: 'de',
                lemma: 'で',
                pos: 'PART',
                meanings: ['dengan', 'melalui']
              },
              {
                token_id: 6,
                surface: '全て',
                display_parts: [{ text: '全', ruby: 'すべ' }, { text: 'て', ruby: null }],
                phonetic_script: 'subete',
                pronounced_as: 'subete',
                lemma: '全て',
                pos: 'NOUN',
                meanings: ['segalanya', 'semua hal']
              },
              {
                token_id: 7,
                surface: 'が',
                display_parts: [{ text: 'が', ruby: null }],
                phonetic_script: 'ga',
                pronounced_as: 'ga',
                lemma: 'が',
                pos: 'PART',
                meanings: ['partikel subjek']
              },
              {
                token_id: 8,
                surface: '伝わった',
                display_parts: [{ text: '伝', ruby: 'つた' }, { text: 'わった', ruby: null }],
                phonetic_script: 'tsutawatta',
                pronounced_as: 'tsutawatta',
                lemma: '伝わる',
                pos: 'VERB',
                meanings: ['tersampaikan', 'terpahami']
              }
            ]
          },
          {
            index: 3,
            start_ms: 17500,
            end_ms: 23000,
            original_text: '日が沈み出した空と君の姿',
            translated_text: 'Sosokmu dan langit saat matahari mulai terbenam',
            tokens: [
              {
                token_id: 0,
                surface: '日',
                display_parts: [{ text: '日', ruby: 'ひ' }],
                phonetic_script: 'hi',
                pronounced_as: 'hi',
                lemma: '日',
                pos: 'NOUN',
                meanings: ['matahari', 'siang']
              },
              {
                token_id: 1,
                surface: 'が',
                display_parts: [{ text: 'が', ruby: null }],
                phonetic_script: 'ga',
                pronounced_as: 'ga',
                lemma: 'が',
                pos: 'PART',
                meanings: ['partikel subjek']
              },
              {
                token_id: 2,
                surface: '沈み出した',
                display_parts: [{ text: '沈', ruby: 'しず' }, { text: 'み', ruby: null }, { text: '出', ruby: 'だ' }, { text: 'した', ruby: null }],
                phonetic_script: 'shizumidashita',
                pronounced_as: 'shizumidashita',
                lemma: '沈み出す',
                pos: 'VERB',
                meanings: ['mulai tenggelam']
              },
              {
                token_id: 3,
                surface: '空',
                display_parts: [{ text: '空', ruby: 'そら' }],
                phonetic_script: 'sora',
                pronounced_as: 'sora',
                lemma: '空',
                pos: 'NOUN',
                meanings: ['langit']
              },
              {
                token_id: 4,
                surface: 'と',
                display_parts: [{ text: 'と', ruby: null }],
                phonetic_script: 'to',
                pronounced_as: 'to',
                lemma: 'と',
                pos: 'PART',
                meanings: ['dan', 'bersama']
              },
              {
                token_id: 5,
                surface: '君',
                display_parts: [{ text: '君', ruby: 'きみ' }],
                phonetic_script: 'kimi',
                pronounced_as: 'kimi',
                lemma: '君',
                pos: 'PRON',
                meanings: ['kamu', 'engkau']
              },
              {
                token_id: 6,
                surface: 'の',
                display_parts: [{ text: 'の', ruby: null }],
                phonetic_script: 'no',
                pronounced_as: 'no',
                lemma: 'の',
                pos: 'PART',
                meanings: ['partikel kepemilikan']
              },
              {
                token_id: 7,
                surface: '姿',
                display_parts: [{ text: '姿', ruby: 'すがた' }],
                phonetic_script: 'sugata',
                pronounced_as: 'sugata',
                lemma: '姿',
                pos: 'NOUN',
                meanings: ['sosok', 'wujud']
              }
            ]
          }
        ]
      };
    }

    // Default YouTube Anime Demo (Gunakan video ID dari URL jika ada, atau klip anime percakapan 9bZkp7q19f0)
    let fallbackVideoId = '9bZkp7q19f0';
    if (url) {
      const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/);
      if (match && match[1]) {
        fallbackVideoId = match[1];
      }
    }

    return {
      video_id: fallbackVideoId,
      title: 'Anime Dialogue Japanese Immersion Demo',
      channel: 'Anime Immersion Audio',
      language: targetLang,
      writing_direction: 'ltr',
      source_type: 'demo',
      segments: [
        {
          index: 0,
          start_ms: 1000,
          end_ms: 4500,
          original_text: 'こんにちは、日本語の勉強を始めましょう。',
          translated_text: 'Halo, mari kita mulai belajar bahasa Jepang.',
          tokens: [
            {
              token_id: 0,
              surface: 'こんにちは',
              display_parts: [{ text: 'こんにちは', ruby: null }],
              phonetic_script: 'konnichiwa',
              pronounced_as: 'konnichiwa',
              lemma: 'こんにちは',
              pos: 'NOUN',
              meanings: ['halo', 'selamat siang']
            },
            {
              token_id: 1,
              surface: '日本語',
              display_parts: [{ text: '日本語', ruby: 'にほんご' }],
              phonetic_script: 'nihongo',
              pronounced_as: 'nihongo',
              lemma: '日本語',
              pos: 'NOUN',
              meanings: ['bahasa Jepang']
            },
            {
              token_id: 2,
              surface: 'の',
              display_parts: [{ text: 'の', ruby: null }],
              phonetic_script: 'no',
              pronounced_as: 'no',
              lemma: 'の',
              pos: 'PART',
              meanings: ['partikel kepemilikan']
            },
            {
              token_id: 3,
              surface: '勉強',
              display_parts: [{ text: '勉強', ruby: 'べんきょう' }],
              phonetic_script: 'benkyou',
              pronounced_as: 'benkyou',
              lemma: '勉強',
              pos: 'NOUN',
              meanings: ['belajar', 'studi']
            },
            {
              token_id: 4,
              surface: 'を',
              display_parts: [{ text: 'を', ruby: null }],
              phonetic_script: 'o',
              pronounced_as: 'o',
              orthographic_rule_note: 'Partikel Objek: Huruf を berfungsi sebagai penanda objek langsung dan dilafalkan "o".',
              lemma: 'を',
              pos: 'PART',
              meanings: ['partikel objek (dibaca "o")']
            },
            {
              token_id: 5,
              surface: '始めましょう',
              display_parts: [{ text: '始', ruby: 'はじ' }, { text: 'めましょう', ruby: null }],
              phonetic_script: 'hajimemashou',
              pronounced_as: 'hajimemashou',
              lemma: '始める',
              pos: 'VERB',
              inflection_chain: ['Bentuk Ajakan Sopan (Volitional)'],
              meanings: ['mari memulai']
            }
          ]
        },
        {
          index: 1,
          start_ms: 5000,
          end_ms: 9500,
          original_text: '私は毎日友達と一緒に美味しいご飯を食べます。',
          translated_text: 'Setiap hari saya makan nasi lezat bersama teman.',
          tokens: [
            {
              token_id: 0,
              surface: '私',
              display_parts: [{ text: '私', ruby: 'わたし' }],
              phonetic_script: 'watashi',
              pronounced_as: 'watashi',
              lemma: '私',
              pos: 'PRON',
              meanings: ['saya', 'aku']
            },
            {
              token_id: 1,
              surface: 'は',
              display_parts: [{ text: 'は', ruby: null }],
              phonetic_script: 'wa',
              pronounced_as: 'wa',
              orthographic_rule_note: 'Partikel Topik: Huruf は ketika berfungsi sebagai partikel topik selalu dilafalkan "wa", bukan "ha".',
              lemma: 'は',
              pos: 'PART',
              meanings: ['partikel topik (dibaca "wa")']
            },
            {
              token_id: 2,
              surface: '毎日',
              display_parts: [{ text: '毎日', ruby: 'まいにち' }],
              phonetic_script: 'mainichi',
              pronounced_as: 'mainichi',
              lemma: '毎日',
              pos: 'NOUN',
              meanings: ['setiap hari']
            },
            {
              token_id: 3,
              surface: '友達',
              display_parts: [{ text: '友達', ruby: 'ともだち' }],
              phonetic_script: 'tomodachi',
              pronounced_as: 'tomodachi',
              lemma: '友達',
              pos: 'NOUN',
              meanings: ['teman', 'sahabat']
            },
            {
              token_id: 4,
              surface: 'と',
              display_parts: [{ text: 'と', ruby: null }],
              phonetic_script: 'to',
              pronounced_as: 'to',
              lemma: 'と',
              pos: 'PART',
              meanings: ['bersama', 'dengan']
            },
            {
              token_id: 5,
              surface: '一緒',
              display_parts: [{ text: '一緒', ruby: 'いっしょ' }],
              phonetic_script: 'issho',
              pronounced_as: 'issho',
              lemma: '一緒',
              pos: 'NOUN',
              meanings: ['bersama-sama']
            },
            {
              token_id: 6,
              surface: 'に',
              display_parts: [{ text: 'に', ruby: null }],
              phonetic_script: 'ni',
              pronounced_as: 'ni',
              lemma: 'に',
              pos: 'PART',
              meanings: ['partikel tujuan']
            },
            {
              token_id: 7,
              surface: '美味しい',
              display_parts: [{ text: '美味', ruby: 'おい' }, { text: 'しい', ruby: null }],
              phonetic_script: 'oishii',
              pronounced_as: 'oishii',
              lemma: '美味しい',
              pos: 'ADJ',
              meanings: ['enak', 'lezat']
            },
            {
              token_id: 8,
              surface: 'ご飯',
              display_parts: [{ text: 'ご飯', ruby: 'ごはん' }],
              phonetic_script: 'gohan',
              pronounced_as: 'gohan',
              lemma: 'ご飯',
              pos: 'NOUN',
              meanings: ['nasi', 'makanan']
            },
            {
              token_id: 9,
              surface: 'を',
              display_parts: [{ text: 'を', ruby: null }],
              phonetic_script: 'o',
              pronounced_as: 'o',
              orthographic_rule_note: 'Partikel Objek: Huruf を berfungsi sebagai penanda objek langsung dan dilafalkan "o".',
              lemma: 'を',
              pos: 'PART',
              meanings: ['partikel objek (dibaca "o")']
            },
            {
              token_id: 10,
              surface: '食べます',
              display_parts: [{ text: '食', ruby: 'た' }, { text: 'べます', ruby: null }],
              phonetic_script: 'tabemasu',
              pronounced_as: 'tabemasu',
              lemma: '食べる',
              pos: 'VERB',
              inflection_chain: ['Bentuk Formal Sopan (Teineigo)'],
              meanings: ['makan']
            }
          ]
        }
      ]
    };
  }
}

window.ApiService = ApiService;
