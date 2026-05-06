import { Session, FeedbackMetrics, FeedbackScore, BenchmarkType } from '../models';

/**
 * Calculate feedback metrics from sessions for a skill
 * @param sessions - Array of sessions to analyze
 * @param weekStart - Start timestamp for the week (milliseconds)
 * @param weekEnd - End timestamp for the week (milliseconds)
 * @returns FeedbackMetrics object with calculated values
 * @throws Error if inputs are invalid
 */
export function calculateFeedbackMetrics(
  sessions: Session[],
  weekStart: number,
  weekEnd: number
): FeedbackMetrics {
  // Input validation
  if (!Array.isArray(sessions)) {
    throw new Error("Sessions must be an array");
  }
  if (typeof weekStart !== 'number' || isNaN(weekStart) || weekStart < 0) {
    throw new Error(`Invalid weekStart: ${weekStart}`);
  }
  if (typeof weekEnd !== 'number' || isNaN(weekEnd) || weekEnd < 0) {
    throw new Error(`Invalid weekEnd: ${weekEnd}`);
  }
  if (weekEnd <= weekStart) {
    throw new Error(`weekEnd (${weekEnd}) must be greater than weekStart (${weekStart})`);
  }
  
  // Filter sessions for the week
  const weekSessions = sessions.filter((s) => {
    if (!s || !s.start_ts) return false;
    const start = new Date(s.start_ts).getTime();
    if (isNaN(start)) return false;
    return start >= weekStart && start < weekEnd;
  });

  // Calculate time spent (hours per week)
  const time_spent = weekSessions.reduce((sum, s) => sum + (s.duration_min || 0) / 60, 0);

  // Frequency (sessions per week)
  const frequency = weekSessions.length;

  // Completion rate: average of completion_rate values, or 1.0 if not provided
  // For hard skills: how many tasks/projects completed successfully
  // For soft skills: how many practice sessions were fully engaged
  // For fundamentals: default to 1.0 (just tracking presence/absence)
  const completion_rates = weekSessions
    .map((s) => s.completion_rate ?? 1.0)
    .filter((r) => r > 0);
  const completion_rate =
    completion_rates.length > 0
      ? completion_rates.reduce((sum, r) => sum + r, 0) / completion_rates.length
      : 1.0;

  // Average energy_state (1-5) - how energetic/ready you felt
  const energy_states = weekSessions
    .map((s) => s.energy_state)
    .filter((e): e is number => e !== undefined && e >= 1 && e <= 5);
  const energy_state =
    energy_states.length > 0
      ? energy_states.reduce((sum, e) => sum + e, 0) / energy_states.length
      : 3.0; // Default neutral

  // Average focus_score (1-5) - how concentrated you were during practice
  const focus_scores = weekSessions
    .map((s) => s.focus_score)
    .filter((f): f is number => f !== undefined && f >= 1 && f <= 5);
  const focus_score =
    focus_scores.length > 0
      ? focus_scores.reduce((sum, f) => sum + f, 0) / focus_scores.length
      : 3.0; // Default neutral

  // Average satisfaction (1-5) - how satisfied you felt after the session
  const satisfactions = weekSessions
    .map((s) => s.satisfaction)
    .filter((s): s is number => s !== undefined && s >= 1 && s <= 5);
  const satisfaction =
    satisfactions.length > 0
      ? satisfactions.reduce((sum, s) => sum + s, 0) / satisfactions.length
      : 3.0; // Default neutral

  return {
    time_spent,
    frequency,
    completion_rate,
    energy_state,
    focus_score,
    satisfaction,
  };
}

/**
 * Calculate feedback score from metrics based on benchmark type
 * 
 * Formula differs by skill type:
 * 
 * QUANTITATIVE (Hard Skills): 
 *   - Focus on measurable outcomes (completion_rate, time_spent consistency)
 *   - Formula: completion_rate * 0.35 + focus_score * 0.25 + satisfaction * 0.25 + regularity * 0.15
 * 
 * QUALITATIVE (Soft Skills):
 *   - Focus on self-assessment quality (focus, satisfaction, engagement)
 *   - Formula: completion_rate * 0.3 + focus_score * 0.35 + satisfaction * 0.35
 * 
 * BALANCE (Fundamentals):
 *   - Focus on consistency and sustainability (frequency, energy balance, satisfaction)
 *   - Formula: regularity * 0.4 + energy_balance * 0.3 + satisfaction * 0.3
 * 
 * All values normalized to 0-1 scale for calculation
 * 
 * @param metrics - FeedbackMetrics to calculate score from
 * @param benchmarkType - Type of benchmark to use for calculation
 * @returns FeedbackScore with calculated score and comment
 * @throws Error if metrics are invalid
 */
