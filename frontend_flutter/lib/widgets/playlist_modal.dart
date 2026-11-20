import 'package:flutter/material.dart';
import '../models/models.dart';

class PlaylistModal extends StatefulWidget {
  final Function(MediaTrack track) onSelectTrack;
  final Function(String url) onLoadCustomUrl;

  const PlaylistModal({
    super.key,
    required this.onSelectTrack,
    required this.onLoadCustomUrl,
  });

  static void show(
    BuildContext context, {
    required Function(MediaTrack track) onSelectTrack,
    required Function(String url) onLoadCustomUrl,
  }) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => FractionallySizedBox(
        heightFactor: 0.88,
        child: PlaylistModal(
          onSelectTrack: onSelectTrack,
          onLoadCustomUrl: onLoadCustomUrl,
        ),
      ),
    );
  }

  @override
  State<PlaylistModal> createState() => _PlaylistModalState();
}

class _PlaylistModalState extends State<PlaylistModal> {
  final TextEditingController _searchController = TextEditingController();
  final TextEditingController _customUrlController = TextEditingController();

  String _filterPlatform = 'all'; // 'all' | 'spotify' | 'youtube'
  String _modalSource = 'spotify'; // 'spotify' | 'youtube'

  @override
  void dispose() {
    _searchController.dispose();
    _customUrlController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final searchQuery = _searchController.text.trim().toLowerCase();

    final filteredTracks = kKoeStreamPresetTracks.where((t) {
      if (_filterPlatform != 'all' && t.type != _filterPlatform) return false;
      if (searchQuery.isEmpty) return true;
      return t.title.toLowerCase().contains(searchQuery) ||
          t.artist.toLowerCase().contains(searchQuery) ||
          t.album.toLowerCase().contains(searchQuery) ||
          t.langName.toLowerCase().contains(searchQuery);
    }).toList();

    return Container(
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF0D0F15) : Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
        border: Border.all(
          color: isDark ? const Color(0xFF27272A) : const Color(0xFFE2E8F0),
          width: 1,
        ),
      ),
      child: Column(
        children: [
          // 1. Spotify-Inspired Liked Songs Hero Banner (1:1 with Web)
          Container(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 14),
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [Color(0xFF4C1D95), Color(0xFF1E1B4B), Color(0xFF0F172A)],
              ),
              borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
            ),
            child: Row(
              children: [
                // Purple Heart Cover Art (1:1 with Web)
                Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF7C3AED), Color(0xFF4338CA)],
                    ),
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.purple.withValues(alpha: 0.4),
                        blurRadius: 12,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: const Center(
                    child: Text('💜', style: TextStyle(fontSize: 28)),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Text(
                          'PLAYLIST KOLEKSI',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 9.5,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 0.6,
                          ),
                        ),
                      ),
                      const SizedBox(height: 3),
                      const Text(
                        'Lagu yang Disukai',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.w800,
                          letterSpacing: -0.3,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Nana Balmon • ${kKoeStreamPresetTracks.length} lagu • Tersinkronisasi Lirik',
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.8),
                          fontSize: 11,
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.15),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.close, color: Colors.white, size: 16),
                  ),
                ),
              ],
            ),
          ),

          // 2. Search & Platform Filter Chips
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            color: isDark ? const Color(0xFF121215) : const Color(0xFFF8FAFC),
            child: Column(
              children: [
                // Search Field
                TextField(
                  controller: _searchController,
                  onChanged: (_) => setState(() {}),
                  decoration: InputDecoration(
                    hintText: 'Cari lagu (Goose house, HoneyWorks, Sparkle, Monokrom, YOASOBI)...',
                    hintStyle: TextStyle(
                      fontSize: 12,
                      color: isDark ? const Color(0xFF71717A) : const Color(0xFF94A3B8),
                    ),
                    prefixIcon: const Icon(Icons.search, size: 18),
                    isDense: true,
                    contentPadding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
                    filled: true,
                    fillColor: isDark ? const Color(0xFF18181B) : Colors.white,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: BorderSide(
                        color: isDark ? const Color(0xFF27272A) : const Color(0xFFE2E8F0),
                      ),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: BorderSide(
                        color: isDark ? const Color(0xFF27272A) : const Color(0xFFE2E8F0),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 8),

                // Platform Filter Chips
                Row(
                  children: [
                    _buildFilterChip('all', 'Semua Lagu', isDark),
                    const SizedBox(width: 6),
                    _buildFilterChip('spotify', '🟢 Khusus Spotify', isDark),
                    const SizedBox(width: 6),
                    _buildFilterChip('youtube', '🔴 Khusus YouTube', isDark),
                  ],
                ),
                const SizedBox(height: 8),

                // Custom URL Input Bar inside modal (1:1 with Web)
                Row(
                  children: [
                    Container(
                      decoration: BoxDecoration(
                        color: isDark ? const Color(0xFF18181B) : const Color(0xFFE2E8F0),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      padding: const EdgeInsets.all(2),
                      child: Row(
                        children: [
                          InkWell(
                            onTap: () => setState(() => _modalSource = 'spotify'),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 4),
                              decoration: BoxDecoration(
                                color: _modalSource == 'spotify'
                                    ? const Color(0xFF1DB954).withValues(alpha: 0.2)
                                    : Colors.transparent,
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: const Text('🟢 SP', style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold)),
                            ),
                          ),
                          InkWell(
                            onTap: () => setState(() => _modalSource = 'youtube'),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 4),
                              decoration: BoxDecoration(
                                color: _modalSource == 'youtube'
                                    ? const Color(0xFFEF4444).withValues(alpha: 0.2)
                                    : Colors.transparent,
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: const Text('🔴 YT', style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold)),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 6),
                    Expanded(
                      child: TextField(
                        controller: _customUrlController,
                        decoration: InputDecoration(
                          hintText: _modalSource == 'spotify'
                              ? 'Tempel link Spotify...'
                              : 'Tempel link YouTube...',
                          hintStyle: const TextStyle(fontSize: 11),
                          isDense: true,
                          contentPadding: const EdgeInsets.symmetric(vertical: 7, horizontal: 10),
                          filled: true,
                          fillColor: isDark ? const Color(0xFF18181B) : Colors.white,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: BorderSide(
                              color: isDark ? const Color(0xFF27272A) : const Color(0xFFE2E8F0),
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 6),
                    FilledButton(
                      style: FilledButton.styleFrom(
                        backgroundColor: const Color(0xFF6366F1),
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      onPressed: () {
                        final text = _customUrlController.text.trim();
                        if (text.isNotEmpty) {
                          Navigator.pop(context);
                          widget.onLoadCustomUrl(text);
                        }
                      },
                      child: const Text('⚡ Putar', style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // 3. Tracks List Table
          Expanded(
            child: filteredTracks.isEmpty
                ? Center(
                    child: Text(
                      'Tidak ada lagu yang cocok dengan pencarian.',
                      style: TextStyle(
                        color: isDark ? const Color(0xFF71717A) : const Color(0xFF94A3B8),
                        fontSize: 13,
                      ),
                    ),
                  )
                : ListView.separated(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    itemCount: filteredTracks.length,
                    separatorBuilder: (_, __) => Divider(
                      height: 1,
                      color: isDark ? const Color(0xFF1F2430) : const Color(0xFFF1F5F9),
                    ),
                    itemBuilder: (ctx, idx) {
                      final track = filteredTracks[idx];
                      final isSp = track.type == 'spotify';

                      return InkWell(
                        onTap: () {
                          Navigator.pop(context);
                          widget.onSelectTrack(track);
                        },
                        borderRadius: BorderRadius.circular(10),
                        child: Padding(
                          padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 6),
                          child: Row(
                            children: [
                              // Number
                              SizedBox(
                                width: 22,
                                child: Text(
                                  '${idx + 1}',
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w700,
                                    color: isDark ? const Color(0xFF71717A) : const Color(0xFF94A3B8),
                                  ),
                                ),
                              ),

                              // Artwork Thumbnail
                              ClipRRect(
                                borderRadius: BorderRadius.circular(8),
                                child: Image.network(
                                  track.artwork,
                                  width: 46,
                                  height: 46,
                                  fit: BoxFit.cover,
                                  errorBuilder: (_, __, ___) => Container(
                                    width: 46,
                                    height: 46,
                                    color: isSp ? Colors.green.shade900 : Colors.red.shade900,
                                    child: Icon(
                                      isSp ? Icons.music_note : Icons.play_arrow,
                                      color: Colors.white,
                                      size: 20,
                                    ),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 10),

                              // Info Title & Artist
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                                          decoration: BoxDecoration(
                                            color: isSp
                                                ? const Color(0xFF1DB954).withValues(alpha: 0.15)
                                                : const Color(0xFFEF4444).withValues(alpha: 0.15),
                                            borderRadius: BorderRadius.circular(4),
                                          ),
                                          child: Text(
                                            isSp ? 'SPOTIFY' : 'YOUTUBE',
                                            style: TextStyle(
                                              fontSize: 8.5,
                                              fontWeight: FontWeight.w800,
                                              color: isSp ? const Color(0xFF1DB954) : const Color(0xFFEF4444),
                                            ),
                                          ),
                                        ),
                                        const SizedBox(width: 5),
                                        Text(
                                          track.langName,
                                          style: TextStyle(
                                            fontSize: 10,
                                            color: isDark ? const Color(0xFF71717A) : const Color(0xFF94A3B8),
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      track.title,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: TextStyle(
                                        fontSize: 13.5,
                                        fontWeight: FontWeight.w700,
                                        color: isDark ? Colors.white : const Color(0xFF0F172A),
                                      ),
                                    ),
                                    Text(
                                      '${track.artist} • ${track.duration}',
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: TextStyle(
                                        fontSize: 11.5,
                                        color: isDark ? const Color(0xFFA1A1AA) : const Color(0xFF64748B),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 8),

                              // Putar Button
                              FilledButton.tonal(
                                style: FilledButton.styleFrom(
                                  backgroundColor: isSp
                                      ? const Color(0xFF1DB954).withValues(alpha: 0.15)
                                      : const Color(0xFF6366F1).withValues(alpha: 0.15),
                                  foregroundColor: isSp ? const Color(0xFF1DB954) : const Color(0xFF818CF8),
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                ),
                                onPressed: () {
                                  Navigator.pop(context);
                                  widget.onSelectTrack(track);
                                },
                                child: const Text(
                                  '⚡ Putar',
                                  style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w700),
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String value, String label, bool isDark) {
    final isSelected = _filterPlatform == value;
    return InkWell(
      onTap: () => setState(() => _filterPlatform = value),
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: isSelected
              ? (value == 'spotify'
                  ? const Color(0xFF1DB954).withValues(alpha: 0.2)
                  : value == 'youtube'
                      ? const Color(0xFFEF4444).withValues(alpha: 0.2)
                      : const Color(0xFF6366F1).withValues(alpha: 0.2))
              : (isDark ? const Color(0xFF18181B) : const Color(0xFFF1F5F9)),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected
                ? (value == 'spotify'
                    ? const Color(0xFF1DB954)
                    : value == 'youtube'
                        ? const Color(0xFFEF4444)
                        : const Color(0xFF6366F1))
                : (isDark ? const Color(0xFF27272A) : const Color(0xFFE2E8F0)),
            width: isSelected ? 1.2 : 0.8,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
            color: isSelected
                ? (value == 'spotify'
                    ? const Color(0xFF1DB954)
                    : value == 'youtube'
                        ? const Color(0xFFEF4444)
                        : const Color(0xFF818CF8))
                : (isDark ? const Color(0xFFA1A1AA) : const Color(0xFF64748B)),
          ),
        ),
      ),
    );
  }
}
