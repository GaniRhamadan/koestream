import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:record/record.dart';
import 'package:path_provider/path_provider.dart';
import '../models/models.dart';
import '../state/app_state.dart';

class ShadowingScreen extends StatefulWidget {
  final TranscriptSegment segment;
  final String videoId;

  const ShadowingScreen({
    super.key,
    required this.segment,
    required this.videoId,
  });

  @override
  State<ShadowingScreen> createState() => _ShadowingScreenState();
}

class _ShadowingScreenState extends State<ShadowingScreen> {
  final AudioRecorder _audioRecorder = AudioRecorder();
  bool _isRecording = false;
  bool _isEvaluating = false;
  ShadowingResult? _evaluationResult;
  String? _errorMessage;

  @override
  void dispose() {
    _audioRecorder.dispose();
    super.dispose();
  }

  Future<void> _startRecording() async {
    try {
      if (await _audioRecorder.hasPermission()) {
        final tempDir = await getTemporaryDirectory();
        final path = '${tempDir.path}/shadowing_${DateTime.now().millisecondsSinceEpoch}.wav';

        await _audioRecorder.start(
          const RecordConfig(encoder: AudioEncoder.wav, sampleRate: 16000),
          path: path,
        );

        setState(() {
          _isRecording = true;
          _errorMessage = null;
          _evaluationResult = null;
        });
      } else {
        setState(() {
          _errorMessage = 'Izin mikrofon tidak diberikan.';
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Gagal memulai perekaman: $e';
      });
    }
  }

  Future<void> _stopRecording() async {
    try {
      final path = await _audioRecorder.stop();
      setState(() {
        _isRecording = false;
      });

      if (path != null) {
        _evaluateAudio(path);
      }
    } catch (e) {
      setState(() {
        _isRecording = false;
        _errorMessage = 'Gagal menghentikan rekaman: $e';
      });
    }
  }

  Future<void> _evaluateAudio(String filePath) async {
    setState(() {
      _isEvaluating = true;
      _errorMessage = null;
    });

    final appState = Provider.of<AppState>(context, listen: false);

    try {
      final result = await appState.apiService.evaluateShadowingAudio(
        audioFilePath: filePath,
      );

      setState(() {
        _isEvaluating = false;
        _evaluationResult = result;
      });
    } catch (e) {
      setState(() {
        _isEvaluating = false;
        _errorMessage = 'Gagal mengevaluasi intonasi: $e';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Latihan Shadowing Intonasi'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Kartu Kalimat Target
            Card(
              elevation: 2,
              color: isDark ? const Color(0xFF1E222D) : Colors.grey.shade50,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: Padding(
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Kalimat Native Target:',
                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      widget.segment.originalText,
                      style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, height: 1.4),
                    ),
                    if (widget.segment.translatedText.isNotEmpty) ...[
                      const SizedBox(height: 6),
                      Text(
                        widget.segment.translatedText,
                        style: TextStyle(
                          fontSize: 14,
                          color: isDark ? Colors.grey.shade400 : Colors.grey.shade700,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),

            const SizedBox(height: 24),

            // Tombol Rekam Suara Besar
            Center(
              child: Column(
                children: [
                  GestureDetector(
                    onTap: _isEvaluating
                        ? null
                        : () {
                            if (_isRecording) {
                              _stopRecording();
                            } else {
                              _startRecording();
                            }
                          },
                    child: Container(
                      width: 84,
                      height: 84,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: _isRecording ? Colors.redAccent : Colors.blueAccent,
                        boxShadow: [
                          BoxShadow(
                            color: (_isRecording ? Colors.red : Colors.blue).withValues(alpha: 0.35),
                            blurRadius: 18,
                            spreadRadius: 2,
                          ),
                        ],
                      ),
                      child: Icon(
                        _isRecording ? Icons.stop : Icons.mic,
                        color: Colors.white,
                        size: 40,
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    _isRecording
                        ? 'Merekam suara Anda... (Ketuk untuk Berhenti)'
                        : (_isEvaluating
                            ? 'Mengevaluasi kontur intonasi DTW...'
                            : 'Ketuk mikrofon dan tirukan kalimat'),
                    style: TextStyle(
                      fontSize: 13.5,
                      fontWeight: FontWeight.w600,
                      color: _isRecording ? Colors.redAccent : (isDark ? Colors.grey.shade300 : Colors.grey.shade700),
                    ),
                  ),
                ],
              ),
            ),

            if (_isEvaluating)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 24.0),
                child: Center(child: CircularProgressIndicator()),
              ),

            // Tampilan Error Jika Ada
            if (_errorMessage != null)
              Container(
                margin: const EdgeInsets.only(top: 20),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.red.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: Colors.red.withValues(alpha: 0.3)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.error_outline, color: Colors.red),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(_errorMessage!, style: const TextStyle(color: Colors.redAccent, fontSize: 13)),
                    ),
                  ],
                ),
              ),

            // Hasil Evaluasi Shadowing
            if (_evaluationResult != null) ...[
              const SizedBox(height: 28),
              _buildEvaluationCard(_evaluationResult!, isDark),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildEvaluationCard(ShadowingResult result, bool isDark) {
    Color scoreColor;
    if (result.score >= 85) {
      scoreColor = Colors.greenAccent.shade400;
    } else if (result.score >= 70) {
      scoreColor = Colors.amberAccent.shade400;
    } else {
      scoreColor = Colors.orangeAccent.shade400;
    }

    return Card(
      elevation: 4,
      color: isDark ? const Color(0xFF1E222D) : Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Skor & Judul
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Skor Keselarasan Intonasi:',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                  decoration: BoxDecoration(
                    color: scoreColor.withValues(alpha: 0.18),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: scoreColor.withValues(alpha: 0.5)),
                  ),
                  child: Text(
                    '${result.score.toInt()} / 100',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: scoreColor),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              result.feedback,
              style: TextStyle(
                fontSize: 14,
                color: isDark ? Colors.grey.shade300 : Colors.black87,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 20),

            // Legenda Kurva
            Row(
              children: [
                Container(width: 14, height: 4, color: Colors.cyan),
                const SizedBox(width: 6),
                const Text('Native F0', style: TextStyle(fontSize: 12)),
                const SizedBox(width: 20),
                Container(width: 14, height: 4, color: Colors.greenAccent),
                const SizedBox(width: 6),
                const Text('Suara Anda F0', style: TextStyle(fontSize: 12)),
              ],
            ),
            const SizedBox(height: 12),

            // Canvas Kurva Pitch DTW
            Container(
              height: 150,
              width: double.infinity,
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF141721) : Colors.grey.shade100,
                borderRadius: BorderRadius.circular(12),
              ),
              child: CustomPaint(
                painter: _PitchCurvePainter(
                  nativeCurve: result.normalizedNativeCurve,
                  userCurve: result.normalizedUserCurve,
                ),
              ),
            ),

            // Evaluasi Kuartil Waktu
            if (result.segmentFeedbacks.isNotEmpty) ...[
              const SizedBox(height: 20),
              const Text(
                'Umpan Balik per Segmen Waktu:',
                style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              ...result.segmentFeedbacks.map((seg) {
                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 4.0),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: Colors.blue.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          '${seg.startPct.toInt()}%-${seg.endPct.toInt()}%',
                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.blue),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          '${seg.feedback} (${seg.score.toInt()} pts)',
                          style: TextStyle(
                            fontSize: 12.5,
                            color: isDark ? Colors.grey.shade400 : Colors.grey.shade800,
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              }),
            ],
          ],
        ),
      ),
    );
  }
}

