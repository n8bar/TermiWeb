import { describe, expect, it } from "vitest";

import {
  advanceModifierState,
  applyModifiersToInput,
  createModifierState,
  mobileControlButtons,
  terminalSequence,
} from "../../src/client/ui/mobileControls.js";

describe("mobile control modifiers", () => {
  it("arms a modifier on first tap, locks it on double tap, and clears it on the next tap", () => {
    const armed = advanceModifierState(createModifierState(), "ctrl", false);
    expect(armed.ctrl).toBe("armed");

    const locked = advanceModifierState(armed, "ctrl", true);
    expect(locked.ctrl).toBe("locked");

    const cleared = advanceModifierState(locked, "ctrl", false);
    expect(cleared.ctrl).toBe("off");
  });

  it("clears an armed modifier when it is tapped again without a double tap", () => {
    const armed = advanceModifierState(createModifierState(), "alt", false);
    const cleared = advanceModifierState(armed, "alt", false);

    expect(cleared.alt).toBe("off");
  });

  it("converts ctrl-letter combos into control characters", () => {
    const state = advanceModifierState(createModifierState(), "ctrl", false);
    const result = applyModifiersToInput("c", state);

    expect(result.data).toBe("\u0003");
    expect(result.nextState.ctrl).toBe("off");
  });

  it("prefixes alt combos with escape", () => {
    const state = advanceModifierState(createModifierState(), "alt", false);
    const result = applyModifiersToInput("f", state);

    expect(result.data).toBe("\u001bf");
    expect(result.nextState.alt).toBe("off");
  });

  it("keeps locked modifiers active after use", () => {
    const locked = advanceModifierState(
      advanceModifierState(createModifierState(), "ctrl", false),
      "ctrl",
      true,
    );
    const result = applyModifiersToInput("c", locked);

    expect(result.data).toBe("\u0003");
    expect(result.nextState.ctrl).toBe("locked");
  });

  it("provides terminal navigation sequences", () => {
    expect(terminalSequence("home")).toBe("\u001b[H");
    expect(terminalSequence("up")).toBe("\u001b[A");
    expect(terminalSequence("end")).toBe("\u001b[F");
    expect(terminalSequence("backspace")).toBe("\u007f");
    expect(terminalSequence("delete")).toBe("\u001b[3~");
  });

  it("switches navigation sequences when application cursor keys mode is active", () => {
    expect(terminalSequence("home", { applicationCursorKeysMode: true })).toBe("\u001bOH");
    expect(terminalSequence("up", { applicationCursorKeysMode: true })).toBe("\u001bOA");
    expect(terminalSequence("end", { applicationCursorKeysMode: true })).toBe("\u001bOF");
    expect(terminalSequence("left", { applicationCursorKeysMode: true })).toBe("\u001bOD");
    expect(terminalSequence("right", { applicationCursorKeysMode: true })).toBe("\u001bOC");
  });

  it("keeps the touch-control order aligned with the intended three-row layout", () => {
    expect(mobileControlButtons.map((button) => button.id)).toEqual([
      "esc",
      "backspace",
      "delete",
      "home",
      "up",
      "end",
      "tab",
      "select",
      "copy",
      "left",
      "down",
      "right",
      "ctrl",
      "alt",
      "paste",
      "enter",
    ]);
  });
});
