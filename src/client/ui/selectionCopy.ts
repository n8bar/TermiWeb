export function getTextareaSelection(
  value: string,
  selectionStart: number | null,
  selectionEnd: number | null,
): string {
  if (
    typeof selectionStart !== "number" ||
    typeof selectionEnd !== "number" ||
    selectionStart === selectionEnd
  ) {
    return "";
  }

  return value.slice(selectionStart, selectionEnd);
}

export function getExplicitSelectionText(options: {
  terminalSelection: string;
  textareaValue: string;
  textareaSelectionStart: number | null;
  textareaSelectionEnd: number | null;
  selectionMode: boolean;
}): string {
  const textareaSelection = getTextareaSelection(
    options.textareaValue,
    options.textareaSelectionStart,
    options.textareaSelectionEnd,
  );

  if (options.selectionMode && textareaSelection) {
    return textareaSelection;
  }

  return options.terminalSelection || textareaSelection;
}

export function isClipboardCopyShortcut(options: {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
}): boolean {
  return (
    (options.ctrlKey || options.metaKey) &&
    !options.altKey &&
    !options.shiftKey &&
    options.key.toLowerCase() === "c"
  );
}
