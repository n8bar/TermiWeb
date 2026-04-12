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

export function fitFontSizeToCols(options: {
  currentFontSize: number;
  fittedCols: number;
  fittedRows?: number | null | undefined;
  targetCols: number;
  targetRows?: number | null | undefined;
  minFontSize?: number;
  maxFontSize?: number;
}): number {
  const {
    currentFontSize,
    fittedCols,
    fittedRows,
    targetCols,
    targetRows,
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

  const widthScale = fittedCols / targetCols;
  const heightScale =
    typeof fittedRows === "number" &&
    Number.isFinite(fittedRows) &&
    fittedRows > 0 &&
    typeof targetRows === "number" &&
    Number.isFinite(targetRows) &&
    targetRows > 0
      ? fittedRows / targetRows
      : widthScale;
  const scaledFontSize = currentFontSize * Math.min(widthScale, heightScale);
  const roundedFontSize = Math.round(scaledFontSize * 10) / 10;

  return Math.min(maxFontSize, Math.max(minFontSize, roundedFontSize));
}
