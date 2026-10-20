import 'package:flutter/material.dart';
import '../models/models.dart';

class UniversalRubySubtitleWidget extends StatelessWidget {
  final List<UniversalToken> tokens;
  final bool isRubyVisible;
  final bool showRomaji;
  final Set<String> masteredLemmas;
  final bool isRtl;
  final double fontSize;
  final int? activeTokenId;
  final Function(UniversalToken token)? onTokenTap;

  const UniversalRubySubtitleWidget({
    super.key,
    required this.tokens,
    this.isRubyVisible = true,
    this.showRomaji = true,
    this.masteredLemmas = const {},
    this.isRtl = false,
    this.fontSize = 20.0,
    this.activeTokenId,
    this.onTokenTap,
  });

  Color _getPosColor(String pos, BuildContext context) {
    switch (pos.toUpperCase()) {
      case 'NOUN':
        return Colors.blue.shade400;
      case 'VERB':
        return Colors.green.shade500;
      case 'ADJ':
        return Colors.amber.shade500;
      case 'ADV':
        return Colors.purple.shade300;
      case 'PRON':
        return Colors.cyan.shade400;
      case 'PART':
        return Colors.teal.shade300;
      case 'ADP':
        return Colors.teal.shade400;
      case 'AUX':
        return Colors.orange.shade400;
      case 'CONJ':
        return Colors.indigo.shade300;
      default:
        return Colors.grey.withValues(alpha: 0.35);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (tokens.isEmpty) {
      return const SizedBox.shrink();
    }

    final textDirection = isRtl ? TextDirection.rtl : TextDirection.ltr;

    return Directionality(
      textDirection: textDirection,
      child: Wrap(
        alignment: WrapAlignment.start,
        crossAxisAlignment: WrapCrossAlignment.end,
        spacing: 6.0,
        runSpacing: 10.0,
        children: tokens.map((tok) {
          final isMastered = masteredLemmas.contains(tok.lemma.trim());
          final isActive = activeTokenId != null && activeTokenId == tok.tokenId;
          final posColor = _getPosColor(tok.pos, context);

          return _TokenRubyItem(
            token: tok,
            isRubyVisible: isRubyVisible && !isMastered,
            showRomaji: showRomaji,
            isActive: isActive,
            posColor: posColor,
            fontSize: fontSize,
            onTap: onTokenTap != null ? () => onTokenTap!(tok) : null,
          );
        }).toList(),
      ),
    );
  }
}

class _TokenRubyItem extends StatelessWidget {
  final UniversalToken token;
  final bool isRubyVisible;
  final bool showRomaji;
  final bool isActive;
  final Color posColor;
  final double fontSize;
  final VoidCallback? onTap;

  const _TokenRubyItem({
    required this.token,
    required this.isRubyVisible,
    required this.showRomaji,
    required this.isActive,
    required this.posColor,
    required this.fontSize,
    this.onTap,
  });

