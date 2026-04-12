import { describe, expect, it } from "vitest";

import {
  computeRequiredTerminalWidth,
  fitFontSizeToCols,
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

  it("also respects row fit when a shared terminal shape is taller than the local viewport", () => {
    expect(
      fitFontSizeToCols({
        currentFontSize: 15,
        fittedCols: 120,
        fittedRows: 24,
        targetCols: 80,
        targetRows: 30,
      }),
    ).toBe(12);
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
});
