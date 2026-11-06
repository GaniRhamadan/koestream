import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:youtube_player_flutter/youtube_player_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../state/app_state.dart';
import '../models/models.dart';
import '../widgets/universal_ruby_subtitle.dart';
import '../widgets/dictionary_sheet.dart';
import 'review_screen.dart';
import 'shadowing_screen.dart';

class ImmersionScreen extends StatefulWidget {
  const ImmersionScreen({super.key});

  @override
  State<ImmersionScreen> createState() => _ImmersionScreenState();
}

class _ImmersionScreenState extends State<ImmersionScreen> {
  final TextEditingController _urlController = TextEditingController(
    text: 'https://open.spotify.com/track/4Mo0vn7a03pJ19uESUrH5a',
  );
  final ScrollController _transcriptScrollController = ScrollController();
  final Map<int, GlobalKey> _cardKeys = {};
  YoutubePlayerController? _youtubeController;
  String? _loadedVideoId;
  int _currentPositionMs = 0;
  bool _isAutoScrollEnabled = true;

  // Kalibrasi Offset Sinkronisasi Lirik (ms)
  int _userSyncOffsetMs = 0;

  // State Audio Player untuk Spotify / Media Audio
  Timer? _audioTimer;
  bool _isAudioPlaying = false;
  int _audioDurationMs = 180000;

