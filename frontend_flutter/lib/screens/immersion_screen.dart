import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:youtube_player_flutter/youtube_player_flutter.dart';
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
    text: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  );
  final ScrollController _transcriptScrollController = ScrollController();
  final Map<int, GlobalKey> _cardKeys = {};
  YoutubePlayerController? _youtubeController;
  String? _loadedVideoId;
  int _currentPositionMs = 0;
  bool _isAutoScrollEnabled = true;

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
  void dispose() {
    _youtubeController?.dispose();
    _urlController.dispose();
    _transcriptScrollController.dispose();
    super.dispose();
  }

  void _setupYoutubeController(String videoId) {
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

    // Sinkronisasi posisi aktif segmen transkrip (loop mundur untuk memilih segmen teranyar jika tumpang-tindih)
    int? matchedIdx;
    for (int i = resp.segments.length - 1; i >= 0; i--) {
      final seg = resp.segments[i];
      // Berikan toleransi 250ms agar transisi mulus dan tidak terputus di celah jeda antarkalimat
      if (currentPositionMs >= seg.startMs && currentPositionMs <= seg.endMs + 250) {
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
    _youtubeController?.seekTo(Duration(milliseconds: seg.startMs));
    _youtubeController?.play();
    _scrollToActiveSegment(index);
  }

  void _changeSpeed(double speed) {
    final appState = Provider.of<AppState>(context, listen: false);
    appState.setPlaybackSpeed(speed);
    _youtubeController?.setPlaybackRate(speed);
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
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'KoeStream',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        actions: [
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
                          hintText: 'Tempel URL YouTube di sini...',
                          prefixIcon: const Icon(Icons.ondemand_video, size: 20),
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
                              if (url.isNotEmpty) {
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

          // Area Pemutar YouTube
          if (_youtubeController != null)
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
                      'Masukkan URL YouTube atau pilih "Mode Demo" untuk mulai',
                      style: TextStyle(color: Colors.grey.shade500, fontSize: 13),
                    ),
                    const SizedBox(height: 12),
                    FilledButton.tonalIcon(
                      onPressed: () => appState.processVideo(_urlController.text.trim(), demo: true),
                      icon: const Icon(Icons.play_circle_outline, size: 18),
                      label: const Text('Mulai Mode Demo'),
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
          final activeTokenId = isActive ? _calculateActiveTokenId(seg, _currentPositionMs) : null;

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
}
