import { describe, expect, it } from "vitest";

import {
  computeTerminalVisibleWidth,
  fitFontSizeToWidth,
  resolveTerminalRows,
} from "../../src/client/ui/terminalSizing.js";

describe("terminal sizing helpers", () => {
  it("computes the visible width for a fixed-column terminal", () => {
    expect(
      computeTerminalVisibleWidth(80, {
        cellWidth: 8.5,
        paddingWidth: 24,
        scrollbarWidth: 14,
      }),
    ).toBe(718);
  });

  it("scales font size to fill the target width", () => {
    expect(
      fitFontSizeToWidth({
        currentFontSize: 15,
        currentVisibleWidth: 720,
        targetWidth: 960,
      }),
    ).toBe(20);
  });

  it("clamps the fitted font size to the configured bounds", () => {
    expect(
      fitFontSizeToWidth({
        currentFontSize: 15,
        currentVisibleWidth: 720,
        targetWidth: 4000,
        maxFontSize: 28,
      }),
    ).toBe(28);

    expect(
      fitFontSizeToWidth({
        currentFontSize: 15,
        currentVisibleWidth: 720,
        targetWidth: 120,
        minFontSize: 9,
      }),
    ).toBe(9);
  });

  it("lets rows shrink to whatever fits instead of enforcing a larger floor", () => {
    expect(
      resolveTerminalRows({
        proposedRows: 11,
        fallbackRows: 24,
      }),
    ).toBe(11);
  });

  it("falls back cleanly and never returns fewer than one row", () => {
    expect(
      resolveTerminalRows({
        proposedRows: null,
        fallbackRows: 7,
      }),
    ).toBe(7);

    expect(
      resolveTerminalRows({
        proposedRows: 0,
        fallbackRows: 0,
      }),
    ).toBe(1);
  });
});
