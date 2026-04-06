import { describe, expect, it } from "vitest";

import { resolveShellCommand } from "../../src/server/terminal/shell.js";

describe("shell resolution", () => {
  it("prefers the configured shell when it exists", () => {
    const pathValue = "C:\\Windows\\System32;C:\\Program Files\\PowerShell\\7";
    const resolved = resolveShellCommand(
      "pwsh.exe",
      pathValue,
      (command) => command === "pwsh.exe",
    );

    expect(resolved).toBe("pwsh.exe");
  });

  it("falls back to Windows PowerShell when pwsh is unavailable", () => {
    const pathValue = "C:\\Windows\\System32";
    const resolved = resolveShellCommand(
      "pwsh.exe",
      pathValue,
      (command) => command === "powershell.exe",
    );

    expect(resolved).toBe("powershell.exe");
  });
});
