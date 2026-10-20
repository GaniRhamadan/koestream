import 'package:flutter/material.dart';
import 'package:flutter_tts/flutter_tts.dart';
import '../models/models.dart';
import '../state/app_state.dart';

class DictionarySheet extends StatefulWidget {
  final UniversalToken token;
  final TranscriptSegment segment;
  final String videoId;
  final AppState appState;

  const DictionarySheet({
    super.key,
    required this.token,
    required this.segment,
    required this.videoId,
    required this.appState,
  });

  static void show(
    BuildContext context, {
    required UniversalToken token,
    required TranscriptSegment segment,
    required String videoId,
    required AppState appState,
  }) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => DictionarySheet(
        token: token,
        segment: segment,
        videoId: videoId,
        appState: appState,
      ),
    );
  }

  @override
  State<DictionarySheet> createState() => _DictionarySheetState();
}

class _DictionarySheetState extends State<DictionarySheet> {
  final FlutterTts _flutterTts = FlutterTts();
  bool _isPlayingAudio = false;
  bool _isSavedToSrs = false;

  @override
  void initState() {
    super.initState();
    _initTts();
    _checkSavedStatus();
  }

  void _initTts() async {
    await _flutterTts.setSpeechRate(0.5);
    await _flutterTts.setVolume(1.0);
    await _flutterTts.setPitch(1.0);

    // Pemetaan bahasa TTS
    final langMap = {
      'ja': 'ja-JP',
      'zh': 'zh-CN',
      'ko': 'ko-KR',
      'ar': 'ar-SA',
      'th': 'th-TH',
      'en': 'en-US',
      'de': 'de-DE',
      'fr': 'fr-FR',
      'es': 'es-ES',
      'ru': 'ru-RU',
      'id': 'id-ID',
    };
    final ttsLang = langMap[widget.appState.targetLang] ?? 'en-US';
    await _flutterTts.setLanguage(ttsLang);
  }

  void _checkSavedStatus() {
    final isAlreadySaved = widget.appState.flashcards.any(
      (c) => c.lemma == widget.token.lemma || c.surface == widget.token.surface,
    );
    setState(() {
      _isSavedToSrs = isAlreadySaved;
    });
  }

  void _speak() async {
    setState(() => _isPlayingAudio = true);
    await _flutterTts.speak(widget.token.surface);
    if (mounted) {
      setState(() => _isPlayingAudio = false);
    }
  }

  @override
  void dispose() {
    _flutterTts.stop();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final token = widget.token;
    final isMastered = widget.appState.isLemmaMastered(token.lemma);

    return Container(
      padding: EdgeInsets.only(
        top: 20.0,
        left: 20.0,
        right: 20.0,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24.0,
      ),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E222D) : Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24.0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.25),
            blurRadius: 20,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Handle Bar
            Center(
              child: Container(
                width: 44,
                height: 4,
                margin: const EdgeInsets.only(bottom: 16.0),
                decoration: BoxDecoration(
                  color: isDark ? Colors.grey.shade700 : Colors.grey.shade300,
                  borderRadius: BorderRadius.circular(2.0),
                ),
              ),
            ),

