import { describe, expect, it } from "vitest";

import {
  getDisplaySessionTitle,
  resolveDisplayedSessionTitle,
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
