import { MAX_SESSION_TITLE_LENGTH } from "../../shared/protocol.js";

const controlCharacterPattern = /[\u0000-\u001f\u007f-\u009f]/g;

/**
 * Normalizes a title payload from an OSC 0 / OSC 2 sequence before it is stored
 * or broadcast. Control characters are stripped, the result is trimmed and
 * clamped to the session title bound, and an empty result becomes null so the
 * workspace default applies.
 */
export function sanitizeShellTitle(raw: string): string | null {
  const stripped = stripShellTitle(raw);
  let clamped = "";
  for (const codePoint of stripped) {
    if (clamped.length + codePoint.length > MAX_SESSION_TITLE_LENGTH) {
      break;
    }

    clamped += codePoint;
  }

  const result = clamped.trimEnd();
  return result.length > 0 ? result : null;
}

function stripShellTitle(raw: string): string {
  return raw.replace(controlCharacterPattern, "").trim();
}

/**
 * The title a session should carry after a shell reports `raw`: null when the
 * report only names the shell itself, otherwise the sanitized, clamped text.
 * The default-title check runs on the unclamped text, because an elevated
 * Windows PowerShell path is longer than the title bound and would otherwise
 * lose the executable name that identifies it.
 */
export function resolveShellTitle(raw: string, shellCommand: string): string | null {
  if (isDefaultConsoleTitle(stripShellTitle(raw), shellCommand)) {
    return null;
  }

  return sanitizeShellTitle(raw);
}

const stockConsoleTitles = new Set(["windows powershell", "powershell", "command prompt", "cmd"]);

function executableName(command: string): string {
  const base = command.trim().split(/[\\/]/).pop() ?? command;
  return base.replace(/\.exe$/i, "").toLowerCase();
}

/**
 * True when a title only names the shell itself: the shell executable's name or
 * path, with or without the `Administrator: ` prefix, or a stock Windows console
 * title. ConPTY emits the console's default title when the shell starts and
 * again when a program hands the console back, and that value says nothing the
 * shell label does not already show, so it counts as no title.
 */
export function isDefaultConsoleTitle(title: string, shellCommand: string): boolean {
  const stripped = title.replace(/^administrator:\s*/i, "").trim();
  if (stripped.length === 0) {
    return true;
  }

  if (stockConsoleTitles.has(stripped.toLowerCase())) {
    return true;
  }

  return executableName(stripped) === executableName(shellCommand);
}