            // Header: Kata, Cara Baca, dan Tombol Suara
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        token.surface,
                        style: TextStyle(
                          fontSize: 30.0,
                          fontWeight: FontWeight.bold,
                          color: isDark ? Colors.white : Colors.black87,
                        ),
                      ),
                      const SizedBox(height: 4.0),
                      Text(
                        token.pronouncedAs.isNotEmpty
                            ? token.pronouncedAs
                            : token.phoneticScript,
                        style: TextStyle(
                          fontSize: 16.0,
                          fontWeight: FontWeight.w500,
                          color: Colors.cyan.shade400,
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton.filledTonal(
                  onPressed: _speak,
                  icon: Icon(
                    _isPlayingAudio ? Icons.volume_up : Icons.volume_down,
                    color: isDark ? Colors.white : Colors.black87,
                  ),
                  tooltip: 'Dengarkan Pelafalan',
                ),
              ],
            ),

            const SizedBox(height: 16.0),

            // Lencana POS, Proficiency, Gender, Root
            Wrap(
              spacing: 8.0,
              runSpacing: 6.0,
              children: [
                _buildBadge('POS: ${token.pos}', Colors.blue),
                if (token.proficiencyTag != null)
                  _buildBadge(token.proficiencyTag!, Colors.amber),
                if (token.gender != null)
                  _buildBadge('Gender: ${token.gender}', Colors.teal),
                if (token.root != null)
                  _buildBadge('Root: ${token.root}', Colors.purple),
                if (token.toneOrPitch != null)
                  _buildBadge(token.toneOrPitch!.value, Colors.deepOrange),
              ],
            ),

            const SizedBox(height: 16.0),

            // Catatan Aturan Ejaan / Fonologi (Jika Ada)
            if (token.orthographicRuleNote != null &&
                token.orthographicRuleNote!.isNotEmpty) ...[
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12.0),
                decoration: BoxDecoration(
                  color: Colors.amber.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(10.0),
                  border: Border.all(
                    color: Colors.amber.withValues(alpha: 0.35),
                  ),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(
                      Icons.auto_fix_high,
                      size: 20.0,
                      color: Colors.amber,
                    ),
                    const SizedBox(width: 8.0),
                    Expanded(
                      child: Text(
                        token.orthographicRuleNote!,
                        style: TextStyle(
                          fontSize: 13.5,
                          height: 1.4,
                          color: isDark ? Colors.amber.shade200 : Colors.amber.shade900,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 14.0),
            ],

            // Rantai Infleksi (Jika Ada)
            if (token.inflectionChain.isNotEmpty) ...[
              Text(
                'Konjugasi / Infleksi:',
                style: TextStyle(
                  fontSize: 13.0,
                  fontWeight: FontWeight.w600,
                  color: isDark ? Colors.grey.shade400 : Colors.grey.shade600,
                ),
              ),
              const SizedBox(height: 4.0),
              Wrap(
                spacing: 6.0,
                children: token.inflectionChain
                    .map((inf) => _buildBadge(inf, Colors.indigo))
                    .toList(),
              ),
              const SizedBox(height: 14.0),
            ],

            // Definisi / Arti Kata
            Text(
              'Arti Kata:',
              style: TextStyle(
                fontSize: 13.0,
                fontWeight: FontWeight.w600,
                color: isDark ? Colors.grey.shade400 : Colors.grey.shade600,
              ),
            ),
            const SizedBox(height: 6.0),
            if (token.meanings.isNotEmpty)
              ...token.meanings.map(
                (m) => Padding(
                  padding: const EdgeInsets.symmetric(vertical: 2.0),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '• ',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: Colors.cyan.shade400,
                        ),
                      ),
                      Expanded(
                        child: Text(
                          m,
                          style: TextStyle(
                            fontSize: 15.0,
                            color: isDark ? Colors.white70 : Colors.black87,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              )
            else
              Text(
                'Tidak ada definisi offline.',
                style: TextStyle(
                  fontSize: 14.0,
                  fontStyle: FontStyle.italic,
                  color: isDark ? Colors.grey.shade500 : Colors.grey.shade600,
                ),
              ),

            const SizedBox(height: 20.0),

            // Kalimat Konteks Asli
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12.0),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF2A2E3D) : Colors.grey.shade100,
                borderRadius: BorderRadius.circular(10.0),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Konteks Kalimat:',
                    style: TextStyle(
                      fontSize: 12.0,
                      fontWeight: FontWeight.bold,
                      color: isDark ? Colors.grey.shade400 : Colors.grey.shade600,
                    ),
                  ),
                  const SizedBox(height: 4.0),
                  Text(
                    widget.segment.originalText,
                    style: TextStyle(
                      fontSize: 14.5,
                      fontWeight: FontWeight.w500,
                      color: isDark ? Colors.white : Colors.black87,
                    ),
                  ),
                  if (widget.segment.translatedText.isNotEmpty) ...[
                    const SizedBox(height: 4.0),
                    Text(
                      widget.segment.translatedText,
                      style: TextStyle(
                        fontSize: 13.0,
                        color: isDark ? Colors.grey.shade400 : Colors.grey.shade700,
                      ),
                    ),
                  ] else ...[
                    const SizedBox(height: 4.0),
                    InkWell(
                      onTap: () async {
                        await widget.appState.translateSegment(widget.segment.index);
                        if (mounted) setState(() {});
                      },
                      child: Text(
                        'Sentuh untuk terjemahkan kalimat...',
                        style: TextStyle(
                          fontSize: 12.0,
                          fontStyle: FontStyle.italic,
                          color: Theme.of(context).colorScheme.primary,
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),

            const SizedBox(height: 24.0),

            // Tombol Aksi: Tandai Dikuasai & Simpan ke SRS
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () async {
                      if (isMastered) {
                        await widget.appState.unmarkLemmaMastered(token.lemma);
                      } else {
                        await widget.appState.markLemmaMastered(token.lemma);
                      }
                      setState(() {});
                    },
                    icon: Icon(
                      isMastered ? Icons.check_circle : Icons.check_circle_outline,
                      color: isMastered ? Colors.green : null,
                    ),
                    label: Text(isMastered ? 'Dikuasai' : 'Tandai Dikuasai'),
                  ),
                ),
                const SizedBox(width: 12.0),
                Expanded(
                  child: FilledButton.icon(
                    onPressed: _isSavedToSrs
                        ? null
                        : () async {
                            await widget.appState.addFlashcardFromToken(
                              token: token,
                              segment: widget.segment,
                              videoId: widget.videoId,
                            );
                            setState(() {
                              _isSavedToSrs = true;
                            });
                            if (context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('Kartu berhasil disimpan ke review SRS!'),
                                  duration: Duration(seconds: 2),
                                ),
                              );
                            }
                          },
                    icon: Icon(
                      _isSavedToSrs ? Icons.bookmark : Icons.bookmark_add,
                    ),
                    label: Text(_isSavedToSrs ? 'Tersimpan' : 'Simpan ke SRS'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBadge(String label, MaterialColor color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 4.0),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(6.0),
        border: Border.all(color: color.withValues(alpha: 0.35)),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 12.0,
          fontWeight: FontWeight.w600,
          color: color.shade300,
        ),
      ),
    );
  }
}
