import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:youtube_player_flutter/youtube_player_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_tts/flutter_tts.dart';

import '../state/app_state.dart';
import '../models/models.dart';
import '../widgets/universal_ruby_subtitle.dart';
import '../widgets/word_inspector_widget.dart';
import '../widgets/playlist_modal.dart';
import '../widgets/grammar_modal.dart';
import 'review_screen.dart';
import 'shadowing_screen.dart';

class ImmersionScreen extends StatefulWidget {
  const ImmersionScreen({super.key});

  @override
  State<ImmersionScreen> createState() => _ImmersionScreenState();
}

class _ImmersionScreenState extends State<ImmersionScreen> {
  final TextEditingController _urlController = TextEditingController(
    text: 'https://open.spotify.com/track/2BlDX1yfT0ea5wo0vjCKKa',
  );
  final ScrollController _transcriptScrollController = ScrollController();
  final Map<int, GlobalKey> _cardKeys = {};
  final FlutterTts _flutterTts = FlutterTts();

  YoutubePlayerController? _youtubeController;
  String? _loadedVideoId;
  int _currentPositionMs = 0;
  bool _isAutoScrollEnabled = true;

  // Platform Mode ('spotify' | 'youtube')
  String _activePlatformMode = 'spotify';

  // Kalibrasi Offset Sinkronisasi Lirik (ms)
  int _userSyncOffsetMs = 0;

  // State Audio Player untuk Spotify / Media Audio
  Timer? _audioTimer;
  bool _isAudioPlaying = false;
  int _audioDurationMs = 252000;

  // Active Inspected Token (for docked or bottom sheet Word Inspector)
  UniversalToken? _activeInspectedToken;
  TranscriptSegment? _activeInspectedSegment;

  // Video Mode State ('video' | 'audio')
  bool _isVideoMode = false;
  bool _isTheaterMode = false;

  final List<Map<String, String>> _supportedLanguages = [
    {'code': 'ja', 'name': 'Japanese (日本語)'},
    {'code': 'zh', 'name': 'Chinese (中文)'},
    {'code': 'ko', 'name': 'Korean (한국어)'},
    {'code': 'en', 'name': 'English (US)'},
    {'code': 'id', 'name': 'Indonesian (Bahasa)'},
    {'code': 'de', 'name': 'German (Deutsch)'},
    {'code': 'th', 'name': 'Thai (ไทย)'},
    {'code': 'ar', 'name': 'Arabic (العربية)'},
  ];

