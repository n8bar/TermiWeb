import { describe, expect, it } from "vitest";

import { resolveConfig } from "../../src/server/config.js";

describe("resolveConfig", () => {
  it("defaults to LAN binding when allow-lan is omitted", () => {
    const config = resolveConfig({
      TERMIWEB_PASSWORD: "let-me-in",
    });

    expect(config.allowLan).toBe(true);
    expect(config.host).toBe("0.0.0.0");
  });

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

  it("defaults to a fixed 80-column terminal width", () => {
    const config = resolveConfig({
      TERMIWEB_PASSWORD: "let-me-in",
    });

    expect(config.fixedCols).toBe(80);
  });

  it("uses the stable default session cookie name on the default port", () => {
    const config = resolveConfig({
      TERMIWEB_PASSWORD: "let-me-in",
    });

    expect(config.sessionCookieName).toBe("termiweb_session");
  });

  it("derives a distinct session cookie name from a nondefault port", () => {
    const config = resolveConfig({
      TERMIWEB_PORT: "32443",
      TERMIWEB_PASSWORD: "let-me-in",
    });

    expect(config.sessionCookieName).toBe("termiweb_session_32443");
  });

  it("allows an explicit session cookie override", () => {
    const config = resolveConfig({
      TERMIWEB_PORT: "32443",
      TERMIWEB_SESSION_COOKIE_NAME: "repo_checkout_session",
      TERMIWEB_PASSWORD: "let-me-in",
    });

    expect(config.sessionCookieName).toBe("repo_checkout_session");
  });
});
