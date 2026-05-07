export type SessionFlowState =
  | 'idle'
  | 'ready'
  | 'in_progress'
  | 'step_completed'
  | 'session_completed'
  | 'next_recommended';

export type SessionFlowEvent =
  | 'ROUTE_READY'
  | 'SESSION_STARTED'
  | 'STEP_MARKED_COMPLETE'
  | 'SESSION_FINISHED'
  | 'RECOMMEND_NEXT'
  | 'RESET';

const transitions: Record<SessionFlowState, Partial<Record<SessionFlowEvent, SessionFlowState>>> = {
  idle: { ROUTE_READY: 'ready', RESET: 'idle' },
  ready: { SESSION_STARTED: 'in_progress', STEP_MARKED_COMPLETE: 'step_completed', RESET: 'idle' },
  in_progress: { STEP_MARKED_COMPLETE: 'step_completed', SESSION_FINISHED: 'session_completed', RESET: 'idle' },
  step_completed: { SESSION_STARTED: 'in_progress', SESSION_FINISHED: 'session_completed', RESET: 'idle' },
  session_completed: { RECOMMEND_NEXT: 'next_recommended', ROUTE_READY: 'ready', RESET: 'idle' },
  next_recommended: { ROUTE_READY: 'ready', SESSION_STARTED: 'in_progress', RESET: 'idle' },
};

export function transitionSessionState(current: SessionFlowState, event: SessionFlowEvent): SessionFlowState {
  return transitions[current][event] ?? current;
}

export const sessionFlowLabel: Record<SessionFlowState, string> = {
  idle: 'Idle',
  ready: 'Ready',
  in_progress: 'In Progress',
  step_completed: 'Step Completed',
  session_completed: 'Session Completed',
  next_recommended: 'Next Recommended',
};

export const sessionFlowHint: Record<SessionFlowState, string> = {
  idle: 'Pick a skill to begin.',
  ready: "Start today's session.",
  in_progress: 'Complete the current practice block.',
  step_completed: 'Nice step. Continue with the next one.',
  session_completed: 'Session saved. Review progress and recovery.',
  next_recommended: 'Next action: view progress or pick the next skill.',
};
