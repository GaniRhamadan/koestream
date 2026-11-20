import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/api_service.dart';

class GrammarModal extends StatefulWidget {
  final TranscriptSegment segment;
  final int segmentIndex;
  final String targetLang;
  final String nativeLang;
  final ApiService apiService;

  const GrammarModal({
    super.key,
    required this.segment,
    required this.segmentIndex,
    required this.targetLang,
    required this.nativeLang,
    required this.apiService,
  });

  static void show(
    BuildContext context, {
    required TranscriptSegment segment,
    required int segmentIndex,
    required String targetLang,
    required String nativeLang,
    required ApiService apiService,
  }) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => FractionallySizedBox(
        heightFactor: 0.82,
        child: GrammarModal(
          segment: segment,
          segmentIndex: segmentIndex,
          targetLang: targetLang,
          nativeLang: nativeLang,
          apiService: apiService,
        ),
      ),
    );
  }

  @override
  State<GrammarModal> createState() => _GrammarModalState();
}

class _GrammarModalState extends State<GrammarModal> {
  bool _isLoading = true;
  String? _errorMessage;
  GrammarExplainResponse? _response;

  @override
  void initState() {
    super.initState();
    _fetchGrammarExplanation();
  }

  Future<void> _fetchGrammarExplanation() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final res = await widget.apiService.explainGrammar(
        sentence: widget.segment.originalText,
        targetLang: widget.targetLang,
        nativeLang: widget.nativeLang,
      );
      if (mounted) {
        setState(() {
          _response = res;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = e.toString();
          _isLoading = false;
        });
      }
    }
  }

  Color _getPosColor(String pos) {
    switch (pos.toUpperCase()) {
      case 'VERB':
        return const Color(0xFF38BDF8); // Cyan
      case 'PART':
        return const Color(0xFFF43F5E); // Rose
      case 'ADJ':
        return const Color(0xFF10B981); // Emerald
      case 'AUX':
        return const Color(0xFFFBBF24); // Amber
      default:
        return const Color(0xFF94A3B8); // Slate
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF121215) : Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
        border: Border.all(
          color: isDark ? const Color(0xFF27272A) : const Color(0xFFE2E8F0),
          width: 1,
        ),
      ),
      child: Column(
        children: [
          // Header (1:1 with Web modal-grammar)
          Padding(
            padding: const EdgeInsets.fromLTRB(18, 16, 12, 12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      width: 26,
                      height: 26,
                      decoration: BoxDecoration(
                        color: const Color(0xFF38BDF8).withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Center(
                        child: Text('✨', style: TextStyle(fontSize: 14)),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'Eksplanasi Tata Bahasa AI',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: isDark ? Colors.white : const Color(0xFF0F172A),
                      ),
                    ),
                  ],
                ),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.close, size: 20),
                ),
              ],
            ),
          ),
          const Divider(height: 1),

          // Sentence Display Box
          Container(
            width: double.infinity,
            margin: const EdgeInsets.fromLTRB(16, 12, 16, 8),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF18181B) : const Color(0xFFF1F5F9),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(
                color: isDark ? const Color(0xFF27272A) : const Color(0xFFE2E8F0),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    widget.segment.originalText,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: isDark ? const Color(0xFFFAFAFA) : const Color(0xFF0F172A),
                    ),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: const Color(0xFF38BDF8).withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    'Baris #${widget.segmentIndex + 1}',
                    style: const TextStyle(
                      fontSize: 10.5,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF38BDF8),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Main Body Content
          Expanded(
            child: _isLoading
                ? Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const SizedBox(
                          width: 32,
                          height: 32,
                          child: CircularProgressIndicator(
                            strokeWidth: 3,
                            color: Color(0xFF38BDF8),
                          ),
                        ),
                        const SizedBox(height: 14),
                        Text(
                          'Menghubungkan ke AI Guru Bahasa...',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: isDark ? Colors.white : const Color(0xFF0F172A),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Menganalisis partikel, konjugasi kata kerja, dan nuansa kalimat',
                          style: TextStyle(
                            fontSize: 12,
                            color: isDark ? const Color(0xFF71717A) : const Color(0xFF94A3B8),
                          ),
                        ),
                      ],
                    ),
                  )
                : _errorMessage != null
                    ? Center(
                        child: Padding(
                          padding: const EdgeInsets.all(20),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.error_outline, color: Colors.redAccent, size: 36),
                              const SizedBox(height: 10),
                              Text(
                                _errorMessage!,
                                textAlign: TextAlign.center,
                                style: const TextStyle(fontSize: 13, color: Colors.redAccent),
                              ),
                              const SizedBox(height: 12),
                              FilledButton.icon(
                                onPressed: _fetchGrammarExplanation,
                                icon: const Icon(Icons.refresh, size: 16),
                                label: const Text('Coba Lagi'),
                              ),
                            ],
                          ),
                        ),
                      )
                    : SingleChildScrollView(
                        padding: const EdgeInsets.fromLTRB(16, 4, 16, 20),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Summary Text
                            Text(
                              _response?.summary ?? '',
                              style: TextStyle(
                                fontSize: 13.5,
                                height: 1.6,
                                color: isDark ? const Color(0xFFE4E4E7) : const Color(0xFF334155),
                              ),
                            ),
                            const SizedBox(height: 16),

                            // Morphological Tokens Breakdown (1:1 with Web)
                            if (_response != null && _response!.tokens.isNotEmpty) ...[
                              Text(
                                'URAIAN TOKEN & BENTUK KAMUS (MORFOLOGI)',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w800,
                                  color: isDark ? const Color(0xFF71717A) : const Color(0xFF64748B),
                                  letterSpacing: 0.6,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Wrap(
                                spacing: 8,
                                runSpacing: 8,
                                children: _response!.tokens.map((tok) {
                                  final posCol = _getPosColor(tok.pos);
                                  return Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
                                    decoration: BoxDecoration(
                                      color: isDark ? const Color(0xFF18181B) : const Color(0xFFF1F5F9),
                                      borderRadius: BorderRadius.circular(8),
                                      border: Border.all(
                                        color: isDark ? const Color(0xFF27272A) : const Color(0xFFCBD5E1),
                                      ),
                                    ),
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Row(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            Text(
                                              tok.surface,
                                              style: TextStyle(
                                                fontSize: 14,
                                                fontWeight: FontWeight.w700,
                                                color: isDark ? Colors.white : const Color(0xFF0F172A),
                                              ),
                                            ),
                                            const SizedBox(width: 6),
                                            Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                                              decoration: BoxDecoration(
                                                color: posCol.withValues(alpha: 0.15),
                                                borderRadius: BorderRadius.circular(4),
                                              ),
                                              child: Text(
                                                tok.pos,
                                                style: TextStyle(
                                                  fontSize: 9.5,
                                                  fontWeight: FontWeight.w700,
                                                  color: posCol,
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                        if (tok.lemma.isNotEmpty && tok.lemma != tok.surface) ...[
                                          const SizedBox(height: 2),
                                          Text(
                                            'Kamus: ${tok.lemma}',
                                            style: TextStyle(
                                              fontSize: 10.5,
                                              color: isDark ? const Color(0xFF71717A) : const Color(0xFF64748B),
                                            ),
                                          ),
                                        ],
                                        if (tok.meaning.isNotEmpty && tok.meaning != '-') ...[
                                          const SizedBox(height: 2),
                                          Text(
                                            tok.meaning,
                                            style: TextStyle(
                                              fontSize: 11,
                                              color: isDark ? const Color(0xFFCBD5E1) : const Color(0xFF475569),
                                            ),
                                          ),
                                        ],
                                      ],
                                    ),
                                  );
                                }).toList(),
                              ),
                            ],

                            // Indonesian Translation Box
                            if (widget.segment.translatedText.isNotEmpty) ...[
                              const SizedBox(height: 16),
                              Container(
                                width: double.infinity,
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF38BDF8).withValues(alpha: 0.08),
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(
                                    color: const Color(0xFF38BDF8).withValues(alpha: 0.25),
                                  ),
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text(
                                      'Arti Bahasa Indonesia:',
                                      style: TextStyle(
                                        fontSize: 11.5,
                                        fontWeight: FontWeight.w700,
                                        color: Color(0xFF38BDF8),
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      widget.segment.translatedText,
                                      style: TextStyle(
                                        fontSize: 13.5,
                                        color: isDark ? Colors.white : const Color(0xFF0F172A),
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
          ),
        ],
      ),
    );
  }
}
