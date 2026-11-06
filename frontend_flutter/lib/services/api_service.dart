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

  /// Mencari URL backend yang aktif secara otomatis tanpa harus mengganti setting manual.
  Future<String?> autoDiscoverBaseUrl() async {
    final Set<String> candidates = {
      _baseUrl,
      'http://127.0.0.1:8000',
      'http://localhost:8000',
      'http://10.0.2.2:8000',       // Android Emulator host loopback
      'http://192.168.1.15:8000',   // Host LAN Ethernet interface
      'http://192.168.1.22:8000',   // Host Wi-Fi interface
      'http://10.19.71.192:8000',   // Host USB Tethering interface
      'http://10.238.110.202:8000', // Host Wi-Fi interface alternatif
    };

    // Deteksi IP interface jaringan lokal HP untuk subnet matching otomatis
    try {
      final interfaces = await NetworkInterface.list(
        includeLoopback: false,
        type: InternetAddressType.IPv4,
      );
      for (final iface in interfaces) {
        for (final addr in iface.addresses) {
          final ip = addr.address;
          final lastDot = ip.lastIndexOf('.');
          if (lastDot != -1) {
            final prefix = ip.substring(0, lastDot);
            for (final hostPart in [1, 15, 22, 2, 100, 101, 102, 192]) {
              candidates.add('http://$prefix.$hostPart:8000');
            }
          }
        }
      }
    } catch (_) {}

    // Uji semua kandidat secara paralel dengan timeout responsif (1.5 detik per host)
    final probes = candidates.map((candidate) async {
      final clean = candidate.trim().replaceAll(RegExp(r'/+$'), '');
      try {
        final uri = Uri.parse('$clean/api/v1/health');
        final resp = await http.get(uri).timeout(const Duration(milliseconds: 1500));
        if (resp.statusCode == 200) {
          final data = jsonDecode(utf8.decode(resp.bodyBytes));
          if (data is Map && data['status'] == 'healthy') {
            return clean;
          }
        }
      } catch (_) {}
      return null;
    });

    final results = await Future.wait(probes);
    for (final res in results) {
      if (res != null) {
        setBaseUrl(res);
        return res;
      }
    }
    return null;
  }

  Future<Map<String, dynamic>> checkHealth() async {
    try {
      final uri = Uri.parse('$_baseUrl/api/v1/health');
      final resp = await http.get(uri).timeout(const Duration(seconds: 3));
      if (resp.statusCode == 200) {
        return jsonDecode(utf8.decode(resp.bodyBytes)) as Map<String, dynamic>;
      }
    } catch (_) {}

    // Jika gagal pada baseUrl saat ini, lakukan auto-discovery otomatis
    final discovered = await autoDiscoverBaseUrl();
    if (discovered != null) {
      final uri = Uri.parse('$discovered/api/v1/health');
      final resp = await http.get(uri).timeout(const Duration(seconds: 3));
      if (resp.statusCode == 200) {
        return jsonDecode(utf8.decode(resp.bodyBytes)) as Map<String, dynamic>;
      }
    }

    throw ApiException(
      'Gagal terhubung ke backend ($_baseUrl). Pastikan server FastAPI di komputer sedang berjalan.',
    );
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
      ).timeout(const Duration(seconds: 120));

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

      // Coba temukan backend aktif otomatis dan ulangi permintaan jika ditemukan
      final discovered = await autoDiscoverBaseUrl();
      if (discovered != null && discovered != _baseUrl) {
        return processVideo(
          youtubeUrl: youtubeUrl,
          targetLang: targetLang,
          nativeLang: nativeLang,
          knownLemmas: knownLemmas,
          maxSegments: maxSegments,
          demo: demo,
        );
      }

      throw ApiException(
        'Terjadi kendala koneksi ke backend ($_baseUrl): $e.\n'
        'Tips: Pastikan server di komputer aktif (`uvicorn app.main:app --host 0.0.0.0 --port 8000`).',
      );
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