export function calculateFeedbackScore(
  metrics: FeedbackMetrics,
  benchmarkType: BenchmarkType = 'quantitative'
): FeedbackScore {
  // Input validation
  if (!metrics || typeof metrics !== 'object') {
    throw new Error("Metrics must be an object");
  }
  
  const { time_spent, frequency, completion_rate, energy_state, focus_score, satisfaction } = metrics;
  
  if (typeof time_spent !== 'number' || isNaN(time_spent) || time_spent < 0) {
    throw new Error(`Invalid time_spent: ${time_spent}`);
  }
  if (typeof frequency !== 'number' || isNaN(frequency) || frequency < 0) {
    throw new Error(`Invalid frequency: ${frequency}`);
  }
  if (typeof completion_rate !== 'number' || isNaN(completion_rate) || completion_rate < 0 || completion_rate > 1) {
    throw new Error(`Invalid completion_rate: ${completion_rate} (must be 0-1)`);
  }
  if (typeof energy_state !== 'number' || isNaN(energy_state) || energy_state < 1 || energy_state > 5) {
    throw new Error(`Invalid energy_state: ${energy_state} (must be 1-5)`);
  }
  if (typeof focus_score !== 'number' || isNaN(focus_score) || focus_score < 1 || focus_score > 5) {
    throw new Error(`Invalid focus_score: ${focus_score} (must be 1-5)`);
  }
  if (typeof satisfaction !== 'number' || isNaN(satisfaction) || satisfaction < 1 || satisfaction > 5) {
    throw new Error(`Invalid satisfaction: ${satisfaction} (must be 1-5)`);
  }
  // Normalize all scores to 0-1 scale
  const completion_norm = Math.min(1, Math.max(0, metrics.completion_rate)); // Already 0-1
  const focus_norm = (metrics.focus_score - 1) / 4; // 1-5 -> 0-1
  const satisfaction_norm = (metrics.satisfaction - 1) / 4; // 1-5 -> 0-1
  const energy_norm = (metrics.energy_state - 1) / 4; // 1-5 -> 0-1

  // Calculate regularity score (based on frequency)
  // Optimal: 5-7 sessions per week = 1.0, fewer = lower score
  // For fundamentals, daily is ideal (7 sessions/week)
  const optimalFrequency = benchmarkType === 'balance' ? 7 : 5;
  const regularity = Math.min(1, metrics.frequency / optimalFrequency);

  let feedback_score: number;
  let comment: string;

  switch (benchmarkType) {
    case 'quantitative': {
      // Hard Skills: Completion + Focus + Satisfaction + Regularity
      feedback_score =
        completion_norm * 0.35 +
        focus_norm * 0.25 +
        satisfaction_norm * 0.25 +
        regularity * 0.15;

      if (feedback_score >= 0.85) {
        comment = 'excellent progress and consistency';
      } else if (feedback_score >= 0.7) {
        comment = 'good progress, maintain momentum';
      } else if (feedback_score >= 0.55) {
        comment = 'steady progress, increase focus on quality';
      } else if (feedback_score >= 0.4) {
        comment = 'inconsistent practice, prioritize regularity';
      } else {
        comment = 'needs more structured approach';
      }
      break;
    }

    case 'qualitative': {
      // Soft Skills: Focus on quality of engagement
      feedback_score =
        completion_norm * 0.3 + focus_norm * 0.35 + satisfaction_norm * 0.35;

      if (feedback_score >= 0.85) {
        comment = 'high engagement and quality practice';
      } else if (feedback_score >= 0.7) {
        comment = 'good engagement, continue deepening focus';
      } else if (feedback_score >= 0.55) {
        comment = 'moderate engagement, improve concentration';
      } else if (feedback_score >= 0.4) {
        comment = 'low engagement, review practice methods';
      } else {
        comment = 'needs more mindful approach';
      }
      break;
    }

    case 'balance': {
      // Fundamentals: Focus on consistency and sustainability
      // Energy balance: ideal energy_state around 3.5-4.0 (not too low, not too high)
      const energy_balance = 1 - Math.abs(metrics.energy_state - 3.5) / 2.5; // Penalize extremes
      const energy_balance_norm = Math.max(0, Math.min(1, energy_balance));

      feedback_score =
        regularity * 0.4 + energy_balance_norm * 0.3 + satisfaction_norm * 0.3;

      if (feedback_score >= 0.85) {
        comment = 'excellent balance and sustainability';
      } else if (feedback_score >= 0.7) {
        comment = 'good balance, maintain consistency';
      } else if (feedback_score >= 0.55) {
        comment = 'moderate balance, focus on regularity';
      } else if (feedback_score >= 0.4) {
        comment = 'imbalanced routine, prioritize consistency';
      } else {
        comment = 'needs more structured balance';
      }
      break;
    }

    default: {
      // Fallback to quantitative formula
      feedback_score =
        completion_norm * 0.35 +
        focus_norm * 0.25 +
        satisfaction_norm * 0.25 +
        regularity * 0.15;
      comment = 'feedback calculated';
      break;
    }
  }

  return {
    feedback_score: Math.round(feedback_score * 100) / 100, // Round to 2 decimals
    metrics,
    comment,
  };
}

/**
 * Get feedback score for a skill over a time period
 * @param sessions - Array of sessions to analyze
 * @param weekStart - Start timestamp for the week (milliseconds)
 * @param weekEnd - End timestamp for the week (milliseconds)
 * @param benchmarkType - Type of benchmark to use for calculation
 * @returns FeedbackScore or null if no sessions
 * @throws Error if inputs are invalid
 */
export function getFeedbackForSkill(
  sessions: Session[],
  weekStart: number,
  weekEnd: number,
  benchmarkType: BenchmarkType = 'quantitative'
): FeedbackScore | null {
  if (!Array.isArray(sessions)) {
    throw new Error("Sessions must be an array");
  }
  
  if (sessions.length === 0) {
    return null;
  }

  const metrics = calculateFeedbackMetrics(sessions, weekStart, weekEnd);
  return calculateFeedbackScore(metrics, benchmarkType);
}

