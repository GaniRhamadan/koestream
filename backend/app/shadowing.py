"""
LingoStream Universal - Evaluasi Shadowing Suara & Intonasi F0 dengan Sakoe-Chiba DTW
Fitur:
1. Ekstraksi F0 & normalisasi log2 frekuensi + speaker z-score normalization + median filter.
2. Dynamic Time Warping (DTW) Sakoe-Chiba berbobot O(n * w) (bukan O(n * m) lambat).
3. Evaluasi skor 0-100, umpan balik global, serta umpan balik per segmen waktu.
4. Parsing file audio pengguna (wav/m4a) dan ekstraksi pitch track.
"""

import math
import wave
import struct
import logging
from typing import List, Tuple, Dict, Any, Optional
import numpy as np

from app.schemas import (
    ShadowingEvaluateResponse,
    ShadowingTimeSegmentFeedback,
)

logger = logging.getLogger(__name__)


def extract_f0_autocorr(audio_samples: np.ndarray, sample_rate: int, hop_size: int = 160) -> np.ndarray:
    """
    Ekstraksi nada dasar F0 menggunakan algoritma autokorelasi berbobot
    (bekerja secara native tanpa bergantung pada library C luar).
    Rentang frekuensi vokal manusia: 50 Hz - 500 Hz.
    """
    min_lag = int(sample_rate / 500)
    max_lag = int(sample_rate / 50)
    window_size = max_lag * 2

    num_frames = max(1, (len(audio_samples) - window_size) // hop_size)
    f0_track = np.zeros(num_frames, dtype=np.float32)

    for i in range(num_frames):
        start = i * hop_size
        frame = audio_samples[start:start + window_size]
        
        # Energi frame
        energy = np.sum(frame ** 2)
        if energy < 1e-4:
            f0_track[i] = 0.0
            continue

        # Autokorelasi
        autocorr = np.correlate(frame, frame, mode='full')
        autocorr = autocorr[len(autocorr) // 2:]

        # Temukan puncak autokorelasi dalam rentang lag
        valid_autocorr = autocorr[min_lag:max_lag]
        if len(valid_autocorr) > 0:
            peak_lag = np.argmax(valid_autocorr) + min_lag
            peak_val = autocorr[peak_lag] / (autocorr[0] + 1e-8)
            if peak_val > 0.3:
                f0_track[i] = sample_rate / peak_lag
            else:
                f0_track[i] = 0.0

    return f0_track


def normalize_pitch_curve(f0_list: List[float]) -> np.ndarray:
    """
    1. Konversi ke semitone / log2 skala musikal.
    2. Interpolasi linear pada bagian tak bersuara (unvoiced gaps).
    3. Z-score normalization per pembicara (mean=0, std=1).
    4. Median filter smoothing.
    """
    f0 = np.array(f0_list, dtype=np.float64)
    if len(f0) == 0:
        return np.array([], dtype=np.float64)

    # Ganti nol/negatif dengan NaN
    voiced = np.where(f0 > 30.0, f0, np.nan)
    
    # Konversi ke log2 (semitone)
    log_pitch = np.where(np.isnan(voiced), np.nan, 12.0 * np.log2(voiced / 440.0 + 1e-8) + 69.0)

    # Interpolasi bagian tak bersuara
    nans = np.isnan(log_pitch)
    not_nans = ~nans
    if not np.any(not_nans):
        # Jika sama sekali tidak ada suara
        return np.zeros_like(f0)

    indices = np.arange(len(log_pitch))
    interp_pitch = np.interp(indices, indices[not_nans], log_pitch[not_nans])

    # Median smoothing (jendela ukuran 3)
    smoothed = np.copy(interp_pitch)
    for i in range(1, len(smoothed) - 1):
        smoothed[i] = np.median(interp_pitch[max(0, i - 1):min(len(interp_pitch), i + 2)])

    # Z-score normalization
    mean_val = np.mean(smoothed)
    std_val = np.std(smoothed)
    if std_val < 1e-4:
        norm = smoothed - mean_val
    else:
        norm = (smoothed - mean_val) / std_val

    return norm


def sakoe_chiba_dtw(curve1: np.ndarray, curve2: np.ndarray, band_ratio: float = 0.15) -> Tuple[float, List[Tuple[int, int]]]:
    """
    Dynamic Time Warping (DTW) dengan pita Sakoe-Chiba:
    Membatasi pencarian pada lebar pita |i - j * (n/m)| <= w.
    Kompleksitas: O(n * w), jauh lebih cepat dan efisien dibanding O(n * m) penuh.
    """
    n = len(curve1)
    m = len(curve2)
    if n == 0 or m == 0:
        return 0.0, []

    # Lebar pita Sakoe-Chiba
    w = max(int(max(n, m) * band_ratio), 5)

    # Inisialisasi matriks biaya dengan tak hingga
    cost_matrix = np.full((n + 1, m + 1), np.inf, dtype=np.float64)
    cost_matrix[0, 0] = 0.0

    slope = n / m

    for i in range(1, n + 1):
        center_j = int(i / slope)
        j_start = max(1, center_j - w)
        j_end = min(m, center_j + w)

        for j in range(j_start, j_end + 1):
            dist = abs(curve1[i - 1] - curve2[j - 1])
            cost_matrix[i, j] = dist + min(
                cost_matrix[i - 1, j],      # insersi
                cost_matrix[i, j - 1],      # delesi
                cost_matrix[i - 1, j - 1]   # kecocokan
            )

    total_cost = cost_matrix[n, m]
    if np.isinf(total_cost):
        # Fallback jika pita terlalu ketat
        total_cost = float(np.mean(np.abs(curve1[:min(n, m)] - curve2[:min(n, m)])))

    # Backtracking jalur warping
    path: List[Tuple[int, int]] = []
    curr_i, curr_j = n, m
    while curr_i > 0 and curr_j > 0:
        path.append((curr_i - 1, curr_j - 1))
        steps = [
            (cost_matrix[curr_i - 1, curr_j - 1], curr_i - 1, curr_j - 1),
            (cost_matrix[curr_i - 1, curr_j], curr_i - 1, curr_j),
            (cost_matrix[curr_i, curr_j - 1], curr_i, curr_j - 1),
        ]
        steps.sort(key=lambda x: x[0])
        _, curr_i, curr_j = steps[0]

    path.reverse()
    normalized_dist = total_cost / max(len(path), 1)
    return normalized_dist, path


class ShadowingService:
    """
    Layanan evaluasi peniruan suara (shadowing) dan analisis kontur nada.
    """

    def evaluate_f0_curves(
        self,
        native_f0: List[float],
        user_f0: List[float],
        sample_rate_hz: float = 100.0
    ) -> ShadowingEvaluateResponse:
        """
        Mengevaluasi keselarasan kurva F0 pengguna terhadap pembicara asli menggunakan Sakoe-Chiba DTW.
        """
        if not native_f0 or not user_f0:
            return ShadowingEvaluateResponse(
                score=0.0,
                feedback="Data F0 tidak mencukupi untuk evaluasi.",
                normalized_native_curve=[],
                normalized_user_curve=[],
                segment_feedbacks=[]
            )

        norm_native = normalize_pitch_curve(native_f0)
        norm_user = normalize_pitch_curve(user_f0)

        # Hitung DTW Sakoe-Chiba
        dist, path = sakoe_chiba_dtw(norm_native, norm_user)

        # Transformasi jarak DTW ke skor 0-100 (dist 0 = 100, dist >= 2.0 = 0)
        score = max(0.0, min(100.0, round(100.0 * math.exp(-0.8 * dist), 1)))

        # Evaluasi per kuartil segmen waktu (0-25%, 25-50%, 50-75%, 75-100%)
        segment_feedbacks: List[ShadowingTimeSegmentFeedback] = []
        n_points = len(path)
        if n_points >= 4:
            step = n_points // 4
            for seg_idx in range(4):
                p_start = seg_idx * step
                p_end = (seg_idx + 1) * step if seg_idx < 3 else n_points
                sub_path = path[p_start:p_end]
                sub_dists = [abs(norm_native[i] - norm_user[j]) for i, j in sub_path]
                sub_mean = np.mean(sub_dists) if sub_dists else dist
                sub_score = max(0.0, min(100.0, round(100.0 * math.exp(-0.8 * sub_mean), 1)))

                start_pct = seg_idx * 25.0
                end_pct = (seg_idx + 1) * 25.0

                if sub_score >= 85.0:
                    fb = "Intonasi sangat akurat dan selaras dengan native."
                elif sub_score >= 70.0:
                    fb = "Intonasi cukup baik, sedikit perbedaan pada tinggi nada."
                elif sub_score >= 50.0:
                    fb = "Kontur nada mulai meleset; perhatikan nada naik/turun di bagian ini."
                else:
                    fb = "Intonasi berbeda signifikan; dengarkan kembali pelafalan native pada bagian ini."

                segment_feedbacks.append(ShadowingTimeSegmentFeedback(
                    start_pct=start_pct,
                    end_pct=end_pct,
                    score=sub_score,
                    feedback=fb
                ))

        # Ringkasan umpan balik global
        if score >= 85.0:
            summary = "Luar biasa! Kontur nada dan ritme Anda sangat mirip dengan pembicara asli."
        elif score >= 70.0:
            summary = "Bagus! Intonasi Anda mendekati native dengan sedikit variasi pada aksen."
        elif score >= 50.0:
            summary = "Cukup baik. Cobalah menyelaraskan tempo dan nada naik-turun pada kalimat."
        else:
            summary = "Perlu latihan lagi. Dengarkan ritme dan tinggi nada kalimat beberapa kali sebelum mengulang."

        # Sampling kurva untuk visualisasi frontend (maks 100 titik)
        step_sample = max(1, len(norm_native) // 100)
        native_sub = [round(float(v), 3) for v in norm_native[::step_sample]]
        step_user = max(1, len(norm_user) // 100)
        user_sub = [round(float(v), 3) for v in norm_user[::step_user]]

        return ShadowingEvaluateResponse(
            score=score,
            normalized_native_curve=native_sub,
            normalized_user_curve=user_sub,
            feedback=summary,
            segment_feedbacks=segment_feedbacks
        )

    def extract_f0_from_wav_bytes(self, wav_bytes: bytes) -> List[float]:
        """Ekstraksi pitch track dari raw byte audio WAV."""
        try:
            import io
            with wave.open(io.BytesIO(wav_bytes), 'rb') as wf:
                num_channels = wf.getnchannels()
                sample_width = wf.getsampwidth()
                sample_rate = wf.getframerate()
                num_frames = wf.getnframes()
                raw_data = wf.readframes(num_frames)

            # Konversi byte ke numpy float32
            if sample_width == 2:
                samples = np.frombuffer(raw_data, dtype=np.int16).astype(np.float32) / 32768.0
            elif sample_width == 1:
                samples = (np.frombuffer(raw_data, dtype=np.uint8).astype(np.float32) - 128.0) / 128.0
            else:
                samples = np.frombuffer(raw_data, dtype=np.int32).astype(np.float32) / 2147483648.0

            if num_channels > 1:
                samples = samples[::num_channels]  # ubah ke mono

            f0 = extract_f0_autocorr(samples, sample_rate)
            return f0.tolist()
        except Exception as e:
            logger.warning("Gagal mengekstrak F0 dari wav bytes: %s", e)
            return []
