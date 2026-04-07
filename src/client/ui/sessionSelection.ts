import type { SessionSummary } from "../../shared/protocol.js";

function hasSession(sessions: SessionSummary[], sessionId: string | null): sessionId is string {
  return Boolean(sessionId && sessions.some((session) => session.id === sessionId));
}

export function resolvePreferredSessionId(options: {
  sessions: SessionSummary[];
  localSessionId: string | null;
  workspaceActiveSessionId: string | null;
}): string | null {
  const { sessions, localSessionId, workspaceActiveSessionId } = options;

  if (sessions.length === 0) {
    return null;
  }

  if (hasSession(sessions, localSessionId)) {
    return localSessionId;
  }

  if (hasSession(sessions, workspaceActiveSessionId)) {
    return workspaceActiveSessionId;
  }

  return sessions[0]?.id ?? null;
}
