import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../state/app_state.dart';
import '../models/models.dart';

class ReviewScreen extends StatefulWidget {
  const ReviewScreen({super.key});

  @override
  State<ReviewScreen> createState() => _ReviewScreenState();
}

class _ReviewScreenState extends State<ReviewScreen> with SingleTickerProviderStateMixin {
  bool _isFlipped = false;
  late AnimationController _flipController;
  late Animation<double> _flipAnimation;

  int _sessionReviewedCount = 0;

  @override
  void initState() {
    super.initState();
    _flipController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 350),
    );
    _flipAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _flipController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _flipController.dispose();
    super.dispose();
  }

  void _flipCard() {
    if (_isFlipped) {
      _flipController.reverse();
    } else {
      _flipController.forward();
    }
    setState(() {
      _isFlipped = !_isFlipped;
    });
  }

  void _rateCard(Flashcard card, int rating) async {
    final appState = Provider.of<AppState>(context, listen: false);
    await appState.reviewFlashcard(card, rating);

    setState(() {
      _sessionReviewedCount++;
      _isFlipped = false;
      _flipController.reset();
      // Tetap di index 0 karena list dueFlashcards akan otomatis membuang kartu yang sudah di-review
    });
  }

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);
    final dueCards = appState.dueFlashcards;
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Review Flashcard FSRS v4.5'),
      ),
      body: dueCards.isEmpty
          ? _buildEmptyState(context, isDark)
          : _buildReviewContent(dueCards[0], dueCards.length, isDark),
    );
  }

  Widget _buildEmptyState(BuildContext context, bool isDark) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.task_alt, size: 72, color: Colors.green.shade400),
            const SizedBox(height: 16),
            const Text(
              'Semua Kartu Selesai Diulas!',
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              'Anda telah menuntaskan $_sessionReviewedCount ulasan pada sesi ini.\nKembalilah saat kartu berikutnya jatuh tempo.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14.5,
                color: isDark ? Colors.grey.shade400 : Colors.grey.shade600,
              ),
            ),
            const SizedBox(height: 24),
            FilledButton.icon(
              onPressed: () => Navigator.pop(context),
              icon: const Icon(Icons.arrow_back),
              label: const Text('Kembali ke Immersi Video'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReviewContent(Flashcard card, int remainingCount, bool isDark) {
    final previews = card.fsrs.previews;

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        children: [
          // Indikator Kartu Tersisa
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Sisa Antrean: $remainingCount kartu',
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.blue.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  'Status: ${card.fsrs.state.toUpperCase()}',
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.blue),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Area Kartu Flashcard dengan Animasi Flip
          Expanded(
            child: GestureDetector(
              onTap: _flipCard,
              child: AnimatedBuilder(
                animation: _flipAnimation,
                builder: (context, child) {
                  final angle = _flipAnimation.value * 3.14159265;
                  final isBack = angle > (3.14159265 / 2);

                  return Transform(
                    alignment: Alignment.center,
                    transform: Matrix4.identity()
                      ..setEntry(3, 2, 0.001)
                      ..rotateY(angle),
                    child: Card(
                      elevation: 6,
                      color: isDark ? const Color(0xFF232838) : Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(20),
                        side: BorderSide(
                          color: isDark ? Colors.grey.shade800 : Colors.grey.shade300,
                        ),
                      ),
                      child: Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(24.0),
                        child: isBack
                            ? Transform(
                                alignment: Alignment.center,
                                transform: Matrix4.identity()..rotateY(3.14159265),
                                child: _buildCardBack(card, isDark),
                              )
                            : _buildCardFront(card, isDark),
                      ),
                    ),
                  );
                },
              ),
            ),
          ),

          const SizedBox(height: 16),

          // Tombol Rating 4 Pilihan FSRS (Again, Hard, Good, Easy)
          if (_isFlipped)
            Row(
              children: [
                _buildRatingButton(
                  rating: 1,
                  label: 'Again',
                  intervalLabel: previews[1] != null ? '${previews[1]!.intervalDays}d' : '<1d',
                  color: Colors.redAccent,
                  onTap: () => _rateCard(card, 1),
                ),
                const SizedBox(width: 8),
                _buildRatingButton(
                  rating: 2,
                  label: 'Hard',
                  intervalLabel: previews[2] != null ? '${previews[2]!.intervalDays}d' : '1d',
                  color: Colors.orangeAccent,
                  onTap: () => _rateCard(card, 2),
                ),
                const SizedBox(width: 8),
                _buildRatingButton(
                  rating: 3,
                  label: 'Good',
                  intervalLabel: previews[3] != null ? '${previews[3]!.intervalDays}d' : '3d',
                  color: Colors.blueAccent,
                  onTap: () => _rateCard(card, 3),
                ),
                const SizedBox(width: 8),
                _buildRatingButton(
                  rating: 4,
                  label: 'Easy',
                  intervalLabel: previews[4] != null ? '${previews[4]!.intervalDays}d' : '7d',
                  color: Colors.greenAccent,
                  onTap: () => _rateCard(card, 4),
                ),
              ],
            )
          else
            SizedBox(
              width: double.infinity,
              height: 50,
              child: FilledButton.tonal(
                onPressed: _flipCard,
                child: const Text('Buka Jawaban (Ketuk Kartu)', style: TextStyle(fontSize: 16)),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildCardFront(Flashcard card, bool isDark) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          card.surface,
          style: TextStyle(
            fontSize: 40,
            fontWeight: FontWeight.bold,
            color: isDark ? Colors.white : Colors.black87,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 24),
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF191C26) : Colors.grey.shade100,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            children: [
              const Text('Konteks Kalimat:', style: TextStyle(fontSize: 12, color: Colors.grey)),
              const SizedBox(height: 6),
              Text(
                card.contextSentence,
                style: const TextStyle(fontSize: 16, height: 1.4),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        Text(
          'Ketuk untuk melihat jawaban & arti',
          style: TextStyle(fontSize: 12, color: Colors.grey.shade500),
        ),
      ],
    );
  }

  Widget _buildCardBack(Flashcard card, bool isDark) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          card.surface,
          style: TextStyle(
            fontSize: 32,
            fontWeight: FontWeight.bold,
            color: isDark ? Colors.white : Colors.black87,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          card.reading,
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: Colors.cyan.shade400,
          ),
        ),
        const SizedBox(height: 16),
        Text(
          card.meaning,
          style: const TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w500,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 20),
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF191C26) : Colors.grey.shade100,
            borderRadius: BorderRadius.circular(10),
          ),
          child: Column(
            children: [
              Text(
                card.contextSentence,
                style: const TextStyle(fontSize: 14.5),
                textAlign: TextAlign.center,
              ),
              if (card.contextTranslation.isNotEmpty) ...[
                const SizedBox(height: 4),
                Text(
                  card.contextTranslation,
                  style: TextStyle(fontSize: 13, color: Colors.grey.shade500),
                  textAlign: TextAlign.center,
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildRatingButton({
    required int rating,
    required String label,
    required String intervalLabel,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Expanded(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(10),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: color.withValues(alpha: 0.4)),
          ),
          child: Column(
            children: [
              Text(
                intervalLabel,
                style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: color),
              ),
              const SizedBox(height: 2),
              Text(
                label,
                style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.bold, color: color),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
