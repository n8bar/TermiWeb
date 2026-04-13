import { describe, expect, it } from "vitest";

import { getDisplaySessionTitle } from "../../src/client/ui/sessionTitle.js";

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
