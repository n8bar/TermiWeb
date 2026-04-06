import { describe, expect, it } from "vitest";

import { resolveConfig } from "../../src/server/config.js";

describe("resolveConfig", () => {
  it("uses the LAN host when allow-lan is enabled and host is blank", () => {
    const config = resolveConfig({
      TERMIWEB_HOST: "",
      TERMIWEB_ALLOW_LAN: "true",
      TERMIWEB_PASSWORD: "let-me-in",
    });

    expect(config.host).toBe("0.0.0.0");
  });

  it("prefers an explicit host over the allow-lan default", () => {
    const config = resolveConfig({
      TERMIWEB_HOST: "192.168.68.68",
      TERMIWEB_ALLOW_LAN: "true",
      TERMIWEB_PASSWORD: "let-me-in",
    });

    expect(config.host).toBe("192.168.68.68");
  });
});
