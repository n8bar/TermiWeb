import type { Terminal } from "@xterm/xterm";

export function consumePixelLineScrollDelta(options: {
  pixelDelta: number;
  cellHeight: number;
  pixelRemainder: number;
}): {
  lineDelta: number;
  nextPixelRemainder: number;
} {
  const { pixelDelta, cellHeight, pixelRemainder } = options;
  const nextCellHeight = Math.max(cellHeight, 1);
  const totalPixelDelta = pixelRemainder + pixelDelta;
  const movedLines =
    totalPixelDelta > 0
      ? Math.floor(totalPixelDelta / nextCellHeight)
      : Math.ceil(totalPixelDelta / nextCellHeight);

  return {
    lineDelta: movedLines,
    nextPixelRemainder: totalPixelDelta - movedLines * nextCellHeight,
  };
}

export function consumeTouchScrollDelta(options: {
  previousY: number;
  currentY: number;
  cellHeight: number;
  pixelRemainder: number;
}): {
  lineDelta: number;
  nextPixelRemainder: number;
} {
  const { previousY, currentY, cellHeight, pixelRemainder } = options;

  return consumePixelLineScrollDelta({
    pixelDelta: previousY - currentY,
    cellHeight,
    pixelRemainder,
  });
}

export function consumeViewportScrollDelta(options: {
  currentOffset: number;
  maxOffset: number;
  pixelDelta: number;
}): {
  nextOffset: number;
  remainingPixelDelta: number;
} {
  const { currentOffset, maxOffset, pixelDelta } = options;
  const clampedCurrentOffset = Math.max(0, Math.min(maxOffset, currentOffset));
  const desiredOffset = clampedCurrentOffset + pixelDelta;
  const nextOffset = Math.max(0, Math.min(maxOffset, desiredOffset));
  const consumedDelta = nextOffset - clampedCurrentOffset;

  return {
    nextOffset,
    remainingPixelDelta: pixelDelta - consumedDelta,
  };
}

export function attachTerminalTouchScroll(options: {
  surface: HTMLElement;
  viewport: HTMLElement;
  terminal: Terminal;
  getCellHeight: () => number;
}): void {
  const { surface, viewport, terminal, getCellHeight } = options;
  let activeTouchId: number | null = null;
  let lastY = 0;
  let pixelRemainder = 0;
  let wheelPixelRemainder = 0;

  const getViewportMaxOffset = (): number =>
    Math.max(0, viewport.scrollHeight - viewport.clientHeight);

  const reset = (): void => {
    activeTouchId = null;
    pixelRemainder = 0;
  };

  viewport.addEventListener(
    "wheel",
    (event) => {
      const deltaMultiplier =
        event.deltaMode === WheelEvent.DOM_DELTA_LINE
          ? getCellHeight()
          : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
            ? Math.max(viewport.clientHeight, 1)
            : 1;
      const pixelDelta = event.deltaY * deltaMultiplier;
      const { nextOffset, remainingPixelDelta } = consumeViewportScrollDelta({
        currentOffset: viewport.scrollTop,
        maxOffset: getViewportMaxOffset(),
        pixelDelta,
      });

      if (nextOffset === viewport.scrollTop) {
        wheelPixelRemainder = 0;
        return;
      }

      viewport.scrollTop = nextOffset;
      event.preventDefault();

      if (remainingPixelDelta !== 0) {
        const { lineDelta, nextPixelRemainder } = consumePixelLineScrollDelta({
          pixelDelta: remainingPixelDelta,
          cellHeight: getCellHeight(),
          pixelRemainder: wheelPixelRemainder,
        });
        wheelPixelRemainder = nextPixelRemainder;

        if (lineDelta !== 0) {
          terminal.scrollLines(lineDelta);
        }
      } else {
        wheelPixelRemainder = 0;
      }
    },
    { passive: false, capture: true },
  );

  surface.addEventListener(
    "touchstart",
    (event) => {
      if (event.touches.length !== 1) {
        reset();
        return;
      }

      const touch = event.touches[0];
      if (!touch) {
        reset();
        return;
      }

      activeTouchId = touch.identifier;
      lastY = touch.clientY;
      pixelRemainder = 0;
    },
    { passive: true, capture: true },
  );

  surface.addEventListener(
    "touchmove",
    (event) => {
      if (activeTouchId === null) {
        return;
      }

      const touch = Array.from(event.touches).find(
        (candidate) => candidate.identifier === activeTouchId,
      );
      if (!touch) {
        return;
      }

      const pixelDelta = lastY - touch.clientY;
      const previousOffset = viewport.scrollTop;
      const { nextOffset, remainingPixelDelta } = consumeViewportScrollDelta({
        currentOffset: previousOffset,
        maxOffset: getViewportMaxOffset(),
        pixelDelta,
      });

      lastY = touch.clientY;
      viewport.scrollTop = nextOffset;

      if (nextOffset !== previousOffset || remainingPixelDelta !== pixelDelta) {
        event.preventDefault();
      }

      if (remainingPixelDelta === 0) {
        pixelRemainder = 0;
        return;
      }

      const remainderResult = consumePixelLineScrollDelta({
        pixelDelta: remainingPixelDelta,
        cellHeight: getCellHeight(),
        pixelRemainder,
      });
      pixelRemainder = remainderResult.nextPixelRemainder;

      if (remainderResult.lineDelta === 0) {
        event.preventDefault();
        return;
      }

      terminal.scrollLines(remainderResult.lineDelta);
      event.preventDefault();
    },
    { passive: false, capture: true },
  );

  surface.addEventListener("touchend", reset, { passive: true, capture: true });
  surface.addEventListener("touchcancel", reset, { passive: true, capture: true });
}
