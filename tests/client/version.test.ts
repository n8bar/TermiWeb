import { describe, expect, it } from "vitest";

import { toDisplayVersion } from "../../src/client/ui/version.js";

describe("display version", () => {
  it("reduces semantic versions to major.minor for the UI badge", () => {
    expect(toDisplayVersion("0.1.0")).toBe("0.1");
    expect(toDisplayVersion("1.4.7")).toBe("1.4");
  });

  it("falls back to the raw value when a minor version is not present", () => {
    expect(toDisplayVersion("2")).toBe("2");
    expect(toDisplayVersion(" 3 ")).toBe("3");
  });
});