  final List<Map<String, String>> _supportedLanguages = [
    {'code': 'ja', 'name': 'Jepang (日本語)'},
    {'code': 'zh', 'name': 'Mandarin (中文)'},
    {'code': 'ko', 'name': 'Korea (한국어)'},
    {'code': 'ar', 'name': 'Arab (العربية)'},
    {'code': 'th', 'name': 'Thai (ภาษาไทย)'},
    {'code': 'en', 'name': 'Inggris (English)'},
    {'code': 'de', 'name': 'Jerman (Deutsch)'},
    {'code': 'id', 'name': 'Indonesia'},
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final appState = Provider.of<AppState>(context, listen: false);
      if (appState.videoResponse != null) {
        _loadSongSyncOffset(appState.videoResponse!.videoId);
      }
    });
  }

  @override
  void dispose() {
    _audioTimer?.cancel();
    _youtubeController?.dispose();
    _urlController.dispose();
    _transcriptScrollController.dispose();
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

  void _setupYoutubeController(String videoId) {
    // Validasi format ID YouTube: Hanya izinkan 11 karakter base64-url
    final isValidYoutube = RegExp(r'^[a-zA-Z0-9_-]{11}$').hasMatch(videoId);
    if (!isValidYoutube) {
      _youtubeController?.dispose();
      _youtubeController = null;
      _loadedVideoId = videoId;
      _cardKeys.clear();

      // Hitung total durasi jika sumber adalah Spotify
      final appState = Provider.of<AppState>(context, listen: false);
      if (appState.videoResponse?.segments.isNotEmpty == true) {
        final lastSeg = appState.videoResponse!.segments.last;
        _audioDurationMs = lastSeg.endMs > 0 ? lastSeg.endMs : 180000;
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
      // Berikan toleransi 250ms agar transisi mulus dan tidak terputus di celah jeda antarkalimat
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

    // Bobot proporsional panjang karakter per token (tanda baca lebih ringan)
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
        // Scrollable.ensureVisible memastikan kartu aktif berposisi persis pada 12% dari atas,
        // sehingga kalimat berikutnya berada di bawahnya dan mengalir mulus ke baris berikutnya.
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
      } else {
        setState(() {
          _currentPositionMs = newPos;
        });
        _onPositionUpdated(newPos);
      }
    });
  }

  void _seekAudioTo(int ms) {
    setState(() {
      _currentPositionMs = ms;
    });
    _onPositionUpdated(ms);
  }

  void _onPositionUpdated(int currentPositionMs) {
    if (!mounted) return;
    final appState = Provider.of<AppState>(context, listen: false);
    final resp = appState.videoResponse;
    if (resp == null || resp.segments.isEmpty) return;

    // Loop A-B Kalimat jika aktif
    if (appState.isLoopActive) {
      final currentSeg = appState.currentSegment;
      if (currentSeg != null && currentPositionMs >= currentSeg.endMs) {
        _seekAudioTo(currentSeg.startMs);
        return;
      }
    }

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

  bool _sanitizeAndValidateUrl(String input) {
    final clean = input.trim().toLowerCase();
    if (clean.isEmpty) return false;

    // Deteksi bahaya XSS / script injection / dangerous schemes
    final dangerousPatterns = [
      'javascript:', 'data:', 'vbscript:', 'file:', 'intent:', 'content:',
      '<script', '</script', 'onload=', 'onerror=', '<iframe', '<img',
      'alert(', 'eval(', 'document.cookie'
    ];
    if (dangerousPatterns.any((p) => clean.contains(p)) || input.contains('<') || input.contains('>')) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Row(
            children: [
              Icon(Icons.shield, color: Colors.amber),
              SizedBox(width: 8),
              Expanded(
                child: Text('Input diblokir demi keamanan: Terdeteksi skrip atau pola berbahaya.'),
              ),
            ],
          ),
          backgroundColor: Colors.redAccent,
        ),
      );
      return false;
    }
    return true;
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
              'Masukkan URL Server Backend (contoh: http://10.0.2.2:8000 untuk emulator Android, atau http://localhost:8000 untuk web):',
              style: TextStyle(fontSize: 13.0),
            ),
            const SizedBox(height: 12.0),
            TextField(
              controller: textController,
              decoration: const InputDecoration(
                labelText: 'Base URL API',
                border: OutlineInputBorder(),
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
                                  const SnackBar(content: Text('Server backend tidak ditemukan. Pastikan backend berjalan.')),
                                );
                              }
                            }
                          },
                    icon: const Icon(Icons.radar, size: 18),
                    label: const Text('Deteksi Otomatis Server'),
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

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    // Sinkronisasi YouTube Player jika video sudah terunduh
    if (appState.videoResponse != null && _loadedVideoId != appState.videoResponse!.videoId) {
      _setupYoutubeController(appState.videoResponse!.videoId);
      _loadSongSyncOffset(appState.videoResponse!.videoId);
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'KoeStream',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        actions: [
          // Tombol Koleksi Lagu & Media Rekomendasi
          IconButton(
            onPressed: _showPresetTracksSheet,
            icon: const Icon(Icons.queue_music),
            tooltip: 'Koleksi Lagu & Media',
          ),
          // Tombol Review SRS dengan Jumlah Kartu Due
          IconButton(
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const ReviewScreen()),
              );
            },
            icon: Badge(
              isLabelVisible: appState.dueFlashcards.isNotEmpty,
              label: Text('${appState.dueFlashcards.length}'),
              child: const Icon(Icons.style),
            ),
            tooltip: 'Review Kartu SRS',
          ),
          // Tombol Pengaturan Server URL
          IconButton(
            onPressed: _showSettingsDialog,
            icon: const Icon(Icons.settings),
            tooltip: 'Pengaturan API',
          ),
          // Toggle Mode Gelap / Terang
          IconButton(
            onPressed: appState.toggleDarkMode,
            icon: Icon(isDark ? Icons.light_mode : Icons.dark_mode),
            tooltip: 'Ganti Tema',
          ),
        ],
      ),
      body: Column(
        children: [
          // Bilah Input URL YouTube & Pemilih Bahasa
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 10.0),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF1E222D) : Colors.grey.shade100,
              border: Border(bottom: BorderSide(color: isDark ? Colors.grey.shade800 : Colors.grey.shade300)),
            ),
            child: Column(
              children: [
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _urlController,
                        decoration: InputDecoration(
                          hintText: 'URL YouTube atau Spotify...',
                          prefixIcon: const Icon(Icons.link, size: 20),
                          isDense: true,
                          contentPadding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    FilledButton.icon(
                      onPressed: appState.isLoading
                          ? null
                          : () {
                              final url = _urlController.text.trim();
                              if (url.isNotEmpty && _sanitizeAndValidateUrl(url)) {
                                appState.processVideo(url);
                              }
                            },
                      icon: appState.isLoading
                          ? const SizedBox(
                              width: 16,
                              height: 16,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                            )
                          : const Icon(Icons.bolt, size: 18),
                      label: const Text('Muat'),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    // Pilihan Bahasa Target
                    const Text('Bahasa Target: ', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold)),
                    DropdownButton<String>(
                      value: appState.targetLang,
                      isDense: true,
                      underline: const SizedBox(),
                      items: _supportedLanguages.map((lang) {
                        return DropdownMenuItem<String>(
                          value: lang['code'],
                          child: Text(lang['name']!, style: const TextStyle(fontSize: 12.5)),
                        );
                      }).toList(),
                      onChanged: (val) {
                        if (val != null) appState.setTargetLang(val);
                      },
                    ),
                    const Spacer(),
                    // Toggle Sembunyikan / Tampilkan Ruby Global
                    TextButton.icon(
                      onPressed: appState.toggleRuby,
                      icon: Icon(
                        appState.isRubyVisible ? Icons.visibility : Icons.visibility_off,
                        size: 15,
                      ),
                      label: Text(appState.isRubyVisible ? 'Ruby ON' : 'Ruby OFF', style: const TextStyle(fontSize: 11.5)),
                    ),
                    const SizedBox(width: 4),
                    // Toggle Sembunyikan / Tampilkan Romaji Global
                    TextButton.icon(
                      onPressed: appState.toggleRomaji,
                      icon: Icon(
                        appState.showRomaji ? Icons.translate : Icons.translate_outlined,
                        size: 15,
                      ),
                      label: Text(appState.showRomaji ? 'Romaji ON' : 'Romaji OFF', style: const TextStyle(fontSize: 11.5)),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Pesan Error Jika Terjadi Kendala Jaringan
          if (appState.errorMessage != null)
            Container(
              margin: const EdgeInsets.all(12.0),
              padding: const EdgeInsets.all(12.0),
              decoration: BoxDecoration(
                color: Colors.red.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: Colors.red.withValues(alpha: 0.4)),
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      const Icon(Icons.error_outline, color: Colors.red),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          appState.errorMessage!,
                          style: TextStyle(color: isDark ? Colors.red.shade200 : Colors.red.shade900, fontSize: 13),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      OutlinedButton.icon(
                        onPressed: () => appState.processVideo(_urlController.text.trim()),
                        icon: const Icon(Icons.refresh, size: 16),
                        label: const Text('Coba Lagi'),
                      ),
                      const SizedBox(width: 8),
                      FilledButton.tonalIcon(
                        onPressed: () => appState.processVideo(_urlController.text.trim(), demo: true),
                        icon: const Icon(Icons.play_circle_outline, size: 16),
                        label: const Text('Mode Demo'),
                      ),
                    ],
                  ),
                ],
              ),
            ),

          // Area Pemutar: YouTube Player / Spotify Audio Player
          if (appState.videoResponse != null && appState.videoResponse!.isSpotify)
            _buildSpotifyAudioCard(appState.videoResponse!, isDark)
          else if (_youtubeController != null)
            ClipRRect(
              child: YoutubePlayer(
                controller: _youtubeController!,
                showVideoProgressIndicator: true,
                progressIndicatorColor: Colors.redAccent,
              ),
            )
          else
            Container(
              height: 200,
              width: double.infinity,
              color: isDark ? const Color(0xFF141721) : Colors.black12,
              child: Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.video_library_outlined, size: 48, color: Colors.grey.shade500),
                    const SizedBox(height: 8),
                    Text(
                      'Masukkan URL media atau pilih dari Koleksi Lagu',
                      style: TextStyle(color: Colors.grey.shade500, fontSize: 13),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        FilledButton.tonalIcon(
                          onPressed: _showPresetTracksSheet,
                          icon: const Icon(Icons.queue_music, size: 18),
                          label: const Text('Pilih Lagu Demo'),
                        ),
                        const SizedBox(width: 8),
                        FilledButton.icon(
                          onPressed: () => appState.processVideo(_urlController.text.trim(), demo: true),
                          icon: const Icon(Icons.play_circle_outline, size: 18),
                          label: const Text('Mode Demo'),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),

          // Bilah Kontrol Putar: A-B Loop, Kecepatan, Kalimat Sebelum/Berikut, Shadowing
          if (appState.videoResponse != null)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF1E222D) : Colors.grey.shade200,
              ),
              child: Row(
                children: [
                  // Tombol Loop A-B
                  IconButton(
                    onPressed: appState.toggleLoop,
                    icon: Icon(
                      Icons.repeat,
                      color: appState.isLoopActive ? Colors.amber : Colors.grey,
                    ),
                    tooltip: 'A-B Loop Kalimat',
                  ),
                  // Tombol Kalimat Sebelumnya
                  IconButton(
                    onPressed: () {
                      if (appState.currentSegmentIndex > 0) {
                        final prevIdx = appState.currentSegmentIndex - 1;
                        final seg = appState.videoResponse!.segments[prevIdx];
                        _seekToSegment(seg, prevIdx);
                      }
                    },
                    icon: const Icon(Icons.skip_previous),
                    tooltip: 'Kalimat Sebelumnya',
                  ),
                  // Tombol Kalimat Berikutnya
                  IconButton(
                    onPressed: () {
                      if (appState.videoResponse != null &&
                          appState.currentSegmentIndex < appState.videoResponse!.segments.length - 1) {
                        final nextIdx = appState.currentSegmentIndex + 1;
                        final seg = appState.videoResponse!.segments[nextIdx];
                        _seekToSegment(seg, nextIdx);
                      }
                    },
                    icon: const Icon(Icons.skip_next),
                    tooltip: 'Kalimat Berikutnya',
                  ),
                  // Kecepatan Putar
                  PopupMenuButton<double>(
                    tooltip: 'Kecepatan Putar',
                    initialValue: appState.playbackSpeed,
                    onSelected: _changeSpeed,
                    itemBuilder: (ctx) => [0.5, 0.75, 1.0, 1.25, 1.5].map((speed) {
                      return PopupMenuItem(
                        value: speed,
                        child: Text('${speed}x'),
                      );
                    }).toList(),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 8),
                      child: Text(
                        '${appState.playbackSpeed}x',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                      ),
                    ),
                  ),
                  const Spacer(),
                  // Tombol Pin / Auto-scroll Ikuti Kalimat
                  IconButton(
                    onPressed: () {
                      setState(() {
                        _isAutoScrollEnabled = !_isAutoScrollEnabled;
                      });
                      if (_isAutoScrollEnabled && appState.currentSegmentIndex >= 0) {
                        _scrollToActiveSegment(appState.currentSegmentIndex);
                      }
                    },
                    icon: Icon(
                      _isAutoScrollEnabled ? Icons.push_pin : Icons.push_pin_outlined,
                      color: _isAutoScrollEnabled ? Colors.greenAccent : Colors.grey,
                      size: 20,
                    ),
                    tooltip: _isAutoScrollEnabled ? 'Auto-scroll Kalimat (Aktif)' : 'Auto-scroll (Mati)',
                  ),
                  // Filter i+1
                  IconButton(
                    onPressed: appState.toggleFilterIPlusOne,
                    icon: Icon(
                      Icons.filter_alt,
                      color: appState.filterIPlusOneOnly ? Colors.cyanAccent : Colors.grey,
                    ),
                    tooltip: 'Filter Kalimat i+1 (Tepat 1 Kata Baru)',
                  ),
                  // Tombol Masuk Layar Shadowing
                  FilledButton.tonalIcon(
                    onPressed: appState.currentSegment != null
                        ? () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => ShadowingScreen(
                                  segment: appState.currentSegment!,
                                  videoId: appState.videoResponse!.videoId,
                                ),
                              ),
                            );
                          }
                        : null,
                    icon: const Icon(Icons.mic, size: 16),
                    label: const Text('Shadowing', style: TextStyle(fontSize: 12)),
                  ),
                ],
              ),
            ),

          // Bilah Sinkronisasi Lirik (Lyric Sync Offset)
          if (appState.videoResponse != null)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF181B24) : Colors.grey.shade100,
                border: Border(
                  bottom: BorderSide(
                    color: isDark ? Colors.white10 : Colors.black12,
                    width: 0.8,
                  ),
                ),
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.timer_outlined,
                    size: 15,
                    color: isDark ? Colors.indigoAccent.shade100 : Colors.indigo,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    'Sinkron Lirik:',
                    style: TextStyle(
                      fontSize: 11.5,
                      fontWeight: FontWeight.w600,
                      color: isDark ? Colors.grey.shade400 : Colors.grey.shade700,
                    ),
                  ),
                  const Spacer(),
                  // Tombol -0.2s
                  InkWell(
                    borderRadius: BorderRadius.circular(6),
                    onTap: () => _adjustSyncOffset(-200),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: isDark ? Colors.white12 : Colors.black12,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Text('-0.2s', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                    ),
                  ),
                  const SizedBox(width: 6),
                  // Indikator Offset (Tap untuk Reset)
                  InkWell(
                    borderRadius: BorderRadius.circular(6),
                    onTap: _resetSyncOffset,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        border: Border.all(
                          color: _userSyncOffsetMs != 0 ? Colors.cyan : (isDark ? Colors.white24 : Colors.black26),
                        ),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        '${_userSyncOffsetMs > 0 ? '+' : ''}${(_userSyncOffsetMs / 1000).toStringAsFixed(1)}s',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: _userSyncOffsetMs != 0 ? Colors.cyanAccent : (isDark ? Colors.white70 : Colors.black87),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 6),
                  // Tombol +0.2s
                  InkWell(
                    borderRadius: BorderRadius.circular(6),
                    onTap: () => _adjustSyncOffset(200),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: isDark ? Colors.white12 : Colors.black12,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Text('+0.2s', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            ),

          // Daftar Transkrip Kalimat Interaktif
          Expanded(
            child: appState.videoResponse == null
                ? const Center(child: Text('Belum ada video yang dimuat'))
                : _buildTranscriptList(appState, isDark),
          ),
        ],
      ),
    );
  }

  Widget _buildTranscriptList(AppState appState, bool isDark) {
    final segments = appState.videoResponse!.segments;
    final isRtl = appState.videoResponse!.isRtl;

    // Terapkan filter i+1 jika diaktifkan
    final displaySegments = appState.filterIPlusOneOnly
        ? segments.where((s) => s.isIPlusOne).toList()
        : segments;

    if (displaySegments.isEmpty) {
      return const Center(child: Text('Tidak ada kalimat yang cocok dengan filter'));
    }

    return SingleChildScrollView(
      controller: _transcriptScrollController,
      padding: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 12.0),
      child: Column(
        children: displaySegments.map((seg) {
          final isActive = appState.currentSegmentIndex == seg.index;
          final syncMs = _currentPositionMs + 350 + _userSyncOffsetMs;
          final activeTokenId = isActive ? _calculateActiveTokenId(seg, syncMs) : null;

          return AnimatedContainer(
            key: _cardKeys.putIfAbsent(seg.index, () => GlobalKey()),
            duration: const Duration(milliseconds: 220),
            margin: const EdgeInsets.symmetric(vertical: 5.5),
            decoration: BoxDecoration(
              color: isActive
                  ? (isDark ? const Color(0xFF1E2638) : const Color(0xFFF1F5F9))
                  : (isDark ? const Color(0xFF141721) : Colors.white),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                color: isActive
                    ? (isDark ? const Color(0xFF3B82F6) : const Color(0xFF60A5FA))
                    : (isDark ? Colors.grey.shade800 : Colors.grey.shade200),
                width: isActive ? 1.8 : 1.0,
              ),
              boxShadow: isActive
                  ? [
                      BoxShadow(
                        color: (isDark ? Colors.black54 : Colors.blue.shade100).withValues(alpha: 0.4),
                        blurRadius: 8,
                        offset: const Offset(0, 3),
                      )
                    ]
                  : [],
            ),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 12.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Label Stempel Waktu & Badge i+1
                  Row(
                    children: [
                      InkWell(
                        borderRadius: BorderRadius.circular(6),
                        onTap: () => _seekToSegment(seg, seg.index),
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                isActive ? Icons.play_arrow : Icons.play_arrow_outlined,
                                size: 16,
                                color: isActive ? Colors.blue : Colors.grey,
                              ),
                              const SizedBox(width: 4),
                              Text(
                                _formatTimestamp(seg.startMs),
                                style: TextStyle(
                                  fontSize: 11.5,
                                  fontWeight: FontWeight.bold,
                                  color: isActive ? Colors.blue : Colors.grey,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      if (seg.isIPlusOne)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: Colors.green.withValues(alpha: 0.18),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: const Text(
                            'i+1',
                            style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.green),
                          ),
                        ),
                      const Spacer(),
                      IconButton(
                        icon: const Icon(Icons.replay, size: 18),
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(),
                        tooltip: 'Putar ulang segmen ini',
                        onPressed: () => _seekToSegment(seg, seg.index),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),

                  // Teks Subtitle dengan Ruby Anotasi, Romaji & Karaoke Highlight
                  UniversalRubySubtitleWidget(
                    tokens: seg.tokens,
                    isRubyVisible: appState.isRubyVisible,
                    showRomaji: appState.showRomaji,
                    masteredLemmas: appState.masteredLemmas,
                    isRtl: isRtl,
                    fontSize: 19.5,
                    activeTokenId: activeTokenId,
                    onTokenTap: (token) {
                      DictionarySheet.show(
                        context,
                        token: token,
                        segment: seg,
                        videoId: appState.videoResponse!.videoId,
                        appState: appState,
                      );
                    },
                  ),

                  // Terjemahan Kalimat
                  if (seg.translatedText.isNotEmpty) ...[
                    const SizedBox(height: 10),
                    InkWell(
                      borderRadius: BorderRadius.circular(4),
                      onTap: () => _seekToSegment(seg, seg.index),
                      child: Text(
                        seg.translatedText,
                        style: TextStyle(
                          fontSize: 14.5,
                          height: 1.45,
                          fontWeight: isActive ? FontWeight.w500 : FontWeight.w400,
                          color: isActive
                              ? (isDark ? Colors.white : const Color(0xFF1E293B))
                              : (isDark ? Colors.grey.shade400 : Colors.grey.shade600),
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  String _formatTimestamp(int ms) {
    final seconds = (ms / 1000).floor();
    final m = (seconds / 60).floor();
    final s = seconds % 60;
    return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  Widget _buildSpotifyAudioCard(VideoTranscriptResponse resp, bool isDark) {
    final title = resp.title.isNotEmpty ? resp.title : 'Spotify Immersion Track';
    final artist = resp.artist ?? resp.channel;
    final thumb = resp.thumbnailUrl ?? 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e0266e246eec1f1fb552ed0f017';
    final curSec = _currentPositionMs ~/ 1000;
    final curStr = '${(curSec ~/ 60).toString().padLeft(2, '0')}:${(curSec % 60).toString().padLeft(2, '0')}';
    final totSec = _audioDurationMs ~/ 1000;
    final totStr = '${(totSec ~/ 60).toString().padLeft(2, '0')}:${(totSec % 60).toString().padLeft(2, '0')}';
    final scrubVal = (_audioDurationMs > 0) ? (_currentPositionMs / _audioDurationMs).clamp(0.0, 1.0) : 0.0;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF141721) : const Color(0xFFEBF1FA),
        border: Border(bottom: BorderSide(color: isDark ? Colors.grey.shade800 : Colors.grey.shade300)),
      ),
      child: Column(
        children: [
          Row(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(10),
                child: Image.network(
                  thumb,
                  width: 54,
                  height: 54,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => Container(
                    width: 54,
                    height: 54,
                    color: Colors.green.shade900,
                    child: const Icon(Icons.music_note, color: Colors.white70),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.green.shade700,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: const Text(
                        'SPOTIFY AUDIO MODE',
                        style: TextStyle(color: Colors.white, fontSize: 9.5, fontWeight: FontWeight.bold),
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      title,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                    ),
                    Text(
                      artist,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(color: isDark ? Colors.grey.shade400 : Colors.grey.shade600, fontSize: 12),
                    ),
                  ],
                ),
              ),
              IconButton.filledTonal(
                onPressed: _toggleAudioPlayback,
                icon: Icon(_isAudioPlaying ? Icons.pause : Icons.play_arrow),
                tooltip: _isAudioPlaying ? 'Jeda Audio' : 'Putar Audio',
              ),
            ],
          ),
          const SizedBox(height: 4),
          Row(
            children: [
              Text(curStr, style: const TextStyle(fontSize: 11)),
              Expanded(
                child: SliderTheme(
                  data: SliderTheme.of(context).copyWith(
                    trackHeight: 3,
                    thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 6),
                  ),
                  child: Slider(
                    value: scrubVal,
                    onChanged: (val) {
                      _seekAudioTo((val * _audioDurationMs).round());
                    },
                  ),
                ),
              ),
              Text(totStr, style: const TextStyle(fontSize: 11)),
            ],
          ),
        ],
      ),
    );
  }

  void _showPresetTracksSheet() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final appState = Provider.of<AppState>(context, listen: false);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return DraggableScrollableSheet(
          initialChildSize: 0.65,
          minChildSize: 0.4,
          maxChildSize: 0.85,
          expand: false,
          builder: (_, scrollController) {
            return Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      width: 40,
                      height: 4,
                      margin: const EdgeInsets.only(bottom: 12),
                      decoration: BoxDecoration(
                        color: Colors.grey.shade400,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  const Row(
                    children: [
                      Icon(Icons.queue_music, color: Colors.blueAccent),
                      SizedBox(width: 8),
                      Text(
                        'Koleksi Lagu & Media Rekomendasi',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Pilih lagu atau audio untuk langsung belajar dengan furigana dan latihan intonasi:',
                    style: TextStyle(fontSize: 12, color: isDark ? Colors.grey.shade400 : Colors.grey.shade600),
                  ),
                  const Divider(height: 20),
                  Expanded(
                    child: ListView.separated(
                      controller: scrollController,
                      itemCount: kKoeStreamPresetTracks.length,
                      separatorBuilder: (_, __) => const Divider(height: 1),
                      itemBuilder: (ctx, idx) {
                        final track = kKoeStreamPresetTracks[idx];
                        return ListTile(
                          contentPadding: const EdgeInsets.symmetric(vertical: 4, horizontal: 4),
                          leading: ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: Image.network(
                              track.artwork,
                              width: 50,
                              height: 50,
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) => Container(
                                width: 50,
                                height: 50,
                                color: Colors.blueGrey,
                                child: const Icon(Icons.audiotrack, color: Colors.white),
                              ),
                            ),
                          ),
                          title: Text(track.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                          subtitle: Text('${track.artist} • ${track.duration}', style: const TextStyle(fontSize: 12)),
                          trailing: FilledButton.tonal(
                            onPressed: () {
                              Navigator.pop(ctx);
                              _urlController.text = track.url;
                              appState.processVideo(track.url);
                            },
                            child: const Text('Putar', style: TextStyle(fontSize: 12)),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }
}
