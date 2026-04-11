export function resolveNextTerminalRows(currentRows: number, requestedRows: number): number {
  const safeCurrentRows =
    Number.isFinite(currentRows) && currentRows > 0 ? Math.floor(currentRows) : 1;
  const safeRequestedRows =
    Number.isFinite(requestedRows) && requestedRows > 0 ? Math.floor(requestedRows) : 1;

  return Math.max(safeCurrentRows, safeRequestedRows);
}
