export const CANONICAL_TERMINAL_COLS = 80;
export const CANONICAL_TERMINAL_ROWS = 30;

export function resolveSharedTerminalRows(cols: number): number {
  if (!Number.isFinite(cols) || cols <= 0) {
    return CANONICAL_TERMINAL_ROWS;
  }

  return Math.max(
    1,
    Math.round((Math.floor(cols) * CANONICAL_TERMINAL_ROWS) / CANONICAL_TERMINAL_COLS),
  );
}
