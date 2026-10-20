"""
LingoStream Universal - Implementasi Matematis FSRS v4.5 (Free Spaced Repetition Scheduler)
Menerapkan 17 bobot resmi FSRS v4.5 dengan rumus pembaharuan stabilitas, kesulitan,
retrievability, dan mean reversion yang 100% presisi.
"""

import math
from datetime import datetime, timedelta, timezone
from typing import Dict, Tuple, List, Optional
from app.schemas import FSRSItemRequest, FSRSItemResponse, FSRSPreview

# 17 Bobot Baku Resmi FSRS v4.5
DEFAULT_W: List[float] = [
    0.4072, 1.1826, 3.1262, 15.4722,  # w0..w3: S0 untuk Rating 1 (Again), 2 (Hard), 3 (Good), 4 (Easy)
    7.2102, 0.5316,                   # w4, w5: D0(3) dan langkah D0
    1.0951,                           # w6: langkah pembaruan D
    0.0234,                           # w7: bobot mean reversion
    1.6299,                           # w8: basis recall S
    0.1637,                           # w9: eksponen recall S
    1.0119,                           # w10: faktor retrievability recall S
    2.0538,                           # w11: basis lupa S (Again)
    0.0988,                           # w12: faktor kesulitan lupa S
    0.3479,                           # w13: faktor stabilitas lupa S
    0.2289,                           # w14: faktor retrievability lupa S
    0.2079,                           # w15: penalti Hard
    2.8687,                           # w16: bonus Easy
]

DECAY: float = -0.5
FACTOR: float = 19.0 / 81.0


def calculate_retrievability(elapsed_days: float, stability: float) -> float:
    """
    Menghitung retrievability R(t, S) = (1 + FACTOR * t / S) ^ DECAY.
    """
    if stability <= 0.0:
        return 0.0
    if elapsed_days <= 0.0:
        return 1.0
    return math.pow(1.0 + FACTOR * (elapsed_days / stability), DECAY)


def calculate_interval(stability: float, desired_retention: float = 0.9) -> int:
    """
    Menghitung interval hari hingga retrievability turun ke desired_retention:
    Interval = S / FACTOR * (R_target^(1/DECAY) - 1).
    Minimal 1 hari.
    """
    if stability <= 0.0:
        return 1
    # R^(1/DECAY) = R^(-2) untuk DECAY = -0.5
    r_factor = math.pow(desired_retention, 1.0 / DECAY) - 1.0
    interval = (stability / FACTOR) * r_factor
    return max(1, round(interval))


def calculate_initial_stability(rating: int, w: List[float] = DEFAULT_W) -> float:
    """Stabilitas awal S0(G) = w[G-1]."""
    g = max(1, min(4, rating))
    return w[g - 1]


def calculate_initial_difficulty(rating: int, w: List[float] = DEFAULT_W) -> float:
    """Kesulitan awal D0(G) = w4 - (G - 3) * w5, di-clamp 1..10."""
    g = max(1, min(4, rating))
    d0 = w[4] - (g - 3) * w[5]
    return max(1.0, min(10.0, d0))


def update_difficulty(curr_d: float, rating: int, w: List[float] = DEFAULT_W) -> float:
    """
    Pembaruan kesulitan dengan mean reversion:
    D' = w7 * D0(3) + (1 - w7) * (D - w6 * (G - 3)), di-clamp 1..10.
    """
    g = max(1, min(4, rating))
    raw_d = curr_d - w[6] * (g - 3)
    d_prime = w[7] * w[4] + (1.0 - w[7]) * raw_d
    return max(1.0, min(10.0, d_prime))


def update_stability_success(
    curr_s: float,
    curr_d: float,
    retrievability: float,
    rating: int,
    w: List[float] = DEFAULT_W
) -> float:
    """
    Pembaruan stabilitas setelah recall sukses (Rating 2, 3, 4):
    S' = S * (1 + exp(w8) * (11 - D) * S^(-w9) * (exp((1 - R) * w10) - 1) * hardPenalty * easyBonus).
    """
    hard_penalty = w[15] if rating == 2 else 1.0
    easy_bonus = w[16] if rating == 4 else 1.0
    
    factor = (
        math.exp(w[8]) *
        (11.0 - curr_d) *
        math.pow(curr_s, -w[9]) *
        (math.exp((1.0 - retrievability) * w[10]) - 1.0) *
        hard_penalty *
        easy_bonus
    )
    return curr_s * (1.0 + factor)


