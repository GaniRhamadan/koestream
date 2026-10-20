import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/models.dart';

class StorageService {
  static const String _flashcardsKey = 'lingostream_flashcards_v1';
  static const String _masteredLemmasKey = 'lingostream_mastered_lemmas_v1';
  static const String _apiBaseUrlKey = 'lingostream_api_base_url_v1';

  Future<List<Flashcard>> loadFlashcards() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final rawList = prefs.getStringList(_flashcardsKey);
      if (rawList == null || rawList.isEmpty) {
        return [];
      }
      return rawList.map((str) {
        final Map<String, dynamic> data = jsonDecode(str);
        return Flashcard.fromJson(data);
      }).toList();
    } catch (e) {
      return [];
    }
  }

  Future<void> saveFlashcards(List<Flashcard> cards) async {
    final prefs = await SharedPreferences.getInstance();
    final rawList = cards.map((c) => jsonEncode(c.toJson())).toList();
    await prefs.setStringList(_flashcardsKey, rawList);
  }

  Future<void> saveFlashcard(Flashcard card) async {
    final cards = await loadFlashcards();
    final index = cards.indexWhere((c) => c.id == card.id);
    if (index >= 0) {
      cards[index] = card;
    } else {
      cards.add(card);
    }
    await saveFlashcards(cards);
  }

  Future<Set<String>> loadMasteredLemmas() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final list = prefs.getStringList(_masteredLemmasKey);
      if (list == null) return {};
      return list.toSet();
    } catch (e) {
      return {};
    }
  }

  Future<void> saveMasteredLemmas(Set<String> lemmas) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setStringList(_masteredLemmasKey, lemmas.toList());
  }

  Future<void> markLemmaMastered(String lemma) async {
    final set = await loadMasteredLemmas();
    set.add(lemma.trim());
    await saveMasteredLemmas(set);
  }

  Future<void> unmarkLemmaMastered(String lemma) async {
    final set = await loadMasteredLemmas();
    set.remove(lemma.trim());
    await saveMasteredLemmas(set);
  }

  Future<String?> loadCustomApiBaseUrl() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_apiBaseUrlKey);
  }

  Future<void> saveCustomApiBaseUrl(String url) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_apiBaseUrlKey, url.trim());
  }
}
