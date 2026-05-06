import { ExpDomainKey } from "../models";

const EXP_MAP: Record<ExpDomainKey, number> = { language: 1.10, default: 1.20, ai: 1.30 };

/**
 * Calculate Self-Confidence Index (C) and Flow (F) from assessment answers
 * @param a - Assessment with q1-q6 values (typically 0-5 scale)
 * @returns Object with C (sum of all answers) and F (q3 value)
 * @throws Error if any question value is invalid (not a number or negative)
 */
function calcSCI(a: { q1: number; q2: number; q3: number; q4: number; q5: number; q6: number }) {
  const questions = [a.q1, a.q2, a.q3, a.q4, a.q5, a.q6];
  for (const [index, value] of questions.entries()) {
    if (typeof value !== 'number' || isNaN(value) || value < 0) {
      throw new Error(`Invalid assessment value for q${index + 1}: ${value}`);
    }
  }
  const C = a.q1 + a.q2 + a.q3 + a.q4 + a.q5 + a.q6;
  const F = a.q3;
  return { C, F };
}

/**
 * Calculate effective intensity (R_eff) using weighted average of estimated and real values
 * @param R_est - Estimated intensity (optional)
 * @param R_real - Real measured intensity
 * @param weeksTracked - Number of weeks of tracking data
 * @returns Effective intensity value
 * @throws Error if parameters are invalid
 */
function calcReff(R_est: number | undefined, R_real: number, weeksTracked: number): number {
  if (typeof weeksTracked !== 'number' || weeksTracked < 0 || isNaN(weeksTracked)) {
    throw new Error(`Invalid weeksTracked: ${weeksTracked}`);
  }
  if (typeof R_real !== 'number' || isNaN(R_real) || R_real < 0) {
    throw new Error(`Invalid R_real: ${R_real}`);
  }
  if (R_est !== undefined && (typeof R_est !== 'number' || isNaN(R_est) || R_est < 0)) {
    throw new Error(`Invalid R_est: ${R_est}`);
  }
  
  if (weeksTracked < 2) return R_est ?? 3;
  const w = Math.min(1, weeksTracked / 8);
  return w*R_real + (1-w)*(R_est ?? R_real);
}

/**
 * Apply level-based bias multiplier to hour estimates
 * @param level - User's claimed level ("A"=advanced, "F"=focused, "E"=expert)
 * @returns Bias multiplier (1.05 for advanced, 0.95 for expert, 1.0 otherwise)
 */
function applyBias(level?: "A"|"F"|"E"): number {
  if (level === "A") return 1.05;
  if (level === "E") return 0.95;
  return 1.0;
}

/**
 * Estimate hours required to master a skill based on assessment parameters
 * @param params - Estimation parameters
 * @param params.C - Self-confidence index (sum of assessment answers)
 * @param params.F - Flow value (q3 from assessment)
 * @param params.R_eff - Effective intensity (hours per week)
 * @param params.E - Efficiency factor (typically 0.5-2.0)
 * @param params.k - Skill complexity constant
 * @param params.expDomain - Experience domain key
 * @param params.levelBias - Optional level-based bias
 * @returns Estimated hours to mastery
 * @throws Error if parameters are invalid
 */
function estimateHours(params:{
  C:number; F:number; R_eff:number; E:number; k:number; expDomain: ExpDomainKey; levelBias?:"A"|"F"|"E";
}): number {
  const {C,F,R_eff,E,k,expDomain,levelBias} = params;
  
  // Input validation
  if (typeof C !== 'number' || isNaN(C) || C < 0) {
    throw new Error(`Invalid C value: ${C}`);
  }
  if (typeof F !== 'number' || isNaN(F) || F < 0) {
    throw new Error(`Invalid F value: ${F}`);
  }
  if (typeof R_eff !== 'number' || isNaN(R_eff) || R_eff <= 0) {
    throw new Error(`Invalid R_eff value: ${R_eff}`);
  }
  if (typeof E !== 'number' || isNaN(E) || E <= 0) {
    throw new Error(`Invalid E value: ${E}`);
  }
  if (typeof k !== 'number' || isNaN(k) || k <= 0) {
    throw new Error(`Invalid k value: ${k}`);
  }
  if (!expDomain || !EXP_MAP[expDomain]) {
    throw new Error(`Invalid expDomain: ${expDomain}`);
  }
  
  const exp = EXP_MAP[expDomain];
  const denom = Math.max(R_eff*E, 0.1);
  const base = k * Math.pow(C, exp) * (1 + F/denom);
  return base * applyBias(levelBias);
}

/**
 * Calculate estimated days to completion (ETA)
 * @param hoursRemaining - Remaining hours needed
 * @param hoursPerDay - Hours per day dedicated (default: 1)
 * @returns Number of days (or Infinity if invalid input)
 */
function etaDays(hoursRemaining:number, hoursPerDay:number=1): number {
  if (typeof hoursRemaining !== 'number' || isNaN(hoursRemaining) || hoursRemaining < 0) {
    return Infinity;
  }
  if (typeof hoursPerDay !== 'number' || isNaN(hoursPerDay) || hoursPerDay <= 0) {
    return Infinity;
  }
  return Math.ceil(hoursRemaining / hoursPerDay);
}

export const estimator = { calcSCI, calcReff, estimateHours, etaDays };
