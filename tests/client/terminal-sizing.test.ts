import { describe, expect, it } from "vitest";

import {
  computeRequiredTerminalWidth,
  fitFontSizeToCols,
  resolveTerminalRows,
} from "../../src/client/ui/terminalSizing.js";

describe("terminal sizing helpers", () => {
  it("computes the width needed to display all columns", () => {
    expect(
      computeRequiredTerminalWidth({
        cols: 80,
        cellWidth: 8.5,
        horizontalPadding: 24,
      }),
    ).toBe(704);
  });

  it("scales font size to fit the target column count", () => {
    expect(
      fitFontSizeToCols({
        currentFontSize: 15,
        fittedCols: 64,
        targetCols: 80,
      }),
    ).toBe(12);

    expect(
      fitFontSizeToCols({
        currentFontSize: 15,
        fittedCols: 120,
        targetCols: 80,
      }),
    ).toBe(22.5);
  });

  it("clamps the fitted font size to the configured bounds", () => {
    expect(
      fitFontSizeToCols({
        currentFontSize: 15,
        fittedCols: 500,
        targetCols: 80,
        maxFontSize: 28,
      }),
    ).toBe(28);

    expect(
      fitFontSizeToCols({
        currentFontSize: 15,
        fittedCols: 20,
        targetCols: 80,
        minFontSize: 6,
      }),
    ).toBe(6);
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
