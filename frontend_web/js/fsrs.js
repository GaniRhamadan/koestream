/**
 * LingoStream / KoeStream Universal - FSRS v4.5 Client-side Scheduler
 * Formula mathematically identical to Python backend app/fsrs.py
 * Enables 100% instant offline SRS flashcard calculation.
 */

class FSRSMath {
  constructor(desiredRetention = 0.9) {
    this.desiredRetention = desiredRetention;
    // Standard FSRS v4.5 Parameters (W0 .. W16)
    this.w = [
      0.40255, 1.18385, 3.173, 15.69105, 7.1949, 0.5345, 1.4604, 0.0046,
      1.54575, 0.1192, 1.01925, 1.9395, 0.11, 0.29605, 0.22695, 0.5698, 2.85525
    ];
  }

  calculateRetrievability(elapsedDays, stability) {
    if (stability <= 0) return 0.0;
    const factor = Math.pow(0.9, -1) - 1; // ~0.1111
    return Math.pow(1 + (factor * elapsedDays) / stability, -1);
  }

  calculateInterval(stability) {
    if (stability <= 0) return 1;
    const factor = Math.pow(0.9, -1) - 1;
    const days = (stability / factor) * (Math.pow(this.desiredRetention, -1) - 1);
    return Math.max(1, Math.round(days));
  }

  step(card, rating) {
    // Rating: 1: Again, 2: Hard, 3: Good, 4: Easy
    let { stability = 0.0, difficulty = 0.0, state = 'new', reps = 0, lapses = 0, elapsedDays = 0.0 } = card.fsrs || {};

    let newStability = stability;
    let newDifficulty = difficulty;
    let newState = state;
    let scheduledDays = 1;

    if (state === 'new') {
      newDifficulty = this.w[4] - Math.exp(this.w[5] * (rating - 1)) + 1;
      newDifficulty = Math.min(10.0, Math.max(1.0, newDifficulty));
      newStability = this.w[rating - 1];
      newState = rating === 1 ? 'learning' : 'review';
      reps = 1;
    } else {
      reps += 1;
      const r = this.calculateRetrievability(elapsedDays, stability);
      
      // Update Difficulty
      const diffDelta = -this.w[6] * (rating - 3);
      newDifficulty = difficulty + diffDelta * ((10.0 - difficulty) / 9.0);
      newDifficulty = Math.min(10.0, Math.max(1.0, newDifficulty));

      if (rating === 1) {
        lapses += 1;
        newState = 'relearning';
        newStability = this.w[11] * Math.pow(newDifficulty, -this.w[12]) * (Math.pow(stability + 1, this.w[13]) - 1) * Math.exp((1 - r) * this.w[14]);
        newStability = Math.max(0.1, newStability);
      } else {
        newState = 'review';
        const hardPenalty = rating === 2 ? this.w[15] : 1.0;
        const easyBonus = rating === 4 ? this.w[16] : 1.0;
        newStability = stability * (1 + Math.exp(this.w[8]) * (11 - newDifficulty) * Math.pow(stability, -this.w[9]) * (Math.exp((1 - r) * this.w[10]) - 1) * hardPenalty * easyBonus);
      }
    }

    scheduledDays = this.calculateInterval(newStability);
    const dueDate = new Date();
    if (rating === 1) {
      dueDate.setMinutes(dueDate.getMinutes() + 10); // 10 menit untuk Again
    } else {
      dueDate.setDate(dueDate.getDate() + scheduledDays);
    }

    return {
      cardId: card.id,
      rating,
      state: newState,
      stability: Math.round(newStability * 100) / 100,
      difficulty: Math.round(newDifficulty * 100) / 100,
      scheduledDays,
      reps,
      lapses,
      dueDate: dueDate.toISOString(),
      retrievability: Math.round(this.calculateRetrievability(0, newStability) * 100) / 100,
    };
  }

  getIntervalLabel(stability, rating) {
    if (rating === 1) return '< 10m';
    if (rating === 2) {
      const days = this.calculateInterval(Math.max(0.5, stability * 0.7));
      return days <= 1 ? '1 hari' : `${days} hari`;
    }
    if (rating === 3) {
      const days = this.calculateInterval(Math.max(1.0, stability * 1.2));
      return days <= 1 ? '1 hari' : `${days} hari`;
    }
    const days = this.calculateInterval(Math.max(2.0, stability * 2.0));
    return `${days} hari`;
  }
}

window.FSRSMath = FSRSMath;