  @override
  void initState() {
    super.initState();
    _initTts();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final appState = Provider.of<AppState>(context, listen: false);
      if (appState.videoResponse == null) {
        // Otomatis muat lagu demo awal seperti versi web
        appState.processVideo(_urlController.text.trim(), demo: true);
      } else {
        _loadSongSyncOffset(appState.videoResponse!.videoId);
      }
    });
  }

  void _initTts() async {
    await _flutterTts.setSpeechRate(0.5);
    await _flutterTts.setVolume(1.0);
    await _flutterTts.setPitch(1.0);
  }

  void _speakSentence(String text) async {
    final appState = Provider.of<AppState>(context, listen: false);
    final langMap = {
      'ja': 'ja-JP',
      'zh': 'zh-CN',
      'ko': 'ko-KR',
      'ar': 'ar-SA',
      'th': 'th-TH',
      'en': 'en-US',
      'de': 'de-DE',
      'id': 'id-ID',
    };
    final ttsLang = langMap[appState.targetLang] ?? 'ja-JP';
    await _flutterTts.setLanguage(ttsLang);
    await _flutterTts.speak(text);
  }

  @override
  void dispose() {
    _audioTimer?.cancel();
    _youtubeController?.dispose();
    _urlController.dispose();
    _transcriptScrollController.dispose();
    _flutterTts.stop();
    super.dispose();
  }

  Future<void> _loadSongSyncOffset(String videoId) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final key = 'sync_offset_${videoId.replaceAll(RegExp(r'[^a-zA-Z0-9_-]'), '_')}';
      if (mounted) {
        setState(() {
          _userSyncOffsetMs = prefs.getInt(key) ?? 0;
        });
      }
    } catch (_) {}
  }

  Future<void> _adjustSyncOffset(int deltaMs) async {
    final appState = Provider.of<AppState>(context, listen: false);
    final videoId = appState.videoResponse?.videoId ?? 'default';
    final newOffset = (_userSyncOffsetMs + deltaMs).clamp(-5000, 5000);
    setState(() {
      _userSyncOffsetMs = newOffset;
    });
    try {
      final prefs = await SharedPreferences.getInstance();
      final key = 'sync_offset_${videoId.replaceAll(RegExp(r'[^a-zA-Z0-9_-]'), '_')}';
      await prefs.setInt(key, newOffset);
    } catch (_) {}
  }

  Future<void> _resetSyncOffset() async {
    final appState = Provider.of<AppState>(context, listen: false);
    final videoId = appState.videoResponse?.videoId ?? 'default';
    setState(() {
      _userSyncOffsetMs = 0;
    });
    try {
      final prefs = await SharedPreferences.getInstance();
      final key = 'sync_offset_${videoId.replaceAll(RegExp(r'[^a-zA-Z0-9_-]'), '_')}';
      await prefs.remove(key);
    } catch (_) {}
  }

  void _setPlatformMode(String platform) {
    setState(() {
      _activePlatformMode = platform;
      if (platform == 'spotify') {
        _urlController.text = 'https://open.spotify.com/track/2BlDX1yfT0ea5wo0vjCKKa';
      } else {
        _urlController.text = 'https://www.youtube.com/watch?v=by4SYYWlhEs';
      }
    });
  }

  void _setupYoutubeController(String videoId) {
    final isValidYoutube = RegExp(r'^[a-zA-Z0-9_-]{11}$').hasMatch(videoId);
    if (!isValidYoutube) {
      _youtubeController?.dispose();
      _youtubeController = null;
      _loadedVideoId = videoId;
      _cardKeys.clear();

      final appState = Provider.of<AppState>(context, listen: false);
      if (appState.videoResponse?.segments.isNotEmpty == true) {
        final lastSeg = appState.videoResponse!.segments.last;
        _audioDurationMs = lastSeg.endMs > 0 ? lastSeg.endMs : 252000;
      }
      return;
    }

    if (_loadedVideoId == videoId && _youtubeController != null) return;

    _youtubeController?.dispose();
    _loadedVideoId = videoId;
    _cardKeys.clear();

    _youtubeController = YoutubePlayerController(
      initialVideoId: videoId,
      flags: const YoutubePlayerFlags(
        autoPlay: false,
        mute: false,
        enableCaption: false,
        isLive: false,
        forceHD: false,
      ),
    )..addListener(_onPlayerStateChanged);
  }

  void _onPlayerStateChanged() {
    if (!mounted || _youtubeController == null) return;
    final appState = Provider.of<AppState>(context, listen: false);
    final resp = appState.videoResponse;
    if (resp == null || resp.segments.isEmpty) return;

    final currentPositionMs = _youtubeController!.value.position.inMilliseconds;
    if (_currentPositionMs != currentPositionMs) {
      setState(() {
        _currentPositionMs = currentPositionMs;
      });
    }

    // Loop A-B Kalimat jika aktif
    if (appState.isLoopActive) {
      final currentSeg = appState.currentSegment;
      if (currentSeg != null && currentPositionMs >= currentSeg.endMs) {
        _youtubeController!.seekTo(Duration(milliseconds: currentSeg.startMs));
        return;
      }
    }

    // Sinkronisasi posisi aktif segmen transkrip (lead-in 350ms + kalibrasi offset lagu)
    final syncPositionMs = currentPositionMs + 350 + _userSyncOffsetMs;
    int? matchedIdx;
    for (int i = resp.segments.length - 1; i >= 0; i--) {
      final seg = resp.segments[i];
      if (syncPositionMs >= seg.startMs && syncPositionMs <= seg.endMs + 250) {
        matchedIdx = i;
        break;
      }
    }

    if (matchedIdx != null && appState.currentSegmentIndex != matchedIdx) {
      appState.setCurrentSegmentIndex(matchedIdx);
      _scrollToActiveSegment(matchedIdx);
    }
  }

  int? _calculateActiveTokenId(TranscriptSegment seg, int currentPositionMs) {
    if (seg.tokens.isEmpty) return null;
    if (currentPositionMs < seg.startMs) return seg.tokens.first.tokenId;
    if (currentPositionMs >= seg.endMs) return seg.tokens.last.tokenId;

    final totalDuration = seg.endMs - seg.startMs;
    if (totalDuration <= 0) return seg.tokens.first.tokenId;

    double totalWeight = 0.0;
    final weights = <double>[];
    for (final tok in seg.tokens) {
      final isPunct = tok.pos.toUpperCase() == 'PUNCT' ||
          tok.surface == '。' ||
          tok.surface == '、' ||
          tok.surface == '！' ||
          tok.surface == '？';
      final len = tok.surface.trim().length;
      final w = isPunct ? 0.25 : (len > 0 ? len.toDouble() : 1.0);
      weights.add(w);
      totalWeight += w;
    }

    if (totalWeight <= 0) return seg.tokens.first.tokenId;

    final elapsed = currentPositionMs - seg.startMs;
    double cumulativeWeight = 0.0;
    for (int i = 0; i < seg.tokens.length; i++) {
      final startRatio = cumulativeWeight / totalWeight;
      cumulativeWeight += weights[i];
      final endRatio = cumulativeWeight / totalWeight;

      final tokenStartMs = (startRatio * totalDuration).round();
      final tokenEndMs = (endRatio * totalDuration).round();

      if (elapsed >= tokenStartMs && elapsed < tokenEndMs) {
        return seg.tokens[i].tokenId;
      }
    }

    return seg.tokens.last.tokenId;
  }

  void _scrollToActiveSegment(int index) {
    if (!_isAutoScrollEnabled || !_transcriptScrollController.hasClients) return;

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted || !_transcriptScrollController.hasClients) return;

      final key = _cardKeys[index];
      final cardCtx = key?.currentContext;

      if (cardCtx != null && cardCtx.mounted) {
        Scrollable.ensureVisible(
          cardCtx,
          alignment: 0.12,
          duration: const Duration(milliseconds: 380),
          curve: Curves.easeInOutCubic,
        );
      }
    });
  }

  void _seekToSegment(TranscriptSegment seg, int index) {
    final appState = Provider.of<AppState>(context, listen: false);
    appState.setCurrentSegmentIndex(index);
    if (appState.videoResponse?.isSpotify == true) {
      _seekAudioTo(seg.startMs);
      if (!_isAudioPlaying) {
        _toggleAudioPlayback();
      }
    } else {
      _youtubeController?.seekTo(Duration(milliseconds: seg.startMs));
      _youtubeController?.play();
    }
    _scrollToActiveSegment(index);
  }

  void _changeSpeed(double speed) {
    final appState = Provider.of<AppState>(context, listen: false);
    appState.setPlaybackSpeed(speed);
    _youtubeController?.setPlaybackRate(speed);
    if (_isAudioPlaying) {
      _startAudioTimer();
    }
  }

  void _cycleSpeed() {
    final speeds = [0.75, 1.0, 1.25, 1.5];
    final appState = Provider.of<AppState>(context, listen: false);
    final curIdx = speeds.indexOf(appState.playbackSpeed);
    final nextIdx = (curIdx + 1) % speeds.length;
    _changeSpeed(speeds[nextIdx]);
  }

  void _toggleAudioPlayback() {
    if (_isAudioPlaying) {
      _audioTimer?.cancel();
      setState(() {
        _isAudioPlaying = false;
      });
    } else {
      setState(() {
        _isAudioPlaying = true;
      });
      _startAudioTimer();
    }
  }

  void _startAudioTimer() {
    _audioTimer?.cancel();
    final appState = Provider.of<AppState>(context, listen: false);
    final intervalMs = (100 / appState.playbackSpeed).round().clamp(25, 400);

    _audioTimer = Timer.periodic(Duration(milliseconds: intervalMs), (timer) {
      if (!mounted || !_isAudioPlaying) {
        timer.cancel();
        return;
      }
      final newPos = _currentPositionMs + 100;
      if (newPos >= _audioDurationMs) {
        setState(() {
          _currentPositionMs = _audioDurationMs;
          _isAudioPlaying = false;
        });
        timer.cancel();
        return;
      }

      setState(() {
        _currentPositionMs = newPos;
      });

      // Loop A-B jika aktif
      if (appState.isLoopActive) {
        final currentSeg = appState.currentSegment;
        if (currentSeg != null && _currentPositionMs >= currentSeg.endMs) {
          _seekAudioTo(currentSeg.startMs);
          return;
        }
      }

      // Sinkronisasi segmen aktif
      final resp = appState.videoResponse;
      if (resp != null && resp.segments.isNotEmpty) {
        final syncMs = _currentPositionMs + 350 + _userSyncOffsetMs;
        for (int i = resp.segments.length - 1; i >= 0; i--) {
          final seg = resp.segments[i];
          if (syncMs >= seg.startMs && syncMs <= seg.endMs + 250) {
            if (appState.currentSegmentIndex != i) {
              appState.setCurrentSegmentIndex(i);
              _scrollToActiveSegment(i);
            }
            break;
          }
        }
      }
    });
  }

  void _seekAudioTo(int ms) {
    setState(() {
      _currentPositionMs = ms.clamp(0, _audioDurationMs);
    });
  }

  void _showSettingsDialog() {
    final appState = Provider.of<AppState>(context, listen: false);
    final textController = TextEditingController(text: appState.apiService.baseUrl);

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Pengaturan API Backend'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Masukkan URL Server Backend (contoh: http://10.0.2.2:8000 untuk Android Emulator, atau URL Cloudflare Tunnel):',
              style: TextStyle(fontSize: 12.5),
            ),
            const SizedBox(height: 12.0),
            TextField(
              controller: textController,
              decoration: const InputDecoration(
                labelText: 'Base URL API',
                border: OutlineInputBorder(),
                isDense: true,
              ),
            ),
            const SizedBox(height: 10.0),
            () {
              bool isScanning = false;
              return StatefulBuilder(
                builder: (context, setBtnState) {
                  return OutlinedButton.icon(
                    onPressed: isScanning
                        ? null
                        : () async {
                            setBtnState(() => isScanning = true);
                            final found = await appState.apiService.autoDiscoverBaseUrl();
                            setBtnState(() => isScanning = false);
                            if (found != null) {
                              textController.text = found;
                              if (ctx.mounted) {
                                ScaffoldMessenger.of(ctx).showSnackBar(
                                  SnackBar(content: Text('Ditemukan server aktif: $found')),
                                );
                              }
                            } else {
                              if (ctx.mounted) {
                                ScaffoldMessenger.of(ctx).showSnackBar(
                                  const SnackBar(content: Text('Server backend tidak ditemukan.')),
                                );
                              }
                            }
                          },
                    icon: const Icon(Icons.radar, size: 16),
                    label: const Text('Deteksi Otomatis Server', style: TextStyle(fontSize: 12)),
                  );
                },
              );
            }(),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Batal'),
          ),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: const Color(0xFF6366F1)),
            onPressed: () async {
              await appState.setCustomApiBaseUrl(textController.text);
              if (ctx.mounted) Navigator.pop(ctx);
            },
            child: const Text('Simpan'),
          ),
        ],
      ),
    );
  }

  void _showLikedSongsPlaylist() {
    final appState = Provider.of<AppState>(context, listen: false);
    PlaylistModal.show(
      context,
      onSelectTrack: (track) {
        setState(() {
          _activePlatformMode = track.type;
          _urlController.text = track.url;
        });
        appState.processVideo(track.url);
      },
      onLoadCustomUrl: (url) {
        final isSp = url.contains('spotify.com') || url.startsWith('spotify_') || url.startsWith('spotify:');
        setState(() {
          _activePlatformMode = isSp ? 'spotify' : 'youtube';
          _urlController.text = url;
        });
        appState.processVideo(url);
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    // Sinkronisasi player jika video terupdate
    if (appState.videoResponse != null && _loadedVideoId != appState.videoResponse!.videoId) {
      _setupYoutubeController(appState.videoResponse!.videoId);
      _loadSongSyncOffset(appState.videoResponse!.videoId);
    }

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            // =================================================================
            // 1. NAVIGATION HEADER (1:1 with Web .app-header)
            // =================================================================
            _buildWebStyleHeader(appState, isDark),

            // =================================================================
            // 2. ERROR / FALLBACK NOTICE BANNER
            // =================================================================
            if (appState.errorMessage != null)
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.red.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: Colors.red.withValues(alpha: 0.35)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.error_outline, color: Colors.redAccent, size: 20),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        appState.errorMessage!,
                        style: const TextStyle(fontSize: 12, color: Colors.redAccent),
                      ),
                    ),
                    const SizedBox(width: 6),
                    FilledButton.tonal(
                      style: FilledButton.styleFrom(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        visualDensity: VisualDensity.compact,
                      ),
                      onPressed: () => appState.processVideo(_urlController.text.trim(), demo: true),
                      child: const Text('Mode Demo', style: TextStyle(fontSize: 11)),
                    ),
                  ],
                ),
              ),

            // =================================================================
            // 3. INTEGRATED PLAYER CARD (1:1 with Web #integrated-player-card)
            // =================================================================
            if (appState.videoResponse != null)
              _buildIntegratedPlayerCard(appState, isDark)
            else
              _buildEmptyPlayerPlaceholder(appState, isDark),

            // =================================================================
            // 4. TRANSCRIPT STREAM & SUBTITLES
            // =================================================================
            Expanded(
              child: appState.videoResponse == null
                  ? Center(
                      child: Text(
                        'Belum ada media yang dimuat',
                        style: TextStyle(
                          color: isDark ? const Color(0xFF71717A) : const Color(0xFF94A3B8),
                        ),
                      ),
                    )
                  : _buildTranscriptList(appState, isDark),
            ),

            // =================================================================
            // 5. DOCKED WORD INSPECTOR PANEL (When a token is tapped)
            // =================================================================
            if (_activeInspectedToken != null && _activeInspectedSegment != null)
              WordInspectorWidget(
                token: _activeInspectedToken!,
                segment: _activeInspectedSegment!,
                videoId: appState.videoResponse?.videoId ?? 'default',
                appState: appState,
                onClose: () => setState(() {
                  _activeInspectedToken = null;
                  _activeInspectedSegment = null;
                }),
              ),
          ],
        ),
      ),
    );
  }

  // =========================================================================
  // SUB-WIDGET: Web-Style App Header (.app-header)
  // =========================================================================
  Widget _buildWebStyleHeader(AppState appState, bool isDark) {
    return Container(
      padding: const EdgeInsets.fromLTRB(14, 8, 14, 8),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF09090B) : Colors.white,
        border: Border(
          bottom: BorderSide(
            color: isDark ? const Color(0xFF27272A) : const Color(0xFFE2E8F0),
            width: 1,
          ),
        ),
      ),
      child: Column(
        children: [
          // Row 1: Brand Logo + Language Dropdown + SRS Deck + Settings
          Row(
            children: [
              // Brand Minimalist (1:1 with Web .brand-minimal)
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 26,
                    height: 26,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)],
                      ),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: const Center(
                      child: Text(
                        'K',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 15,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  const Text(
                    'KoeStream',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                      letterSpacing: -0.4,
                    ),
                  ),
                ],
              ),
              const SizedBox(width: 8),
              Text(
                '/',
                style: TextStyle(
                  color: isDark ? const Color(0xFF3F3F46) : const Color(0xFFCBD5E1),
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(width: 8),

              // Language Selector Minimal Dropdown
              Expanded(
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: appState.targetLang,
                    isDense: true,
                    isExpanded: true,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: isDark ? const Color(0xFFFAFAFA) : const Color(0xFF0F172A),
                    ),
                    items: _supportedLanguages.map((lang) {
                      return DropdownMenuItem<String>(
                        value: lang['code'],
                        child: Text(lang['name']!, overflow: TextOverflow.ellipsis),
                      );
                    }).toList(),
                    onChanged: (val) {
                      if (val != null) appState.setTargetLang(val);
                    },
                  ),
                ),
              ),

              // SRS Deck Pill Button (1:1 with Web .btn-srs-deck)
              InkWell(
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const ReviewScreen()),
                  );
                },
                borderRadius: BorderRadius.circular(8),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF18181B) : const Color(0xFFF1F5F9),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: isDark ? const Color(0xFF27272A) : const Color(0xFFCBD5E1),
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Text(
                        'SRS',
                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700),
                      ),
                      const SizedBox(width: 4),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                        decoration: BoxDecoration(
                          color: const Color(0xFF6366F1),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          '${appState.dueFlashcards.length}',
                          style: const TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 6),

              // Settings Gear Button
              IconButton(
                onPressed: _showSettingsDialog,
                icon: const Icon(Icons.settings_outlined, size: 20),
                tooltip: 'Pengaturan API',
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
              ),
            ],
          ),
          const SizedBox(height: 8),

          // Row 2: Platform Tab Group + Capsule URL Ingestion Bar
          Row(
            children: [
              // Dedicated Platform Switcher (1:1 with Web .platform-tab-group)
              Container(
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF18181B) : const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: isDark ? const Color(0xFF27272A) : const Color(0xFFE2E8F0),
                  ),
                ),
                padding: const EdgeInsets.all(2),
                child: Row(
                  children: [
                    InkWell(
                      onTap: () => _setPlatformMode('spotify'),
                      borderRadius: BorderRadius.circular(6),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                        decoration: BoxDecoration(
                          color: _activePlatformMode == 'spotify'
                              ? const Color(0xFF1DB954).withValues(alpha: 0.22)
                              : Colors.transparent,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          '🟢 Spotify',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: _activePlatformMode == 'spotify' ? FontWeight.w800 : FontWeight.w500,
                            color: _activePlatformMode == 'spotify' ? const Color(0xFF1DB954) : null,
                          ),
                        ),
                      ),
                    ),
                    InkWell(
                      onTap: () => _setPlatformMode('youtube'),
                      borderRadius: BorderRadius.circular(6),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                        decoration: BoxDecoration(
                          color: _activePlatformMode == 'youtube'
                              ? const Color(0xFFEF4444).withValues(alpha: 0.22)
                              : Colors.transparent,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          '🔴 YouTube',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: _activePlatformMode == 'youtube' ? FontWeight.w800 : FontWeight.w500,
                            color: _activePlatformMode == 'youtube' ? const Color(0xFFEF4444) : null,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),

              // Capsule URL Input + "Muat" Button
              Expanded(
                child: Container(
                  height: 38,
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF18181B) : Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: _activePlatformMode == 'spotify'
                          ? const Color(0xFF1DB954).withValues(alpha: 0.4)
                          : const Color(0xFFEF4444).withValues(alpha: 0.4),
                      width: 1.2,
                    ),
                  ),
                  child: Row(
                    children: [
                      const SizedBox(width: 10),
                      Icon(
                        Icons.link,
                        size: 16,
                        color: _activePlatformMode == 'spotify'
                            ? const Color(0xFF1DB954)
                            : const Color(0xFFEF4444),
                      ),
                      const SizedBox(width: 6),
                      Expanded(
                        child: TextField(
                          controller: _urlController,
                          style: const TextStyle(fontSize: 12),
                          decoration: InputDecoration(
                            hintText: _activePlatformMode == 'spotify'
                                ? 'Tempel link Spotify (track/...)'
                                : 'Tempel link YouTube (watch?v=...)',
                            hintStyle: TextStyle(
                              fontSize: 11,
                              color: isDark ? const Color(0xFF71717A) : const Color(0xFF94A3B8),
                            ),
                            isDense: true,
                            contentPadding: const EdgeInsets.symmetric(vertical: 8),
                            border: InputBorder.none,
                          ),
                        ),
                      ),
                      InkWell(
                        onTap: appState.isLoading
                            ? null
                            : () {
                                final text = _urlController.text.trim();
                                if (text.isNotEmpty) {
                                  appState.processVideo(text);
                                }
                              },
                        borderRadius: BorderRadius.circular(16),
                        child: Container(
                          margin: const EdgeInsets.only(right: 3),
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                          decoration: BoxDecoration(
                            color: const Color(0xFF6366F1),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: appState.isLoading
                              ? const SizedBox(
                                  width: 12,
                                  height: 12,
                                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                                )
                              : const Text(
                                  'Muat',
                                  style: TextStyle(
                                    fontSize: 11.5,
                                    fontWeight: FontWeight.w700,
                                    color: Colors.white,
                                  ),
                                ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),

          // Row 3: Segmented Quick Toggles (Furigana, Romaji, Target i+1) + Lagu Disukai
          Row(
            children: [
              _buildSegmentedToggle(
                label: 'Furigana',
                isActive: appState.isRubyVisible,
                onTap: appState.toggleRuby,
                isDark: isDark,
              ),
              const SizedBox(width: 5),
              _buildSegmentedToggle(
                label: 'Romaji',
                isActive: appState.showRomaji,
                onTap: appState.toggleRomaji,
                isDark: isDark,
              ),
              const SizedBox(width: 5),
              _buildSegmentedToggle(
                label: 'Target i+1',
                isActive: appState.filterIPlusOneOnly,
                onTap: appState.toggleFilterIPlusOne,
                isDark: isDark,
              ),
              const Spacer(),

              // "💜 Lagu yang Disukai" Playlist Pill
              InkWell(
                onTap: _showLikedSongsPlaylist,
                borderRadius: BorderRadius.circular(16),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4.5),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF7C3AED), Color(0xFF4F46E5)],
                    ),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text('💜', style: TextStyle(fontSize: 11)),
                      SizedBox(width: 4),
                      Text(
                        'Lagu Disukai',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSegmentedToggle({
    required String label,
    required bool isActive,
    required VoidCallback onTap,
    required bool isDark,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
        decoration: BoxDecoration(
          color: isActive
              ? (isDark ? const Color(0xFF6366F1).withValues(alpha: 0.22) : const Color(0xFFE0E7FF))
              : (isDark ? const Color(0xFF18181B) : const Color(0xFFF1F5F9)),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isActive
                ? const Color(0xFF6366F1)
                : (isDark ? const Color(0xFF27272A) : const Color(0xFFE2E8F0)),
            width: isActive ? 1.2 : 0.8,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
            color: isActive
                ? const Color(0xFF818CF8)
                : (isDark ? const Color(0xFFA1A1AA) : const Color(0xFF64748B)),
          ),
        ),
      ),
    );
  }

  // =========================================================================
  // SUB-WIDGET: Integrated Player Card (1:1 with Web #integrated-player-card)
  // =========================================================================
  Widget _buildIntegratedPlayerCard(AppState appState, bool isDark) {
    final resp = appState.videoResponse!;
    final isSp = resp.isSpotify;
    final title = resp.title.isNotEmpty ? resp.title : 'KoeStream Immersion Track';
    final artist = resp.artist ?? resp.channel;
    final thumb = resp.thumbnailUrl ??
        (isSp
            ? 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02baf89eb11ec7c657805d2da0'
            : 'https://img.youtube.com/vi/${resp.videoId}/mqdefault.jpg');

    final curSec = _currentPositionMs ~/ 1000;
    final curStr = '${(curSec ~/ 60).toString().padLeft(2, '0')}:${(curSec % 60).toString().padLeft(2, '0')}';
    final totSec = _audioDurationMs ~/ 1000;
    final totStr = '${(totSec ~/ 60).toString().padLeft(2, '0')}:${(totSec % 60).toString().padLeft(2, '0')}';
    final scrubVal = (_audioDurationMs > 0) ? (_currentPositionMs / _audioDurationMs).clamp(0.0, 1.0) : 0.0;

    return Container(
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF121215) : const Color(0xFFF8FAFC),
        border: Border(
          bottom: BorderSide(
            color: isDark ? const Color(0xFF27272A) : const Color(0xFFE2E8F0),
            width: 1,
          ),
        ),
      ),
      child: Column(
        children: [
          // If Video Mode is active and YouTube is loaded
          if (!isSp && _youtubeController != null && (_isVideoMode || _isTheaterMode))
            AspectRatio(
              aspectRatio: 16 / 9,
              child: YoutubePlayer(
                controller: _youtubeController!,
                showVideoProgressIndicator: true,
                progressIndicatorColor: const Color(0xFFEF4444),
              ),
            ),

          // Track Header Row (Artwork, Title, Badges, Mode Toggles)
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 10, 14, 6),
            child: Row(
              children: [
                // Thumbnail Artwork
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Image.network(
                    thumb,
                    width: 48,
                    height: 48,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => Container(
                      width: 48,
                      height: 48,
                      color: isSp ? Colors.green.shade900 : Colors.red.shade900,
                      child: Icon(isSp ? Icons.music_note : Icons.play_arrow, color: Colors.white),
                    ),
                  ),
                ),
                const SizedBox(width: 10),

                // Info: Source Tag + Title + Artist
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                            decoration: BoxDecoration(
                              color: isSp
                                  ? const Color(0xFF1DB954).withValues(alpha: 0.18)
                                  : const Color(0xFFEF4444).withValues(alpha: 0.18),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              isSp ? 'SPOTIFY TRACK' : 'YOUTUBE VIDEO',
                              style: TextStyle(
                                fontSize: 9,
                                fontWeight: FontWeight.w800,
                                color: isSp ? const Color(0xFF1DB954) : const Color(0xFFEF4444),
                              ),
                            ),
                          ),
                          const Spacer(),

                          // Theater / Video Mode Switcher
                          if (!isSp) ...[
                            InkWell(
                              onTap: () => setState(() => _isVideoMode = !_isVideoMode),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: _isVideoMode
                                      ? const Color(0xFF6366F1).withValues(alpha: 0.2)
                                      : Colors.transparent,
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(
                                  _isVideoMode ? 'Mode Audio' : 'Mode Video',
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w600,
                                    color: _isVideoMode ? const Color(0xFF818CF8) : const Color(0xFF71717A),
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                      const SizedBox(height: 2),
                      Text(
                        title,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w700),
                      ),
                      Text(
                        artist,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontSize: 11.5,
                          color: isDark ? const Color(0xFFA1A1AA) : const Color(0xFF64748B),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Timeline Scrubber (1:1 with Web #playback-scrubber)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 14),
            child: Row(
              children: [
                Text(
                  curStr,
                  style: TextStyle(
                    fontSize: 10.5,
                    fontFamily: 'monospace',
                    color: isDark ? const Color(0xFF71717A) : const Color(0xFF94A3B8),
                  ),
                ),
                Expanded(
                  child: SliderTheme(
                    data: SliderTheme.of(context).copyWith(
                      trackHeight: 3.5,
                      thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 5.5),
                      activeTrackColor: isSp ? const Color(0xFF1DB954) : const Color(0xFF6366F1),
                      inactiveTrackColor: isDark ? const Color(0xFF27272A) : const Color(0xFFE2E8F0),
                      thumbColor: isSp ? const Color(0xFF1DB954) : const Color(0xFF6366F1),
                      overlayShape: const RoundSliderOverlayShape(overlayRadius: 10),
                    ),
                    child: Slider(
                      value: scrubVal,
                      onChanged: (val) {
                        final targetMs = (val * _audioDurationMs).round();
                        if (isSp) {
                          _seekAudioTo(targetMs);
                        } else {
                          _youtubeController?.seekTo(Duration(milliseconds: targetMs));
                        }
                      },
                    ),
                  ),
                ),
                Text(
                  totStr,
                  style: TextStyle(
                    fontSize: 10.5,
                    fontFamily: 'monospace',
                    color: isDark ? const Color(0xFF71717A) : const Color(0xFF94A3B8),
                  ),
                ),
              ],
            ),
          ),

          // Unified Controls Row (Speed, Prev, Play/Pause, Next, Loop)
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 0, 14, 6),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // Speed Pill Button (1:1 with Web .btn-speed-pill)
                InkWell(
                  onTap: _cycleSpeed,
                  borderRadius: BorderRadius.circular(14),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF18181B) : const Color(0xFFF1F5F9),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: isDark ? const Color(0xFF27272A) : const Color(0xFFCBD5E1),
                      ),
                    ),
                    child: Text(
                      '${appState.playbackSpeed}x',
                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),

                // Center Navigation Group (Prev, Play/Pause, Next)
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    IconButton(
                      icon: const Icon(Icons.skip_previous, size: 22),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                      tooltip: 'Kalimat Sebelumnya',
                      onPressed: () {
                        if (appState.currentSegmentIndex > 0) {
                          final prevIdx = appState.currentSegmentIndex - 1;
                          _seekToSegment(resp.segments[prevIdx], prevIdx);
                        }
                      },
                    ),
                    const SizedBox(width: 14),
                    // Play / Pause Capsule (Green for Spotify, Indigo for YT)
                    InkWell(
                      onTap: () {
                        if (isSp) {
                          _toggleAudioPlayback();
                        } else {
                          if (_youtubeController != null) {
                            if (_youtubeController!.value.isPlaying) {
                              _youtubeController!.pause();
                            } else {
                              _youtubeController!.play();
                            }
                          }
                        }
                      },
                      borderRadius: BorderRadius.circular(20),
                      child: Container(
                        width: 36,
                        height: 36,
                        decoration: BoxDecoration(
                          color: isSp ? const Color(0xFF1DB954) : const Color(0xFF6366F1),
                          shape: BoxShape.circle,
                        ),
                        child: Center(
                          child: Icon(
                            (isSp ? _isAudioPlaying : (_youtubeController?.value.isPlaying ?? false))
                                ? Icons.pause
                                : Icons.play_arrow,
                            color: Colors.white,
                            size: 20,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 14),
                    IconButton(
                      icon: const Icon(Icons.skip_next, size: 22),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                      tooltip: 'Kalimat Berikutnya',
                      onPressed: () {
                        if (appState.currentSegmentIndex < resp.segments.length - 1) {
                          final nextIdx = appState.currentSegmentIndex + 1;
                          _seekToSegment(resp.segments[nextIdx], nextIdx);
                        }
                      },
                    ),
                  ],
                ),

                // Loop Pill (1:1 with Web .btn-loop-pill)
                InkWell(
                  onTap: appState.toggleLoop,
                  borderRadius: BorderRadius.circular(14),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: appState.isLoopActive
                          ? const Color(0xFF6366F1).withValues(alpha: 0.22)
                          : (isDark ? const Color(0xFF18181B) : const Color(0xFFF1F5F9)),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: appState.isLoopActive
                            ? const Color(0xFF6366F1)
                            : (isDark ? const Color(0xFF27272A) : const Color(0xFFCBD5E1)),
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.repeat,
                          size: 13,
                          color: appState.isLoopActive ? const Color(0xFF818CF8) : null,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          'Loop${appState.isLoopActive ? ' ON' : ''}',
                          style: TextStyle(
                            fontSize: 10.5,
                            fontWeight: FontWeight.bold,
                            color: appState.isLoopActive ? const Color(0xFF818CF8) : null,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Lyric Sync Offset Calibration Strip (1:1 with Web .player-sync-row)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF09090B) : const Color(0xFFF1F5F9),
              border: Border(
                top: BorderSide(
                  color: isDark ? const Color(0xFF1F2430) : const Color(0xFFE2E8F0),
                  width: 0.8,
                ),
              ),
            ),
            child: Row(
              children: [
                Icon(
                  Icons.access_time,
                  size: 13,
                  color: isDark ? const Color(0xFF71717A) : const Color(0xFF94A3B8),
                ),
                const SizedBox(width: 5),
                Text(
                  'Sinkron Lirik:',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: isDark ? const Color(0xFFA1A1AA) : const Color(0xFF64748B),
                  ),
                ),
                const Spacer(),
                // -0.2s
                InkWell(
                  onTap: () => _adjustSyncOffset(-200),
                  borderRadius: BorderRadius.circular(6),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF18181B) : Colors.white,
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(
                        color: isDark ? const Color(0xFF27272A) : const Color(0xFFCBD5E1),
                      ),
                    ),
                    child: const Text('-0.2s', style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold)),
                  ),
                ),
                const SizedBox(width: 6),
                // Reset / Current offset
                InkWell(
                  onTap: _resetSyncOffset,
                  borderRadius: BorderRadius.circular(6),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF18181B) : Colors.white,
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(
                        color: _userSyncOffsetMs != 0
                            ? const Color(0xFF6366F1)
                            : (isDark ? const Color(0xFF27272A) : const Color(0xFFCBD5E1)),
                      ),
                    ),
                    child: Text(
                      '${_userSyncOffsetMs > 0 ? '+' : ''}${(_userSyncOffsetMs / 1000).toStringAsFixed(1)}s',
                      style: TextStyle(
                        fontSize: 10.5,
                        fontWeight: FontWeight.bold,
                        color: _userSyncOffsetMs != 0 ? const Color(0xFF818CF8) : null,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 6),
                // +0.2s
                InkWell(
                  onTap: () => _adjustSyncOffset(200),
                  borderRadius: BorderRadius.circular(6),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF18181B) : Colors.white,
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(
                        color: isDark ? const Color(0xFF27272A) : const Color(0xFFCBD5E1),
                      ),
                    ),
                    child: const Text('+0.2s', style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // =========================================================================
  // SUB-WIDGET: Empty Player Placeholder
  // =========================================================================
  Widget _buildEmptyPlayerPlaceholder(AppState appState, bool isDark) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
      color: isDark ? const Color(0xFF121215) : const Color(0xFFF1F5F9),
      child: Center(
        child: Column(
          children: [
            const Icon(Icons.music_video_outlined, size: 40, color: Color(0xFF6366F1)),
            const SizedBox(height: 8),
            const Text(
              'Pilih lagu dari Koleksi atau tempel tautan Spotify / YouTube',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 12),
            FilledButton.icon(
              style: FilledButton.styleFrom(
                backgroundColor: const Color(0xFF7C3AED),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              onPressed: _showLikedSongsPlaylist,
              icon: const Text('💜'),
              label: const Text('Buka Lagu yang Disukai', style: TextStyle(fontSize: 12.5)),
            ),
          ],
        ),
      ),
    );
  }

  // =========================================================================
  // SUB-WIDGET: Interactive Transcript List (1:1 with Web #transcript-stream)
  // =========================================================================
  Widget _buildTranscriptList(AppState appState, bool isDark) {
    final segments = appState.videoResponse!.segments;
    final isRtl = appState.videoResponse!.isRtl;

    final displaySegments = appState.filterIPlusOneOnly
        ? segments.where((s) => s.isIPlusOne).toList()
        : segments;

    if (displaySegments.isEmpty) {
      return const Center(
        child: Text('Tidak ada kalimat yang cocok dengan filter Target i+1'),
      );
    }

    return ListView.builder(
      controller: _transcriptScrollController,
      padding: const EdgeInsets.fromLTRB(12, 10, 12, 40),
      itemCount: displaySegments.length,
      itemBuilder: (ctx, idx) {
        final seg = displaySegments[idx];
        final isActive = appState.currentSegmentIndex == seg.index;
        final syncMs = _currentPositionMs + 350 + _userSyncOffsetMs;
        final activeTokenId = isActive ? _calculateActiveTokenId(seg, syncMs) : null;

        return AnimatedContainer(
          key: _cardKeys.putIfAbsent(seg.index, () => GlobalKey()),
          duration: const Duration(milliseconds: 200),
          margin: const EdgeInsets.symmetric(vertical: 5),
          decoration: BoxDecoration(
            color: isActive
                ? (isDark ? const Color(0xFF181D2A) : const Color(0xFFEFF6FF))
                : (isDark ? const Color(0xFF121215) : Colors.white),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: isActive
                  ? const Color(0xFF6366F1)
                  : (isDark ? const Color(0xFF27272A) : const Color(0xFFE2E8F0)),
              width: isActive ? 1.6 : 0.8,
            ),
            boxShadow: isActive
                ? [
                    BoxShadow(
                      color: const Color(0xFF6366F1).withValues(alpha: isDark ? 0.3 : 0.15),
                      blurRadius: 10,
                      offset: const Offset(0, 3),
                    ),
                  ]
                : [],
          ),
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top Row: Play Time Badge + Target i+1 + Action Icons (TTS, Grammar, Shadowing, Loop)
                Row(
                  children: [
                    // Play Time Pill
                    InkWell(
                      onTap: () => _seekToSegment(seg, seg.index),
                      borderRadius: BorderRadius.circular(6),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: isActive
                              ? const Color(0xFF6366F1).withValues(alpha: 0.2)
                              : (isDark ? const Color(0xFF18181B) : const Color(0xFFF1F5F9)),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              isActive ? Icons.play_arrow : Icons.play_arrow_outlined,
                              size: 14,
                              color: isActive ? const Color(0xFF818CF8) : const Color(0xFF71717A),
                            ),
                            const SizedBox(width: 3),
                            Text(
                              _formatTimestamp(seg.startMs),
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: isActive ? const Color(0xFF818CF8) : const Color(0xFF71717A),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 6),

                    // Target i+1 Badge
                    if (seg.isIPlusOne)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: const Color(0xFF10B981).withValues(alpha: 0.18),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Text(
                          '🎯 Target i+1',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF10B981),
                          ),
                        ),
                      ),
                    const Spacer(),

                    // Action Icons Toolbar: TTS, AI Grammar, Shadowing, Loop
                    // 1. TTS Pronounce
                    IconButton(
                      icon: const Icon(Icons.volume_up_outlined, size: 17),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                      tooltip: 'Dengarkan Kalimat',
                      onPressed: () => _speakSentence(seg.originalText),
                    ),
                    const SizedBox(width: 8),

                    // 2. AI Grammar Modal
                    IconButton(
                      icon: const Text('✨', style: TextStyle(fontSize: 14)),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                      tooltip: 'Eksplanasi Tata Bahasa AI',
                      onPressed: () {
                        GrammarModal.show(
                          context,
                          segment: seg,
                          segmentIndex: seg.index,
                          targetLang: appState.targetLang,
                          nativeLang: appState.nativeLang,
                          apiService: appState.apiService,
                        );
                      },
                    ),
                    const SizedBox(width: 8),

                    // 3. Shadowing Studio
                    IconButton(
                      icon: const Icon(Icons.mic_outlined, size: 17),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                      tooltip: 'Latihan Shadowing',
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => ShadowingScreen(
                              segment: seg,
                              videoId: appState.videoResponse!.videoId,
                            ),
                          ),
                        );
                      },
                    ),
                    const SizedBox(width: 8),

                    // 4. Replay / Loop Segmen
                    IconButton(
                      icon: const Icon(Icons.replay, size: 17),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                      tooltip: 'Putar Ulang Kalimat Ini',
                      onPressed: () => _seekToSegment(seg, seg.index),
                    ),
                  ],
                ),
                const SizedBox(height: 8),

                // Universal Ruby Subtitle (Furigana / Pinyin on top of words)
                UniversalRubySubtitleWidget(
                  tokens: seg.tokens,
                  isRubyVisible: appState.isRubyVisible,
                  showRomaji: appState.showRomaji,
                  masteredLemmas: appState.masteredLemmas,
                  isRtl: isRtl,
                  fontSize: 19.0,
                  activeTokenId: activeTokenId,
                  onTokenTap: (tok) {
                    setState(() {
                      _activeInspectedToken = tok;
                      _activeInspectedSegment = seg;
                    });
                  },
                ),

                // Indonesian Translation
                if (seg.translatedText.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  InkWell(
                    onTap: () => _seekToSegment(seg, seg.index),
                    child: Text(
                      seg.translatedText,
                      style: TextStyle(
                        fontSize: 13.5,
                        height: 1.4,
                        fontWeight: isActive ? FontWeight.w500 : FontWeight.w400,
                        color: isActive
                            ? (isDark ? const Color(0xFFFAFAFA) : const Color(0xFF0F172A))
                            : (isDark ? const Color(0xFFA1A1AA) : const Color(0xFF64748B)),
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        );
      },
    );
  }

  String _formatTimestamp(int ms) {
    final seconds = (ms / 1000).floor();
    final m = (seconds / 60).floor();
    final s = seconds % 60;
    return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }
}
