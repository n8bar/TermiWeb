export function computeCursorXtermScrollDelta(options: {
  cursorAbsoluteY: number;
  viewportY: number;
  viewportRows: number;
  bottomSlackRows?: number;
}): number {
  const { cursorAbsoluteY, viewportY, viewportRows, bottomSlackRows = 1 } = options;

  if (
    !Number.isFinite(cursorAbsoluteY) ||
    !Number.isFinite(viewportY) ||
    !Number.isFinite(viewportRows) ||
    viewportRows <= 0
  ) {
    return 0;
  }

  const safeRows = Math.max(1, Math.floor(viewportRows));
  const safeSlack = Math.max(0, Math.min(safeRows - 1, Math.floor(bottomSlackRows)));
  const top = Math.floor(viewportY);
  const desiredBottom = top + safeRows - 1 - safeSlack;
  const cursor = Math.floor(cursorAbsoluteY);

  if (cursor < top) {
    return cursor - top;
  }

  if (cursor > desiredBottom) {
    return cursor - desiredBottom;
  }

  return 0;
}

export function computeCursorViewportScrollTop(options: {
  currentScrollTop: number;
  viewportHeight: number;
  maxScrollTop: number;
  cursorTop: number;
  cursorBottom: number;
  bottomSlackPx?: number;
}): number {
  const {
    currentScrollTop,
    viewportHeight,
    maxScrollTop,
    cursorTop,
    cursorBottom,
    bottomSlackPx = 0,
  } = options;

  if (
    !Number.isFinite(currentScrollTop) ||
    !Number.isFinite(viewportHeight) ||
    !Number.isFinite(maxScrollTop) ||
    !Number.isFinite(cursorTop) ||
    !Number.isFinite(cursorBottom) ||
    viewportHeight <= 0
  ) {
    return Math.max(0, Math.min(maxScrollTop, currentScrollTop));
  }

  const safeCurrent = Math.max(0, Math.min(maxScrollTop, currentScrollTop));
  const safeSlack = Math.max(0, bottomSlackPx);
  const desiredBottom = safeCurrent + viewportHeight - safeSlack;

  if (cursorTop < safeCurrent) {
    return Math.max(0, Math.min(maxScrollTop, cursorTop));
  }

  if (cursorBottom > desiredBottom) {
    return Math.max(0, Math.min(maxScrollTop, cursorBottom + safeSlack - viewportHeight));
  }

  return safeCurrent;
}
