import { describe, expect, it } from "vitest";

import { consumeTouchScrollDelta } from "../../src/client/ui/terminalScroll.js";

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
      nextPixelRemainder: 4,
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
      nextPixelRemainder: -14,
    });
  });
});
