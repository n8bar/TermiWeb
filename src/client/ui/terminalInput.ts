export const terminalInputAttributeEntries = [
  ["autocapitalize", "off"],
  ["autocomplete", "off"],
  ["autocorrect", "off"],
  ["spellcheck", "false"],
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