  bool _isPunctuation(UniversalToken tok) {
    if (tok.pos.toUpperCase() == 'PUNCT') return true;
    final s = tok.surface.trim();
    return s == '。' ||
        s == '、' ||
        s == '！' ||
        s == '？' ||
        s == '.' ||
        s == ',' ||
        s == '!' ||
        s == '?' ||
        s == '…' ||
        s == '「' ||
        s == '」' ||
        s == '[' ||
        s == ']';
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final isPunct = _isPunctuation(token);

    // Ambil teks Romaji / pelafalan latin (misal: "yamero", "tsukamaete", "mimi")
    final rawRomaji = token.pronouncedAs.isNotEmpty
        ? token.pronouncedAs
        : token.phoneticScript;
    final hasRomaji = showRomaji &&
        !isPunct &&
        rawRomaji.isNotEmpty &&
        rawRomaji.trim() != token.surface.trim();

    final rubyStyle = TextStyle(
      fontSize: fontSize * 0.44,
      fontWeight: FontWeight.w600,
      color: isActive
          ? (isDark ? const Color(0xFFFDE68A) : const Color(0xFFC2410C))
          : (isDark ? Colors.grey.shade400 : Colors.grey.shade600),
      height: 1.1,
    );

    final surfaceStyle = TextStyle(
      fontSize: fontSize,
      fontWeight: FontWeight.w700,
      color: isActive
          ? (isDark ? const Color(0xFFFDE68A) : const Color(0xFF9A3412))
          : (isDark ? Colors.white : const Color(0xFF1E293B)),
      height: 1.2,
    );

    final romajiStyle = TextStyle(
      fontSize: fontSize * 0.50,
      fontWeight: FontWeight.w500,
      color: isActive
          ? (isDark ? const Color(0xFFFDE68A) : const Color(0xFFC2410C))
          : (isDark ? Colors.grey.shade400 : Colors.grey.shade600),
      height: 1.1,
    );

    Widget wordBody;

    if (token.displayParts.isNotEmpty) {
      // Kata majemuk / kanji dengan furigana terurai (misal: 授[さず]け, 捕[つか]まえて)
      wordBody = Row(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: token.displayParts.map((part) {
          final showRubyForPart =
              isRubyVisible && !isPunct && part.ruby != null && part.ruby!.isNotEmpty;

          return Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // 1. Ruby / Furigana Atas
              SizedBox(
                height: fontSize * 0.60,
                child: showRubyForPart
                    ? Center(child: Text(part.ruby!, style: rubyStyle))
                    : const SizedBox.shrink(),
              ),
              // 2. Teks Dasar (Kanji / Kana)
              Text(part.text, style: surfaceStyle),
            ],
          );
        }).toList(),
      );
    } else {
      // Kata polos tanpa partisi okurigana (Kana utuh atau bahasa lain)
      final showRuby = isRubyVisible &&
          !isPunct &&
          token.phoneticScript.isNotEmpty &&
          token.phoneticScript != token.surface &&
          !RegExp(r'^[a-zA-Z0-9\s]+$').hasMatch(token.phoneticScript);

      wordBody = Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          SizedBox(
            height: fontSize * 0.60,
            child: showRuby
                ? Center(child: Text(token.phoneticScript, style: rubyStyle))
                : const SizedBox.shrink(),
          ),
          Text(token.surface, style: surfaceStyle),
        ],
      );
    }

    // Bungkus dengan romaji di bagian bawah (Tier 3)
    Widget fullItem = Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        wordBody,
        if (hasRomaji) ...[
          const SizedBox(height: 1.5),
          Text(
            rawRomaji,
            style: romajiStyle,
            textAlign: TextAlign.center,
          ),
        ] else if (!isPunct && showRomaji) ...[
          // Spacer penyeimbang tinggi jika baris kata lain memiliki romaji
          SizedBox(height: fontSize * 0.50),
        ],
      ],
    );

    // Styling aktif / inaktif container kata
    BoxDecoration decoration;
    if (isActive) {
      // Desain Karaoke Aktif ala tangkapan layar referensi: soft warm peach pill highlight
      decoration = BoxDecoration(
        color: isDark
            ? const Color(0xFFFB923C).withValues(alpha: 0.32)
            : const Color(0xFFFFEDD5),
        borderRadius: BorderRadius.circular(8.0),
        border: Border.all(
          color: isDark ? const Color(0xFFFB923C) : const Color(0xFFF97316),
          width: 1.6,
        ),
      );
    } else if (!isPunct) {
      // Garis bawah POS halus untuk kata biasa
      decoration = BoxDecoration(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(6.0),
        border: Border(
          bottom: BorderSide(
            color: posColor,
            width: 2.2,
          ),
        ),
      );
    } else {
      decoration = const BoxDecoration(color: Colors.transparent);
    }

    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        curve: Curves.easeOut,
        padding: EdgeInsets.symmetric(
          horizontal: isActive ? 5.5 : 3.0,
          vertical: isActive ? 3.5 : 2.0,
        ),
        decoration: decoration,
        child: fullItem,
      ),
    );
  }
}
