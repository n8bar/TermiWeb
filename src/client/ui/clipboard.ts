function createClipboardUnavailableError(): Error {
  const error = new Error("Clipboard API unavailable and fallback copy failed.");
  error.name = "ClipboardUnavailableError";
  return error;
}

function createClipboardReadUnavailableError(): Error {
  const error = new Error("Clipboard API unavailable and fallback paste failed.");
  error.name = "ClipboardReadUnavailableError";
  return error;
}

function restoreFocusedElement(element: Element | null): void {
  if (!(element instanceof HTMLElement)) {
    return;
  }

  element.focus();
}

export function tryExecCommandCopy(documentObject: Document, text: string): boolean {
  if (!documentObject.body) {
    return false;
  }

  const activeElement = documentObject.activeElement;
  const textarea = documentObject.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.setAttribute("aria-hidden", "true");
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "0";
  textarea.style.width = "1px";
  textarea.style.height = "1px";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";

  documentObject.body.append(textarea);
  textarea.focus();
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);

  const execCommand = (
    documentObject as Document & {
      execCommand?: (commandId: string) => boolean;
    }
  ).execCommand;
  const copied = execCommand?.call(documentObject, "copy") === true;

  textarea.remove();
  restoreFocusedElement(activeElement);
  return copied;
}

export function tryExecCommandPaste(documentObject: Document): string | null {
  if (!documentObject.body) {
    return null;
  }

  const activeElement = documentObject.activeElement;
  const textarea = documentObject.createElement("textarea");
  textarea.setAttribute("aria-hidden", "true");
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "0";
  textarea.style.width = "1px";
  textarea.style.height = "1px";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";

  documentObject.body.append(textarea);
  textarea.focus();
  textarea.select();

  const execCommand = (
    documentObject as Document & {
      execCommand?: (commandId: string) => boolean;
    }
  ).execCommand;
  const pasted = execCommand?.call(documentObject, "paste") === true;
  const text = pasted ? textarea.value : null;

  textarea.remove();
  restoreFocusedElement(activeElement);
  return text;
}

export async function copyTextToClipboard(options: {
  text: string;
  documentObject: Document;
  navigatorClipboard?: {
    writeText(text: string): Promise<void>;
  };
}): Promise<"clipboard-api" | "exec-command"> {
  const clipboard = options.navigatorClipboard;

  if (clipboard?.writeText) {
    try {
      await clipboard.writeText(options.text);
      return "clipboard-api";
    } catch (error) {
      if (tryExecCommandCopy(options.documentObject, options.text)) {
        return "exec-command";
      }

      throw error;
    }
  }

  if (tryExecCommandCopy(options.documentObject, options.text)) {
    return "exec-command";
  }

  throw createClipboardUnavailableError();
}

export async function readTextFromClipboard(options: {
  documentObject: Document;
  navigatorClipboard?: {
    readText(): Promise<string>;
  };
}): Promise<{
  text: string;
  mechanism: "clipboard-api" | "exec-command";
}> {
  const clipboard = options.navigatorClipboard;

  if (clipboard?.readText) {
    try {
      return {
        text: await clipboard.readText(),
        mechanism: "clipboard-api",
      };
    } catch (error) {
      const fallbackText = tryExecCommandPaste(options.documentObject);
      if (fallbackText !== null) {
        return {
          text: fallbackText,
          mechanism: "exec-command",
        };
      }

      throw error;
    }
  }

  const fallbackText = tryExecCommandPaste(options.documentObject);
  if (fallbackText !== null) {
    return {
      text: fallbackText,
      mechanism: "exec-command",
    };
  }

  throw createClipboardReadUnavailableError();
}
