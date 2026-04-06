import fs from "node:fs";
import path from "node:path";

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

  for (const candidate of FALLBACK_SHELLS) {
    if (exists(candidate, pathValue)) {
      return candidate;
    }
  }

  return preferred ?? "powershell.exe";
}
