import sys
import os
import json
import urllib.request
import urllib.parse

sys.path.insert(0, '/home/gani/aplikasi_bljr_Bahasa/backend')

from app.youtube import parse_lrc, get_nlp_engine_for_lang, YouTubePipelineService
from app.dictionary import DictionaryService
from app.schemas import VideoTranscriptResponse, TranscriptSegment
import yt_dlp

def build_sparkle():
    print("Building Sparkle (06:50)...")
    # 1. Fetch LRCLIB synced lyrics
    q = urllib.parse.urlencode({'track_name': 'Sparkle', 'artist_name': 'RADWIMPS'})
    req = urllib.request.Request(f'https://lrclib.net/api/get?{q}', headers={'User-Agent': 'KoeStream/2.0'})
    with urllib.request.urlopen(req) as r:
        data = json.loads(r.read().decode())
        lrc = data.get('syncedLyrics', '')

    events = parse_lrc(lrc)
    events = [e for e in events if e.get('text', '').strip()]

    # 2. Fetch Indonesian subs from YouTube -pHfPJGatgE for matching translation
    svc = YouTubePipelineService()
    subs_id = []
    with yt_dlp.YoutubeDL({'quiet': True, 'skip_download': True}) as ydl:
        info = ydl.extract_info('https://www.youtube.com/watch?v=-pHfPJGatgE', download=False)
        raw_id = svc._layer1_manual_subtitles(ydl, info, 'id')
        if raw_id:
            subs_id = [s for s in raw_id if s.get('text') and not s['text'].startswith('(translate')]

    dict_service = DictionaryService.get_instance()
    nlp_engine = get_nlp_engine_for_lang('ja')

    segments = []
    for idx, ev in enumerate(events):
        text = ev['text'].strip()
        s_ms = ev['start_ms']
        e_ms = ev['end_ms']

        # Find best Indonesian subtitle by time overlap
        matched_trans = ""
        for s in subs_id:
            overlap = max(0, min(e_ms, s['end_ms']) - max(s_ms, s['start_ms']))
            if overlap > 500 or (abs(s['start_ms'] - s_ms) < 2000):
                matched_trans = s['text']
                break

        if not matched_trans:
            trans = dict_service.get_sentence_cache('ja', 'id', text)
            if not trans:
                try:
                    trans = dict_service.translate_sentence(text, 'ja', 'id')
                    if trans:
                        dict_service.save_sentence_cache('ja', 'id', text, trans)
                except Exception:
                    trans = text
            matched_trans = trans or text

        # Tokenize with Sudachi + Kakasi
        tokens = nlp_engine.analyze(text)
        for tok in tokens:
            if not tok.meanings:
                m = dict_service.lookup('ja', tok.lemma, 'id')
                if m and m.get('meaning'):
                    tok.meanings = [m['meaning']]
                    if not tok.proficiency_tag and m.get('tag'):
                        tok.proficiency_tag = m['tag']

        seg = TranscriptSegment(
            index=idx,
            start_ms=s_ms,
            end_ms=e_ms,
            original_text=text,
            translated_text=matched_trans,
            translation_failed=False,
            is_i_plus_one=False,
            tokens=tokens
        )
        segments.append(seg)

    response = VideoTranscriptResponse(
        video_id="-pHfPJGatgE",
        title="スパークル (Sparkle) - Original Version",
        channel="RADWIMPS",
        language="ja",
        writing_direction="ltr",
        source_type="spotify",
        spotify_id="1HNvADmPBGAExeyIHkcJtd",
        spotify_embed_url="https://open.spotify.com/embed/track/1HNvADmPBGAExeyIHkcJtd?utm_source=generator&theme=0",
        thumbnail_url="https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e0285b0876389c92ac31f514593",
        artist="RADWIMPS",
        duration_ms=410000,
        duration=410,
        audio_url=None,
        engine_used={
            "pipeline": "spotify_lrclib_synced",
            "nlp": "ja",
            "tokenizer": "sudachipy_mode_c",
            "phonetics": "pykakasi",
            "pitch": "real_ojad_lexicon"
        },
        truncated=False,
        segments=segments
    )

    data_dict = response.model_dump()
    paths = [
        '/home/gani/aplikasi_bljr_Bahasa/cache/transcript_-pHfPJGatgE_ja_id.json',
        '/home/gani/aplikasi_bljr_Bahasa/cache/transcript_1HNvADmPBGAExeyIHkcJtd_ja_id.json'
    ]
    for p in paths:
        with open(p, 'w', encoding='utf-8') as f:
            json.dump(data_dict, f, ensure_ascii=False, indent=2)
        print(f"Saved {len(segments)} segments to {p}")

if __name__ == '__main__':
    build_sparkle()
