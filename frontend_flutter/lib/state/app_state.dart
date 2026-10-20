import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import '../services/storage_service.dart';

class AppState extends ChangeNotifier {
  final ApiService _apiService = ApiService();
  final StorageService _storageService = StorageService();

  ApiService get apiService => _apiService;
  StorageService get storageService => _storageService;

  bool _isLoading = false;
  String? _errorMessage;
  VideoTranscriptResponse? _videoResponse;
  int _currentSegmentIndex = 0;

  String _targetLang = 'ja';
  String _nativeLang = 'id';

  bool _isLoopActive = false;
  double _playbackSpeed = 1.0;
  bool _isRubyVisible = true;
  bool _showRomaji = true;
  bool _filterIPlusOneOnly = false;
  bool _isDarkMode = true;

  Set<String> _masteredLemmas = {};
  List<Flashcard> _flashcards = [];

  // Getters
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  VideoTranscriptResponse? get videoResponse => _videoResponse;
  int get currentSegmentIndex => _currentSegmentIndex;
  String get targetLang => _targetLang;
  String get nativeLang => _nativeLang;
  bool get isLoopActive => _isLoopActive;
  double get playbackSpeed => _playbackSpeed;
  bool get isRubyVisible => _isRubyVisible;
  bool get showRomaji => _showRomaji;
  bool get filterIPlusOneOnly => _filterIPlusOneOnly;
  bool get isDarkMode => _isDarkMode;
  Set<String> get masteredLemmas => _masteredLemmas;
  List<Flashcard> get flashcards => _flashcards;

  List<Flashcard> get dueFlashcards {
    final now = DateTime.now();
    return _flashcards.where((c) {
      final due = DateTime.tryParse(c.fsrs.dueDate);
      if (due == null) return true;
      return now.isAfter(due);
    }).toList()
      ..sort((a, b) => a.fsrs.dueDate.compareTo(b.fsrs.dueDate));
  }

  TranscriptSegment? get currentSegment {
    if (_videoResponse == null || _videoResponse!.segments.isEmpty) return null;
    if (_currentSegmentIndex >= 0 && _currentSegmentIndex < _videoResponse!.segments.length) {
      return _videoResponse!.segments[_currentSegmentIndex];
    }
    return null;
  }

  Future<void> init() async {
    _masteredLemmas = await _storageService.loadMasteredLemmas();
    _flashcards = await _storageService.loadFlashcards();
    final customUrl = await _storageService.loadCustomApiBaseUrl();
    if (customUrl != null && customUrl.isNotEmpty) {
      _apiService.setBaseUrl(customUrl);
    }
    notifyListeners();
  }

  void setTargetLang(String lang) {
    if (_targetLang != lang) {
      _targetLang = lang;
      notifyListeners();
    }
  }

  void setNativeLang(String lang) {
    if (_nativeLang != lang) {
      _nativeLang = lang;
      notifyListeners();
    }
  }

  void toggleLoop() {
    _isLoopActive = !_isLoopActive;
    notifyListeners();
  }

  void setPlaybackSpeed(double speed) {
    _playbackSpeed = speed;
    notifyListeners();
  }

  void toggleRuby() {
    _isRubyVisible = !_isRubyVisible;
    notifyListeners();
  }

  void toggleRomaji() {
    _showRomaji = !_showRomaji;
    notifyListeners();
  }

  void toggleFilterIPlusOne() {
    _filterIPlusOneOnly = !_filterIPlusOneOnly;
    notifyListeners();
  }

  void toggleDarkMode() {
    _isDarkMode = !_isDarkMode;
    notifyListeners();
  }

  void setCurrentSegmentIndex(int index) {
    if (_videoResponse == null) return;
    if (index >= 0 && index < _videoResponse!.segments.length) {
      if (_currentSegmentIndex != index) {
        _currentSegmentIndex = index;
        notifyListeners();
        // Prefetch terjemahan segmen saat ini jika masih kosong
        if (_videoResponse!.segments[index].translatedText.isEmpty) {
          translateSegment(index);
        }
      }
    }
  }

