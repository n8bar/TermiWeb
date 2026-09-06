import { describe, expect, it } from "vitest";

import {
  getDisplaySessionTitle,
  resolveDisplayedSessionTitle,
  resolveTitleScroll,
} from "../../src/client/ui/sessionTitle.js";

describe("getDisplaySessionTitle", () => {
  it("keeps the full title when the sidebar is expanded", () => {
    expect(getDisplaySessionTitle("Instance 12", false)).toBe("Instance 12");
  });

  it("shows only the number for auto-named instances when collapsed", () => {
    expect(getDisplaySessionTitle("Instance 12", true)).toBe("12");
  });

  it("leaves custom titles unchanged when collapsed", () => {
    expect(getDisplaySessionTitle("CryptoZing", true)).toBe("CryptoZing");
  });
});

describe("resolveDisplayedSessionTitle", () => {
  it("prefers a non-empty shell title over the workspace default", () => {
    expect(
      resolveDisplayedSessionTitle({ title: "Instance 2", shellTitle: "build watcher" }),
    ).toBe("build watcher");
  });

  it("falls back to the workspace default when no shell title has been seen", () => {
    expect(resolveDisplayedSessionTitle({ title: "Instance 2", shellTitle: null })).toBe(
      "Instance 2",
    );
    expect(resolveDisplayedSessionTitle({ title: "Instance 2" })).toBe("Instance 2");
  });

  it("falls back to the workspace default when the shell cleared the title", () => {
    expect(resolveDisplayedSessionTitle({ title: "Instance 2", shellTitle: "" })).toBe(
      "Instance 2",
    );
    expect(resolveDisplayedSessionTitle({ title: "Instance 2", shellTitle: "   " })).toBe(
      "Instance 2",
    );
  });
});

describe("resolveTitleScroll", () => {
  it("scrolls an overflowing title on a coarse-pointer device", () => {
    expect(
      resolveTitleScroll({ contentWidth: 520, slotWidth: 200, coarsePointer: true, reducedMotion: false }),
    ).toEqual({ distancePx: 320, durationMs: 8000 });
  });

  it("never travels faster than the minimum duration allows", () => {
    expect(
      resolveTitleScroll({ contentWidth: 210, slotWidth: 200, coarsePointer: true, reducedMotion: false }),
    ).toEqual({ distancePx: 10, durationMs: 2500 });
  });

  it("does not move a title that fits", () => {
    expect(
      resolveTitleScroll({ contentWidth: 180, slotWidth: 200, coarsePointer: true, reducedMotion: false }),
    ).toBeNull();
    expect(
      resolveTitleScroll({ contentWidth: 200, slotWidth: 200, coarsePointer: true, reducedMotion: false }),
    ).toBeNull();
  });

  it("leaves the ellipsis alone on fine-pointer devices and under reduced motion", () => {
    expect(
      resolveTitleScroll({ contentWidth: 520, slotWidth: 200, coarsePointer: false, reducedMotion: false }),
    ).toBeNull();
    expect(
      resolveTitleScroll({ contentWidth: 520, slotWidth: 200, coarsePointer: true, reducedMotion: true }),
    ).toBeNull();
  });
});
