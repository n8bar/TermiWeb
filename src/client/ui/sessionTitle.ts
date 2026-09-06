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
