export const terminalInputAttributeEntries = [
  ["autocapitalize", "off"],
  ["autocomplete", "off"],
  ["autocorrect", "off"],
  ["enterkeyhint", "enter"],
  ["spellcheck", "false"],
  ["aria-autocomplete", "none"],
  ["data-form-type", "other"],
  ["data-lpignore", "true"],
  ["data-1p-ignore", "true"],
  ["data-protonpass-ignore", "true"],
  ["data-gramm", "false"],
  ["data-gramm_editor", "false"],
  ["data-enable-grammarly", "false"],
] as const;

export const terminalMobileCaptureInputAttributeEntries = [
  ["type", "url"],
  ["autocapitalize", "none"],
  ["autocomplete", "off"],
  ["autocorrect", "off"],
  ["enterkeyhint", "enter"],
  ["inputmode", "url"],
  ["name", "termiweb-terminal-capture"],
  ["readonly", "readonly"],
  ["spellcheck", "false"],
  ["aria-autocomplete", "none"],
  ["data-form-type", "other"],
  ["data-lpignore", "true"],
  ["data-1p-ignore", "true"],
  ["data-bwignore", "true"],
  ["data-protonpass-ignore", "true"],
  ["data-ms-editor", "false"],
  ["data-gramm", "false"],
  ["data-gramm_editor", "false"],
  ["data-enable-grammarly", "false"],
] as const;

export function applyTerminalInputAttributes(
  input: Pick<HTMLInputElement | HTMLTextAreaElement, "setAttribute" | "spellcheck">,
): void {
  input.spellcheck = false;

  for (const [name, value] of terminalInputAttributeEntries) {
    input.setAttribute(name, value);
  }
}

export function applyTerminalMobileCaptureInputAttributes(
  input: Pick<HTMLInputElement, "setAttribute" | "spellcheck">,
): void {
  input.spellcheck = false;

  for (const [name, value] of terminalMobileCaptureInputAttributeEntries) {
    input.setAttribute(name, value);
  }
}
