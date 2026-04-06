import fs from "node:fs";
import path from "node:path";

const POWERSHELL_7_DEFAULT_PATH = "C:\\Program Files\\PowerShell\\7\\pwsh.exe";
const FALLBACK_SHELLS = ["pwsh.exe", "pwsh", "powershell.exe", "powershell"];

function pathExtensions(): string[] {
  const configured = process.env.PATHEXT;
  if (!configured) {
    return [".exe", ".cmd", ".bat", ".com"];
  }

  return configured.split(";").filter(Boolean);
}

function hasPathSeparator(command: string): boolean {
  return command.includes("\\") || command.includes("/") || path.isAbsolute(command);
}

export function executableExists(command: string, pathValue = process.env.PATH ?? ""): boolean {
  if (!command) {
    return false;
  }

  if (hasPathSeparator(command)) {
    return fs.existsSync(command);
  }

  const entries = pathValue.split(";").filter(Boolean);
  const extensions = path.extname(command) ? [""] : pathExtensions();

  for (const entry of entries) {
    for (const extension of extensions) {
      if (fs.existsSync(path.join(entry, `${command}${extension}`))) {
        return true;
      }
    }
  }

  return false;
}

export function resolveShellCommand(
  preferred: string | undefined,
  pathValue = process.env.PATH ?? "",
  exists: (command: string, pathValue: string) => boolean = executableExists,
): string {
  if (preferred && exists(preferred, pathValue)) {
    return preferred;
  }

  if (exists("pwsh.exe", pathValue)) {
    return "pwsh.exe";
  }

  if (exists("pwsh", pathValue)) {
    return "pwsh";
  }

  if (preferred !== POWERSHELL_7_DEFAULT_PATH && exists(POWERSHELL_7_DEFAULT_PATH, pathValue)) {
    return POWERSHELL_7_DEFAULT_PATH;
  }

  for (const candidate of FALLBACK_SHELLS) {
    if (candidate === "pwsh.exe" || candidate === "pwsh") {
      continue;
    }

    if (exists(candidate, pathValue)) {
      return candidate;
    }
  }

  return preferred ?? "powershell.exe";
}
