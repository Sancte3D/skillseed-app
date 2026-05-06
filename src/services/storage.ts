import { SelfAssessment, Session, SkillMaster, UserSkill, ExportBundle } from "../models";

// Lightweight storage wrapper with in-memory fallback if AsyncStorage is unavailable
type KV = { getItem:(k:string)=>Promise<string|null>; setItem:(k:string,v:string)=>Promise<void>; multiGet:(keys:string[])=>Promise<[string,string|null][]>; multiSet:(pairs:[string,string][])=>Promise<void> };
const memory = new Map<string,string>();
const memStore: KV = {
  async getItem(k){ return memory.has(k)? memory.get(k)! : null; },
  async setItem(k,v){ memory.set(k,v); },
  async multiGet(keys){ return keys.map(k=>[k, memory.has(k)? memory.get(k)! : null]); },
  async multiSet(pairs){ for (const [k,v] of pairs) memory.set(k,v); }
};
let storage: KV = memStore;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const AS = require("@react-native-async-storage/async-storage");
  if (AS && AS.default) {
    const AsyncStorage = AS.default;
    storage = {
      async getItem(k){ return AsyncStorage.getItem(k); },
      async setItem(k,v){ return AsyncStorage.setItem(k,v); },
      async multiGet(keys){ return AsyncStorage.multiGet(keys); },
      async multiSet(pairs){ return AsyncStorage.multiSet(pairs); }
    } as KV;
  }
} catch { /* fall back to memory */ }

let _userSkills: UserSkill[] = [];
let _sessions: Session[] = [];
// App-level flags/state (local-first). In a production app, persist via AsyncStorage.
let _onboarded = false;
let _globalAssessment: Required<SelfAssessment> | null = null;
let _username: string | null = null;
let _weeklyGoalHours: number = 5;
type TimerPersist = { running:boolean; paused:boolean; start:number|null; accumSec:number; skillId:string|null };
let _timer: TimerPersist = { running:false, paused:false, start:null, accumSec:0, skillId:null };

/**
 * Generate a unique identifier
 */
export function uid(): string {
  return Math.random().toString(36).slice(2);
}

/**
 * Handle storage errors gracefully
 * Logs errors in development, silently fails in production for non-critical operations
 */
function handleStorageError(operation: string, error: unknown): void {
  if (__DEV__) {
    console.warn(`Storage operation failed (${operation}):`, error);
  }
}

