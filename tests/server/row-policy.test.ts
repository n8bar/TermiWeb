import { describe, expect, it } from "vitest";

import { resolveNextTerminalRows } from "../../src/server/terminal/row-policy.js";

describe("terminal row policy", () => {
  it("does not shrink the live PTY for a smaller device viewport", () => {
    expect(resolveNextTerminalRows(32, 18)).toBe(32);
  });

  it("allows the live PTY to grow for a larger device viewport", () => {
    expect(resolveNextTerminalRows(32, 48)).toBe(48);
  });
});
