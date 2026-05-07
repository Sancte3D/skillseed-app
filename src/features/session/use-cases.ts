type SessionWriter = {
  finishSession: (skillId: string, durMin: number, afkWarning: boolean, notes?: string, isHistoric?: boolean) => void;
};

export function computeSessionDurationMinutes(startTimestamp: number | null, now = Date.now()): number {
  if (!startTimestamp) return 1;
  return Math.max(1, Math.round((now - startTimestamp) / 60000));
}

export function startSessionUseCase(skillId: string, accumSec: number) {
  const now = Date.now();
  return {
    timerState: {
      running: true,
      paused: false,
      start: now,
      accumSec,
      lastActivity: now,
      skillId,
    },
  };
}

export function completeSessionUseCase(
  writer: SessionWriter,
  input: {
    skillId: string | null | undefined;
    startTimestamp: number | null;
    durationMin?: number;
    afkWarning: boolean;
    notes?: string;
    isHistoric?: boolean;
  }
) {
  if (!input.skillId) return;
  const durMin = input.durationMin ?? computeSessionDurationMinutes(input.startTimestamp);
  writer.finishSession(input.skillId, durMin, input.afkWarning, input.notes, input.isHistoric);
}
