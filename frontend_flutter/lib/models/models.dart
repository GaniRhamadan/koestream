/// Model Data Kontrak LingoStream Universal (Dart 3.4+)
/// Sinkron 100% dengan Skema Pydantic v2 Backend (snake_case di JSON, camelCase di Dart).
library;

class DisplayPart {
  final String text;
  final String? ruby;

  const DisplayPart({required this.text, this.ruby});

  factory DisplayPart.fromJson(Map<String, dynamic> json) {
    return DisplayPart(
      text: json['text'] as String? ?? '',
      ruby: json['ruby'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
    'text': text,
    'ruby': ruby,
  };
}

class ToneOrPitch {
  final String system;
  final String value;
  final List<int> pattern;

  const ToneOrPitch({
    required this.system,
    required this.value,
    this.pattern = const [],
  });

  factory ToneOrPitch.fromJson(Map<String, dynamic> json) {
    return ToneOrPitch(
      system: json['system'] as String? ?? '',
      value: json['value'] as String? ?? '',
      pattern: (json['pattern'] as List<dynamic>?)
              ?.map((e) => (e as num).toInt())
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() => {
    'system': system,
    'value': value,
    'pattern': pattern,
  };
}

class UniversalToken {
  final int tokenId;
  final String surface;
  final List<DisplayPart> displayParts;
  final String phoneticScript;
  final String pronouncedAs;
  final String? orthographicRuleNote;
  final String lemma;
  final String pos;
  final String? subPos;
  final List<String> inflectionChain;
  final String? root;
  final String? gender;
  final ToneOrPitch? toneOrPitch;
  final String? proficiencyTag;
  final List<String> meanings;
  final List<int> linkedTokenIds;

  const UniversalToken({
    required this.tokenId,
    required this.surface,
    this.displayParts = const [],
    required this.phoneticScript,
    required this.pronouncedAs,
    this.orthographicRuleNote,
    required this.lemma,
    required this.pos,
    this.subPos,
    this.inflectionChain = const [],
    this.root,
    this.gender,
    this.toneOrPitch,
    this.proficiencyTag,
    this.meanings = const [],
    this.linkedTokenIds = const [],
  });

  factory UniversalToken.fromJson(Map<String, dynamic> json) {
    return UniversalToken(
      tokenId: (json['token_id'] as num?)?.toInt() ?? 0,
      surface: json['surface'] as String? ?? '',
      displayParts: (json['display_parts'] as List<dynamic>?)
              ?.map((e) => DisplayPart.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      phoneticScript: json['phonetic_script'] as String? ?? '',
      pronouncedAs: json['pronounced_as'] as String? ?? '',
      orthographicRuleNote: json['orthographic_rule_note'] as String?,
      lemma: json['lemma'] as String? ?? '',
      pos: json['pos'] as String? ?? 'OTHER',
      subPos: json['sub_pos'] as String?,
      inflectionChain: (json['inflection_chain'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
      root: json['root'] as String?,
      gender: json['gender'] as String?,
      toneOrPitch: json['tone_or_pitch'] != null
          ? ToneOrPitch.fromJson(json['tone_or_pitch'] as Map<String, dynamic>)
          : null,
      proficiencyTag: json['proficiency_tag'] as String?,
      meanings: (json['meanings'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
      linkedTokenIds: (json['linked_token_ids'] as List<dynamic>?)
              ?.map((e) => (e as num).toInt())
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() => {
    'token_id': tokenId,
    'surface': surface,
    'display_parts': displayParts.map((e) => e.toJson()).toList(),
    'phonetic_script': phoneticScript,
    'pronounced_as': pronouncedAs,
    'orthographic_rule_note': orthographicRuleNote,
    'lemma': lemma,
    'pos': pos,
    'sub_pos': subPos,
    'inflection_chain': inflectionChain,
    'root': root,
    'gender': gender,
    'tone_or_pitch': toneOrPitch?.toJson(),
    'proficiency_tag': proficiencyTag,
    'meanings': meanings,
    'linked_token_ids': linkedTokenIds,
  };
}

class TranscriptSegment {
  final int index;
  final int startMs;
  final int endMs;
  final String originalText;
  final String translatedText;
  final bool translationFailed;
  final bool isIPlusOne;
  final List<UniversalToken> tokens;

  const TranscriptSegment({
    required this.index,
    required this.startMs,
    required this.endMs,
    required this.originalText,
    required this.translatedText,
    this.translationFailed = false,
    this.isIPlusOne = false,
    this.tokens = const [],
  });

  factory TranscriptSegment.fromJson(Map<String, dynamic> json) {
    return TranscriptSegment(
      index: (json['index'] as num?)?.toInt() ?? 0,
      startMs: (json['start_ms'] as num?)?.toInt() ?? 0,
      endMs: (json['end_ms'] as num?)?.toInt() ?? 0,
      originalText: json['original_text'] as String? ?? '',
      translatedText: json['translated_text'] as String? ?? '',
      translationFailed: json['translation_failed'] as bool? ?? false,
      isIPlusOne: json['is_i_plus_one'] as bool? ?? false,
      tokens: (json['tokens'] as List<dynamic>?)
              ?.map((e) => UniversalToken.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() => {
    'index': index,
    'start_ms': startMs,
    'end_ms': endMs,
    'original_text': originalText,
    'translated_text': translatedText,
    'translation_failed': translationFailed,
    'is_i_plus_one': isIPlusOne,
    'tokens': tokens.map((e) => e.toJson()).toList(),
  };
}

class VideoTranscriptResponse {
  final String videoId;
  final String title;
  final String channel;
  final String language;
  final String writingDirection;
  final String sourceType;
  final Map<String, String> engineUsed;
  final bool truncated;
  final List<TranscriptSegment> segments;

  const VideoTranscriptResponse({
    required this.videoId,
    required this.title,
    required this.channel,
    required this.language,
    this.writingDirection = 'ltr',
    required this.sourceType,
    this.engineUsed = const {},
    this.truncated = false,
    this.segments = const [],
  });

  bool get isRtl => writingDirection.toLowerCase() == 'rtl';

  factory VideoTranscriptResponse.fromJson(Map<String, dynamic> json) {
    final engineMap = <String, String>{};
    if (json['engine_used'] is Map) {
      (json['engine_used'] as Map).forEach((k, v) {
        engineMap[k.toString()] = v.toString();
      });
    }

    return VideoTranscriptResponse(
      videoId: json['video_id'] as String? ?? '',
      title: json['title'] as String? ?? '',
      channel: json['channel'] as String? ?? '',
      language: json['language'] as String? ?? 'ja',
      writingDirection: json['writing_direction'] as String? ?? 'ltr',
      sourceType: json['source_type'] as String? ?? 'unknown',
      engineUsed: engineMap,
      truncated: json['truncated'] as bool? ?? false,
      segments: (json['segments'] as List<dynamic>?)
              ?.map((e) => TranscriptSegment.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() => {
    'video_id': videoId,
    'title': title,
    'channel': channel,
    'language': language,
    'writing_direction': writingDirection,
    'source_type': sourceType,
    'engine_used': engineUsed,
    'truncated': truncated,
    'segments': segments.map((e) => e.toJson()).toList(),
  };
}

class FSRSPreview {
  final int rating;
  final int intervalDays;
  final String dueDate;
  final double stability;
  final double difficulty;
  final String state;

  const FSRSPreview({
    required this.rating,
    required this.intervalDays,
    required this.dueDate,
    required this.stability,
    required this.difficulty,
    required this.state,
  });

  factory FSRSPreview.fromJson(Map<String, dynamic> json) {
    return FSRSPreview(
      rating: (json['rating'] as num?)?.toInt() ?? 1,
      intervalDays: (json['interval_days'] as num?)?.toInt() ?? 1,
      dueDate: json['due_date'] as String? ?? '',
      stability: (json['stability'] as num?)?.toDouble() ?? 0.0,
      difficulty: (json['difficulty'] as num?)?.toDouble() ?? 0.0,
      state: json['state'] as String? ?? 'review',
    );
  }

  Map<String, dynamic> toJson() => {
    'rating': rating,
    'interval_days': intervalDays,
    'due_date': dueDate,
    'stability': stability,
    'difficulty': difficulty,
    'state': state,
  };
}

class FSRSItem {
  final String? cardId;
  final int rating;
  final String state;
  final int step;
  final double stability;
  final double difficulty;
  final double elapsedDays;
  final int scheduledDays;
  final int reps;
  final int lapses;
  final String dueDate;
  final double retrievability;
  final Map<int, FSRSPreview> previews;

  const FSRSItem({
    this.cardId,
    this.rating = 3,
    this.state = 'new',
    this.step = 0,
    this.stability = 0.0,
    this.difficulty = 0.0,
    this.elapsedDays = 0.0,
    this.scheduledDays = 0,
    this.reps = 0,
    this.lapses = 0,
    required this.dueDate,
    this.retrievability = 1.0,
    this.previews = const {},
  });

  factory FSRSItem.fromJson(Map<String, dynamic> json) {
    final prevMap = <int, FSRSPreview>{};
    if (json['previews'] is Map) {
      (json['previews'] as Map).forEach((k, v) {
        final keyInt = int.tryParse(k.toString()) ?? 1;
        if (v is Map<String, dynamic>) {
          prevMap[keyInt] = FSRSPreview.fromJson(v);
        }
      });
    }

    return FSRSItem(
      cardId: json['card_id'] as String?,
      rating: (json['rating'] as num?)?.toInt() ?? 3,
      state: json['state'] as String? ?? 'new',
      step: (json['step'] as num?)?.toInt() ?? 0,
      stability: (json['stability'] as num?)?.toDouble() ?? 0.0,
      difficulty: (json['difficulty'] as num?)?.toDouble() ?? 0.0,
      elapsedDays: (json['elapsed_days'] as num?)?.toDouble() ?? 0.0,
      scheduledDays: (json['scheduled_days'] as num?)?.toInt() ?? 0,
      reps: (json['reps'] as num?)?.toInt() ?? 0,
      lapses: (json['lapses'] as num?)?.toInt() ?? 0,
      dueDate: json['due_date'] as String? ?? DateTime.now().toIso8601String(),
      retrievability: (json['retrievability'] as num?)?.toDouble() ?? 1.0,
      previews: prevMap,
    );
  }

  Map<String, dynamic> toJson() => {
    'card_id': cardId,
    'rating': rating,
    'state': state,
    'step': step,
    'stability': stability,
    'difficulty': difficulty,
    'elapsed_days': elapsedDays,
    'scheduled_days': scheduledDays,
    'reps': reps,
    'lapses': lapses,
    'due_date': dueDate,
    'retrievability': retrievability,
    'previews': previews.map((k, v) => MapEntry(k.toString(), v.toJson())),
  };
}

class Flashcard {
  final String id;
  final String lemma;
  final String surface;
  final String targetLang;
  final String reading;
  final String meaning;
  final String contextSentence;
  final String contextTranslation;
  final String videoId;
  final int timestampMs;
  final FSRSItem fsrs;
  final DateTime lastReviewDate;
  final DateTime createdAt;

  const Flashcard({
    required this.id,
    required this.lemma,
    required this.surface,
    required this.targetLang,
    required this.reading,
    required this.meaning,
    required this.contextSentence,
    required this.contextTranslation,
    required this.videoId,
    required this.timestampMs,
    required this.fsrs,
    required this.lastReviewDate,
    required this.createdAt,
  });

  bool get isDue => DateTime.now().isAfter(DateTime.parse(fsrs.dueDate));

  factory Flashcard.fromJson(Map<String, dynamic> json) {
    return Flashcard(
      id: json['id'] as String? ?? '',
      lemma: json['lemma'] as String? ?? '',
      surface: json['surface'] as String? ?? '',
      targetLang: json['target_lang'] as String? ?? 'ja',
      reading: json['reading'] as String? ?? '',
      meaning: json['meaning'] as String? ?? '',
      contextSentence: json['context_sentence'] as String? ?? '',
      contextTranslation: json['context_translation'] as String? ?? '',
      videoId: json['video_id'] as String? ?? '',
      timestampMs: (json['timestamp_ms'] as num?)?.toInt() ?? 0,
      fsrs: FSRSItem.fromJson(json['fsrs'] as Map<String, dynamic>? ?? {}),
      lastReviewDate: DateTime.tryParse(json['last_review_date'] as String? ?? '') ?? DateTime.now(),
      createdAt: DateTime.tryParse(json['created_at'] as String? ?? '') ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'lemma': lemma,
    'surface': surface,
    'target_lang': targetLang,
    'reading': reading,
    'meaning': meaning,
    'context_sentence': contextSentence,
    'context_translation': contextTranslation,
    'video_id': videoId,
    'timestamp_ms': timestampMs,
    'fsrs': fsrs.toJson(),
    'last_review_date': lastReviewDate.toIso8601String(),
    'created_at': createdAt.toIso8601String(),
  };
}

class ShadowingSegmentFeedback {
  final double startPct;
  final double endPct;
  final double score;
  final String feedback;

  const ShadowingSegmentFeedback({
    required this.startPct,
    required this.endPct,
    required this.score,
    required this.feedback,
  });

  factory ShadowingSegmentFeedback.fromJson(Map<String, dynamic> json) {
    return ShadowingSegmentFeedback(
      startPct: (json['start_pct'] as num?)?.toDouble() ?? 0.0,
      endPct: (json['end_pct'] as num?)?.toDouble() ?? 0.0,
      score: (json['score'] as num?)?.toDouble() ?? 0.0,
      feedback: json['feedback'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
    'start_pct': startPct,
    'end_pct': endPct,
    'score': score,
    'feedback': feedback,
  };
}

class ShadowingResult {
  final double score;
  final List<double> normalizedNativeCurve;
  final List<double> normalizedUserCurve;
  final String feedback;
  final List<ShadowingSegmentFeedback> segmentFeedbacks;

  const ShadowingResult({
    required this.score,
    this.normalizedNativeCurve = const [],
    this.normalizedUserCurve = const [],
    required this.feedback,
    this.segmentFeedbacks = const [],
  });

  factory ShadowingResult.fromJson(Map<String, dynamic> json) {
    return ShadowingResult(
      score: (json['score'] as num?)?.toDouble() ?? 0.0,
      normalizedNativeCurve: (json['normalized_native_curve'] as List<dynamic>?)
              ?.map((e) => (e as num).toDouble())
              .toList() ??
          [],
      normalizedUserCurve: (json['normalized_user_curve'] as List<dynamic>?)
              ?.map((e) => (e as num).toDouble())
              .toList() ??
          [],
      feedback: json['feedback'] as String? ?? '',
      segmentFeedbacks: (json['segment_feedbacks'] as List<dynamic>?)
              ?.map((e) => ShadowingSegmentFeedback.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() => {
    'score': score,
    'normalized_native_curve': normalizedNativeCurve,
    'normalized_user_curve': normalizedUserCurve,
    'feedback': feedback,
    'segment_feedbacks': segmentFeedbacks.map((e) => e.toJson()).toList(),
  };
}
