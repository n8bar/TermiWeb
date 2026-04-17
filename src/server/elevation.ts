import { spawnSync, type SpawnSyncReturns } from "node:child_process";

const WINDOWS_POWERSHELL_PATH =
  "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe";

const WINDOWS_ELEVATION_CHECK_COMMAND = [
  "$identity = [System.Security.Principal.WindowsIdentity]::GetCurrent()",
  "$principal = New-Object System.Security.Principal.WindowsPrincipal($identity)",
  "[Console]::Out.Write($principal.IsInRole([System.Security.Principal.WindowsBuiltInRole]::Administrator))",
].join("; ");

export interface ProcessLaunchInfo {
  platform: NodeJS.Platform;
  env: NodeJS.ProcessEnv;
  execPath: string;
  execArgv: string[];
  argv: string[];
  cwd: string;
}

interface RelaunchOptions {
  filePath: string;
  args: string[];
  cwd: string;
  envAssignments?: Record<string, string>;
}

interface ElevationDeps {
  isElevated?: () => boolean;
  relaunch?: (options: RelaunchOptions) => void;
}

type SpawnSyncImpl = (
  command: string,
  args: readonly string[],
  options: {
    encoding: BufferEncoding;
    stdio?: "ignore" | "inherit";
  },
) => SpawnSyncReturns<string | null>;

function escapePowerShellLiteral(value: string): string {
  return value.replace(/'/g, "''");
}

function powerShellArrayLiteral(values: string[]): string {
  if (values.length === 0) {
    return "@()";
  }

  return `@(${values.map((value) => `'${escapePowerShellLiteral(value)}'`).join(", ")})`;
}

export function buildWindowsElevationCommand(options: RelaunchOptions): string {
  const assignments = Object.entries(options.envAssignments ?? {}).map(
    ([key, value]) => `$env:${key} = '${escapePowerShellLiteral(value)}'`,
  );

  const startProcess = [
    "Start-Process",
    `-FilePath '${escapePowerShellLiteral(options.filePath)}'`,
    `-WorkingDirectory '${escapePowerShellLiteral(options.cwd)}'`,
    `-ArgumentList ${powerShellArrayLiteral(options.args)}`,
    "-Verb RunAs",
  ].join(" ");

  return [...assignments, startProcess].join("; ");
}

export function isProcessElevated(
  platform: NodeJS.Platform,
  spawnSyncImpl: SpawnSyncImpl = spawnSync,
): boolean {
  if (platform !== "win32") {
    return true;
  }

  const result = spawnSyncImpl(
    WINDOWS_POWERSHELL_PATH,
    [
      "-NoLogo",
      "-NoProfile",
      "-NonInteractive",
      "-Command",
      WINDOWS_ELEVATION_CHECK_COMMAND,
    ],
    {
      encoding: "utf8",
    },
  );

  if (result.error || result.status !== 0) {
    return false;
  }

  const stdout = typeof result.stdout === "string" ? result.stdout : "";
  return stdout.trim().toLowerCase() === "true";
}

export function relaunchProcessElevated(
  options: RelaunchOptions,
  spawnSyncImpl: SpawnSyncImpl = spawnSync,
): void {
  const command = buildWindowsElevationCommand(options);
  const result = spawnSyncImpl(
    WINDOWS_POWERSHELL_PATH,
    ["-NoLogo", "-NoProfile", "-NonInteractive", "-Command", command],
    {
      encoding: "utf8",
      stdio: "inherit",
    },
  );

  if (result.error || result.status !== 0) {
    throw new Error(
      "TermiWeb 0.1 requires Windows elevation. The elevation request did not complete.",
    );
  }
}

export function relaunchProcessElevatedIfNeeded(
  processInfo: ProcessLaunchInfo,
  deps: ElevationDeps = {},
): boolean {
  if (
    processInfo.platform !== "win32" ||
    processInfo.env.TERMIWEB_SKIP_ELEVATION === "true"
  ) {
    return false;
  }

  const isElevated = deps.isElevated ?? (() => isProcessElevated(processInfo.platform));
  if (isElevated()) {
    return false;
  }

  const relaunch =
    deps.relaunch ??
    ((options: RelaunchOptions) => {
      relaunchProcessElevated(options);
    });

  relaunch({
    filePath: processInfo.execPath,
    args: [...processInfo.execArgv, ...processInfo.argv.slice(1)],
    cwd: processInfo.cwd,
    envAssignments: {
      TERMIWEB_ELEVATION_REQUESTED: "true",
    },
  });
  return true;
}
