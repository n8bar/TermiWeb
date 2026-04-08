export function resolveTerminalViewport(root: ParentNode | null): HTMLElement | null {
  return root?.querySelector<HTMLElement>(".xterm-viewport") ?? null;
}

export function attachTerminalTouchScroll(
  surface: HTMLElement,
  viewport: HTMLElement,
): void {
  let activeTouchId: number | null = null;
  let startY = 0;
  let startScrollTop = 0;

  const reset = (): void => {
    activeTouchId = null;
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
      startY = touch.clientY;
      startScrollTop = viewport.scrollTop;
    },
    { passive: true },
  );

  surface.addEventListener(
    "touchmove",
    (event) => {
      if (activeTouchId === null || viewport.scrollHeight <= viewport.clientHeight) {
        return;
      }

      const touch = Array.from(event.touches).find(
        (candidate) => candidate.identifier === activeTouchId,
      );
      if (!touch) {
        return;
      }

      const nextScrollTop = startScrollTop + (startY - touch.clientY);
      const maxScrollTop = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
      const clampedScrollTop = Math.min(Math.max(nextScrollTop, 0), maxScrollTop);

      if (Math.abs(clampedScrollTop - viewport.scrollTop) < 0.5) {
        return;
      }

      viewport.scrollTop = clampedScrollTop;
      event.preventDefault();
    },
    { passive: false },
  );

  surface.addEventListener("touchend", reset, { passive: true });
  surface.addEventListener("touchcancel", reset, { passive: true });
}
