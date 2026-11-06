/**
 * KoeStream Universal - Main Application Logic
 * Full-featured Web Edition supporting both YouTube and Spotify media sources.
 */

class KoeStreamApp {
  constructor() {
    this.api = new ApiService();
    this.fsrs = new FSRSMath();
    
    // Application State
    this.videoResponse = null;
    this.currentSegmentIndex = 0;
    this.currentPositionMs = 0;
    this.activeTokenId = null;
    
    this.targetLang = localStorage.getItem('koestream_target_lang') || 'ja';
    this.nativeLang = 'id';
    
    this.isRubyVisible = localStorage.getItem('koestream_ruby_visible') !== 'false';
    this.showRomaji = localStorage.getItem('koestream_show_romaji') !== 'false';
    this.filterIPlusOneOnly = false;
    this.isLoopActive = false;
    this.loopSegmentIndex = -1;
    this.playbackSpeed = 1.0;
    this.autoScroll = true;
    this.isDarkMode = localStorage.getItem('koestream_theme') !== 'light';

    // Lyric Sync Calibration Offset (ms) per song
    this.currentSongSyncOffsetMs = 0;

    // Video & Theater Mode Display State
    this.isVideoMode = false;
    this.isTheaterMode = false;

    // Current Player Engine: 'youtube' | 'spotify'
    this.currentEngine = 'spotify';
    this.ytPlayer = null;
    this.isYtReady = false;
    this.spotifyTimer = null;
    this.isSpotifyPlaying = false;
    this.spotifyDurationMs = 180000;
    this.spotifyAudio = null;

    // Dedicated Platform Separation State
    this.activePlatformMode = 'spotify';
    this.playlistPlatformFilter = 'all';
    this.modalPlatformSource = 'spotify';

    // Local Storage State
    this.masteredLemmas = new Set(JSON.parse(localStorage.getItem('koestream_mastered_lemmas') || '[]'));
    this.flashcards = JSON.parse(localStorage.getItem('koestream_flashcards') || '[]');

    // Active Modal Token/Segment
    this.activeDictToken = null;
    this.activeDictSegment = null;

    // Review Modal State
    this.reviewQueue = [];
    this.currentReviewIndex = 0;
    this.isCardFlipped = false;

    // Shadowing Studio
    this.shadowingStudio = null;
    this.activeShadowingSegment = null;

    this.init();
  }

  escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  init() {
    this.applyTheme();
    this.bindEvents();
    this.setupYouTubeAPI();
    this.updateSRSBadge();

    localStorage.removeItem('koestream_last_media');
    const initialUrl = 'https://open.spotify.com/track/2BlDX1yfT0ea5wo0vjCKKa';
    const isSp = initialUrl.includes('spotify.com') || initialUrl.startsWith('spotify_') || initialUrl.startsWith('spotify:');
    this.setPlatformMode(isSp ? 'spotify' : 'youtube');
    this.loadMedia(initialUrl, false);
  }

  setPlatformMode(platform) {
    this.activePlatformMode = platform;
    const btnSp = document.getElementById('btn-tab-spotify');
    const btnYt = document.getElementById('btn-tab-youtube');
    const input = document.getElementById('input-url');
    const capsule = document.getElementById('url-capsule');
    if (platform === 'spotify') {
      if (btnSp) btnSp.className = 'platform-tab-btn active spotify-tab';
      if (btnYt) btnYt.className = 'platform-tab-btn youtube-tab';
      if (capsule) {
        capsule.classList.add('spotify-focus');
        capsule.classList.remove('youtube-focus');
      }
      if (input) {
        input.placeholder = 'Tempel link Spotify (https://open.spotify.com/track/...)';
      }
    } else {
      if (btnSp) btnSp.className = 'platform-tab-btn spotify-tab';
      if (btnYt) btnYt.className = 'platform-tab-btn active youtube-tab';
      if (capsule) {
        capsule.classList.add('youtube-focus');
        capsule.classList.remove('spotify-focus');
      }
      if (input) {
        input.placeholder = 'Tempel link YouTube (https://www.youtube.com/watch?v=...)';
      }
    }
  }

  onUrlInputChanged(val) {
    const clean = (val || '').trim().toLowerCase();
    if (clean.includes('spotify.com') || clean.startsWith('spotify:') || clean.startsWith('spotify_')) {
      if (this.activePlatformMode !== 'spotify') {
        this.setPlatformMode('spotify');
      }
    } else if (clean.includes('youtube.com') || clean.includes('youtu.be')) {
      if (this.activePlatformMode !== 'youtube') {
        this.setPlatformMode('youtube');
      }
    }
  }

  setModalPlatformSource(platform) {
    this.modalPlatformSource = platform;
    const btnSp = document.getElementById('modal-tab-sp');
    const btnYt = document.getElementById('modal-tab-yt');
    const input = document.getElementById('modal-custom-url-input');
    if (platform === 'spotify') {
      if (btnSp) btnSp.className = 'modal-src-btn active spotify';
      if (btnYt) btnYt.className = 'modal-src-btn youtube';
      if (input) input.placeholder = 'Tempel link Spotify (https://open.spotify.com/track/...)';
    } else {
      if (btnSp) btnSp.className = 'modal-src-btn spotify';
      if (btnYt) btnYt.className = 'modal-src-btn active youtube';
      if (input) input.placeholder = 'Tempel link YouTube (https://www.youtube.com/watch?v=...)';
    }
  }

  setPlaylistPlatformFilter(filter) {
    this.playlistPlatformFilter = filter;
    const btnAll = document.getElementById('filter-tab-all');
    const btnSp = document.getElementById('filter-tab-spotify');
    const btnYt = document.getElementById('filter-tab-youtube');
    if (btnAll) btnAll.classList.toggle('active', filter === 'all');
    if (btnSp) btnSp.classList.toggle('active', filter === 'spotify');
    if (btnYt) btnYt.classList.toggle('active', filter === 'youtube');
    this.renderPlaylist(document.getElementById('playlist-search-input')?.value || '');
  }

  applyTheme() {
    document.documentElement.setAttribute('data-theme', this.isDarkMode ? 'dark' : 'light');
    const themeBtn = document.getElementById('btn-toggle-theme');
    if (themeBtn) {
      themeBtn.innerHTML = this.isDarkMode ? '☀️ Terang' : '🌙 Gelap';
    }
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('koestream_theme', this.isDarkMode ? 'dark' : 'light');
    this.applyTheme();
  }

  getEffectiveYouTubeId() {
    if (!this.videoResponse) return null;
    if (this.videoResponse.matched_yt_id && /^[A-Za-z0-9_-]{11}$/.test(this.videoResponse.matched_yt_id)) {
      return this.videoResponse.matched_yt_id;
    }
    if (this.videoResponse.video_id && /^[A-Za-z0-9_-]{11}$/.test(this.videoResponse.video_id) && !this.videoResponse.video_id.startsWith('spotify_')) {
      return this.videoResponse.video_id;
    }
    return null;
  }

  setupYouTubeAPI() {
    if (window.YT && window.YT.Player) {
      this.isYtReady = true;
      const ytId = this.getEffectiveYouTubeId();
      if (ytId) {
        this.initYTPlayer(ytId);
      }
      return;
    }

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const container = document.head || document.body || document.documentElement;
      if (container) {
        container.appendChild(tag);
      }
    }

