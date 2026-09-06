import { describe, expect, it } from "vitest";

import { resolveBellReaction, resolveDocumentTitle } from "../../src/client/ui/bell.js";

const base = {
  sessionId: "a",
  activeSessionId: "a",
  soundEnabled: false,
  audioUnlocked: false,
  coarsePointer: false,
  reducedMotion: false,
  vibrationSupported: false,
};

describe("resolveBellReaction", () => {
  it("always flashes the card and flashes the frame only for the active instance", () => {
    expect(resolveBellReaction(base)).toEqual({
      flashCard: true,
      flashFrame: true,
      animate: true,
      playTone: false,
      vibrate: false,
    });
    expect(resolveBellReaction({ ...base, activeSessionId: "b" }).flashFrame).toBe(false);
    expect(resolveBellReaction({ ...base, activeSessionId: null }).flashFrame).toBe(false);
  });

  it("drops motion under the reduced-motion preference", () => {
    expect(resolveBellReaction({ ...base, reducedMotion: true }).animate).toBe(false);
  });

  it("plays the tone only when sound is on and audio is unlocked", () => {
    expect(resolveBellReaction({ ...base, soundEnabled: true }).playTone).toBe(false);
    expect(resolveBellReaction({ ...base, audioUnlocked: true }).playTone).toBe(false);
    expect(resolveBellReaction({ ...base, soundEnabled: true, audioUnlocked: true }).playTone).toBe(
      true,
    );
  });

  it("vibrates only on coarse-pointer devices with sound on and vibration available", () => {
    const coarse = { ...base, soundEnabled: true, coarsePointer: true, vibrationSupported: true };
    expect(resolveBellReaction(coarse).vibrate).toBe(true);
    expect(resolveBellReaction({ ...coarse, coarsePointer: false }).vibrate).toBe(false);
    expect(resolveBellReaction({ ...coarse, soundEnabled: false }).vibrate).toBe(false);
    expect(resolveBellReaction({ ...coarse, vibrationSupported: false }).vibrate).toBe(false);
  });
});

describe("resolveDocumentTitle", () => {
  it("prefixes a bell marker only while attention is pending", () => {
    expect(resolveDocumentTitle("TermiWeb v0.1.1", false)).toBe("TermiWeb v0.1.1");
    expect(resolveDocumentTitle("TermiWeb v0.1.1", true)).toBe("🔔 TermiWeb v0.1.1");
  });
});
