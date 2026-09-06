export function getDisplaySessionTitle(title: string, collapsed: boolean): string {
  if (!collapsed) {
    return title;
  }

  const match = /^Instance (\d+)$/.exec(title.trim());
  if (match) {
    return match[1] ?? title;
  }

  return title;
}

/**
 * Display precedence: the shell-provided title when present and non-empty,
 * otherwise the workspace default.
 */
export function resolveDisplayedSessionTitle(session: {
  title: string;
  shellTitle?: string | null;
}): string {
  const shellTitle = session.shellTitle?.trim();
  return shellTitle ? shellTitle : session.title;
}

export interface TitleScrollPlan {
  distancePx: number;
  durationMs: number;
}

const TITLE_SCROLL_PX_PER_SECOND = 40;
const TITLE_SCROLL_MIN_DURATION_MS = 2500;

/**
 * Decides whether an overflowing title should scroll back and forth so it can
 * be read where hover does not exist. Returns null when the title fits, when the
 * device has a fine pointer (hover and the native tooltip cover it), or when the
 * user prefers reduced motion. The duration covers one direction of travel.
 */
export function resolveTitleScroll(options: {
  contentWidth: number;
  slotWidth: number;
  coarsePointer: boolean;
  reducedMotion: boolean;
}): TitleScrollPlan | null {
  const distancePx = Math.ceil(options.contentWidth - options.slotWidth);
  if (distancePx <= 0 || !options.coarsePointer || options.reducedMotion) {
    return null;
  }

  const durationMs = Math.max(
    TITLE_SCROLL_MIN_DURATION_MS,
    Math.round((distancePx / TITLE_SCROLL_PX_PER_SECOND) * 1000),
  );
  return { distancePx, durationMs };
}
