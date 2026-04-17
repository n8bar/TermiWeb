import { describe, expect, it, vi } from "vitest";

import {
  buildWindowsElevationCommand,
  isProcessElevated,
  relaunchProcessElevatedIfNeeded,
} from "../../src/server/elevation.js";

describe("server elevation helpers", () => {
  it("builds a PowerShell relaunch command with escaped args", () => {
    const command = buildWindowsElevationCommand({
      filePath: "C:\\Program Files\\nodejs\\node.exe",
      args: ["C:\\Projects\\TermiWeb\\node_modules\\tsx\\dist\\cli.mjs", "watch", "it's"],
      cwd: "C:\\Projects\\TermiWeb",
      envAssignments: {
        TERMIWEB_ELEVATION_REQUESTED: "true",
      },
    });

    expect(command).toContain("$env:TERMIWEB_ELEVATION_REQUESTED = 'true'");
    expect(command).toContain(
      "Start-Process -FilePath 'C:\\Program Files\\nodejs\\node.exe'",
    );
    expect(command).toContain(
      "-ArgumentList @('C:\\Projects\\TermiWeb\\node_modules\\tsx\\dist\\cli.mjs', 'watch', 'it''s')",
    );
    expect(command).toContain("-Verb RunAs");
  });

  it("treats non-Windows platforms as already satisfied", () => {
    expect(
      relaunchProcessElevatedIfNeeded({
        platform: "linux",
        env: {},
        execPath: "/usr/bin/node",
        execArgv: [],
        argv: ["/usr/bin/node", "server.js"],
        cwd: "/repo",
      }),
    ).toBe(false);
  });

  it("does nothing when the process is already elevated", () => {
    const relaunch = vi.fn();

    expect(
      relaunchProcessElevatedIfNeeded(
        {
          platform: "win32",
          env: {},
          execPath: "C:\\node.exe",
          execArgv: ["--trace-warnings"],
          argv: ["C:\\node.exe", "server.js"],
          cwd: "C:\\repo",
        },
        {
          isElevated: () => true,
          relaunch,
        },
      ),
    ).toBe(false);

    expect(relaunch).not.toHaveBeenCalled();
  });

  it("relaunches a Windows process when it is not elevated", () => {
    const relaunch = vi.fn();

    expect(
      relaunchProcessElevatedIfNeeded(
        {
          platform: "win32",
          env: {},
          execPath: "C:\\node.exe",
          execArgv: ["--trace-warnings"],
          argv: ["C:\\node.exe", "server.js", "--watch"],
          cwd: "C:\\repo",
        },
        {
          isElevated: () => false,
          relaunch,
        },
      ),
    ).toBe(true);

    expect(relaunch).toHaveBeenCalledWith({
      filePath: "C:\\node.exe",
      args: ["--trace-warnings", "server.js", "--watch"],
      cwd: "C:\\repo",
      envAssignments: {
        TERMIWEB_ELEVATION_REQUESTED: "true",
      },
    });
  });

  it("can skip the elevation requirement explicitly", () => {
    const relaunch = vi.fn();

    expect(
      relaunchProcessElevatedIfNeeded(
        {
          platform: "win32",
          env: {
            TERMIWEB_SKIP_ELEVATION: "true",
          },
          execPath: "C:\\node.exe",
          execArgv: [],
          argv: ["C:\\node.exe", "server.js"],
          cwd: "C:\\repo",
        },
        {
          isElevated: () => false,
          relaunch,
        },
      ),
    ).toBe(false);

    expect(relaunch).not.toHaveBeenCalled();
  });

  it("detects elevated status from PowerShell output", () => {
    expect(
      isProcessElevated("win32", () => ({
        pid: 1,
        output: [],
        stdout: "True",
        stderr: "",
        status: 0,
        signal: null,
      })),
    ).toBe(true);
  });

  it("treats missing PowerShell output as not elevated instead of crashing", () => {
    expect(
      isProcessElevated("win32", () => ({
        pid: 1,
        output: [],
        stdout: null,
        stderr: "",
        status: 0,
        signal: null,
      })),
    ).toBe(false);
  });
});
