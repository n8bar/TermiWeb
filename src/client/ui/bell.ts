export interface BellReaction {
  flashCard: boolean;
  flashFrame: boolean;
  animate: boolean;
  playTone: boolean;
  vibrate: boolean;
}

/**
 * Decides how this client reacts to a bell from the given instance. The visual
 * cue is always on; the frame flash applies only when the ringing instance is
 * the active one; motion honors the reduced-motion preference; sound and
 * vibration follow the per-device preference and what the browser allows.
 */
export function resolveBellReaction(options: {
  sessionId: string;
  activeSessionId: string | null;
  soundEnabled: boolean;
  audioUnlocked: boolean;
  coarsePointer: boolean;
  reducedMotion: boolean;
  vibrationSupported: boolean;
}): BellReaction {
  return {
    flashCard: true,
    flashFrame: options.sessionId === options.activeSessionId,
    animate: !options.reducedMotion,
    playTone: options.soundEnabled && options.audioUnlocked,
    vibrate: options.soundEnabled && options.coarsePointer && options.vibrationSupported,
  };
}

export function resolveDocumentTitle(baseTitle: string, attentionPending: boolean): string {
  return attentionPending ? `🔔 ${baseTitle}` : baseTitle;
}
