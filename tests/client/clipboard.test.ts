// @vitest-environment jsdom

import { describe, expect, it, vi } from "vitest";

import {
  copyTextToClipboard,
  readTextFromClipboard,
  tryExecCommandCopy,
  tryExecCommandPaste,
} from "../../src/client/ui/clipboard.js";

describe("clipboard helpers", () => {
  it("uses the Clipboard API when available", async () => {
    const writeText = vi.fn(async () => undefined);
    const execCommand = vi.fn(() => true);
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: execCommand,
    });

    const result = await copyTextToClipboard({
      text: "copied text",
      documentObject: document,
      navigatorClipboard: {
        writeText,
      },
    });

    expect(result).toBe("clipboard-api");
    expect(writeText).toHaveBeenCalledWith("copied text");
    expect(execCommand).not.toHaveBeenCalled();
  });

  it("falls back to execCommand copy when the Clipboard API is unavailable", async () => {
    const execCommand = vi.fn(() => true);
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: execCommand,
    });

    const result = await copyTextToClipboard({
      text: "copied text",
      documentObject: document,
    });

    expect(result).toBe("exec-command");
    expect(execCommand).toHaveBeenCalledWith("copy");
  });

  it("falls back to execCommand copy when writeText rejects", async () => {
    const writeText = vi.fn(async () => {
      throw new TypeError("Clipboard unavailable");
    });
    const execCommand = vi.fn(() => true);
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: execCommand,
    });

    const result = await copyTextToClipboard({
      text: "copied text",
      documentObject: document,
      navigatorClipboard: {
        writeText,
      },
    });

    expect(result).toBe("exec-command");
    expect(writeText).toHaveBeenCalledWith("copied text");
    expect(execCommand).toHaveBeenCalledWith("copy");
  });

  it("reports failure when both clipboard paths are unavailable", async () => {
    const execCommand = vi.fn(() => false);
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: execCommand,
    });

    await expect(
      copyTextToClipboard({
        text: "copied text",
        documentObject: document,
      }),
    ).rejects.toMatchObject({
      name: "ClipboardUnavailableError",
    });
  });

  it("returns false when execCommand copy cannot run", () => {
    const orphanDocument = document.implementation.createHTMLDocument("orphan");
    orphanDocument.body.remove();

    expect(tryExecCommandCopy(orphanDocument, "copied text")).toBe(false);
  });

  it("uses the Clipboard API for paste when available", async () => {
    const readText = vi.fn(async () => "pasted text");
    const execCommand = vi.fn(() => true);
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: execCommand,
    });

    const result = await readTextFromClipboard({
      documentObject: document,
      navigatorClipboard: {
        readText,
      },
    });

    expect(result).toEqual({
      text: "pasted text",
      mechanism: "clipboard-api",
    });
    expect(execCommand).not.toHaveBeenCalled();
  });

  it("falls back to execCommand paste when the Clipboard API is unavailable", async () => {
    const execCommand = vi.fn((commandId: string) => {
      if (commandId !== "paste" || !(document.activeElement instanceof HTMLTextAreaElement)) {
        return false;
      }

      document.activeElement.value = "pasted text";
      return true;
    });
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: execCommand,
    });

    const result = await readTextFromClipboard({
      documentObject: document,
    });

    expect(result).toEqual({
      text: "pasted text",
      mechanism: "exec-command",
    });
  });

  it("falls back to execCommand paste when readText rejects", async () => {
    const readText = vi.fn(async () => {
      throw new TypeError("Clipboard unavailable");
    });
    const execCommand = vi.fn((commandId: string) => {
      if (commandId !== "paste" || !(document.activeElement instanceof HTMLTextAreaElement)) {
        return false;
      }

      document.activeElement.value = "pasted text";
      return true;
    });
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: execCommand,
    });

    const result = await readTextFromClipboard({
      documentObject: document,
      navigatorClipboard: {
        readText,
      },
    });

    expect(result).toEqual({
      text: "pasted text",
      mechanism: "exec-command",
    });
  });

  it("reports failure when both paste paths are unavailable", async () => {
    const execCommand = vi.fn(() => false);
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: execCommand,
    });

    await expect(
      readTextFromClipboard({
        documentObject: document,
      }),
    ).rejects.toMatchObject({
      name: "ClipboardReadUnavailableError",
    });
  });

  it("returns null when execCommand paste cannot run", () => {
    const orphanDocument = document.implementation.createHTMLDocument("orphan");
    orphanDocument.body.remove();

    expect(tryExecCommandPaste(orphanDocument)).toBeNull();
  });
});
