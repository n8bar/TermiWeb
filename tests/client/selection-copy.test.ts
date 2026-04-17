import { describe, expect, it } from "vitest";

import {
  getExplicitSelectionText,
  getTextareaSelection,
  isClipboardCopyShortcut,
} from "../../src/client/ui/selectionCopy.js";

describe("selection copy helpers", () => {
  it("returns textarea selection only when a real range is highlighted", () => {
    expect(getTextareaSelection("abcdef", 1, 4)).toBe("bcd");
    expect(getTextareaSelection("abcdef", 2, 2)).toBe("");
    expect(getTextareaSelection("abcdef", null, 2)).toBe("");
  });

  it("prefers highlighted textarea text while selection mode is open", () => {
    expect(
      getExplicitSelectionText({
        terminalSelection: "terminal text",
        textareaValue: "snapshot text",
        textareaSelectionStart: 0,
        textareaSelectionEnd: 8,
        selectionMode: true,
      }),
    ).toBe("snapshot");
  });

  it("uses terminal selection outside selection mode before textarea selection", () => {
    expect(
      getExplicitSelectionText({
        terminalSelection: "terminal text",
        textareaValue: "snapshot text",
        textareaSelectionStart: 0,
        textareaSelectionEnd: 8,
        selectionMode: false,
      }),
    ).toBe("terminal text");
  });

  it("detects the copy shortcut only for plain ctrl or meta plus c", () => {
    expect(
      isClipboardCopyShortcut({
        key: "c",
        ctrlKey: true,
        metaKey: false,
        altKey: false,
        shiftKey: false,
      }),
    ).toBe(true);

    expect(
      isClipboardCopyShortcut({
        key: "C",
        ctrlKey: false,
        metaKey: true,
        altKey: false,
        shiftKey: false,
      }),
    ).toBe(true);

    expect(
      isClipboardCopyShortcut({
        key: "c",
        ctrlKey: true,
        metaKey: false,
        altKey: false,
        shiftKey: true,
      }),
    ).toBe(false);

    expect(
      isClipboardCopyShortcut({
        key: "v",
        ctrlKey: true,
        metaKey: false,
        altKey: false,
        shiftKey: false,
      }),
    ).toBe(false);
  });
});
