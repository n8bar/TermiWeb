import { describe, expect, it } from "vitest";

import {
  isDefaultConsoleTitle,
  sanitizeShellTitle,
} from "../../src/server/terminal/shell-title.js";
import { MAX_SESSION_TITLE_LENGTH } from "../../src/shared/protocol.js";

describe("sanitizeShellTitle", () => {
  it("keeps an ordinary title and trims surrounding whitespace", () => {
    expect(sanitizeShellTitle("  build watcher  ")).toBe("build watcher");
  });

  it("returns null for an empty or whitespace-only payload so the default applies", () => {
    expect(sanitizeShellTitle("")).toBeNull();
    expect(sanitizeShellTitle("   ")).toBeNull();
  });

  it("strips control characters, including escape and C1 controls", () => {
    expect(sanitizeShellTitle("vim\u001b[31m README\u0007\u009b.md")).toBe("vim[31m README.md");
    expect(sanitizeShellTitle("\u0007\u001b")).toBeNull();
  });

  it("clamps to the session title bound without splitting a surrogate pair", () => {
    const long = "x".repeat(MAX_SESSION_TITLE_LENGTH + 20);
    expect(sanitizeShellTitle(long)).toHaveLength(MAX_SESSION_TITLE_LENGTH);

    const emoji = "\u{1F600}".repeat(40);
    const clamped = sanitizeShellTitle(emoji) ?? "";
    expect(clamped.length).toBeLessThanOrEqual(MAX_SESSION_TITLE_LENGTH);
    expect(clamped.length % 2).toBe(0);
    expect([...clamped].every((codePoint) => codePoint === "\u{1F600}")).toBe(true);
  });
});

describe("isDefaultConsoleTitle", () => {
  it("treats the elevated pwsh startup title as the shell naming itself", () => {
    expect(
      isDefaultConsoleTitle("Administrator: C:\\Program Files\\PowerShell\\7\\pwsh.exe", "pwsh.exe"),
    ).toBe(true);
    expect(isDefaultConsoleTitle("pwsh", "C:\\Program Files\\PowerShell\\7\\pwsh.exe")).toBe(true);
  });

  it("treats stock Windows console titles as no title", () => {
    expect(isDefaultConsoleTitle("Administrator: Windows PowerShell", "powershell.exe")).toBe(true);
    expect(isDefaultConsoleTitle("Command Prompt", "cmd.exe")).toBe(true);
    expect(isDefaultConsoleTitle("Administrator: ", "pwsh.exe")).toBe(true);
  });

  it("keeps titles that carry information", () => {
    expect(isDefaultConsoleTitle("build watcher", "pwsh.exe")).toBe(false);
    expect(isDefaultConsoleTitle("Administrator: build watcher", "pwsh.exe")).toBe(false);
    expect(isDefaultConsoleTitle("vim README.md", "C:\\Windows\\system32\\cmd.exe")).toBe(false);
  });
});
