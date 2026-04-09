export function fitFontSizeToCols(options: {
  currentFontSize: number;
  fittedCols: number;
  targetCols: number;
  minFontSize?: number;
  maxFontSize?: number;
}): number {
  const {
    currentFontSize,
    fittedCols,
    targetCols,
    minFontSize = 8,
    maxFontSize = 32,
  } = options;

  if (
    !Number.isFinite(currentFontSize) ||
    !Number.isFinite(fittedCols) ||
    !Number.isFinite(targetCols) ||
    currentFontSize <= 0 ||
    fittedCols <= 0 ||
    targetCols <= 0
  ) {
    return currentFontSize;
  }

  const scaledFontSize = currentFontSize * (fittedCols / targetCols);
  const roundedFontSize = Math.round(scaledFontSize * 10) / 10;

  return Math.min(maxFontSize, Math.max(minFontSize, roundedFontSize));
}

export function resolveTerminalRows(options: {
  proposedRows?: number | null | undefined;
  fallbackRows: number;
}): number {
  const { proposedRows, fallbackRows } = options;
  const candidate =
    typeof proposedRows === "number" && Number.isFinite(proposedRows)
      ? Math.floor(proposedRows)
      : Math.floor(fallbackRows);

  return Math.max(1, candidate);
}