    const prevOnReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof prevOnReady === 'function') {
        try { prevOnReady(); } catch (e) {}
      }
      this.isYtReady = true;
      const ytId = this.getEffectiveYouTubeId();
      if (ytId) {
        this.initYTPlayer(ytId);
      }
    };
  }

  initYTPlayer(videoId) {
    if (!videoId || typeof videoId !== 'string' || !/^[A-Za-z0-9_-]{11}$/.test(videoId)) {
      console.warn('Skipping initYTPlayer: invalid YouTube video ID format', videoId);
      return;
    }

    if (!window.YT || !window.YT.Player) {
      this.setupYouTubeAPI();
      return;
    }

    const frame = document.getElementById('youtube-player-frame');
    if (!frame) return;

    this.currentEngine = 'youtube';

    if (this.ytPlayer) {
      try {
        if (typeof this.ytPlayer.destroy === 'function') {
          this.ytPlayer.destroy();
        }
      } catch (e) {
        console.debug('Recreating YT player:', e);
      }
      this.ytPlayer = null;
    }

    try {
      this.ytPlayer = new window.YT.Player('youtube-player-frame', {
        host: 'https://www.youtube.com',
        videoId: videoId,
        playerVars: {
          playsinline: 1,
          autoplay: 1,
          controls: 1,
          rel: 0,
          modestbranding: 1,
          iv_load_policy: 3,
          enablejsapi: 1,
          origin: window.location.origin,
          widget_referrer: window.location.href
        },
        events: {
          onReady: (event) => {
            const iframe = document.getElementById('youtube-player-frame');
            if (iframe && iframe.tagName === 'IFRAME') {
              iframe.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
              iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
            }
            try {
              const dur = event.target.getDuration();
              if (dur && dur > 1) {
                this.totalDurationMs = Math.round(dur * 1000);
                this.updateTimeDisplay(0);
              }
            } catch (e) {}

            try {
              event.target.playVideo();
            } catch (e) {}
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              this.startPlaybackTicker();
              this.updatePlayPauseButton(true);
            } else if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED) {
              this.updatePlayPauseButton(false);
            }
          },
          onError: (event) => {
            console.warn('YouTube Player error event:', event.data);
          }
        }
      });
    } catch (err) {
      console.warn('Gagal menginisialisasi YT.Player:', err);
    }
  }

  toggleVideoMode() {
    this.isVideoMode = !this.isVideoMode;
    this.updateVideoDisplayMode();
    if (this.videoResponse) {
      this.renderPlayer(this.videoResponse);
    }
  }

  updateVideoDisplayMode() {
    const box = document.getElementById('player-box');
    const card = document.getElementById('integrated-player-card');
    const toggleBtn = document.getElementById('btn-toggle-video-mode');
    const toggleLabel = document.getElementById('label-video-mode');
    const iconContainer = document.getElementById('mode-icon-container');

    if (!box || !card) return;

    if (this.isVideoMode) {
      box.classList.remove('audio-only-mode');
      box.classList.add('video-active-mode');
      card.classList.add('video-mode-active');
      if (toggleBtn) toggleBtn.classList.add('active');
      if (toggleLabel) toggleLabel.textContent = 'Mode Audio';
      if (toggleBtn) toggleBtn.title = 'Alihkan ke Mode Audio (Thumbnail Spotify)';
      if (iconContainer) {
        iconContainer.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>`;
      }
    } else {
      box.classList.remove('video-active-mode');
      box.classList.add('audio-only-mode');
      card.classList.remove('video-mode-active');
      if (toggleBtn) toggleBtn.classList.remove('active');
      if (toggleLabel) toggleLabel.textContent = 'Mode Video';
      if (toggleBtn) toggleBtn.title = 'Tampilkan Pemutar Video YouTube (Anime / MV)';
      if (iconContainer) {
        iconContainer.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect><polyline points="17 2 12 7 7 2"></polyline></svg>`;
      }
    }
  }

  getSongKey() {
    if (!this.videoResponse) return 'default_song';
    return (this.videoResponse.spotify_id || this.videoResponse.video_id || 'default_song').replace(/[^a-zA-Z0-9_-]/g, '_');
  }

  loadSongSyncOffset() {
    const key = this.getSongKey();
    const saved = localStorage.getItem(`koestream_offset_${key}`);
    this.currentSongSyncOffsetMs = saved !== null ? parseInt(saved, 10) : 0;
    this.updateSyncOffsetDisplay();
  }

  adjustSyncOffset(deltaMs) {
    this.currentSongSyncOffsetMs = (this.currentSongSyncOffsetMs || 0) + deltaMs;
    // Batas aman kalibrasi: -5000ms sampai +5000ms (-5 detik sampai +5 detik)
    this.currentSongSyncOffsetMs = Math.max(-5000, Math.min(5000, this.currentSongSyncOffsetMs));
    const key = this.getSongKey();
    localStorage.setItem(`koestream_offset_${key}`, this.currentSongSyncOffsetMs);
    this.updateSyncOffsetDisplay();
    // Langsung picu pembaruan posisi aktif lirik
    this.onPlaybackTick();
  }

  resetSyncOffset() {
    this.currentSongSyncOffsetMs = 0;
    const key = this.getSongKey();
    localStorage.removeItem(`koestream_offset_${key}`);
    this.updateSyncOffsetDisplay();
    this.onPlaybackTick();
  }

  updateSyncOffsetDisplay() {
    const el = document.getElementById('sync-offset-value');
    if (el) {
      const sec = (this.currentSongSyncOffsetMs / 1000).toFixed(1);
      const sign = this.currentSongSyncOffsetMs > 0 ? '+' : '';
      el.textContent = `${sign}${sec}s`;
      el.style.color = this.currentSongSyncOffsetMs !== 0 ? '#38bdf8' : 'var(--text-secondary)';
    }
  }

  toggleTheaterMode() {
    this.isTheaterMode = !this.isTheaterMode;
    const stage = document.querySelector('.immersion-stage');
    const btn = document.getElementById('btn-theater-mode');
    if (stage) {
      stage.classList.toggle('theater-mode', this.isTheaterMode);
    }
    if (btn) {
      btn.classList.toggle('active', this.isTheaterMode);
      btn.title = this.isTheaterMode ? 'Kembalikan Ukuran Normal' : 'Lebarkan Tampilan Video (Theater Mode)';
    }
  }

  startPlaybackTicker() {
    if (this._playbackTicker) clearInterval(this._playbackTicker);
    this._playbackTicker = setInterval(() => {
      this.onPlaybackTick();
    }, 25);
  }

  stopPlaybackTicker() {
    if (this._playbackTicker) {
      clearInterval(this._playbackTicker);
      this._playbackTicker = null;
    }
  }

  onPlaybackTick() {
    let currentMs = 0;

    if (this.currentEngine === 'youtube' && this.ytPlayer) {
      if (typeof this.ytPlayer.getCurrentTime === 'function') {
        try {
          currentMs = Math.round(this.ytPlayer.getCurrentTime() * 1000);
        } catch (e) {
          return;
        }
      }
      if (typeof this.ytPlayer.getDuration === 'function') {
        try {
          const ytDur = this.ytPlayer.getDuration();
          if (ytDur && ytDur > 1) {
            const ytDurMs = Math.round(ytDur * 1000);
            if (!this.totalDurationMs || this.totalDurationMs <= 0) {
              this.totalDurationMs = ytDurMs;
              const totalEl = document.getElementById('total-time-display');
              if (totalEl) {
                const totalSec = Math.floor(this.totalDurationMs / 1000);
                const m = Math.floor(totalSec / 60);
                const s = totalSec % 60;
                totalEl.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
              }
            }
          }
        } catch (e) {}
      }
    } else if (this.currentEngine === 'spotify') {
      if (this.spotifyAudio) {
        this.currentPositionMs = Math.round(this.spotifyAudio.currentTime * 1000);
      } else if (this.isSpotifyPlaying) {
        this.currentPositionMs += Math.round(25 * this.playbackSpeed);
        if (this.currentPositionMs > this.totalDurationMs) {
          this.currentPositionMs = 0;
        }
      }
      currentMs = this.currentPositionMs;
    }

    // Auto-adjust totalDurationMs if playback exceeds it
    if (currentMs > this.totalDurationMs) {
      this.totalDurationMs = currentMs;
    }

    this.currentPositionMs = currentMs;
    this.updateTimeDisplay(currentMs);

    // Sync Scrubber Range & Fill
    const totalMs = this.totalDurationMs || 221000;
    const pct = Math.min(100, Math.max(0, (currentMs / totalMs) * 100));
    const scrubber = document.getElementById('playback-scrubber');
    const scrubberFill = document.getElementById('scrubber-fill');
    const scrubberWrapper = document.querySelector('.scrubber-track-wrapper');
    if (scrubber && !this.isUserScrubbing) {
      scrubber.value = Math.round(pct * 10);
    }
    if (scrubberFill) {
      scrubberFill.style.width = `${pct}%`;
    }
    if (scrubberWrapper) {
      scrubberWrapper.style.setProperty('--scrub-pct', `${pct}%`);
    }

    if (!this.videoResponse || !this.videoResponse.segments.length) return;

    // Kompensasi latensi persepsi audio & decoder YouTube (~350ms lead-in) + offset kalibrasi lagu
    const baseLeadInMs = 350;
    const syncMs = currentMs + baseLeadInMs + (this.currentSongSyncOffsetMs || 0);

    // Handle A-B sentence loop ONLY when isLoopActive is true AND a specific segment is targeted
    if (this.isLoopActive && this.loopSegmentIndex !== -1 && this.videoResponse?.segments) {
      const loopSeg = this.videoResponse.segments[this.loopSegmentIndex];
      if (loopSeg) {
        const curStart = loopSeg.start_ms ?? loopSeg.startMs ?? 0;
        const curEnd = loopSeg.end_ms ?? loopSeg.endMs ?? (curStart + 3500);
        if (currentMs >= curEnd) {
          this.seekToMs(curStart);
          return;
        }
      }
    }

    // Synchronize active segment
    const segments = this.videoResponse.segments;
    let matchedIdx = -1;

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      const sStart = seg.start_ms ?? seg.startMs ?? 0;
      const sEnd = seg.end_ms ?? seg.endMs ?? (sStart + 3500);
      const nextSeg = segments[i + 1];
      const nextStart = nextSeg ? (nextSeg.start_ms ?? nextSeg.startMs ?? sEnd) : Infinity;

      if (syncMs >= sStart && syncMs < nextStart) {
        matchedIdx = i;
        break;
      }
    }

    // If syncMs is before first segment, match segment 0; if past last, match last
    if (matchedIdx === -1 && segments.length > 0) {
      const firstStart = segments[0].start_ms ?? segments[0].startMs ?? 0;
      matchedIdx = syncMs <= firstStart ? 0 : segments.length - 1;
    }

    if (matchedIdx !== -1 && matchedIdx !== this.currentSegmentIndex) {
      this.currentSegmentIndex = matchedIdx;
      this.highlightActiveSegment(matchedIdx);
      if (this.autoScroll) {
        this.scrollToSegment(matchedIdx);
      }
    }

    // Calculate active karaoke token inside the active segment with zero delay
    if (this.currentSegmentIndex >= 0 && this.currentSegmentIndex < segments.length) {
      const seg = segments[this.currentSegmentIndex];
      const activeTokId = this.calculateActiveTokenId(seg, syncMs);
      if (activeTokId !== this.activeTokenId || this._lastActiveSeg !== this.currentSegmentIndex) {
        this.activeTokenId = activeTokId;
        this._lastActiveSeg = this.currentSegmentIndex;
        this.highlightActiveToken(this.currentSegmentIndex, activeTokId);
      }
    }
  }

  calculateActiveTokenId(seg, syncMs) {
    if (!seg.tokens || !seg.tokens.length) return null;
    const startMs = seg.start_ms ?? seg.startMs ?? 0;
    const endMs = seg.end_ms ?? seg.endMs ?? (startMs + 3500);

    if (syncMs <= startMs) return seg.tokens[0].token_id;
    if (syncMs >= endMs) return seg.tokens[seg.tokens.length - 1].token_id;

    const totalDuration = Math.max(300, endMs - startMs);

    let totalWeight = 0;
    const weights = seg.tokens.map((tok) => {
      const isPunct = tok.pos === 'PUNCT' || tok.surface === '。' || tok.surface === '、' || tok.surface === ' ' || tok.surface === '？' || tok.surface === '！';
      const len = (tok.surface || '').trim().length;
      const w = isPunct ? 0.2 : Math.max(1, len);
      totalWeight += w;
      return w;
    });

    if (totalWeight <= 0) return seg.tokens[0].token_id;

    const elapsed = Math.max(0, syncMs - startMs);
    let cumulative = 0;

    for (let i = 0; i < seg.tokens.length; i++) {
      const startRatio = cumulative / totalWeight;
      cumulative += weights[i];
      const endRatio = cumulative / totalWeight;

      const tStart = startRatio * totalDuration;
      const tEnd = endRatio * totalDuration;

      if (elapsed >= tStart && elapsed < tEnd) {
        return seg.tokens[i].token_id;
      }
    }

    return seg.tokens[seg.tokens.length - 1].token_id;
  }

  seekToMs(ms) {
    this.currentPositionMs = ms;
    if (this.currentEngine === 'youtube' && this.ytPlayer && typeof this.ytPlayer.seekTo === 'function') {
      this.ytPlayer.seekTo(ms / 1000, true);
      this.ytPlayer.playVideo();
      this.updatePlayPauseButton(true);
    } else if (this.currentEngine === 'spotify') {
      this.currentPositionMs = ms;
      if (this.spotifyAudio) {
        try {
          this.spotifyAudio.currentTime = ms / 1000;
          this.spotifyAudio.play().catch(() => {});
        } catch (e) {}
      }
      this.isSpotifyPlaying = true;
      this.startPlaybackTicker();
      this.updateSpotifyPlayBtn();
    }
    this.updateTimeDisplay(ms);
  }

  togglePlayPause() {
    if (this.currentEngine === 'youtube') {
      if (this.ytPlayer) {
        if (typeof this.ytPlayer.getPlayerState === 'function') {
          const state = this.ytPlayer.getPlayerState();
          if (state === window.YT.PlayerState.PLAYING) {
            this.ytPlayer.pauseVideo();
            this.updatePlayPauseButton(false);
          } else {
            this.ytPlayer.playVideo();
            this.updatePlayPauseButton(true);
          }
        } else if (typeof this.ytPlayer.playVideo === 'function') {
          this.ytPlayer.playVideo();
          this.updatePlayPauseButton(true);
        }
      } else {
        const ytId = this.getEffectiveYouTubeId();
        if (ytId) this.initYTPlayer(ytId);
      }
    } else if (this.currentEngine === 'spotify') {
      if (this.spotifyAudio) {
        if (this.spotifyAudio.paused) {
          this.spotifyAudio.play().then(() => {
            this.isSpotifyPlaying = true;
            this.startPlaybackTicker();
            this.updateSpotifyPlayBtn();
          }).catch(err => {
            console.warn('Playback error:', err);
          });
        } else {
          this.spotifyAudio.pause();
          this.isSpotifyPlaying = false;
          this.updateSpotifyPlayBtn();
        }
      } else {
        this.isSpotifyPlaying = !this.isSpotifyPlaying;
        if (this.isSpotifyPlaying) {
          this.startPlaybackTicker();
        }
        this.updateSpotifyPlayBtn();
      }
    }
  }

  updateSpotifyPlayBtn() {
    this.updatePlayPauseButton(this.isSpotifyPlaying);
  }

  updatePlayPauseButton(isPlaying) {
    const btn = document.getElementById('btn-play-pause');
    if (!btn) return;
    if (isPlaying) {
      btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1.5"></rect><rect x="14" y="5" width="4" height="14" rx="1.5"></rect></svg>`;
      btn.title = 'Jeda';
      btn.setAttribute('aria-label', 'Jeda');
    } else {
      btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="transform: translateX(1px);"><polygon points="6 4 20 12 6 20 6 4"></polygon></svg>`;
      btn.title = 'Putar';
      btn.setAttribute('aria-label', 'Putar');
    }
  }

  updateTimeDisplay(ms) {
    const timeEl = document.getElementById('time-display');
    if (timeEl) {
      const totalSec = Math.floor(ms / 1000);
      const m = Math.floor(totalSec / 60);
      const s = totalSec % 60;
      timeEl.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    const totalEl = document.getElementById('total-time-display');
    if (totalEl && this.totalDurationMs) {
      const totalSec = Math.floor(this.totalDurationMs / 1000);
      const m = Math.floor(totalSec / 60);
      const s = totalSec % 60;
      totalEl.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
  }

  async loadMedia(url, demo = false) {
    const input = document.getElementById('input-url');
    if (input) input.value = url;

    // Fully reset all playback, cursor, and highlight state when switching tracks
    this.currentPositionMs = 0;
    this.currentSegmentIndex = 0;
    this.activeTokenId = null;
    this._lastActiveSeg = null;
    this.isLoopActive = false;
    this.loopSegmentIndex = -1;
    this.updateLoopButton();
    if (this.spotifyAudio) {
      try {
        this.spotifyAudio.pause();
        this.spotifyAudio.currentTime = 0;
      } catch (e) {}
    }
    if (this.ytPlayer && typeof this.ytPlayer.stopVideo === 'function') {
      try { this.ytPlayer.stopVideo(); } catch (e) {}
    }
    this.updatePlayPauseButton(false);

    const btnLoad = document.getElementById('btn-load');
    if (btnLoad) {
      btnLoad.disabled = true;
      btnLoad.innerHTML = '<div class="spinner"></div> Memuat...';
    }

    const alertBanner = document.getElementById('alert-banner');
    if (alertBanner) alertBanner.style.display = 'none';

    try {
      const cleanUrl = (url || '').trim();
      const dangerousPatterns = ['javascript:', 'data:', 'vbscript:', 'file:', '<script', '</script', 'onload=', 'onerror=', 'eval(', 'alert('];
      if (dangerousPatterns.some(p => cleanUrl.toLowerCase().includes(p)) || cleanUrl.includes('<') || cleanUrl.includes('>')) {
        throw new Error('Input URL tidak valid atau terdeteksi mengandung skrip yang dilarang.');
      }

      const isSp = cleanUrl.includes('spotify.com') || cleanUrl.startsWith('spotify_') || cleanUrl.startsWith('spotify:');
      this.setPlatformMode(isSp ? 'spotify' : 'youtube');

      const data = await this.api.processMedia(
        cleanUrl,
        this.targetLang,
        this.nativeLang,
        Array.from(this.masteredLemmas),
        demo
      );

      this.videoResponse = data;
      if (data && data.language) {
        this.targetLang = data.language;
        localStorage.setItem('koestream_target_lang', this.targetLang);
        const langSelect = document.getElementById('select-target-lang');
        if (langSelect && langSelect.value !== data.language) {
          langSelect.value = data.language;
        }
      }
      this.currentSegmentIndex = 0;
      this.currentPositionMs = 0;
      this.loadSongSyncOffset();
      this.renderPlayer(data);
      this.renderTranscriptStream();

      // Direct single-use: tidak menyimpan cache sesi ke localStorage

      if (data._fromFallback && alertBanner) {
        alertBanner.className = 'alert-banner info';
        alertBanner.style.display = 'flex';
        const errDetail = data._originalError ? ` (${this.escapeHtml(data._originalError)})` : '';
        alertBanner.innerHTML = `<span>ℹ️ URL tidak dapat diproses langsung oleh backend${errDetail}. Menampilkan data demo tersinkronisasi.</span>`;
      }
    } catch (err) {
      console.error('Error loading media:', err);
      if (alertBanner) {
        alertBanner.className = 'alert-banner error';
        alertBanner.style.display = 'flex';
        alertBanner.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center; width:100%; gap:12px; flex-wrap:wrap;">
            <span>⚠️ ${this.escapeHtml(err.message || 'Gagal memproses URL media.')}</span>
            <button class="btn-retry-inline" style="padding:4px 12px; font-size:12px; border-radius:6px; background:rgba(255,255,255,0.15); border:1px solid rgba(255,255,255,0.3); color:inherit; cursor:pointer;" onclick="window.koeApp.loadMedia('${this.escapeHtml((url || '').trim())}', false)">🔄 Coba Lagi</button>
          </div>
        `;
      }
    } finally {
      if (btnLoad) {
        btnLoad.disabled = false;
        btnLoad.innerHTML = 'Muat';
      }
    }
  }

  setPlayerEngine(engine) {
    if (!this.videoResponse) return;
    this.currentEngine = engine;
    this.renderPlayer(this.videoResponse);
  }

  renderPlayer(data) {
    const box = document.getElementById('player-box');
    const titleEl = document.getElementById('track-title');
    const channelEl = document.getElementById('track-channel');
    const thumbEl = document.getElementById('player-thumb');
    const sourceBadge = document.getElementById('source-badge');

    if (!box) return;

    if (titleEl) titleEl.textContent = data.title || '夜に駆ける (Yoru ni Kakeru)';
    if (channelEl) channelEl.textContent = data.artist || data.channel || 'YOASOBI';
    if (thumbEl && data.thumbnail_url) thumbEl.src = data.thumbnail_url;

    // Deteksi tegas apakah media berasal dari Spotify
    const isSpotify = data.source_type === 'spotify' || 
                      (data.video_id && data.video_id.startsWith('spotify_')) || 
                      (data.spotify_id && !data.video_id?.startsWith('yt_') && (data.video_id?.startsWith('spotify_') || data.spotify_embed_url));
    const isValidYouTubeId = !isSpotify && data.video_id && typeof data.video_id === 'string' && /^[A-Za-z0-9_-]{11}$/.test(data.video_id) && !data.video_id.startsWith('spotify_');

    if (sourceBadge) {
      if (isSpotify) {
        sourceBadge.textContent = 'SPOTIFY TRACK';
        sourceBadge.className = 'source-tag-minimal spotify-source';
      } else {
        sourceBadge.className = 'source-tag-minimal youtube-source';
        const titleLower = (data.title || '').toLowerCase();
        const channelLower = (data.channel || '').toLowerCase();
        const isAnime = titleLower.includes('anime') ||
                        titleLower.includes('アニメ') ||
                        titleLower.includes('episode') ||
                        titleLower.includes('ep') ||
                        titleLower.includes('話') ||
                        titleLower.includes('第') ||
                        titleLower.includes('#') ||
                        channelLower.includes('ani-one') ||
                        channelLower.includes('muse') ||
                        channelLower.includes('crunchyroll');
        if (isAnime) {
          sourceBadge.textContent = 'ANIME VIDEO';
        } else {
          sourceBadge.textContent = 'YOUTUBE VIDEO';
        }
      }
    }

    if (isSpotify) {
      this.currentEngine = 'spotify';
      this.isVideoMode = false;
    } else if (isValidYouTubeId) {
      this.currentEngine = 'youtube';
      this.isVideoMode = true;
    } else {
      this.isVideoMode = false;
    }
    this.updateVideoDisplayMode();

    // Tentukan durasi total murni dari metadata media yang dimuat
    let foundDurationMs = 0;
    if (data.duration_ms && data.duration_ms > 30000) {
      foundDurationMs = data.duration_ms;
    } else if (data.duration && data.duration > 30) {
      foundDurationMs = data.duration * 1000;
    }

    if (foundDurationMs > 0) {
      this.totalDurationMs = foundDurationMs;
    } else if (data.segments && data.segments.length > 0) {
      this.totalDurationMs = Math.max(40000, data.segments[data.segments.length - 1].end_ms);
    } else {
      this.totalDurationMs = 261000;
    }

    const totalEl = document.getElementById('total-time-display');
    if (totalEl) {
      const totalSec = Math.floor(this.totalDurationMs / 1000);
      const m = Math.floor(totalSec / 60);
      const s = totalSec % 60;
      totalEl.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    const currentEl = document.getElementById('current-time-display');
    if (currentEl) currentEl.textContent = '00:00';
    const scrubber = document.getElementById('playback-scrubber');
    if (scrubber) scrubber.value = 0;
    const scrubberFill = document.getElementById('scrubber-fill');
    if (scrubberFill) scrubberFill.style.width = '0%';
    const scrubberWrapper = document.querySelector ? document.querySelector('.scrubber-track-wrapper') : null;
    if (scrubberWrapper && scrubberWrapper.style && typeof scrubberWrapper.style.setProperty === 'function') {
      scrubberWrapper.style.setProperty('--scrub-pct', '0%');
    }

    // Pemutar terpisah: Tentukan engine pemutar yang paling optimal
    // 1. Jika media YouTube murni (video_id 11 karakter) -> selalu gunakan engine YouTube (bebas limit 29 detik!)
    // 2. Jika media Spotify:
    //    - Jika Mode Video aktif ATAU audio_url berupa klip preview 29 detik ('p.scdn.co') dan ada padanan YouTube (matched_yt_id),
    //      maka aktifkan engine YouTube agar lagu dapat berputar PENUH (3-5 menit) tanpa terpotong 29 detik!
    //    - Jika audio studio lokal tersedia -> gunakan audio Spotify
    const hasMatchedYt = data.matched_yt_id && /^[A-Za-z0-9_-]{11}$/.test(data.matched_yt_id);
    let useYoutubeEngine = false;
    let effectiveYtId = null;

    if (isValidYouTubeId && !isSpotify) {
      useYoutubeEngine = true;
      effectiveYtId = data.video_id;
    } else if (hasMatchedYt && (this.isVideoMode || !data.audio_url || data.audio_url.includes('p.scdn.co'))) {
      useYoutubeEngine = true;
      effectiveYtId = data.matched_yt_id;
    }

    if (useYoutubeEngine && effectiveYtId) {
      this.currentEngine = 'youtube';
      if (this.spotifyAudio) {
        try { this.spotifyAudio.pause(); } catch (e) {}
        this.spotifyAudio = null;
      }
      box.innerHTML = `<div id="youtube-player-frame"></div>`;
      if (this.isYtReady) {
        this.initYTPlayer(effectiveYtId);
      } else {
        this.setupYouTubeAPI();
      }
    } else if (isSpotify) {
      this.currentEngine = 'spotify';
      if (this.ytPlayer && typeof this.ytPlayer.stopVideo === 'function') {
        try { this.ytPlayer.stopVideo(); } catch (e) {}
      }
      box.innerHTML = `<iframe style="border-radius:12px; width:100%; height:152px; border:none;" src="${this.escapeHtml(data.spotify_embed_url || `https://open.spotify.com/embed/track/${data.spotify_id || ''}?utm_source=generator&theme=0`)}" width="100%" height="152" frameBorder="0" allowfullscreen="" sandbox="allow-scripts allow-same-origin allow-presentation allow-forms" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`;

      // Sinkronisasi audio stream studio penuh
      if (data.audio_url) {
        if (!this.spotifyAudio) {
          this.spotifyAudio = new Audio();
        }
        let audioSrc = data.audio_url;
        if (audioSrc.startsWith('/') && this.api && this.api.baseUrl) {
          audioSrc = `${this.api.baseUrl.replace(/\/+$/, '')}${audioSrc}`;
        }
        this.spotifyAudio.src = audioSrc;
        this.spotifyAudio.playbackRate = this.playbackSpeed;
        this.spotifyAudio.preload = 'auto';

        this.spotifyAudio.onplay = () => {
          this.isSpotifyPlaying = true;
          this.updateSpotifyPlayBtn();
          this.startPlaybackTicker();
        };
        this.spotifyAudio.onpause = () => {
          this.isSpotifyPlaying = false;
          this.updateSpotifyPlayBtn();
        };
        this.spotifyAudio.onended = () => {
          this.isSpotifyPlaying = false;
          this.updateSpotifyPlayBtn();
          this.stopPlaybackTicker();
          this.currentPositionMs = 0;
          this.updateTimeDisplay(0);
        };
        this.spotifyAudio.onloadedmetadata = () => {
          if (this.spotifyAudio && this.spotifyAudio.duration && this.spotifyAudio.duration > 1) {
            const previewDurMs = Math.round(this.spotifyAudio.duration * 1000);
            const isPreviewUrl = data.audio_url && data.audio_url.includes('p.scdn.co');
            if (!isPreviewUrl || this.totalDurationMs <= 30000) {
              if (previewDurMs > this.totalDurationMs || this.totalDurationMs <= 30000) {
                this.totalDurationMs = previewDurMs;
              }
            }
            const totalEl = document.getElementById('total-time-display');
            if (totalEl && this.totalDurationMs) {
              const totalSec = Math.floor(this.totalDurationMs / 1000);
              const m = Math.floor(totalSec / 60);
              const s = totalSec % 60;
              totalEl.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
            }
          }
        };
      } else if (this.spotifyAudio) {
        try { this.spotifyAudio.pause(); } catch (e) {}
        this.spotifyAudio = null;
      }
    } else if (isValidYouTubeId) {
      this.currentEngine = 'youtube';
      box.innerHTML = `<div id="youtube-player-frame"></div>`;
      if (this.isYtReady) {
        this.initYTPlayer(data.video_id);
      } else {
        this.setupYouTubeAPI();
      }
    }

    // Reset Play/Pause Button to Play icon
    this.updatePlayPauseButton(false);

    // Auto-highlight first segment and first token
    if (data.segments && data.segments.length > 0) {
      this.currentSegmentIndex = 0;
      this.highlightActiveSegment(0);
      if (data.segments[0].tokens && data.segments[0].tokens[0]) {
        this.activeTokenId = data.segments[0].tokens[0].token_id;
        this._lastActiveSeg = 0;
        this.highlightActiveToken(0, this.activeTokenId);
        this.selectWordInspector(data.segments[0].tokens[0], data.segments[0]);
      }
    }
  }

  renderTranscriptStream() {
    const container = document.getElementById('transcript-stream');
    if (!container || !this.videoResponse) return;

    container.innerHTML = '';
    const segments = this.videoResponse?.segments || [];

    if (!segments.length) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📜</div>
          <div>Tidak ada teks subtitel yang ditemukan untuk media ini.</div>
        </div>
      `;
      return;
    }

    segments.forEach((seg, idx) => {
      // Check i+1 filter
      if (this.filterIPlusOneOnly && !seg.is_i_plus_one) return;

      const card = document.createElement('div');
      card.className = `segment-card ${idx === this.currentSegmentIndex ? 'active' : ''}`;
      card.id = `segment-card-${idx}`;
      card.onclick = (e) => {
        // Prevent trigger if clicking action buttons
        if (e.target.closest('.btn-card-action') || e.target.closest('.token-item')) return;
        this.seekToSegment(idx);
      };

      // Header row
      const metaRow = document.createElement('div');
      metaRow.className = 'segment-meta-row';

      const timePill = document.createElement('span');
      timePill.className = 'timestamp-pill';
      timePill.textContent = `${this.formatTime(seg.start_ms)} - ${this.formatTime(seg.end_ms)}`;
      metaRow.appendChild(timePill);

      if (idx === this.currentSegmentIndex) {
        const playingBadge = document.createElement('span');
        playingBadge.className = 'active-playing-indicator';
        playingBadge.innerHTML = `<span class="playing-pulse-dot"></span> Sedang Diputar`;
        metaRow.appendChild(playingBadge);
      }

      if (seg.is_i_plus_one) {
        const iPlusBadge = document.createElement('span');
        iPlusBadge.className = 'i-plus-one-badge';
        iPlusBadge.textContent = '🌟 i+1';
        metaRow.appendChild(iPlusBadge);
      }
      card.appendChild(metaRow);

      // Ruby subtitle row
      const rubyContainer = document.createElement('div');
      rubyContainer.className = 'ruby-container';
      this.renderUniversalRuby(seg.tokens, rubyContainer, seg);
      card.appendChild(rubyContainer);

      // Translation row
      const transEl = document.createElement('div');
      transEl.className = 'segment-translation';
      transEl.textContent = seg.translated_text || 'Menerjemahkan kalimat...';
      card.appendChild(transEl);

      // Actions row
      const actions = document.createElement('div');
      actions.className = 'segment-actions';
      actions.innerHTML = `
        <button class="btn-card-action" onclick="app.seekToSegment(${idx})" title="Putar dari awal kalimat">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style="transform: translateX(0.5px);"><polygon points="6 4 20 12 6 20 6 4"></polygon></svg>
          <span>Putar</span>
        </button>
        <button class="btn-card-action ${this.isLoopActive && this.loopSegmentIndex === idx ? 'active' : ''}" data-action="loop" data-idx="${idx}" onclick="app.loopSegment(${idx})" title="Ulang kalimat ini terus-menerus">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>
          <span>Loop</span>
        </button>
        <button class="btn-card-action" onclick="app.openShadowingModal(${idx})" title="Latihan meniru intonasi native">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
          <span>Shadowing</span>
        </button>
        <button class="btn-card-action" onclick="app.explainGrammarSentence(${idx})" title="Tanya AI Guru Tata Bahasa">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"></path><path d="M10 22h4"></path><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"></path></svg>
          <span>Tata Bahasa</span>
        </button>
      `;
      card.appendChild(actions);

      container.appendChild(card);
    });
  }

  renderUniversalRuby(tokens, container, segment) {
    if (!tokens || !tokens.length) return;
    const segIdx = segment?.index ?? 0;

    tokens.forEach((tok) => {
      const isMastered = tok.lemma ? this.masteredLemmas.has(tok.lemma.trim()) : false;
      const showRuby = this.isRubyVisible && !isMastered;
      const tokenEl = document.createElement('div');
      tokenEl.className = 'token-item';
      tokenEl.id = `token-${segIdx}-${tok.token_id}`;
      tokenEl.onclick = () => this.selectWordInspector(tok, segment);

      // Tier 1: Ruby Furigana / Pinyin / IPA
      if (tok.display_parts && tok.display_parts.length > 0) {
        const partsRow = document.createElement('div');
        partsRow.className = 'display-parts-row';

        tok.display_parts.forEach((part) => {
          const partCol = document.createElement('div');
          partCol.className = 'display-part';

          const partRuby = document.createElement('div');
          partRuby.className = 'display-part-ruby';
          partRuby.textContent = (showRuby && part.ruby) ? part.ruby : '';
          partCol.appendChild(partRuby);

          const partText = document.createElement('div');
          partText.className = 'token-surface';
          partText.textContent = part.text;
          partCol.appendChild(partText);

          partsRow.appendChild(partCol);
        });

        tokenEl.appendChild(partsRow);
      } else {
        const rubyEl = document.createElement('div');
        rubyEl.className = 'token-ruby';
        rubyEl.textContent = (showRuby && tok.phonetic_script && tok.phonetic_script !== tok.surface) ? tok.phonetic_script : '';
        tokenEl.appendChild(rubyEl);

        const surfaceEl = document.createElement('div');
        surfaceEl.className = 'token-surface';
        surfaceEl.textContent = tok.surface;
        tokenEl.appendChild(surfaceEl);
      }

      // Tier 3: Romaji Reading
      const pronounced = tok.pronounced_as || tok.phonetic_script || '';
      if (this.showRomaji && pronounced && pronounced.trim().toLowerCase() !== (tok.surface || '').trim().toLowerCase()) {
        const romajiEl = document.createElement('div');
        romajiEl.className = 'token-romaji';
        romajiEl.textContent = pronounced;
        tokenEl.appendChild(romajiEl);
      }

      container.appendChild(tokenEl);
    });
  }

  selectWordInspector(tok, segment) {
    if (!tok) return;
    this.currentWord = tok;
    this.activeContextSentence = segment?.original_text || '';

    // Highlight clicked token in transcript stream
    document.querySelectorAll('.token-item.selected, .token-item.active-inspector-token').forEach(el => {
      el.classList.remove('selected', 'active-inspector-token');
    });
    const segIdx = segment?.index ?? this.currentSegmentIndex ?? 0;
    const tokEl = document.getElementById(`token-${segIdx}-${tok.token_id}`);
    if (tokEl) {
      tokEl.classList.add('active-inspector-token');
    }

    // Populate Word Inspector Card Elements
    const readingEl = document.getElementById('inspector-reading');
    const jlptEl = document.getElementById('inspector-jlpt');
    const surfaceEl = document.getElementById('inspector-surface');
    const grammarEl = document.getElementById('inspector-grammar');
    const defsEl = document.getElementById('inspector-definitions');
    const masterBtn = document.getElementById('btn-inspector-master');

    if (readingEl) {
      const phonetic = tok.phonetic_script || tok.surface;
      const romaji = tok.pronounced_as && tok.pronounced_as !== phonetic ? tok.pronounced_as : '';
      readingEl.textContent = romaji ? `${phonetic} • ${romaji}` : phonetic;
    }

    if (jlptEl) {
      jlptEl.textContent = tok.jlpt ? `JLPT ${tok.jlpt}` : (tok.level || 'JLPT N3');
    }

    if (surfaceEl) {
      surfaceEl.textContent = tok.surface;
    }

    if (grammarEl) {
      let grammarText = '';
      if (tok.pos === 'VERB') {
        grammarText = `Bentuk Dasar (Kata Kerja) • Mizenkei: ${tok.lemma || tok.surface}`;
      } else if (tok.pos === 'NOUN') {
        grammarText = `Kata Benda (Meishi) • ${tok.lemma || tok.surface}`;
      } else if (tok.pos === 'ADJ') {
        grammarText = `Kata Sifat (Keiyoushi) • ${tok.lemma || tok.surface}`;
      } else if (tok.pos === 'AUX') {
        grammarText = `Partikel / Kata Bantu • ${tok.lemma || tok.surface}`;
      } else {
        grammarText = `Kelas Kata: ${tok.pos || 'Universal'} • Lemma: ${tok.lemma || tok.surface}`;
      }
      grammarEl.textContent = grammarText;
    }

    if (defsEl) {
      const meanings = (tok.meanings && tok.meanings.length) ? tok.meanings : [tok.lemma || tok.surface];
      defsEl.innerHTML = meanings.map((m, idx) => `<div class="inspector-def-item">${idx + 1}. ${this.escapeHtml(m)}</div>`).join('');
    }

    if (masterBtn) {
      const isMastered = this.masteredLemmas.has(tok.lemma?.trim() || tok.surface.trim());
      masterBtn.textContent = isMastered ? '✓ Dikuasai' : '✓ Tandai Dikuasai';
      masterBtn.classList.toggle('active', isMastered);
    }
  }

  renderMediaCollection() {
    // Koleksi Media dinonaktifkan sesuai permintaan pengguna (pemutar mandiri per-link langsung)
  }

  cycleSpeed() {
    const speeds = [1.0, 1.25, 1.5, 0.75];
    const currentIdx = speeds.indexOf(this.playbackSpeed);
    const nextSpeed = speeds[(currentIdx + 1) % speeds.length];
    this.setSpeed(nextSpeed);
    const speedBtn = document.getElementById('btn-speed-toggle');
    if (speedBtn) {
      speedBtn.textContent = `${nextSpeed}x`;
    }
  }

  getPOSColor(pos) {
    switch ((pos || '').toUpperCase()) {
      case 'NOUN': return 'var(--pos-noun)';
      case 'VERB': return 'var(--pos-verb)';
      case 'ADJ': return 'var(--pos-adj)';
      case 'ADV': return 'var(--pos-adv)';
      case 'PRON': return 'var(--pos-pron)';
      case 'PART': return 'var(--pos-part)';
      case 'ADP': return 'var(--pos-adp)';
      case 'AUX': return 'var(--pos-aux)';
      case 'CONJ': return 'var(--pos-conj)';
      default: return 'var(--pos-other)';
    }
  }

  highlightActiveSegment(index) {
    document.querySelectorAll('.segment-card').forEach((el) => {
      el.classList.remove('active');
      const badge = el.querySelector ? el.querySelector('.active-playing-indicator') : null;
      if (badge && typeof badge.remove === 'function') badge.remove();
    });

    const activeCard = document.getElementById(`segment-card-${index}`);
    if (activeCard) {
      activeCard.classList.add('active');
      const metaRow = activeCard.querySelector ? activeCard.querySelector('.segment-meta-row') : null;
      if (metaRow && (!metaRow.querySelector || !metaRow.querySelector('.active-playing-indicator'))) {
        const playingBadge = document.createElement('span');
        playingBadge.className = 'active-playing-indicator';
        playingBadge.innerHTML = `<span class="playing-pulse-dot"></span> Sedang Diputar`;
        metaRow.appendChild(playingBadge);
      }
    }
  }

  highlightActiveToken(segIndex, tokenId) {
    document.querySelectorAll('.token-item.karaoke-active').forEach((el) => {
      el.classList.remove('karaoke-active');
    });

    if (segIndex !== null && segIndex !== undefined && tokenId !== null && tokenId !== undefined) {
      const activeTok = document.getElementById(`token-${segIndex}-${tokenId}`);
      if (activeTok) {
        activeTok.classList.add('karaoke-active');
      }
    }
  }

  scrollToSegment(index) {
    const card = document.getElementById(`segment-card-${index}`);
    const container = document.getElementById('transcript-stream');
    if (!card || !container) return;

    // Scroll container langsung agar kartu aktif tepat berada di tengah area pandang
    const cardTop = card.offsetTop;
    const cardHeight = card.offsetHeight;
    const containerHeight = container.clientHeight;
    const targetScroll = cardTop - (containerHeight / 2) + (cardHeight / 2);

    container.scrollTo({
      top: Math.max(0, targetScroll),
      behavior: 'smooth'
    });
  }

  seekToSegment(index) {
    if (!this.videoResponse || !this.videoResponse.segments[index]) return;
    this.currentSegmentIndex = index;
    // Explicitly reset looping so playback advances continuously
    this.isLoopActive = false;
    this.loopSegmentIndex = -1;
    this.updateLoopButton();
    this.updateCardLoopButtons();

    const seg = this.videoResponse.segments[index];
    const sStart = seg.start_ms ?? seg.startMs ?? 0;
    this.seekToMs(sStart);
    this.highlightActiveSegment(index);
    if (seg.tokens && seg.tokens.length) {
      this.activeTokenId = seg.tokens[0].token_id;
      this._lastActiveSeg = index;
      this.highlightActiveToken(index, this.activeTokenId);
    }
    if (this.autoScroll) {
      this.scrollToSegment(index);
    }
  }

  loopSegment(index) {
    if (this.isLoopActive && this.loopSegmentIndex === index) {
      // Toggle loop OFF if already looping this card
      this.isLoopActive = false;
      this.loopSegmentIndex = -1;
    } else {
      // Loop this specific card
      this.loopSegmentIndex = index;
      this.isLoopActive = true;
      this.currentSegmentIndex = index;
      const seg = this.videoResponse.segments[index];
      const sStart = seg.start_ms ?? seg.startMs ?? 0;
      this.seekToMs(sStart);
      this.highlightActiveSegment(index);
      if (seg.tokens && seg.tokens.length) {
        this.activeTokenId = seg.tokens[0].token_id;
        this._lastActiveSeg = index;
        this.highlightActiveToken(index, this.activeTokenId);
      }
      if (this.autoScroll) {
        this.scrollToSegment(index);
      }
    }
    this.updateLoopButton();
    this.updateCardLoopButtons();
  }

  toggleLoop() {
    this.isLoopActive = !this.isLoopActive;
    if (!this.isLoopActive) {
      this.loopSegmentIndex = -1;
    } else {
      this.loopSegmentIndex = this.currentSegmentIndex;
    }
    this.updateLoopButton();
    this.updateCardLoopButtons();
  }

  updateCardLoopButtons() {
    document.querySelectorAll('.btn-card-action[data-action="loop"]').forEach((btn) => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      const isCardLooping = this.isLoopActive && this.loopSegmentIndex === idx;
      btn.classList.toggle('active', isCardLooping);
    });
  }

  updateLoopButton() {
    const btn = document.getElementById('btn-loop');
    if (btn) {
      btn.classList.toggle('active', this.isLoopActive);
      btn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>
        <span>Loop${this.isLoopActive ? ' ON' : ''}</span>
      `;
    }
  }

  setSpeed(speed) {
    this.playbackSpeed = speed;
    if (this.currentEngine === 'youtube' && this.ytPlayer && typeof this.ytPlayer.setPlaybackRate === 'function') {
      this.ytPlayer.setPlaybackRate(speed);
    }
    if (this.spotifyAudio) {
      try { this.spotifyAudio.playbackRate = speed; } catch (e) {}
    }
  }

  formatTime(ms) {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  // =====================================================================
  // MODALS & INTERACTION: Dictionary, FSRS Review, Shadowing, Settings
  // =====================================================================
  openDictionaryModal(token, segment) {
    this.activeDictToken = token;
    this.activeDictSegment = segment;

    const modal = document.getElementById('modal-dictionary');
    const surfaceEl = document.getElementById('dict-surface');
    const readingEl = document.getElementById('dict-reading');
    const posBadge = document.getElementById('dict-pos-badge');
    const ruleBox = document.getElementById('dict-rule-box');
    const defsContainer = document.getElementById('dict-definitions');
    const contextBox = document.getElementById('dict-context-box');
    const btnMastered = document.getElementById('btn-toggle-mastered');

    surfaceEl.textContent = token.surface;
    readingEl.textContent = token.pronounced_as || token.phonetic_script || '';
    posBadge.textContent = token.pos || 'OTHER';
    posBadge.style.backgroundColor = this.getPOSColor(token.pos);

    // Rule Note (e.g. Japanese particles は/へ/を, Chinese Tone Sandhi, Korean Assimilation)
    if (token.orthographic_rule_note) {
      ruleBox.style.display = 'block';
      ruleBox.textContent = `💡 Aturan Pelafalan: ${token.orthographic_rule_note}`;
    } else {
      ruleBox.style.display = 'none';
    }

    // Definitions
    defsContainer.innerHTML = '';
    const meanings = token.meanings && token.meanings.length ? token.meanings : [token.surface];
    meanings.forEach((m, idx) => {
      const item = document.createElement('div');
      item.className = 'dict-def-item';
      item.innerHTML = `<span class="dict-def-number">${idx + 1}.</span> <span>${this.escapeHtml(m)}</span>`;
      defsContainer.appendChild(item);
    });

    // Context Sentence
    contextBox.innerHTML = `
      <div><strong>Konteks Kalimat:</strong> ${this.escapeHtml(segment.original_text)}</div>
      <div style="color: var(--text-muted); font-size: 0.8rem; margin-top: 4px;"><strong>Arti:</strong> ${this.escapeHtml(segment.translated_text)}</div>
    `;

    // Mastered button text
    const isMastered = this.masteredLemmas.has(token.lemma.trim());
    btnMastered.innerHTML = isMastered ? '✓ Sudah Dikuasai' : 'Tandai Dikuasai';
    btnMastered.className = `btn ${isMastered ? 'btn-secondary' : 'btn-primary'}`;

    modal.classList.add('open');
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('open');
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('open');
  }

  speakCurrentWord() {
    const tok = this.activeDictToken || this.currentWord;
    if (!tok) return;
    const text = tok.surface;
    const langMap = {
      ja: 'ja-JP',
      zh: 'zh-CN',
      ko: 'ko-KR',
      ar: 'ar-SA',
      th: 'th-TH',
      en: 'en-US',
      de: 'de-DE',
      id: 'id-ID'
    };
    const lang = langMap[this.targetLang] || 'ja-JP';

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  }

  toggleMasteredCurrentWord() {
    const tok = this.activeDictToken || this.currentWord;
    if (!tok) return;
    const lemma = (tok.lemma || tok.surface).trim();
    if (this.masteredLemmas.has(lemma)) {
      this.masteredLemmas.delete(lemma);
    } else {
      this.masteredLemmas.add(lemma);
    }
    localStorage.setItem('koestream_mastered_lemmas', JSON.stringify(Array.from(this.masteredLemmas)));

    // Update inspector button label if present
    const masterBtn = document.getElementById('btn-inspector-master');
    if (masterBtn) {
      const isMastered = this.masteredLemmas.has(lemma);
      masterBtn.textContent = isMastered ? '✓ Dikuasai' : '✓ Tandai Dikuasai';
      masterBtn.classList.toggle('active', isMastered);
    }

    this.renderTranscriptStream();
    this.closeModal('modal-dictionary');
  }

  saveFlashcardCurrentWord() {
    const tok = this.activeDictToken || this.currentWord;
    const seg = this.activeDictSegment || (this.videoResponse?.segments ? this.videoResponse.segments[this.currentSegmentIndex] : null);
    if (!tok) return;

    const cardId = `card_${Date.now()}_${tok.lemma || tok.surface}`;
    const initialFsrs = {
      cardId: cardId,
      rating: 3,
      state: 'new',
      step: 0,
      stability: 0.0,
      difficulty: 0.0,
      scheduledDays: 1,
      reps: 0,
      lapses: 0,
      dueDate: new Date().toISOString()
    };

    const newCard = {
      id: cardId,
      lemma: tok.lemma || tok.surface,
      surface: tok.surface,
      targetLang: this.targetLang,
      reading: tok.pronounced_as || tok.phonetic_script || '',
      meaning: (tok.meanings && tok.meanings.length) ? tok.meanings.join(', ') : tok.surface,
      contextSentence: seg ? seg.original_text : '',
      contextTranslation: seg ? seg.translated_text : '',
      ruleNote: tok.orthographic_rule_note || null,
      fsrs: initialFsrs,
      createdAt: new Date().toISOString()
    };

    // Prevent duplicate card for same lemma
    const existingIdx = this.flashcards.findIndex((c) => c.lemma === (tok.lemma || tok.surface));
    if (existingIdx !== -1) {
      this.flashcards[existingIdx] = newCard;
    } else {
      this.flashcards.push(newCard);
    }

    localStorage.setItem('koestream_flashcards', JSON.stringify(this.flashcards));
    this.updateSRSBadge();
    this.closeModal('modal-dictionary');

    const badge = document.getElementById('srs-due-badge');
    if (badge) {
      badge.textContent = String(this.getDueFlashcards().length);
      badge.style.display = 'inline-block';
    }
  }

  updateSRSBadge() {
    const badge = document.getElementById('srs-due-badge');
    if (!badge) return;
    const dueCount = this.getDueFlashcards().length;
    badge.textContent = dueCount > 0 ? dueCount : '0';
    badge.style.display = dueCount > 0 ? 'inline-block' : 'none';
  }

  getDueFlashcards() {
    const now = new Date();
    return this.flashcards.filter((c) => {
      if (!c.fsrs || !c.fsrs.dueDate) return true;
      return new Date(c.fsrs.dueDate) <= now;
    });
  }

  openReviewModal() {
    this.reviewQueue = this.getDueFlashcards();
    if (!this.reviewQueue.length) {
      alert('Semua flashcard Anda sudah diulang! Tidak ada kartu due hari ini.');
      return;
    }

    this.currentReviewIndex = 0;
    this.isCardFlipped = false;
    this.renderCurrentReviewCard();
    document.getElementById('modal-review').classList.add('open');
  }

  renderCurrentReviewCard() {
    if (this.currentReviewIndex >= this.reviewQueue.length) {
      this.closeModal('modal-review');
      alert('Selesai! Anda telah menyelesaikan seluruh sesi review SRS hari ini.');
      this.updateSRSBadge();
      return;
    }

    const card = this.reviewQueue[this.currentReviewIndex];
    this.isCardFlipped = false;

    const progressEl = document.getElementById('review-progress');
    const frontEl = document.getElementById('review-card-front');
    const backEl = document.getElementById('review-card-back');
    const ratingBar = document.getElementById('review-rating-bar');

    progressEl.textContent = `Kartu ${this.currentReviewIndex + 1} dari ${this.reviewQueue.length}`;

    // Highlight target word in context sentence
    const highlightedSentence = card.contextSentence.replace(
      new RegExp(card.surface, 'g'),
      `<mark style="background-color: var(--primary-light); color: var(--primary); padding: 0 4px; border-radius: 4px;">${card.surface}</mark>`
    );

    frontEl.innerHTML = `
      <div style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.75rem;">${card.surface}</div>
      <div style="font-size: 1.05rem; line-height: 1.5;">${highlightedSentence}</div>
      <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 1rem;">Klik kartu untuk melihat jawaban</div>
    `;

    backEl.style.display = 'none';
    ratingBar.style.display = 'none';

    // Interval labels for FSRS ratings 1..4
    const stability = (card.fsrs && card.fsrs.stability) || 0.4;
    document.getElementById('interval-again').textContent = this.fsrs.getIntervalLabel(stability, 1);
    document.getElementById('interval-hard').textContent = this.fsrs.getIntervalLabel(stability, 2);
    document.getElementById('interval-good').textContent = this.fsrs.getIntervalLabel(stability, 3);
    document.getElementById('interval-easy').textContent = this.fsrs.getIntervalLabel(stability, 4);
  }

  flipReviewCard() {
    if (this.isCardFlipped) return;
    this.isCardFlipped = true;

    const card = this.reviewQueue[this.currentReviewIndex];
    const backEl = document.getElementById('review-card-back');
    const ratingBar = document.getElementById('review-rating-bar');

    backEl.innerHTML = `
      <div style="font-size: 1.15rem; color: var(--primary); font-weight: 700; margin-bottom: 0.35rem;">
        ${card.reading}
      </div>
      <div style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.65rem;">
        ${card.meaning}
      </div>
      <div style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
        ${card.contextTranslation}
      </div>
      ${card.ruleNote ? `<div class="dict-rule-box" style="margin-top: 0.5rem;">${card.ruleNote}</div>` : ''}
    `;

    backEl.style.display = 'block';
    ratingBar.style.display = 'grid';
  }

  rateFlashcard(rating) {
    const card = this.reviewQueue[this.currentReviewIndex];
    const updatedFsrs = this.fsrs.step(card, rating);
    card.fsrs = updatedFsrs;

    // Save updated card to permanent flashcards store
    const idx = this.flashcards.findIndex((c) => c.id === card.id);
    if (idx !== -1) {
      this.flashcards[idx].fsrs = updatedFsrs;
      localStorage.setItem('koestream_flashcards', JSON.stringify(this.flashcards));
    }

    this.currentReviewIndex++;
    this.renderCurrentReviewCard();
  }

  // =====================================================================
  // SHADOWING STUDIO: Native audio reference + User microphone recording
  // =====================================================================
  openShadowingModal(segmentIndex) {
    const seg = this.videoResponse.segments[segmentIndex];
    this.activeShadowingSegment = seg;

    const textEl = document.getElementById('shadowing-text');
    const transEl = document.getElementById('shadowing-trans');
    const canvas = document.getElementById('shadowing-canvas');
    const resultBox = document.getElementById('shadowing-result');

    textEl.textContent = seg.original_text;
    transEl.textContent = seg.translated_text;
    resultBox.style.display = 'none';

    if (!this.shadowingStudio) {
      this.shadowingStudio = new ShadowingStudio(canvas);
    }
    this.shadowingStudio.clearCanvas();

    document.getElementById('modal-shadowing').classList.add('open');
  }

  async toggleShadowingRecord() {
    if (!this.shadowingStudio) return;
    const btn = document.getElementById('btn-shadowing-record');

    if (this.shadowingStudio.isRecording) {
      btn.innerHTML = '⏳ Menilai...';
      const audioBlob = await this.shadowingStudio.stopRecording();
      btn.innerHTML = '🎙️ Mulai Rekam';

      const evalResult = this.shadowingStudio.calculateEvaluationScore();
      const resultBox = document.getElementById('shadowing-result');
      resultBox.style.display = 'block';
      resultBox.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.4rem;">
          <strong style="font-size: 1.1rem;">Skor Akurasi Intonasi:</strong>
          <span style="font-size: 1.6rem; font-weight: 800; color: #4ADE80;">${evalResult.score}/100</span>
        </div>
        <div style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.4;">
          ${evalResult.feedback}
        </div>
      `;
    } else {
      try {
        await this.shadowingStudio.startRecording();
        btn.innerHTML = '⏹️ Berhenti & Evaluasi';
      } catch (err) {
        alert('Gagal mengakses mikrofon. Pastikan Anda memberikan izin akses mikrofon di browser.');
      }
    }
  }

  escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  renderMarkdownToHtml(md) {
    if (!md) return '';
    let html = md
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h4 style="margin: 1.15rem 0 0.4rem; color: #38bdf8; font-size: 0.98rem; font-weight: 700;">$1</h4>');
    html = html.replace(/^## (.*$)/gim, '<h3 style="margin: 1.3rem 0 0.5rem; color: #f8fafc; font-size: 1.05rem; font-weight: 700;">$1</h3>');
    html = html.replace(/^# (.*$)/gim, '<h2 style="margin: 1.5rem 0 0.5rem; color: #f8fafc; font-size: 1.15rem; font-weight: 800;">$1</h2>');

    // Horizontal line
    html = html.replace(/^\s*---\s*$/gim, '<hr style="border: none; border-top: 1px solid var(--border-subtle); margin: 0.85rem 0;">');

    // Bold, italic, code
    html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #f8fafc;">$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em style="color: #94a3b8;">$1</em>');
    html = html.replace(/`([^`]+)`/g, '<code style="background: rgba(255,255,255,0.08); padding: 2px 6px; border-radius: 4px; font-size: 0.88em; font-family: monospace; color: #38bdf8;">$1</code>');

    // Blockquotes
    html = html.replace(/^\> (.*$)/gim, '<blockquote style="border-left: 3px solid #38bdf8; margin: 0.6rem 0; padding: 0.4rem 0.8rem; background: rgba(56,189,248,0.06); border-radius: 0 4px 4px 0; font-size: 0.88rem;">$1</blockquote>');

    // Bullet points
    html = html.replace(/^\s*[\*\-]\s+(.*$)/gim, '<li style="margin-left: 1.25rem; margin-bottom: 0.35rem; color: var(--text-secondary);">$1</li>');

    // Paragraph breaks
    html = html.replace(/\n\n+/g, '<div style="margin-bottom: 0.75rem;"></div>');
    html = html.replace(/\n/g, '<br>');

    return html;
  }

  async explainGrammarSentence(index) {
    if (!this.videoResponse || !this.videoResponse.segments || !this.videoResponse.segments[index]) {
      console.warn('explainGrammarSentence: Segmen tidak ditemukan untuk indeks:', index);
      return;
    }
    const seg = this.videoResponse.segments[index];
    const modal = document.getElementById('modal-grammar');
    const body = document.getElementById('grammar-body');
    const sentenceEl = document.getElementById('grammar-sentence');

    if (sentenceEl) {
      sentenceEl.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; margin-bottom: 0.5rem;">
          <span style="font-size: 1.2rem; font-weight: 700; color: #f8fafc; letter-spacing: 0.02em;">${this.escapeHtml(seg.original_text)}</span>
          <span style="font-size: 0.75rem; background: rgba(56,189,248,0.15); color: #38bdf8; padding: 2px 8px; border-radius: 9999px; font-weight: 600; white-space: nowrap;">Baris #${index + 1}</span>
        </div>
      `;
    }

    body.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.75rem; padding: 2.25rem 1rem;">
        <div class="spinner" style="width: 32px; height: 32px; border-width: 3px; border-top-color: #38bdf8;"></div>
        <div style="color: #f8fafc; font-size: 0.98rem; font-weight: 600;">
          Menghubungkan ke AI Guru Bahasa...
        </div>
        <div style="font-size: 0.82rem; color: var(--text-muted); text-align: center;">
          Menganalisis partikel, konjugasi kata kerja, dan nuansa kalimat
        </div>
      </div>
    `;
    modal.classList.add('open');

    try {
      const result = await this.api.explainGrammar(seg.original_text, this.targetLang, this.nativeLang);

      const formattedSummary = this.renderMarkdownToHtml(result.summary || '');

      let tokensHtml = '';
      if (result.tokens && result.tokens.length > 0) {
        tokensHtml = `
          <div style="margin-top: 1.25rem; padding-top: 1rem; border-top: 1px solid var(--border-subtle);">
            <div style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 0.6rem;">
              Uraian Token & Bentuk Kamus (Morfologi)
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
              ${result.tokens.map(t => {
                const isVerb = t.pos === 'VERB';
                const isPart = t.pos === 'PART';
                const isAdj = t.pos === 'ADJ';
                const isAux = t.pos === 'AUX';
                const badgeColor = isVerb ? '#38bdf8' : isPart ? '#f43f5e' : isAdj ? '#10b981' : isAux ? '#fbbf24' : '#94a3b8';
                const badgeBg = isVerb ? 'rgba(56,189,248,0.12)' : isPart ? 'rgba(244,63,94,0.12)' : isAdj ? 'rgba(16,185,129,0.12)' : isAux ? 'rgba(251,191,36,0.12)' : 'rgba(148,163,184,0.12)';
                return `
                  <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 0.45rem 0.75rem; font-size: 0.82rem; display: flex; flex-direction: column; gap: 3px; min-width: 100px;">
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;">
                      <span style="font-weight: 700; color: #f8fafc; font-size: 0.95rem;">${this.escapeHtml(t.surface)}</span>
                      <span style="font-size: 0.68rem; color: ${badgeColor}; background: ${badgeBg}; padding: 1px 5px; border-radius: 4px; font-weight: 600;">${this.escapeHtml(t.pos)}</span>
                    </div>
                    ${t.lemma && t.lemma !== t.surface ? `<span style="font-size: 0.72rem; color: var(--text-muted);">Kamus: ${this.escapeHtml(t.lemma)}</span>` : ''}
                    ${t.meaning && t.meaning !== '-' ? `<span style="font-size: 0.75rem; color: #cbd5e1;">${this.escapeHtml(t.meaning)}</span>` : ''}
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
      }

      body.innerHTML = `
        <div style="line-height: 1.65; font-size: 0.92rem; color: var(--text-secondary); max-height: 60vh; overflow-y: auto; padding-right: 0.35rem;">
          ${formattedSummary}
          ${tokensHtml}
        </div>
        <div style="margin-top: 1rem; padding: 0.75rem 1rem; background: rgba(56,189,248,0.06); border: 1px solid rgba(56,189,248,0.2); border-radius: var(--radius-md); font-size: 0.85rem; color: var(--text-primary); display: flex; align-items: flex-start; gap: 0.5rem;">
          <span style="color: #38bdf8; font-weight: 700; flex-shrink: 0;">Arti Bahasa Indonesia:</span>
          <span style="line-height: 1.4;">${this.escapeHtml(seg.translated_text || '-')}</span>
        </div>
      `;
    } catch (err) {
      console.error('explainGrammarSentence failed:', err);
      body.innerHTML = `
        <div style="padding: 1.5rem; text-align: center;">
          <div style="color: #ef4444; font-weight: 600; margin-bottom: 0.5rem;">Gagal Memuat Eksplanasi</div>
          <div style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1rem;">
            Terjadi kendala saat memproses tata bahasa. Silakan klik tombol di bawah untuk mencoba lagi.
          </div>
          <button class="btn-primary" onclick="app.explainGrammarSentence(${index})" style="padding: 0.45rem 1.25rem; font-size: 0.85rem; border-radius: 9999px;">
            Coba Lagi
          </button>
        </div>
      `;
    }
  }

  openSettingsModal() {
    const modal = document.getElementById('modal-settings');
    const input = document.getElementById('input-api-base-url');
    input.value = this.api.baseUrl;
    modal.classList.add('open');
  }

  saveSettings() {
    const input = document.getElementById('input-api-base-url');
    if (input) {
      this.api.setBaseUrl(input.value.trim());
      alert('Pengaturan URL API Backend berhasil disimpan.');
    }
    this.closeModal('modal-settings');
  }

  bindEvents() {
    // Ingestion Form
    const btnLoad = document.getElementById('btn-load');
    const inputUrl = document.getElementById('input-url');
    if (btnLoad && inputUrl) {
      btnLoad.onclick = () => {
        const url = inputUrl.value.trim();
        if (url) this.loadMedia(url);
      };
      inputUrl.onfocus = () => {
        inputUrl.select();
      };
      inputUrl.onkeydown = (e) => {
        if (e.key === 'Enter') {
          const url = inputUrl.value.trim();
          if (url) this.loadMedia(url);
        }
      };
    }

    // Playlist Collection Modal Triggers
    const btnOpenPlaylist = document.getElementById('btn-open-playlist');
    if (btnOpenPlaylist) btnOpenPlaylist.onclick = () => this.openPlaylistModal();

    const btnQuickPlaylist = document.getElementById('btn-quick-playlist');
    if (btnQuickPlaylist) btnQuickPlaylist.onclick = () => this.openPlaylistModal();

    const btnPlayerPlaylist = document.getElementById('btn-player-change-song');
    if (btnPlayerPlaylist) btnPlayerPlaylist.onclick = () => this.openPlaylistModal();

    // Quick Playlist Demos (matching user's liked songs)
    const demoKawaikute = document.getElementById('demo-kawaikute');
    if (demoKawaikute) {
      demoKawaikute.onclick = () => this.loadMedia('https://open.spotify.com/track/4Mo0vn7a03pJ19uESUrH5a', false);
    }
    const demoSparkle = document.getElementById('demo-sparkle');
    if (demoSparkle) {
      demoSparkle.onclick = () => this.loadMedia('https://open.spotify.com/track/1HNvADmPBGAExeyIHkcJtd', false);
    }
    const demoMonokrom = document.getElementById('demo-monokrom');
    if (demoMonokrom) {
      demoMonokrom.onclick = () => this.loadMedia('https://open.spotify.com/track/4GfK1qOF3uBWidbPlTCQRL', false);
    }
    const demoYoasobi = document.getElementById('demo-yoasobi');
    if (demoYoasobi) {
      demoYoasobi.onclick = () => this.loadMedia('https://open.spotify.com/track/4Mo0vn7a03pJ19uESUrH5a?song=yoasobi', false);
    }
    const demoYt = document.getElementById('demo-youtube');
    if (demoYt) {
      demoYt.onclick = () => this.loadMedia('https://www.youtube.com/watch?v=9bZkp7q19f0', false);
    }

    // Language Dropdown
    const langSelect = document.getElementById('select-target-lang');
    if (langSelect) {
      langSelect.value = this.targetLang;
      langSelect.onchange = (e) => {
        const newLang = e.target.value;
        this.targetLang = newLang;
        localStorage.setItem('koestream_target_lang', this.targetLang);

        const matchingTrack = (window.KOESTREAM_PLAYLIST || []).find(t => t.language === newLang);
        if (matchingTrack) {
          this.loadMedia(matchingTrack.url, false);
        } else if (inputUrl && inputUrl.value.trim()) {
          this.loadMedia(inputUrl.value.trim());
        }
      };
    }

    // Segmented Subtitle Toggles
    const toggleRuby = document.getElementById('toggle-ruby');
    if (toggleRuby) {
      toggleRuby.classList.toggle('active', this.isRubyVisible);
      toggleRuby.onclick = () => {
        this.isRubyVisible = !this.isRubyVisible;
        localStorage.setItem('koestream_ruby_visible', this.isRubyVisible);
        toggleRuby.classList.toggle('active', this.isRubyVisible);
        this.renderTranscriptStream();
      };
    }

    const toggleRomaji = document.getElementById('toggle-romaji');
    if (toggleRomaji) {
      toggleRomaji.classList.toggle('active', this.showRomaji);
      toggleRomaji.onclick = () => {
        this.showRomaji = !this.showRomaji;
        localStorage.setItem('koestream_show_romaji', this.showRomaji);
        toggleRomaji.classList.toggle('active', this.showRomaji);
        this.renderTranscriptStream();
      };
    }

    const toggleIPlusOne = document.getElementById('toggle-i-plus-one');
    if (toggleIPlusOne) {
      toggleIPlusOne.classList.toggle('active', this.filterIPlusOneOnly);
      toggleIPlusOne.onclick = () => {
        this.filterIPlusOneOnly = !this.filterIPlusOneOnly;
        toggleIPlusOne.classList.toggle('active', this.filterIPlusOneOnly);
        this.renderTranscriptStream();
      };
    }

    const toggleTheme = document.getElementById('btn-toggle-theme');
    if (toggleTheme) {
      toggleTheme.onclick = () => this.toggleTheme();
    }

    // Integrated Media Player Controls
    const btnPlayPause = document.getElementById('btn-play-pause');
    if (btnPlayPause) btnPlayPause.onclick = () => this.togglePlayPause();

    const btnLoop = document.getElementById('btn-loop');
    if (btnLoop) btnLoop.onclick = () => this.toggleLoop();

    const btnSpeed = document.getElementById('btn-speed-toggle');
    if (btnSpeed) btnSpeed.onclick = () => this.cycleSpeed();

    const btnToggleVideo = document.getElementById('btn-toggle-video-mode');
    if (btnToggleVideo) {
      btnToggleVideo.onclick = () => this.toggleVideoMode();
    }

    const btnTheater = document.getElementById('btn-theater-mode');
    if (btnTheater) {
      btnTheater.onclick = () => this.toggleTheaterMode();
    }

    // Lyric Sync Calibration Controls
    const btnSyncSlower = document.getElementById('btn-sync-slower');
    if (btnSyncSlower) {
      btnSyncSlower.onclick = () => this.adjustSyncOffset(-200);
    }

    const btnSyncFaster = document.getElementById('btn-sync-faster');
    if (btnSyncFaster) {
      btnSyncFaster.onclick = () => this.adjustSyncOffset(200);
    }

    const btnSyncReset = document.getElementById('btn-sync-reset');
    if (btnSyncReset) {
      btnSyncReset.onclick = () => this.resetSyncOffset();
    }

    // Scrubber Slider Dragging & Seeking
    const scrubber = document.getElementById('playback-scrubber');
    if (scrubber) {
      scrubber.oninput = (e) => {
        this.isUserScrubbing = true;
        const val = parseFloat(e.target.value);
        const pct = val / 10;
        const fill = document.getElementById('scrubber-fill');
        const track = document.querySelector('.scrubber-track-wrapper');
        if (fill) fill.style.width = `${pct}%`;
        if (track) track.style.setProperty('--scrub-pct', `${pct}%`);
        const totalMs = this.totalDurationMs || 40000;
        const currentMs = (val / 1000) * totalMs;
        this.updateTimeDisplay(currentMs);
      };
      scrubber.onchange = (e) => {
        this.isUserScrubbing = false;
        const val = parseFloat(e.target.value);
        const totalMs = this.totalDurationMs || 40000;
        const targetMs = (val / 1000) * totalMs;
        this.seekToMs(targetMs);
      };
    }

    const btnPrev = document.getElementById('btn-prev-segment');
    if (btnPrev) {
      btnPrev.onclick = () => {
        if (this.currentSegmentIndex > 0) {
          this.seekToSegment(this.currentSegmentIndex - 1);
        }
      };
    }

    const btnNext = document.getElementById('btn-next-segment');
    if (btnNext) {
      btnNext.onclick = () => {
        if (this.videoResponse && this.currentSegmentIndex < this.videoResponse.segments.length - 1) {
          this.seekToSegment(this.currentSegmentIndex + 1);
        }
      };
    }

    const speedSelect = document.getElementById('select-speed');
    if (speedSelect) {
      speedSelect.onchange = (e) => this.setSpeed(parseFloat(e.target.value));
    }

    const autoScrollCb = document.getElementById('cb-auto-scroll');
    if (autoScrollCb) {
      autoScrollCb.onchange = (e) => {
        this.autoScroll = e.target.checked;
      };
    }

    // SRS Review Modal Triggers
    const btnOpenReview = document.getElementById('btn-open-review');
    if (btnOpenReview) btnOpenReview.onclick = () => this.openReviewModal();

    const btnOpenSettings = document.getElementById('btn-open-settings');
    if (btnOpenSettings) btnOpenSettings.onclick = () => this.openSettingsModal();

    // Close modals on Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.open').forEach((m) => m.classList.remove('open'));
      }
    });

    // Close modal on click outside
    document.querySelectorAll('.modal-overlay').forEach((modal) => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('open');
        }
      });
    });
  }

  openPlaylistModal() {
    this.renderPlaylist();
    this.openModal('modal-playlist');
  }

  renderPlaylist(filter = '') {
    const container = document.getElementById('playlist-tracks-container');
    const countEl = document.getElementById('playlist-track-count');
    if (!container) return;

    const playlist = window.KOESTREAM_PLAYLIST || [];
    const query = filter.trim().toLowerCase();
    const platformFilter = this.playlistPlatformFilter || 'all';

    let filtered = playlist;
    if (platformFilter === 'spotify') {
      filtered = filtered.filter(t => t.type === 'spotify');
    } else if (platformFilter === 'youtube') {
      filtered = filtered.filter(t => t.type !== 'spotify');
    }

    if (query) {
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(query) || 
        t.artist.toLowerCase().includes(query) || 
        (t.album && t.album.toLowerCase().includes(query))
      );
    }

    if (countEl) countEl.textContent = `${filtered.length} lagu`;

    if (!filtered.length) {
      container.innerHTML = `
        <div style="padding: 2.5rem 1rem; text-align: center; color: var(--text-muted); font-size: 0.9rem;">
          Tidak ada lagu yang cocok dengan kriteria pencarian.
        </div>
      `;
      return;
    }

    const currentId = this.videoResponse?.spotify_id || this.videoResponse?.video_id || '';

    container.innerHTML = filtered.map((track, idx) => {
      const isActive = currentId && (track.id.includes(currentId) || currentId.includes(track.id));
      const isSpotify = track.type === 'spotify';
      const targetEngine = isSpotify ? 'spotify' : 'youtube';
      const platformBadge = isSpotify
        ? `<span class="track-badge-platform spotify">Spotify</span>`
        : `<span class="track-badge-platform youtube">YouTube</span>`;

      return `
        <div class="playlist-track-row ${isActive ? 'active' : ''}" onclick="app.selectPlaylistTrack('${this.escapeHtml(track.id)}', '${targetEngine}')">
          <span class="track-col-num">${isActive ? '▶' : (idx + 1)}</span>
          <div class="track-main-cell">
            <img class="track-thumb" src="${this.escapeHtml(track.artwork)}" alt="${this.escapeHtml(track.title)}" onerror="this.src='https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e0266e246eec1f1fb552ed0f017'">
            <div class="track-text-meta">
              <div class="track-title-wrapper" style="display:flex;align-items:center;gap:6px;">
                <span class="track-name-text">${this.escapeHtml(track.title)}</span>
                ${platformBadge}
              </div>
              <span class="track-artist-text">${this.escapeHtml(track.artist)}</span>
            </div>
          </div>
          <span class="track-album-cell">${this.escapeHtml(track.album || '-')}</span>
          <span class="track-time-cell">${this.escapeHtml(track.duration || '--:--')}</span>
          <div class="track-action-group">
            ${isSpotify ? `
              <button class="track-btn-spotify" onclick="event.stopPropagation(); app.selectPlaylistTrack('${this.escapeHtml(track.id)}', 'spotify')" title="Putar Spotify">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.563.387-.857.207-2.35-1.435-5.308-1.76-8.792-.963-.335.077-.67-.133-.746-.468-.077-.334.132-.67.467-.746 3.808-.87 7.076-.5 9.721 1.113.294.18.387.563.207.857zm1.226-2.723c-.226.367-.706.482-1.072.256-2.69-1.653-6.79-2.133-9.971-1.167-.413.125-.85-.11-.975-.523-.125-.413.11-.85.523-.975 3.633-1.103 8.163-.568 11.239 1.337.366.226.482.706.256 1.072zm.105-2.835C14.692 8.95 9.375 8.775 6.297 9.71c-.493.15-1.016-.13-1.166-.623-.15-.493.13-1.016.623-1.166 3.532-1.072 9.404-.866 13.115 1.338.445.264.59.838.326 1.283-.264.444-.838.59-1.282.326z"/></svg>
                <span>Putar Spotify</span>
              </button>
            ` : `
              <button class="track-btn-full" onclick="event.stopPropagation(); app.selectPlaylistTrack('${this.escapeHtml(track.id)}', 'youtube')" title="Putar YouTube">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" style="transform: translateX(0.5px);"><polygon points="6 4 20 12 6 20 6 4"></polygon></svg>
                <span>Putar YouTube</span>
              </button>
            `}
          </div>
        </div>
      `;
    }).join('');
  }

  filterPlaylist(val) {
    this.renderPlaylist(val);
  }

  selectPlaylistTrack(trackId, preferEngine) {
    const playlist = window.KOESTREAM_PLAYLIST || [];
    const track = playlist.find(t => t.id === trackId);
    if (!track) return;

    const engine = (track.type === 'spotify' || preferEngine === 'spotify') ? 'spotify' : 'youtube';
    this.currentEngine = engine;
    this.setPlatformMode(engine, false);

    const inputUrl = document.getElementById('input-url');
    if (inputUrl) inputUrl.value = track.url;

    this.closeModal('modal-playlist');
    this.loadMedia(track.url, false);
  }

  loadFromModalInput() {
    const input = document.getElementById('modal-custom-url-input');
    if (!input) return;
    const url = input.value.trim();
    if (!url) return;

    const isSpotify = url.includes('spotify.com');
    this.setPlatformMode(isSpotify ? 'spotify' : 'youtube', false);

    const mainInput = document.getElementById('input-url');
    if (mainInput) mainInput.value = url;

    this.closeModal('modal-playlist');
    this.loadMedia(url, false);
  }

  openCustomLinkPrompt() {
    const userUrl = prompt('Masukkan link Spotify atau YouTube yang ingin kamu putar (contoh: https://open.spotify.com/track/...):');
    if (userUrl && userUrl.trim()) {
      const isSpotify = userUrl.includes('spotify.com');
      this.setPlatformMode(isSpotify ? 'spotify' : 'youtube', false);
      const inputUrl = document.getElementById('input-url');
      if (inputUrl) inputUrl.value = userUrl.trim();
      this.closeModal('modal-playlist');
      this.loadMedia(userUrl.trim(), false);
    }
  }
}

window.KoeStreamApp = KoeStreamApp;

// Global bootstrap with DOM readyState fallback
function initKoeStream() {
  if (!window.app) {
    try {
      window.app = new KoeStreamApp();
      window.koeApp = window.app;
      console.log('KoeStream initialized successfully.');
    } catch (e) {
      console.error('Failed to initialize KoeStream:', e);
    }
  }
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initKoeStream);
} else {
  initKoeStream();
}
