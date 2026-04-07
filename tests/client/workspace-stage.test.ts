import { describe, expect, it } from "vitest";

import {
  computeStageLayout,
  resolveEffectiveViewportWidth,
  shouldAutoCollapseSidebar,
} from "../../src/client/ui/workspaceStage.js";

describe("workspace stage layout", () => {
  it("fills the available area when it already meets the minimum aspect ratio", () => {
    const layout = computeStageLayout({
      availableWidth: 1200,
      availableHeight: 720,
    });

    expect(layout.scale).toBe(1);
    expect(layout.baseWidth).toBe(1200);
    expect(layout.baseHeight).toBe(720);
    expect(layout.renderedHeight).toBe(720);
    expect(layout.slackHeight).toBe(0);
  });

  it("scales the stage down when the available area is narrower than 4:3", () => {
    const layout = computeStageLayout({
      availableWidth: 600,
      availableHeight: 900,
    });

    expect(layout.baseWidth).toBe(1200);
    expect(layout.baseHeight).toBe(900);
    expect(layout.scale).toBe(0.5);
    expect(layout.renderedWidth).toBe(600);
    expect(layout.renderedHeight).toBe(450);
    expect(layout.slackHeight).toBe(450);
  });

  it("chooses the smallest real viewport width for sidebar auto-collapse decisions", () => {
    const viewportWidth = resolveEffectiveViewportWidth({
      layoutWidth: 1024,
      visualWidth: 1024,
      screenWidth: 393,
    });

    expect(viewportWidth).toBe(393);
    expect(shouldAutoCollapseSidebar(viewportWidth)).toBe(true);
  });

  it("keeps the sidebar expanded for larger effective viewports", () => {
    const viewportWidth = resolveEffectiveViewportWidth({
      layoutWidth: 1200,
      visualWidth: 1200,
      screenWidth: 1920,
    });

    expect(shouldAutoCollapseSidebar(viewportWidth)).toBe(false);
  });
});