export const store = {
  /**
   * Create a new user skill from assessment results
   * @param skill - Skill master data
   * @param a - Required self-assessment with all questions answered
   * @param L - Estimated hours to mastery
   * @returns userSkillId of the created skill
   */
  addUserSkillFromAssessment(skill: SkillMaster, a: Required<SelfAssessment>, L:number): string {
    const { C, F } = { C: a.q1+a.q2+a.q3+a.q4+a.q5+a.q6, F: a.q3 };
    const userSkill: UserSkill = {
      userSkillId: uid(),
      skill_id: skill.skill_id,
      self: { ...a, C, F, level_claim: "F" },
      intensity: { R_est: 3, R_real: 0, R_eff: 3, E: 1.0 },
      estimates: { k: skill.k, L_hours: L, confidence: "med" },
      progress: { logged_hours: 0 }
    };
    userSkill.updated_at = Date.now();
    _userSkills.push(userSkill);
    storage.setItem("skillseed.userSkills", JSON.stringify(_userSkills))
      .catch((err) => handleStorageError("addUserSkill", err));
    return userSkill.userSkillId;
  },
  /**
   * Get a user skill by its userSkillId
   * @param id - userSkillId to lookup
   * @returns UserSkill or undefined if not found
   */
  getUserSkill(id: string): UserSkill | undefined {
    return _userSkills.find(x => x.userSkillId === id);
  },
  /**
   * Get a user skill by its skill_id
   * @param sid - skill_id to lookup
   * @returns UserSkill or undefined if not found
   */
  getUserSkillBySkillId(sid: string): UserSkill | undefined {
    return _userSkills.find(x => x.skill_id === sid);
  },
  /**
   * Update logged hours for a user skill
   * @param userSkillId - ID of the skill to update
   * @param loggedHours - New total logged hours
   * @returns true if updated, false if skill not found
   */
  updateUserSkillProgress(userSkillId: string, loggedHours: number): boolean {
    const us = _userSkills.find(x => x.userSkillId === userSkillId);
    if (!us) return false;
    us.progress.logged_hours = loggedHours;
    us.updated_at = Date.now();
    storage.setItem("skillseed.userSkills", JSON.stringify(_userSkills))
      .catch((err) => handleStorageError("updateUserSkillProgress", err));
    return true;
  },
  /**
   * List all user skills (shallow copy)
   * @returns Array of all user skills
   */
  listUserSkills(): UserSkill[] {
    return [..._userSkills];
  },
  /**
   * Get all user skills (alias for listUserSkills, used by UI screens)
   * @returns Array of all user skills
   */
  getAllUserSkills(): UserSkill[] {
    return [..._userSkills];
  },
  /**
   * Get all sessions for a specific skill
   * @param skill_id - Skill ID to filter sessions
   * @returns Array of sessions for the skill
   */
  getSessionsForSkill(skill_id: string): Session[] {
    return _sessions.filter(s => s.skill_id === skill_id);
  },
  /**
   * Update a session with new data
   * @param session_id - ID of session to update
   * @param changes - Partial session data to update
   * @returns true if updated, false if session not found
   */
  updateSession(session_id: string, changes: Partial<Pick<Session,'duration_min'|'notes'|'is_historic'>>): boolean {
    const idx = _sessions.findIndex(s=>s.session_id===session_id);
    if (idx === -1) return false;
    const old = _sessions[idx];
    const prevDurMin = old.duration_min;
    _sessions[idx] = { ...old, ...changes, duration_min: changes.duration_min ?? old.duration_min };
    const newDurMin = _sessions[idx].duration_min;
    // adjust progress if duration changed
    if (newDurMin !== prevDurMin) {
      const us = _userSkills.find(x=>x.skill_id===old.skill_id);
      if (us) {
        us.progress.logged_hours += (newDurMin - prevDurMin)/60;
        us.updated_at = Date.now();
      }
    }
    storage.setItem("skillseed.sessions", JSON.stringify(_sessions))
      .catch((err) => handleStorageError("updateSession", err));
    return true;
  },
  /**
   * Delete a session and adjust progress accordingly
   * @param session_id - ID of session to delete
   * @returns true if deleted, false if session not found
   */
  deleteSession(session_id: string): boolean {
    const idx = _sessions.findIndex(s=>s.session_id===session_id);
    if (idx === -1) return false;
    const s = _sessions[idx];
    const us = _userSkills.find(x=>x.skill_id===s.skill_id);
    if (us) {
      us.progress.logged_hours -= (s.duration_min||0)/60;
      us.updated_at = Date.now();
    }
    _sessions.splice(idx,1);
    storage.setItem("skillseed.sessions", JSON.stringify(_sessions))
      .catch((err) => handleStorageError("deleteSession", err));
    return true;
  },
  /**
   * Create and persist a finished session
   * @param skill_id - ID of the skill this session is for
   * @param durMin - Duration in minutes
   * @param afk_warning - Whether AFK warning was triggered
   * @param notes - Optional session notes
   * @param is_historic - Whether this is a historical session (added retroactively)
   */
  finishSession(skill_id: string, durMin: number, afk_warning: boolean, notes?: string, is_historic?: boolean): void {
    const s: Session = {
      session_id: uid(),
      skill_id,
      start_ts: new Date(Date.now() - durMin*60000).toISOString(),
      end_ts: new Date().toISOString(),
      duration_min: durMin,
      afk_warning,
      notes,
      is_historic
    };
    _sessions.push(s);
    const us = _userSkills.find(x=>x.skill_id===skill_id);
    if (us) {
      us.progress.logged_hours += durMin/60;
      us.updated_at = Date.now();
    }
    // persist sessions lightweight
    storage.setItem("skillseed.sessions", JSON.stringify(_sessions))
      .catch((err) => handleStorageError("finishSession", err));
  }
};

/**
 * Get all sessions for a specific skill (UI helper)
 * @param skill_id - Skill ID to filter sessions
 * @returns Array of sessions for the skill
 */
export function getSessionsForSkill(skill_id: string): Session[] {
  return _sessions.filter(s => s.skill_id === skill_id);
}

/**
 * Export all user data as a bundle for backup/restore
 * @param userId - Unique identifier for the user
 * @returns ExportBundle containing all user data
 */
export function exportBundle(userId: string): ExportBundle {
  return {
    version: "1.0",
    exported_at: new Date().toISOString(),
    user_id: userId,
    user_skills: _userSkills,
    sessions: _sessions,
    onboarded: _onboarded,
    global_assessment: _globalAssessment,
    username: _username
  };
}

/**
 * Import user data from an export bundle
 * @param bundle - ExportBundle to import
 * @throws Error if bundle format is invalid or unsupported
 */
