import { describe, expect, it } from "vitest";

import {
  applyModifiersToInput,
  createModifierState,
  terminalSequence,
  toggleModifier,
} from "../../src/client/ui/mobileControls.js";

describe("mobile control modifiers", () => {
  it("converts ctrl-letter combos into control characters", () => {
    const state = toggleModifier(createModifierState(), "ctrl");
    const result = applyModifiersToInput("c", state);

    expect(result.data).toBe("\u0003");
    expect(result.nextState.ctrl).toBe(false);
  });

  it("prefixes alt combos with escape", () => {
    const state = toggleModifier(createModifierState(), "alt");
    const result = applyModifiersToInput("f", state);

    expect(result.data).toBe("\u001bf");
    expect(result.nextState.alt).toBe(false);
  });

  it("provides terminal navigation sequences", () => {
    expect(terminalSequence("up")).toBe("\u001b[A");
    expect(terminalSequence("backspace")).toBe("\u007f");
    expect(terminalSequence("delete")).toBe("\u001b[3~");
  });
});
