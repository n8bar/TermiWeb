import { describe, expect, it } from "vitest";

import {
  buildDesktopViewportContent,
  computeDesktopViewportScale,
  DESKTOP_LAYOUT_VIEWPORT_WIDTH,
} from "../../src/client/ui/mobileViewport.js";

describe("mobile viewport helpers", () => {
  it("computes a desktop-style fit scale from the effective viewport width", () => {
    expect(
      computeDesktopViewportScale({
        effectiveViewportWidth: 412,
      }),
    ).toBe(0.402);
    expect(
      computeDesktopViewportScale({
        effectiveViewportWidth: 915,
      }),
    ).toBe(0.894);
  });

  it("returns null for unusable viewport dimensions", () => {
    expect(
      computeDesktopViewportScale({
        effectiveViewportWidth: 0,
      }),
    ).toBeNull();
  });

  it("builds viewport content with an explicit initial scale when provided", () => {
    expect(
      buildDesktopViewportContent({
        initialScale: 0.402,
      }),
    ).toBe(
      "width=1024, initial-scale=0.402, minimum-scale=0.1, maximum-scale=10.0, user-scalable=yes, viewport-fit=cover",
    );
  });

  it("can build viewport content without an initial scale override", () => {
    expect(
      buildDesktopViewportContent({
        layoutViewportWidth: DESKTOP_LAYOUT_VIEWPORT_WIDTH,
      }),
    ).toBe(
      "width=1024, minimum-scale=0.1, maximum-scale=10.0, user-scalable=yes, viewport-fit=cover",
    );
  });
});
