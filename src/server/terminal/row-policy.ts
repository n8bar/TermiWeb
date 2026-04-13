import { resolveSharedTerminalRows } from "../../shared/terminal-geometry.js";

export function resolveSessionRowsForCols(cols: number): number {
  return resolveSharedTerminalRows(cols);
}
