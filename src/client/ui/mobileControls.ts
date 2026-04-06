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
  | "up"
  | "down"
  | "left"
  | "right";

export interface TerminalControlButton {
  id: ModifierKey | TerminalControlAction | "copy" | "paste";
  label: string;
  kind: "modifier" | "sequence" | "clipboard";
}

export const mobileControlButtons: TerminalControlButton[] = [
  { id: "ctrl", label: "Ctrl", kind: "modifier" },
  { id: "alt", label: "Alt", kind: "modifier" },
  { id: "esc", label: "Esc", kind: "sequence" },
  { id: "tab", label: "Tab", kind: "sequence" },
  { id: "enter", label: "Enter", kind: "sequence" },
  { id: "up", label: "Up", kind: "sequence" },
  { id: "left", label: "Left", kind: "sequence" },
  { id: "down", label: "Down", kind: "sequence" },
  { id: "right", label: "Right", kind: "sequence" },
  { id: "backspace", label: "Bksp", kind: "sequence" },
  { id: "copy", label: "Copy", kind: "clipboard" },
  { id: "paste", label: "Paste", kind: "clipboard" },
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
