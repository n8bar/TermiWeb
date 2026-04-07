export interface TerminalRenderMetrics {
  cellWidth: number;
  paddingWidth: number;
  scrollbarWidth: number;
}

export function computeTerminalVisibleWidth(
  cols: number,
  metrics: TerminalRenderMetrics,
): number {
  return cols * metrics.cellWidth + metrics.paddingWidth + metrics.scrollbarWidth;
}

export function fitFontSizeToWidth(options: {
  currentFontSize: number;
  currentVisibleWidth: number;
  targetWidth: number;
  minFontSize?: number;
  maxFontSize?: number;
}): number {
  const {
    currentFontSize,
    currentVisibleWidth,
    targetWidth,
    minFontSize = 8,
    maxFontSize = 32,
  } = options;

  if (
    !Number.isFinite(currentFontSize) ||
    !Number.isFinite(currentVisibleWidth) ||
    !Number.isFinite(targetWidth) ||
    currentFontSize <= 0 ||
    currentVisibleWidth <= 0 ||
    targetWidth <= 0
  ) {
    return currentFontSize;
  }

  const scaledFontSize = currentFontSize * (targetWidth / currentVisibleWidth);
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
