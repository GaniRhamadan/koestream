import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../models/models.dart';

class ApiException implements Exception {
  final String message;
  final String code;
  final int statusCode;

  ApiException(this.message, {this.code = 'API_ERROR', this.statusCode = 500});

  @override
  String toString() => message;
}

class ApiService {
  static const String _defaultBaseUrl = String.fromEnvironment(
    'API_BASE',
    defaultValue: 'http://127.0.0.1:8000',
  );

  String _baseUrl = _defaultBaseUrl;

  String get baseUrl => _baseUrl;

  void setBaseUrl(String newUrl) {
    var url = newUrl.trim();
    if (url.endsWith('/')) {
      url = url.substring(0, url.length - 1);
    }
    _baseUrl = url;
  }

  Future<Map<String, dynamic>> checkHealth() async {
    try {
      final uri = Uri.parse('$_baseUrl/api/v1/health');
      final resp = await http.get(uri).timeout(const Duration(seconds: 5));
      if (resp.statusCode == 200) {
        return jsonDecode(utf8.decode(resp.bodyBytes)) as Map<String, dynamic>;
      } else {
        throw ApiException(
          'Server tidak sehat: status ${resp.statusCode}',
          statusCode: resp.statusCode,
        );
      }
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Gagal terhubung ke server ($_baseUrl): $e');
    }
  }

  Future<VideoTranscriptResponse> processVideo({
    required String youtubeUrl,
    required String targetLang,
    String nativeLang = 'id',
    List<String> knownLemmas = const [],
    int maxSegments = 200,
    bool demo = false,
  }) async {
    final uri = Uri.parse('$_baseUrl/api/v1/process-video');
    try {
      final bodyData = jsonEncode({
        'youtube_url': youtubeUrl,
        'target_lang': targetLang,
        'native_lang': nativeLang,
        'known_lemmas': knownLemmas,
        'max_segments': maxSegments,
        'demo': demo,
      });

      final resp = await http.post(
        uri,
        headers: {'Content-Type': 'application/json; charset=utf-8'},
        body: bodyData,
      ).timeout(const Duration(seconds: 300));

      if (resp.statusCode == 200) {
        final Map<String, dynamic> data = jsonDecode(utf8.decode(resp.bodyBytes));
        return VideoTranscriptResponse.fromJson(data);
      } else {
        String detailMsg = 'Gagal memproses video (status ${resp.statusCode})';
        String errCode = 'HTTP_${resp.statusCode}';
        try {
          final errJson = jsonDecode(utf8.decode(resp.bodyBytes));
          if (errJson['detail'] != null) {
            detailMsg = errJson['detail'].toString();
          }
          if (errJson['code'] != null) {
            errCode = errJson['code'].toString();
          }
        } catch (_) {}
        throw ApiException(detailMsg, code: errCode, statusCode: resp.statusCode);
      }
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Terjadi kendala koneksi ke backend: $e');
    }
  }

  Future<String> translateSentence({
    required String sentence,
    required String sourceLang,
    String targetLang = 'id',
    String? nativeLang,
  }) async {
    final tgt = nativeLang ?? targetLang;
    final uri = Uri.parse('$_baseUrl/api/v1/translate-sentence');
    try {
      final resp = await http.post(
        uri,
        headers: {'Content-Type': 'application/json; charset=utf-8'},
        body: jsonEncode({
          'sentence': sentence,
          'source_lang': sourceLang,
          'target_lang': tgt,
        }),
      ).timeout(const Duration(seconds: 8));

      if (resp.statusCode == 200) {
        final Map<String, dynamic> data = jsonDecode(utf8.decode(resp.bodyBytes));
        return data['translated_text'] as String? ?? '';
      }
      return '';
    } catch (_) {
      return '';
    }
  }

  Future<FSRSItem> scheduleFSRS(FSRSItem item) async {
    final uri = Uri.parse('$_baseUrl/api/v1/srs/schedule');
    try {
      final resp = await http.post(
        uri,
        headers: {'Content-Type': 'application/json; charset=utf-8'},
        body: jsonEncode(item.toJson()),
      ).timeout(const Duration(seconds: 10));

      if (resp.statusCode == 200) {
        final Map<String, dynamic> data = jsonDecode(utf8.decode(resp.bodyBytes));
        return FSRSItem.fromJson(data);
      } else {
        throw ApiException('Gagal menjadwalkan SRS: status ${resp.statusCode}');
      }
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Error FSRS: $e');
    }
  }

  Future<ShadowingResult> evaluateShadowingAudio({
    required String audioFilePath,
    List<double>? nativeF0,
  }) async {
    final uri = Uri.parse('$_baseUrl/api/v1/shadowing/evaluate-audio');
    try {
      final req = http.MultipartRequest('POST', uri);
      final file = File(audioFilePath);
      if (!await file.exists()) {
        throw ApiException('File rekaman suara tidak ditemukan di path: $audioFilePath');
      }

      req.files.add(await http.MultipartFile.fromPath('file', audioFilePath));
      if (nativeF0 != null && nativeF0.isNotEmpty) {
        req.fields['native_f0_json'] = jsonEncode(nativeF0);
      }

      final streamedResp = await req.send().timeout(const Duration(seconds: 40));
      final resp = await http.Response.fromStream(streamedResp);

      if (resp.statusCode == 200) {
        final Map<String, dynamic> data = jsonDecode(utf8.decode(resp.bodyBytes));
        return ShadowingResult.fromJson(data);
      } else {
        throw ApiException('Gagal evaluasi audio: status ${resp.statusCode}');
      }
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Error evaluasi shadowing: $e');
    }
  }
}
