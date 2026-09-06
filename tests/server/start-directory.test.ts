import { describe, expect, it, vi } from "vitest";

import {
  resolveHomeDirectory,
  resolveStartDirectory,
} from "../../src/server/terminal/start-directory.js";

describe("resolveStartDirectory", () => {
  it("uses the configured directory when it exists", () => {
    const result = resolveStartDirectory({
      configured: "C:\\Users\\someone",
      fallback: "C:\\Windows\\System32\\config\\systemprofile",
      isDirectory: () => true,
    });

    expect(result).toBe("C:\\Users\\someone");
  });

  it("falls back when the configured directory is missing", () => {
    const result = resolveStartDirectory({
      configured: "C:\\Users\\gone",
      fallback: "C:\\Windows\\System32\\config\\systemprofile",
      isDirectory: () => false,
    });

    expect(result).toBe("C:\\Windows\\System32\\config\\systemprofile");
  });

  it("falls back without probing when nothing is configured", () => {
    const isDirectory = vi.fn(() => true);

    const result = resolveStartDirectory({
      configured: undefined,
      fallback: "C:\\Users\\home",
      isDirectory,
    });

    expect(result).toBe("C:\\Users\\home");
    expect(isDirectory).not.toHaveBeenCalled();
  });
});

describe("resolveHomeDirectory", () => {
  it("prefers USERPROFILE, then HOME", () => {
    expect(resolveHomeDirectory({ USERPROFILE: "C:\\Users\\a", HOME: "C:\\Users\\b" })).toBe(
      "C:\\Users\\a",
    );
    expect(resolveHomeDirectory({ HOME: "C:\\Users\\b" })).toBe("C:\\Users\\b");
  });
});