export function importBundle(bundle: unknown): void {
  if (!bundle || typeof bundle !== 'object') {
    throw new Error("Invalid bundle: must be an object");
  }
  
  const bundleData = bundle as Partial<ExportBundle>;
  
  if (bundleData.version !== "1.0") {
    throw new Error(`Unsupported export version: ${bundleData.version || 'unknown'}`);
  }
  
  if (!Array.isArray(bundleData.user_skills)) {
    throw new Error("Invalid bundle: user_skills must be an array");
  }
  
  if (!Array.isArray(bundleData.sessions)) {
    throw new Error("Invalid bundle: sessions must be an array");
  }
  
  _userSkills = bundleData.user_skills ?? [];
  _sessions = bundleData.sessions ?? [];
  _onboarded = Boolean(bundleData.onboarded);
  _globalAssessment = bundleData.global_assessment ?? null;
  _username = bundleData.username ?? null;
  
  // persist imported state
  storage.multiSet([
    ["skillseed.userSkills", JSON.stringify(_userSkills)],
    ["skillseed.sessions", JSON.stringify(_sessions)],
    ["skillseed.onboarded", JSON.stringify(_onboarded)],
    ["skillseed.globalAssessment", JSON.stringify(_globalAssessment)],
    ["skillseed.username", JSON.stringify(_username)]
  ]).catch((error) => {
    console.error("Failed to persist imported data:", error);
  });
}

/**
 * App-level state management helpers for onboarding, assessment, and settings
 */
export const appState = {
  /**
   * Initialize app state from storage
   * Loads user skills, sessions, onboarding status, and settings
   */
  async init(): Promise<void> {
    try{
      const entries = await storage.multiGet([
        "skillseed.userSkills",
        "skillseed.sessions",
        "skillseed.onboarded",
        "skillseed.globalAssessment",
        "skillseed.username",
        "skillseed.timer",
        "skillseed.weeklyGoalHours"
      ]);
      const map = Object.fromEntries(entries);
      _userSkills = map["skillseed.userSkills"] ? JSON.parse(map["skillseed.userSkills"]) : _userSkills;
      _sessions = map["skillseed.sessions"] ? JSON.parse(map["skillseed.sessions"]) : _sessions;
      _onboarded = map["skillseed.onboarded"] ? JSON.parse(map["skillseed.onboarded"]) : _onboarded;
      _globalAssessment = map["skillseed.globalAssessment"] ? JSON.parse(map["skillseed.globalAssessment"]) : _globalAssessment;
      _username = map["skillseed.username"] ? JSON.parse(map["skillseed.username"]) : _username;
      _timer = map["skillseed.timer"] ? JSON.parse(map["skillseed.timer"]) : _timer;
      _weeklyGoalHours = map["skillseed.weeklyGoalHours"] ? JSON.parse(map["skillseed.weeklyGoalHours"]) : _weeklyGoalHours;
    } catch(e) {
      // ignore
    }
  },
  /**
   * Check if user has completed onboarding
   */
  isOnboarded(): boolean {
    return _onboarded;
  },
  setOnboarded(v: boolean) {
    _onboarded = v;
    storage.setItem("skillseed.onboarded", JSON.stringify(v))
      .catch((err) => handleStorageError("setOnboarded", err));
  },
  /**
   * Get the global self-assessment (if completed)
   */
  getGlobalAssessment(): Required<SelfAssessment> | null {
    return _globalAssessment;
  },
  setGlobalAssessment(a: Required<SelfAssessment>) {
    _globalAssessment = a;
    storage.setItem("skillseed.globalAssessment", JSON.stringify(a))
      .catch((err) => handleStorageError("setGlobalAssessment", err));
  },
  getUsername(): string | null {
    return _username;
  },
  setUsername(v: string) {
    _username = v;
    storage.setItem("skillseed.username", JSON.stringify(v))
      .catch((err) => handleStorageError("setUsername", err));
  },
  getTimer(): TimerPersist {
    return _timer;
  },
  setTimer(v: TimerPersist) {
    _timer = v;
    storage.setItem("skillseed.timer", JSON.stringify(v))
      .catch((err) => handleStorageError("setTimer", err));
  },
  getWeeklyGoalHours(): number {
    return _weeklyGoalHours;
  },
  setWeeklyGoalHours(v: number) {
    _weeklyGoalHours = v;
    storage.setItem("skillseed.weeklyGoalHours", JSON.stringify(v))
      .catch((err) => handleStorageError("setWeeklyGoalHours", err));
  }
};
