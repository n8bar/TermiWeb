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

export function applyTerminalInputAttributes(
  textarea: Pick<HTMLTextAreaElement, "setAttribute" | "spellcheck">,
): void {
  textarea.spellcheck = false;

  for (const [name, value] of terminalInputAttributeEntries) {
    textarea.setAttribute(name, value);
  }
}
