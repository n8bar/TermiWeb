export type ModifierMode = "off" | "armed" | "locked";

export interface ModifierState {
  ctrl: ModifierMode;
  alt: ModifierMode;
}

export type ModifierKey = keyof ModifierState;

export type TerminalControlAction =
  | "esc"
  | "tab"
  | "enter"
  | "backspace"
  | "delete"
  | "home"
  | "end"
  | "up"
  | "down"
  | "left"
  | "right";

export interface TerminalControlButton {
  id: ModifierKey | TerminalControlAction | "copy" | "paste" | "select";
  label: string;
  kind: "modifier" | "sequence" | "clipboard" | "mode";
  group: "main" | "arrow";
}

export interface TerminalSequenceOptions {
  applicationCursorKeysMode?: boolean;
  includeHomeEndFallback?: boolean;
}

export const mobileControlButtons: TerminalControlButton[] = [
  { id: "esc", label: "Esc", kind: "sequence", group: "main" },
  { id: "backspace", label: "Bksp", kind: "sequence", group: "main" },
  { id: "delete", label: "Del", kind: "sequence", group: "main" },
  { id: "home", label: "Home", kind: "sequence", group: "arrow" },
  { id: "up", label: "↑", kind: "sequence", group: "arrow" },
  { id: "end", label: "End", kind: "sequence", group: "arrow" },
  { id: "tab", label: "Tab", kind: "sequence", group: "main" },
  { id: "select", label: "Select", kind: "mode", group: "main" },
  { id: "copy", label: "Copy", kind: "clipboard", group: "main" },
  { id: "left", label: "←", kind: "sequence", group: "arrow" },
  { id: "down", label: "↓", kind: "sequence", group: "arrow" },
  { id: "right", label: "→", kind: "sequence", group: "arrow" },
  { id: "ctrl", label: "Ctrl", kind: "modifier", group: "main" },
  { id: "alt", label: "Alt", kind: "modifier", group: "main" },
  { id: "paste", label: "Paste", kind: "clipboard", group: "main" },
  { id: "enter", label: "Enter", kind: "sequence", group: "main" },
];

const CONTROL_CHAR_MAP: Record<string, string> = {
  "@": "\u0000",
  " ": "\u0000",
  "[": "\u001b",
  "\\": "\u001c",
  "]": "\u001d",
  "^": "\u001e",
  "_": "\u001f",
  "?": "\u007f",
};

const SEQUENCES: Record<TerminalControlAction, string> = {
  esc: "\u001b",
  tab: "\t",
  enter: "\r",
  backspace: "\u007f",
  delete: "\u001b[3~",
  home: "\u001b[H",
  end: "\u001b[F",
  up: "\u001b[A",
  down: "\u001b[B",
  right: "\u001b[C",
  left: "\u001b[D",
};

export function createModifierState(): ModifierState {
  return {
    ctrl: "off",
    alt: "off",
  };
}

export function advanceModifierState(
  state: ModifierState,
  modifier: ModifierKey,
  isDoubleTap: boolean,
): ModifierState {
  const current = state[modifier];
  let next: ModifierMode;

  if (current === "locked") {
    next = "off";
  } else if (current === "armed") {
    next = isDoubleTap ? "locked" : "off";
  } else {
    next = "armed";
  }

  return {
    ...state,
    [modifier]: next,
  };
}

export function terminalSequence(
  action: TerminalControlAction,
  options: TerminalSequenceOptions = {},
): string {
  const applicationCursorKeysMode = options.applicationCursorKeysMode ?? false;
  const includeHomeEndFallback = options.includeHomeEndFallback ?? false;

  let sequence = SEQUENCES[action];

  if (applicationCursorKeysMode) {
    switch (action) {
      case "home":
        sequence = "\u001bOH";
        break;
      case "end":
        sequence = "\u001bOF";
        break;
      case "up":
        sequence = "\u001bOA";
        break;
      case "down":
        sequence = "\u001bOB";
        break;
      case "right":
        sequence = "\u001bOC";
        break;
      case "left":
        sequence = "\u001bOD";
        break;
      default:
        break;
    }
  }

  if (includeHomeEndFallback && (action === "home" || action === "end")) {
    const fallback = applicationCursorKeysMode
      ? SEQUENCES[action]
      : action === "home"
        ? "\u001bOH"
        : "\u001bOF";

    if (fallback !== sequence) {
      return `${sequence}${fallback}`;
    }
  }

  return sequence;
}

export function applyModifiersToInput(
  data: string,
  state: ModifierState,
): { data: string; nextState: ModifierState } {
  const ctrlActive = state.ctrl !== "off";
  const altActive = state.alt !== "off";

  if (!ctrlActive && !altActive) {
    return {
      data,
      nextState: state,
    };
  }

  let transformed = data;
  if (ctrlActive && data.length === 1) {
    const lowered = data.toLowerCase();
    if (lowered >= "a" && lowered <= "z") {
      transformed = String.fromCharCode(lowered.charCodeAt(0) - 96);
    } else if (CONTROL_CHAR_MAP[lowered]) {
      transformed = CONTROL_CHAR_MAP[lowered];
    }
  }

  if (altActive) {
    transformed = `\u001b${transformed}`;
  }

  return {
    data: transformed,
    nextState: {
      ctrl: state.ctrl === "armed" ? "off" : state.ctrl,
      alt: state.alt === "armed" ? "off" : state.alt,
    },
  };
}
