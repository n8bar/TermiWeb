import { describe, expect, it } from "vitest";

import { captureVisibleTerminalText } from "../../src/client/ui/terminalSnapshot.js";

function line(text: string) {
  return {
    translateToString(trimRight = false) {
      return trimRight ? text.replace(/\s+$/, "") : text;
    },
  };
}

describe("captureVisibleTerminalText", () => {
  it("captures only the currently visible rows", () => {
    const text = captureVisibleTerminalText({
      rows: 3,
      buffer: {
        active: {
          viewportY: 2,
          getLine(y: number) {
            return {
              0: line("boot"),
              1: line("before cls"),
              2: line("PS C:\\Users\\n8Bar> "),
              3: line("dir"),
              4: line("TermiWeb"),
            }[y];
          },
        },
      },
    });

    expect(text).toBe("PS C:\\Users\\n8Bar>\ndir\nTermiWeb");
  });

  it("trims trailing empty rows from the viewport snapshot", () => {
    const text = captureVisibleTerminalText({
      rows: 4,
      buffer: {
        active: {
          viewportY: 0,
          getLine(y: number) {
            return {
              0: line("prompt"),
              1: line(""),
              2: line(""),
              3: line(""),
            }[y];
          },
        },
      },
    });

    expect(text).toBe("prompt");
  });
});
