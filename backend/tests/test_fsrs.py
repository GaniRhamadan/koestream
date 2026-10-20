"""
LingoStream Universal - Pengujian Matematis FSRS v4.5
Memverifikasi ketepatan rumus FSRS v4.5 untuk 5 skenario penting:
1. Kartu Baru (Initial Review) untuk Rating 1..4 (S0 dan D0).
2. Identitas Matematis Retrievability R(t=S, S) = 0.9.
3. Review Ulang Sukses (Rating 3 Good) & Pertumbuhan Stabilitas.
4. Lupa (Rating 1 Again) & Transisi Status ke Relearning.
5. Verifikasi Interval Pratinjau (Monotonik Meningkat: Again <= Hard <= Good <= Easy).
"""

import math
import pytest
from app.fsrs import (
    DEFAULT_W,
    FACTOR,
    DECAY,
    calculate_retrievability,
    calculate_interval,
    calculate_initial_stability,
    calculate_initial_difficulty,
    update_difficulty,
    FSRSScheduler,
)
from app.schemas import FSRSItemRequest


def test_fsrs_initial_ratings():
    """Skenario 1: Penilaian kartu baru menghasilkan S0 dan D0 sesuai bobot resmi."""
    # S0(G) = w[G-1]
    assert calculate_initial_stability(1) == pytest.approx(DEFAULT_W[0], 1e-4)
    assert calculate_initial_stability(2) == pytest.approx(DEFAULT_W[1], 1e-4)
    assert calculate_initial_stability(3) == pytest.approx(DEFAULT_W[2], 1e-4)
    assert calculate_initial_stability(4) == pytest.approx(DEFAULT_W[3], 1e-4)

    # D0(3) = w4
    assert calculate_initial_difficulty(3) == pytest.approx(DEFAULT_W[4], 1e-4)
    # D0(4) = w4 - w5
    assert calculate_initial_difficulty(4) == pytest.approx(DEFAULT_W[4] - DEFAULT_W[5], 1e-4)


def test_fsrs_retrievability_identity():
    """Skenario 2: Identitas FSRS pada t = S, retrievability R HARUS tepat 0.9."""
    stability = 10.0
    elapsed = 10.0
    r = calculate_retrievability(elapsed, stability)
    assert r == pytest.approx(0.9, abs=1e-5)


def test_fsrs_review_success():
    """Skenario 3: Recall sukses (Good) memperpanjang stabilitas dan interval."""
    scheduler = FSRSScheduler()
    req = FSRSItemRequest(
        card_id="card_001",
        rating=3,
        state="review",
        stability=3.1262,
        difficulty=7.2102,
        elapsed_days=3.0,
        reps=1,
        lapses=0,
    )
    res = scheduler.step(req)
    # Stabilitas harus meningkat setelah recall sukses
    assert res.stability > req.stability
    assert res.state == "review"
    assert res.scheduled_days >= 3


def test_fsrs_review_forget():
    """Skenario 4: Saat lupa (Again / Rating 1), status berubah menjadi relearning dan lapse bertambah."""
    scheduler = FSRSScheduler()
    req = FSRSItemRequest(
        card_id="card_002",
        rating=1,
        state="review",
        stability=10.0,
        difficulty=5.0,
        elapsed_days=10.0,
        reps=5,
        lapses=0,
    )
    res = scheduler.step(req)
    assert res.state == "relearning"
    assert res.lapses == 1
    # Interval untuk Again harus kembali ke 1 hari
    assert res.scheduled_days == 1


def test_fsrs_preview_monotonicity():
    """Skenario 5: Keempat interval pratinjau harus berurutan secara monotonik."""
    scheduler = FSRSScheduler()
    req = FSRSItemRequest(
        card_id="card_003",
        rating=3,
        state="review",
        stability=5.0,
        difficulty=6.0,
        elapsed_days=5.0,
        reps=2,
        lapses=0,
    )
    res = scheduler.step(req)
    previews = res.previews

    int_again = previews[1].interval_days
    int_hard = previews[2].interval_days
    int_good = previews[3].interval_days
    int_easy = previews[4].interval_days

    assert int_again <= int_hard
    assert int_hard <= int_good
    assert int_good <= int_easy
