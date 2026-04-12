import { describe, expect, it } from "vitest";

import {
  computeCursorViewportScrollTop,
  computeCursorXtermScrollDelta,
} from "../../src/client/ui/cursorFollow.js";

describe("cursor follow helpers", () => {
  it("scrolls xterm down when the cursor is below the visible viewport", () => {
    expect(
      computeCursorXtermScrollDelta({
        cursorAbsoluteY: 48,
        viewportY: 20,
        viewportRows: 20,
        bottomSlackRows: 1,
      }),
    ).toBe(10);
  });

  it("scrolls xterm up when the cursor is above the visible viewport", () => {
    expect(
      computeCursorXtermScrollDelta({
        cursorAbsoluteY: 9,
        viewportY: 12,
        viewportRows: 20,
        bottomSlackRows: 1,
      }),
    ).toBe(-3);
  });

  it("keeps the current local viewport scroll when the cursor is already visible", () => {
    expect(
      computeCursorViewportScrollTop({
        currentScrollTop: 120,
        viewportHeight: 300,
        maxScrollTop: 600,
        cursorTop: 180,
        cursorBottom: 210,
        bottomSlackPx: 20,
      }),
    ).toBe(120);
  });

  it("scrolls the local viewport enough to reveal the cursor with bottom slack", () => {
    expect(
      computeCursorViewportScrollTop({
        currentScrollTop: 120,
        viewportHeight: 300,
        maxScrollTop: 600,
        cursorTop: 380,
        cursorBottom: 420,
        bottomSlackPx: 20,
      }),
    ).toBe(140);
  });
});
