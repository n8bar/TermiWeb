import { describe, expect, it } from "vitest";

import { resolveSessionRowsForCols } from "../../src/server/terminal/row-policy.js";

describe("terminal row policy", () => {
  it("derives rows from the canonical 80x30 shared terminal shape", () => {
    expect(resolveSessionRowsForCols(80)).toBe(30);
    expect(resolveSessionRowsForCols(100)).toBe(38);
    expect(resolveSessionRowsForCols(120)).toBe(45);
    expect(resolveSessionRowsForCols(160)).toBe(60);
  });

  it("never returns fewer than one row", () => {
    expect(resolveSessionRowsForCols(0)).toBe(30);
    expect(resolveSessionRowsForCols(-20)).toBe(30);
  });
});
