import 'package:flutter/material.dart';
import 'package:flutter_tts/flutter_tts.dart';
import '../models/models.dart';
import '../state/app_state.dart';

class WordInspectorWidget extends StatefulWidget {
  final UniversalToken token;
  final TranscriptSegment segment;
  final String videoId;
  final AppState appState;
  final VoidCallback? onClose;

  const WordInspectorWidget({
    super.key,
    required this.token,
    required this.segment,
    required this.videoId,
    required this.appState,
    this.onClose,
  });

  static void showModal(
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
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(ctx).viewInsets.bottom,
        ),
        child: WordInspectorWidget(
          token: token,
          segment: segment,
          videoId: videoId,
          appState: appState,
          onClose: () => Navigator.pop(ctx),
        ),
      ),
    );
  }

  @override
  State<WordInspectorWidget> createState() => _WordInspectorWidgetState();
}

class _WordInspectorWidgetState extends State<WordInspectorWidget> {
  final FlutterTts _flutterTts = FlutterTts();
  bool _isPlayingAudio = false;

  @override
  void initState() {
    super.initState();
    _initTts();
  }

  void _initTts() async {
    await _flutterTts.setSpeechRate(0.5);
    await _flutterTts.setVolume(1.0);
    await _flutterTts.setPitch(1.0);

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
    final ttsLang = langMap[widget.appState.targetLang] ?? 'ja-JP';
    await _flutterTts.setLanguage(ttsLang);
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
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final token = widget.token;
    final isMastered = widget.appState.isLemmaMastered(token.lemma);
    final isSaved = widget.appState.flashcards.any(
      (c) => c.lemma == token.lemma || c.surface == token.surface,
    );

    // Reading & Romaji formatting (1:1 with Web)
    final phonetic = token.phoneticScript.isNotEmpty ? token.phoneticScript : token.surface;
    final romaji = (token.pronouncedAs.isNotEmpty && token.pronouncedAs != phonetic)
        ? token.pronouncedAs
        : '';
    final readingDisplay = romaji.isNotEmpty ? '$phonetic • $romaji' : phonetic;

    // JLPT / Level badge
    final levelBadge = token.proficiencyTag != null && token.proficiencyTag!.isNotEmpty
        ? token.proficiencyTag!
        : 'JLPT N3';

    // Grammar note
    String grammarText = '';
    if (token.pos.toUpperCase() == 'VERB') {
      grammarText = 'Bentuk Dasar (Kata Kerja) • Mizenkei: ${token.lemma.isNotEmpty ? token.lemma : token.surface}';
    } else if (token.pos.toUpperCase() == 'NOUN') {
      grammarText = 'Kata Benda (Meishi) • ${token.lemma.isNotEmpty ? token.lemma : token.surface}';
    } else if (token.pos.toUpperCase() == 'ADJ') {
      grammarText = 'Kata Sifat (Keiyoushi) • ${token.lemma.isNotEmpty ? token.lemma : token.surface}';
    } else if (token.pos.toUpperCase() == 'AUX' || token.pos.toUpperCase() == 'PART') {
      grammarText = 'Partikel / Kata Bantu • ${token.lemma.isNotEmpty ? token.lemma : token.surface}';
    } else {
      grammarText = 'Kelas Kata: ${token.pos} • Lemma: ${token.lemma.isNotEmpty ? token.lemma : token.surface}';
    }

    final meanings = token.meanings.isNotEmpty
        ? token.meanings
        : [token.lemma.isNotEmpty ? token.lemma : token.surface];

    return Container(
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF121215) : Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
        border: Border.all(
          color: isDark ? const Color(0xFF27272A) : const Color(0xFFE2E8F0),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.6 : 0.1),
            blurRadius: 20,
            offset: const Offset(0, -6),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(18, 12, 18, 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Handle bar & Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 7,
                        height: 7,
                        decoration: const BoxDecoration(
                          color: Color(0xFF6366F1),
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'Inspektur Kata',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: isDark ? const Color(0xFFFAFAFA) : const Color(0xFF0F172A),
                          letterSpacing: 0.2,
                        ),
                      ),
                    ],
                  ),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                        decoration: BoxDecoration(
                          color: isDark ? const Color(0xFF18181B) : const Color(0xFFF1F5F9),
                          borderRadius: BorderRadius.circular(5),
                          border: Border.all(
                            color: isDark ? const Color(0xFF27272A) : const Color(0xFFCBD5E1),
                            width: 0.8,
                          ),
                        ),
                        child: Text(
                          'JMdict / JLPT',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                            color: isDark ? const Color(0xFF71717A) : const Color(0xFF64748B),
                          ),
                        ),
                      ),
                      if (widget.onClose != null) ...[
                        const SizedBox(width: 8),
                        InkWell(
                          onTap: widget.onClose,
                          borderRadius: BorderRadius.circular(12),
                          child: Container(
                            padding: const EdgeInsets.all(4),
                            decoration: BoxDecoration(
                              color: isDark ? Colors.white10 : Colors.black12,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.close, size: 16),
                          ),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Top Reading & JLPT Badge
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      readingDisplay,
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: isDark ? const Color(0xFF818CF8) : const Color(0xFF2563EB),
                      ),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: const Color(0xFF8B5CF6).withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(
                        color: const Color(0xFF8B5CF6).withValues(alpha: 0.35),
                        width: 0.8,
                      ),
                    ),
                    child: Text(
                      levelBadge,
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFFA78BFA),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),

              // Main Surface Text + TTS Speaker
              Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Text(
                    token.surface,
                    style: TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.w800,
                      color: isDark ? Colors.white : const Color(0xFF0F172A),
                      letterSpacing: -0.5,
                    ),
                  ),
                  const SizedBox(width: 12),
                  InkWell(
                    onTap: _speak,
                    borderRadius: BorderRadius.circular(8),
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: const Color(0xFF6366F1).withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: const Color(0xFF6366F1).withValues(alpha: 0.3),
                          width: 1,
                        ),
                      ),
                      child: Icon(
                        _isPlayingAudio ? Icons.volume_up : Icons.volume_up_outlined,
                        size: 18,
                        color: const Color(0xFF818CF8),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),

              // Grammar Note
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF18181B) : const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: isDark ? const Color(0xFF27272A) : const Color(0xFFE2E8F0),
                    width: 0.8,
                  ),
                ),
                child: Text(
                  grammarText,
                  style: TextStyle(
                    fontSize: 11.5,
                    color: isDark ? const Color(0xFFA1A1AA) : const Color(0xFF475569),
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
              const SizedBox(height: 10),

              // Definitions Label
              Text(
                'ARTI & DEFINISI:',
                style: TextStyle(
                  fontSize: 10.5,
                  fontWeight: FontWeight.w700,
                  color: isDark ? const Color(0xFF71717A) : const Color(0xFF64748B),
                  letterSpacing: 0.6,
                ),
              ),
              const SizedBox(height: 4),

              // Definitions List
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: meanings.asMap().entries.map((entry) {
                  return Padding(
                    padding: const EdgeInsets.symmetric(vertical: 2.5),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '${entry.key + 1}. ',
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF6366F1),
                          ),
                        ),
                        Expanded(
                          child: Text(
                            entry.value,
                            style: TextStyle(
                              fontSize: 13,
                              color: isDark ? const Color(0xFFE4E4E7) : const Color(0xFF1E293B),
                              height: 1.35,
                            ),
                          ),
                        ),
                      ],
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 14),

              // Action Buttons Row (1:1 with Web)
              Row(
                children: [
                  Expanded(
                    child: FilledButton.icon(
                      style: FilledButton.styleFrom(
                        backgroundColor: const Color(0xFF6366F1),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                      onPressed: () async {
                        await widget.appState.saveFlashcard(
                          token: widget.token,
                          segment: widget.segment,
                          videoId: widget.videoId,
                        );
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('✓ Berhasil ditambahkan ke SRS: "${token.surface}"'),
                              behavior: SnackBarBehavior.floating,
                              duration: const Duration(seconds: 2),
                            ),
                          );
                        }
                      },
                      icon: Icon(isSaved ? Icons.check : Icons.add, size: 16),
                      label: Text(
                        isSaved ? 'Tersimpan di SRS' : '+ Tambah ke SRS',
                        style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        side: BorderSide(
                          color: isMastered
                              ? const Color(0xFF10B981)
                              : (isDark ? const Color(0xFF27272A) : const Color(0xFFCBD5E1)),
                          width: 1,
                        ),
                        backgroundColor: isMastered
                            ? const Color(0xFF10B981).withValues(alpha: 0.15)
                            : Colors.transparent,
                        foregroundColor: isMastered
                            ? const Color(0xFF10B981)
                            : (isDark ? const Color(0xFFFAFAFA) : const Color(0xFF0F172A)),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                      onPressed: () {
                        widget.appState.toggleMasteredLemma(token.lemma);
                        setState(() {});
                      },
                      icon: Icon(
                        isMastered ? Icons.check_circle : Icons.check_circle_outline,
                        size: 16,
                      ),
                      label: Text(
                        isMastered ? '✓ Dikuasai' : '✓ Tandai Dikuasai',
                        style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
