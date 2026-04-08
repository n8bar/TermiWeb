import type { Terminal } from "@xterm/xterm";

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
  const nextCellHeight = Math.max(cellHeight, 1);
  const totalPixelDelta = pixelRemainder + (currentY - previousY);
  const movedLines =
    totalPixelDelta > 0
      ? Math.floor(totalPixelDelta / nextCellHeight)
      : Math.ceil(totalPixelDelta / nextCellHeight);

  return {
    lineDelta: -movedLines,
    nextPixelRemainder: totalPixelDelta - movedLines * nextCellHeight,
  };
}

export function attachTerminalTouchScroll(options: {
  surface: HTMLElement;
  terminal: Terminal;
  getCellHeight: () => number;
}): void {
  const { surface, terminal, getCellHeight } = options;
  let activeTouchId: number | null = null;
  let lastY = 0;
  let pixelRemainder = 0;

  const reset = (): void => {
    activeTouchId = null;
    pixelRemainder = 0;
  };

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

      const { lineDelta, nextPixelRemainder } = consumeTouchScrollDelta({
        previousY: lastY,
        currentY: touch.clientY,
        cellHeight: getCellHeight(),
        pixelRemainder,
      });

      lastY = touch.clientY;
      pixelRemainder = nextPixelRemainder;

      if (lineDelta === 0) {
        return;
      }

      terminal.scrollLines(lineDelta);
      event.preventDefault();
    },
    { passive: false, capture: true },
  );

  surface.addEventListener("touchend", reset, { passive: true, capture: true });
  surface.addEventListener("touchcancel", reset, { passive: true, capture: true });
}
