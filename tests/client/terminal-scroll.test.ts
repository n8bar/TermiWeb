import { describe, expect, it } from "vitest";

import {
  consumePixelLineScrollDelta,
  consumeTouchScrollDelta,
  consumeViewportScrollDelta,
} from "../../src/client/ui/terminalScroll.js";

describe("terminal touch scroll", () => {
  it("turns downward finger movement into upward scrollback movement", () => {
    expect(
      consumeTouchScrollDelta({
        previousY: 100,
        currentY: 124,
        cellHeight: 20,
        pixelRemainder: 0,
      }),
    ).toEqual({
      lineDelta: -1,
      nextPixelRemainder: -4,
    });
  });

  it("turns upward finger movement into downward viewport movement", () => {
    expect(
      consumeTouchScrollDelta({
        previousY: 180,
        currentY: 146,
        cellHeight: 20,
        pixelRemainder: 0,
      }),
    ).toEqual({
      lineDelta: 1,
      nextPixelRemainder: 14,
    });
  });

  it("consumes local viewport scroll before leaving remainder for deeper scrolling", () => {
    expect(
      consumeViewportScrollDelta({
        currentOffset: 12,
        maxOffset: 40,
        pixelDelta: -20,
      }),
    ).toEqual({
      nextOffset: 0,
      remainingPixelDelta: -8,
    });
  });

  it("converts pixel delta into terminal line scroll when local viewport is exhausted", () => {
    expect(
      consumePixelLineScrollDelta({
        pixelDelta: -24,
        cellHeight: 20,
        pixelRemainder: 0,
      }),
    ).toEqual({
      lineDelta: -1,
      nextPixelRemainder: -4,
    });
  });
});
