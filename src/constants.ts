/**
 * Application-wide constants for calculations, scoring, and configuration
 */

/**
 * Feedback score calculation weights for different benchmark types
 */
export const FEEDBACK_WEIGHTS = {
  quantitative: {
    completionRate: 0.35,
    focusScore: 0.25,
    satisfaction: 0.25,
    regularity: 0.15,
  },
  qualitative: {
    completionRate: 0.3,
    focusScore: 0.35,
    satisfaction: 0.35,
  },
  balance: {
    regularity: 0.4,
    energyBalance: 0.3,
    satisfaction: 0.3,
  },
} as const;

/**
 * Feedback score thresholds for comments
 */
export const FEEDBACK_THRESHOLDS = {
  excellent: 0.85,
  good: 0.7,
  moderate: 0.55,
  poor: 0.4,
} as const;

/**
 * Optimal session frequency per week by benchmark type
 */
export const OPTIMAL_FREQUENCY = {
  balance: 7, // Daily for fundamentals
  default: 5, // 5 sessions/week for hard/soft skills
} as const;

/**
 * Default values for feedback metrics when no data available
 */
export const DEFAULT_METRICS = {
  completionRate: 1.0,
  energyState: 3.0, // Neutral on 1-5 scale
  focusScore: 3.0, // Neutral on 1-5 scale
  satisfaction: 3.0, // Neutral on 1-5 scale
} as const;

/**
 * Score normalization constants
 */
export const SCORE_RANGES = {
  focusScore: { min: 1, max: 5 }, // 1-5 scale
  satisfaction: { min: 1, max: 5 }, // 1-5 scale
  energyState: { min: 1, max: 5 }, // 1-5 scale
  completionRate: { min: 0, max: 1 }, // 0-1 scale
} as const;

/**
 * Energy balance calculation constants
 */
export const ENERGY_BALANCE = {
  idealValue: 3.5,
  penaltyRange: 2.5, // Used for calculating deviation penalty
} as const;

/**
 * Estimator constants
 */
export const ESTIMATOR = {
  defaultR_est: 3, // Default estimated intensity
  weeksForWeighting: 8, // Weeks of data needed for full real-data weighting
  minimumWeeks: 2, // Minimum weeks before using real data
  levelBias: {
    advanced: 1.05,
    focused: 1.0,
    expert: 0.95,
  },
  experienceDomains: {
    language: 1.10,
    default: 1.20,
    ai: 1.30,
  },
} as const;

/**
 * Component animation constants
 */
export const ANIMATION = {
  springFriction: 8,
  springTension: 80,
  timingDuration: 600, // milliseconds
} as const;

/**
 * Storage and data constants
 */
export const STORAGE = {
  exportVersion: "1.0",
  defaultWeeklyGoalHours: 5,
  defaultR_est: 3,
  defaultE: 1.0,
} as const;

/**
 * UI constants
 */
export const UI = {
  borderRadius: 10,
  categoryIconSize: 24,
  progressBarHeight: {
    default: 8,
    enhanced: 10,
  },
} as const;