class _PitchCurvePainter extends CustomPainter {
  final List<double> nativeCurve;
  final List<double> userCurve;

  _PitchCurvePainter({required this.nativeCurve, required this.userCurve});

  @override
  void paint(Canvas canvas, Size size) {
    if (nativeCurve.isEmpty && userCurve.isEmpty) return;

    final nativePaint = Paint()
      ..color = Colors.cyan
      ..strokeWidth = 2.5
      ..style = PaintingStyle.stroke;

    final userPaint = Paint()
      ..color = Colors.greenAccent
      ..strokeWidth = 2.5
      ..style = PaintingStyle.stroke;

    // Gambar Kurva Native
    _drawCurve(canvas, size, nativeCurve, nativePaint);
    // Gambar Kurva Pengguna
    _drawCurve(canvas, size, userCurve, userPaint);
  }

  void _drawCurve(Canvas canvas, Size size, List<double> curve, Paint paint) {
    if (curve.length < 2) return;

    final path = Path();
    final stepX = size.width / (curve.length - 1);
    final midY = size.height / 2;
    final scaleY = size.height / 6.0;

    for (int i = 0; i < curve.length; i++) {
      final x = i * stepX;
      // Normalisasi z-score biasanya dalam rentang -3.0 .. +3.0
      final y = (midY - (curve[i] * scaleY)).clamp(0.0, size.height);

      if (i == 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    }
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant _PitchCurvePainter oldDelegate) => true;
}
