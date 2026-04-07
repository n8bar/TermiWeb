export interface ModifierState {
  ctrl: boolean;
  alt: boolean;
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

export const mobileControlButtons: TerminalControlButton[] = [
  { id: "ctrl", label: "Ctrl", kind: "modifier", group: "main" },
  { id: "alt", label: "Alt", kind: "modifier", group: "main" },
  { id: "esc", label: "Esc", kind: "sequence", group: "main" },
  { id: "tab", label: "Tab", kind: "sequence", group: "main" },
  { id: "enter", label: "Enter", kind: "sequence", group: "main" },
  { id: "backspace", label: "Bksp", kind: "sequence", group: "main" },
  { id: "delete", label: "Del", kind: "sequence", group: "main" },
  { id: "select", label: "Select", kind: "mode", group: "main" },
  { id: "copy", label: "Copy", kind: "clipboard", group: "main" },
  { id: "paste", label: "Paste", kind: "clipboard", group: "main" },
  { id: "home", label: "Home", kind: "sequence", group: "arrow" },
  { id: "up", label: "↑", kind: "sequence", group: "arrow" },
  { id: "end", label: "End", kind: "sequence", group: "arrow" },
  { id: "left", label: "←", kind: "sequence", group: "arrow" },
  { id: "down", label: "↓", kind: "sequence", group: "arrow" },
  { id: "right", label: "→", kind: "sequence", group: "arrow" },
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
    ctrl: false,
    alt: false,
  };
}

export function toggleModifier(
  state: ModifierState,
  modifier: ModifierKey,
): ModifierState {
  return {
    ...state,
    [modifier]: !state[modifier],
  };
}

export function resetModifiers(): ModifierState {
  return createModifierState();
}

export function terminalSequence(action: TerminalControlAction): string {
  return SEQUENCES[action];
}

export function applyModifiersToInput(
  data: string,
  state: ModifierState,
): { data: string; nextState: ModifierState } {
  if (!state.ctrl && !state.alt) {
    return {
      data,
      nextState: state,
    };
  }

  let transformed = data;
  if (state.ctrl && data.length === 1) {
    const lowered = data.toLowerCase();
    if (lowered >= "a" && lowered <= "z") {
      transformed = String.fromCharCode(lowered.charCodeAt(0) - 96);
    } else if (CONTROL_CHAR_MAP[lowered]) {
      transformed = CONTROL_CHAR_MAP[lowered];
    }
  }

  if (state.alt) {
    transformed = `\u001b${transformed}`;
  }

  return {
    data: transformed,
    nextState: resetModifiers(),
  };
}
