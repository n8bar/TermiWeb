import { describe, expect, it } from "vitest";

import { resolveShellCommand } from "../../src/server/terminal/shell.js";

describe("shell resolution", () => {
  it("prefers pwsh from PATH before the default install path", () => {
    const resolved = resolveShellCommand(
      undefined,
      "C:\\Tools;C:\\Windows\\System32",
      (command) =>
        command === "pwsh.exe" || command === "C:\\Program Files\\PowerShell\\7\\pwsh.exe",
    );

    expect(resolved).toBe("pwsh.exe");
  });

  it("falls back to the standard PowerShell 7 install path when PATH is stale", () => {
    const resolved = resolveShellCommand(
      undefined,
      "C:\\Windows\\System32",
      (command) => command === "C:\\Program Files\\PowerShell\\7\\pwsh.exe",
    );

    expect(resolved).toBe("C:\\Program Files\\PowerShell\\7\\pwsh.exe");
  });

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
