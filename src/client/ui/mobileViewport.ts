export const DESKTOP_LAYOUT_VIEWPORT_WIDTH = 1024;
export const MIN_DESKTOP_VIEWPORT_SCALE = 0.1;
export const MAX_DESKTOP_VIEWPORT_SCALE = 10;

export function computeDesktopViewportScale(options: {
  effectiveViewportWidth: number;
  layoutViewportWidth?: number;
}): number | null {
  const effectiveViewportWidth = options.effectiveViewportWidth;
  const layoutViewportWidth =
    options.layoutViewportWidth ?? DESKTOP_LAYOUT_VIEWPORT_WIDTH;

  if (
    !Number.isFinite(effectiveViewportWidth) ||
    !Number.isFinite(layoutViewportWidth) ||
    effectiveViewportWidth <= 0 ||
    layoutViewportWidth <= 0
  ) {
    return null;
  }

  const scale = effectiveViewportWidth / layoutViewportWidth;
  const rounded = Math.round(scale * 1000) / 1000;

  return Math.min(MAX_DESKTOP_VIEWPORT_SCALE, Math.max(MIN_DESKTOP_VIEWPORT_SCALE, rounded));
}

export function buildDesktopViewportContent(options: {
  initialScale?: number | null;
  layoutViewportWidth?: number;
} = {}): string {
  const layoutViewportWidth =
    options.layoutViewportWidth ?? DESKTOP_LAYOUT_VIEWPORT_WIDTH;
  const content = [`width=${layoutViewportWidth}`];

  if (typeof options.initialScale === "number" && Number.isFinite(options.initialScale)) {
    content.push(`initial-scale=${options.initialScale.toFixed(3)}`);
  }

  content.push(
    `minimum-scale=${MIN_DESKTOP_VIEWPORT_SCALE.toFixed(1)}`,
    `maximum-scale=${MAX_DESKTOP_VIEWPORT_SCALE.toFixed(1)}`,
    "user-scalable=yes",
    "viewport-fit=cover",
  );

  return content.join(", ");
}
