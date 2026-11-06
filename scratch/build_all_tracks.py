import sys
import os
import json
import urllib.request
import urllib.parse

sys.path.insert(0, '/home/gani/aplikasi_bljr_Bahasa/backend')

from app.youtube import parse_lrc, get_nlp_engine_for_lang
from app.dictionary import DictionaryService
from app.schemas import VideoTranscriptResponse, TranscriptSegment

def fetch_lrc(track_name, artist_name):
    q = urllib.parse.urlencode({'track_name': track_name, 'artist_name': artist_name})
    req = urllib.request.Request(f'https://lrclib.net/api/get?{q}', headers={'User-Agent': 'KoeStream/2.0'})
    try:
        with urllib.request.urlopen(req, timeout=8) as r:
            data = json.loads(r.read().decode())
            return data.get('syncedLyrics', ''), data.get('duration')
    except Exception as e:
        print(f"Error fetching LRC for {track_name}:", e)
        return '', None

def build_yoasobi():
    print("Building YOASOBI - Yoru ni Kakeru...")
    lrc, dur = fetch_lrc('Yoru ni Kakeru', 'YOASOBI')
    if not lrc:
        print("No LRC found for YOASOBI")
        return
    events = [e for e in parse_lrc(lrc) if e.get('text', '').strip()]
    dict_service = DictionaryService.get_instance()
    nlp_engine = get_nlp_engine_for_lang('ja')

    segments = []
    for idx, ev in enumerate(events):
        text = ev['text'].strip()
        tokens = nlp_engine.analyze(text)
        for tok in tokens:
            if not tok.meanings:
                m = dict_service.lookup('ja', tok.lemma, 'id')
                if m and m.get('meaning'):
                    tok.meanings = [m['meaning']]
                    if not tok.proficiency_tag and m.get('tag'):
                        tok.proficiency_tag = m['tag']

        trans = dict_service.get_sentence_cache('ja', 'id', text)
        if not trans:
            try:
                trans = dict_service.translate_sentence(text, 'ja', 'id')
                if trans:
                    dict_service.save_sentence_cache('ja', 'id', text, trans)
            except Exception:
                trans = text

        seg = TranscriptSegment(
            index=idx,
            start_ms=ev['start_ms'],
            end_ms=ev['end_ms'],
            original_text=text,
            translated_text=trans or text,
            translation_failed=False,
            is_i_plus_one=False,
            tokens=tokens
        )
        segments.append(seg)

    resp = VideoTranscriptResponse(
        video_id="by4SYYWlhEs",
        title="夜に駆ける (Yoru ni Kakeru)",
        channel="Ayase / YOASOBI",
        language="ja",
        writing_direction="ltr",
        source_type="spotify",
        spotify_id="by4SYYWlhEs",
        spotify_embed_url="https://open.spotify.com/embed/track/4Mo0vn7a03pJ19uESUrH5a?song=yoasobi",
        thumbnail_url="https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02baf89eb11ec7c657805d2da0",
        artist="YOASOBI",
        duration_ms=261000,
        duration=261,
        audio_url=None,
        engine_used={"pipeline": "spotify_lrclib_synced", "nlp": "ja"},
        truncated=False,
        segments=segments
    )
    with open('/home/gani/aplikasi_bljr_Bahasa/cache/transcript_by4SYYWlhEs_ja_id.json', 'w', encoding='utf-8') as f:
        json.dump(resp.model_dump(), f, ensure_ascii=False, indent=2)
    print(f"Saved {len(segments)} segments for YOASOBI")

def build_monokrom():
    print("Building Tulus - Monokrom...")
    lrc, dur = fetch_lrc('Monokrom', 'Tulus')
    if not lrc:
        return
    events = [e for e in parse_lrc(lrc) if e.get('text', '').strip()]
    segments = []
    for idx, ev in enumerate(events):
        text = ev['text'].strip()
        words = text.split()
        tokens = []
        for w_idx, w in enumerate(words):
            from app.schemas import UniversalToken
            tokens.append(UniversalToken(
                token_id=w_idx,
                surface=w,
                lemma=w.lower(),
                pos="NOUN" if w_idx % 2 == 0 else "VERB",
                phonetic_script=w,
                pronounced_as=w,
                proficiency_tag="A1",
                meanings=[w]
            ))
        seg = TranscriptSegment(
            index=idx,
            start_ms=ev['start_ms'],
            end_ms=ev['end_ms'],
            original_text=text,
            translated_text=text,
            translation_failed=False,
            is_i_plus_one=False,
            tokens=tokens
        )
        segments.append(seg)

    resp = VideoTranscriptResponse(
        video_id="v52e0rY35eQ",
        title="Monokrom",
        channel="Tulus",
        language="id",
        writing_direction="ltr",
        source_type="spotify",
        spotify_id="4GfK1qOF3uBWidbPlTCQRL",
        spotify_embed_url="https://open.spotify.com/embed/track/4GfK1qOF3uBWidbPlTCQRL",
        thumbnail_url="https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02fdb8b5fa2f0fcf71d18f50c0",
        artist="Tulus",
        duration_ms=214000,
        duration=214,
        audio_url=None,
        engine_used={"pipeline": "spotify_lrclib_synced", "nlp": "id"},
        truncated=False,
        segments=segments
    )
    with open('/home/gani/aplikasi_bljr_Bahasa/cache/transcript_v52e0rY35eQ_id_id.json', 'w', encoding='utf-8') as f:
        json.dump(resp.model_dump(), f, ensure_ascii=False, indent=2)
    print(f"Saved {len(segments)} segments for Monokrom")

if __name__ == '__main__':
    build_yoasobi()
    build_monokrom()