def update_stability_forget(
    curr_s: float,
    curr_d: float,
    retrievability: float,
    w: List[float] = DEFAULT_W
) -> float:
    """
    Pembaruan stabilitas setelah lupa (Rating 1 - Again):
    S' = w11 * D^(-w12) * ((S + 1)^w13 - 1) * exp((1 - R) * w14).
    """
    s_prime = (
        w[11] *
        math.pow(curr_d, -w[12]) *
        (math.pow(curr_s + 1.0, w[13]) - 1.0) *
        math.exp((1.0 - retrievability) * w[14])
    )
    return max(0.1, s_prime)


class FSRSScheduler:
    """
    Penjadwal Repetisi Terjarak FSRS v4.5 Lengkap.
    """

    def __init__(self, weights: Optional[List[float]] = None):
        self.w = weights or DEFAULT_W

    def step(self, item: FSRSItemRequest) -> FSRSItemResponse:
        """
        Menjalankan 1 langkah penjadwalan dan menghasilkan pratinjau untuk ke-4 rating.
        """
        rating = item.rating
        state = item.state.lower()
        now = datetime.now(timezone.utc)
        desired_retention = item.desired_retention

        # 1. Hitung retrievability saat ini
        if state == "new" or item.stability <= 0.0:
            retrievability = 1.0
        else:
            retrievability = calculate_retrievability(item.elapsed_days, item.stability)

        # 2. Hitung stabilitas dan kesulitan baru untuk rating terpilih
        new_stability, new_difficulty, new_state, new_lapses, new_reps = self._compute_single_rating(
            item, rating, retrievability
        )

        if rating == 1:
            interval_days = 1
        else:
            interval_days = calculate_interval(new_stability, desired_retention)
        due_date = (now + timedelta(days=interval_days)).isoformat()

        # 3. Hitung pratinjau untuk SEMUA rating 1..4 (untuk ditampilkan di tombol UI kartu)
        previews: Dict[int, FSRSPreview] = {}
        for r_candidate in [1, 2, 3, 4]:
            s_cand, d_cand, state_cand, _, _ = self._compute_single_rating(
                item, r_candidate, retrievability
            )
            if r_candidate == 1:
                i_cand = 1
            else:
                i_cand = calculate_interval(s_cand, desired_retention)
            due_cand = (now + timedelta(days=i_cand)).isoformat()
            previews[r_candidate] = FSRSPreview(
                rating=r_candidate,
                interval_days=i_cand,
                due_date=due_cand,
                stability=round(s_cand, 4),
                difficulty=round(d_cand, 4),
                state=state_cand
            )

        return FSRSItemResponse(
            card_id=item.card_id,
            rating=rating,
            state=new_state,
            step=item.step + 1,
            stability=round(new_stability, 4),
            difficulty=round(new_difficulty, 4),
            elapsed_days=item.elapsed_days,
            scheduled_days=interval_days,
            reps=new_reps,
            lapses=new_lapses,
            due_date=due_date,
            retrievability=round(retrievability, 4),
            previews=previews
        )

    def _compute_single_rating(
        self,
        item: FSRSItemRequest,
        rating: int,
        retrievability: float
    ) -> Tuple[float, float, str, int, int]:
        """Menghitung hasil transisi untuk 1 nilai rating tertentu."""
        state = item.state.lower()
        reps = item.reps + 1
        lapses = item.lapses

        if state == "new" or item.stability <= 0.0:
            # Kartu baru pertama kali dipelajari
            new_s = calculate_initial_stability(rating, self.w)
            new_d = calculate_initial_difficulty(rating, self.w)
            if rating == 1:
                new_state = "learning"
                lapses += 1
            else:
                new_state = "review"
        else:
            # Kartu review / relearning yang sudah memiliki riwayat
            new_d = update_difficulty(item.difficulty, rating, self.w)
            if rating == 1:
                new_s = update_stability_forget(item.stability, new_d, retrievability, self.w)
                new_state = "relearning"
                lapses += 1
            else:
                new_s = update_stability_success(item.stability, new_d, retrievability, rating, self.w)
                new_state = "review"

        return new_s, new_d, new_state, lapses, reps
