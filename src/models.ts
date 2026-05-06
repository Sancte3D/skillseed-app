export type ExpDomainKey = "language" | "default" | "ai";
export type SkillStatus = "core" | "emerging" | "experimental";
export type SkillType = "hard" | "soft" | "fundamental";
export type BenchmarkType = "quantitative" | "qualitative" | "balance";

export interface SkillMaster {
  skill_id: string;
  category: string;
  subcategory: string;
  name: string;
  tags: string[];
  k: number;
  expDomainKey: ExpDomainKey;
  C_preset: number;
  F_preset: number;
  C_range: [number, number];
  status: SkillStatus;
  type?: SkillType; // "hard" (measurable end goal), "soft" (growth), "fundamental" (balance)
  benchmarkType?: BenchmarkType; // For feedback calculation
}

export interface SelfAssessment {
  q1:number; q2:number; q3:number; q4:number; q5:number; q6:number;
  C?: number; F?: number; level_claim?: "A"|"F"|"E";
}

export interface UserSkill {
  userSkillId: string;
  skill_id: string;
  self: Required<SelfAssessment>;
  intensity: { R_est:number; R_real:number; R_eff:number; E:number };
  estimates: { k:number; L_hours:number; confidence: "low"|"med"|"high" };
  progress: { logged_hours:number };
  updated_at?: number; // Timestamp when skill was last updated
  /** Set when user passes the F-level quiz for this skill */
  f_level_passed?: boolean;
}

export interface Session {
  session_id: string;
  skill_id: string;
  start_ts: string;
  end_ts: string;
  duration_min: number;
  afk_warning?: boolean;
  notes?: string;
  is_historic?: boolean;
  // Qualitative feedback metrics (optional, for soft skills and fundamentals)
  focus_score?: number; // 1-5
  satisfaction?: number; // 1-5
  energy_state?: number; // 1-5
  completion_rate?: number; // 0-1 (for tasks/units completed)
}

export interface FeedbackMetrics {
  time_spent: number; // hours per week
  frequency: number; // sessions per week
  completion_rate: number; // 0-1
  energy_state: number; // 1-5
  focus_score: number; // 1-5
  satisfaction: number; // 1-5
}

export interface FeedbackScore {
  feedback_score: number; // Calculated: (completion_rate * 0.4) + (focus_score * 0.3) + (satisfaction * 0.3)
  metrics: FeedbackMetrics;
  comment?: string;
}

/**
 * Export bundle structure for data backup/restore
 */
export interface ExportBundle {
  version: string;
  exported_at: string;
  user_id: string;
  user_skills: UserSkill[];
  sessions: Session[];
  onboarded: boolean;
  global_assessment: Required<SelfAssessment> | null;
  username: string | null;
}