  Future<void> translateSegment(int index) async {
    if (_videoResponse == null) return;
    if (index < 0 || index >= _videoResponse!.segments.length) return;
    final seg = _videoResponse!.segments[index];
    if (seg.translatedText.isNotEmpty) return;

    try {
      final trans = await _apiService.translateSentence(
        sentence: seg.originalText,
        sourceLang: _targetLang,
        nativeLang: _nativeLang,
      );
      if (trans.isNotEmpty) {
        final updatedSeg = TranscriptSegment(
          index: seg.index,
          startMs: seg.startMs,
          endMs: seg.endMs,
          originalText: seg.originalText,
          translatedText: trans,
          translationFailed: false,
          isIPlusOne: seg.isIPlusOne,
          tokens: seg.tokens,
        );
        _videoResponse!.segments[index] = updatedSeg;
        notifyListeners();
      }
    } catch (_) {}
  }

  Future<void> processVideo(String url, {bool demo = false}) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final resp = await _apiService.processVideo(
        youtubeUrl: url,
        targetLang: _targetLang,
        nativeLang: _nativeLang,
        knownLemmas: _masteredLemmas.toList(),
        demo: demo,
      );
      _videoResponse = resp;
      _currentSegmentIndex = 0;
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString();
      notifyListeners();
    }
  }

  Future<void> markLemmaMastered(String lemma) async {
    final clean = lemma.trim();
    if (clean.isEmpty) return;
    _masteredLemmas.add(clean);
    await _storageService.saveMasteredLemmas(_masteredLemmas);
    notifyListeners();
  }

  Future<void> unmarkLemmaMastered(String lemma) async {
    _masteredLemmas.remove(lemma.trim());
    await _storageService.saveMasteredLemmas(_masteredLemmas);
    notifyListeners();
  }

  bool isLemmaMastered(String lemma) {
    return _masteredLemmas.contains(lemma.trim());
  }

  Future<void> addFlashcardFromToken({
    required UniversalToken token,
    required TranscriptSegment segment,
    required String videoId,
  }) async {
    final cardId = 'card_${DateTime.now().millisecondsSinceEpoch}_${token.lemma}';
    final initialFsrs = FSRSItem(
      cardId: cardId,
      rating: 3,
      state: 'new',
      step: 0,
      stability: 0.0,
      difficulty: 0.0,
      dueDate: DateTime.now().toIso8601String(),
    );

    final newCard = Flashcard(
      id: cardId,
      lemma: token.lemma,
      surface: token.surface,
      targetLang: _targetLang,
      reading: token.pronouncedAs,
      meaning: token.meanings.isNotEmpty ? token.meanings.join(', ') : token.surface,
      contextSentence: segment.originalText,
      contextTranslation: segment.translatedText,
      videoId: videoId,
      timestampMs: segment.startMs,
      fsrs: initialFsrs,
      lastReviewDate: DateTime.now(),
      createdAt: DateTime.now(),
    );

    await _storageService.saveFlashcard(newCard);
    _flashcards = await _storageService.loadFlashcards();
    notifyListeners();
  }

  Future<void> reviewFlashcard(Flashcard card, int rating) async {
    try {
      final now = DateTime.now();
      // Hitung hari nyata sejak ulasan terakhir
      final double elapsedDays = now.difference(card.lastReviewDate).inHours / 24.0;

      final req = FSRSItem(
        cardId: card.id,
        rating: rating,
        state: card.fsrs.state,
        step: card.fsrs.step,
        stability: card.fsrs.stability,
        difficulty: card.fsrs.difficulty,
        elapsedDays: elapsedDays > 0 ? elapsedDays : 0.0,
        scheduledDays: card.fsrs.scheduledDays,
        reps: card.fsrs.reps,
        lapses: card.fsrs.lapses,
        dueDate: card.fsrs.dueDate,
        retrievability: card.fsrs.retrievability,
      );

      final updatedFsrs = await _apiService.scheduleFSRS(req);

      final updatedCard = Flashcard(
        id: card.id,
        lemma: card.lemma,
        surface: card.surface,
        targetLang: card.targetLang,
        reading: card.reading,
        meaning: card.meaning,
        contextSentence: card.contextSentence,
        contextTranslation: card.contextTranslation,
        videoId: card.videoId,
        timestampMs: card.timestampMs,
        fsrs: updatedFsrs,
        lastReviewDate: now,
        createdAt: card.createdAt,
      );

      await _storageService.saveFlashcard(updatedCard);
      _flashcards = await _storageService.loadFlashcards();
      notifyListeners();
    } catch (e) {
      _errorMessage = 'Gagal menyimpan ulasan flashcard: $e';
      notifyListeners();
    }
  }

  Future<void> setCustomApiBaseUrl(String url) async {
    _apiService.setBaseUrl(url);
    await _storageService.saveCustomApiBaseUrl(url);
    notifyListeners();
  }
}
