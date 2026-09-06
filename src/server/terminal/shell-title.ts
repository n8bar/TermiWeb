import { MAX_SESSION_TITLE_LENGTH } from "../../shared/protocol.js";

const controlCharacterPattern = /[\u0000-\u001f\u007f-\u009f]/g;

/**
 * Normalizes a title payload from an OSC 0 / OSC 2 sequence before it is stored
 * or broadcast. Control characters are stripped, the result is trimmed and
 * clamped to the session title bound, and an empty result becomes null so the
 * workspace default applies.
 */
export function sanitizeShellTitle(raw: string): string | null {
  const stripped = raw.replace(controlCharacterPattern, "").trim();
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
