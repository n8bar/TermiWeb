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
