export function computeRequiredTerminalWidth(options: {
  cols: number;
  cellWidth: number;
  horizontalPadding: number;
}): number {
  const { cols, cellWidth, horizontalPadding } = options;

  if (
    !Number.isFinite(cols) ||
    !Number.isFinite(cellWidth) ||
    !Number.isFinite(horizontalPadding) ||
    cols <= 0 ||
    cellWidth <= 0 ||
    horizontalPadding < 0
  ) {
    return 0;
  }

  return cols * cellWidth + horizontalPadding;
}

export function computeRequiredTerminalHeight(options: {
  rows: number;
  cellHeight: number;
  verticalPadding: number;
}): number {
  const { rows, cellHeight, verticalPadding } = options;

  if (
    !Number.isFinite(rows) ||
    !Number.isFinite(cellHeight) ||
    !Number.isFinite(verticalPadding) ||
    rows <= 0 ||
    cellHeight <= 0 ||
    verticalPadding < 0
  ) {
    return 0;
  }

  return rows * cellHeight + verticalPadding;
}

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
    minFontSize = 6,
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
