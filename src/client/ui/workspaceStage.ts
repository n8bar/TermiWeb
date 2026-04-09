export const NARROW_VIEWPORT_COLLAPSE_THRESHOLD = 760;

export interface StageLayout {
  baseWidth: number;
  baseHeight: number;
  scale: number;
  renderedWidth: number;
  renderedHeight: number;
  slackHeight: number;
}

export function computeStageLayout(options: {
  availableWidth: number;
  availableHeight: number;
}): StageLayout {
  const availableWidth = Math.max(0, options.availableWidth);
  const availableHeight = Math.max(0, options.availableHeight);

  if (availableWidth === 0 || availableHeight === 0) {
    return {
      baseWidth: availableWidth,
      baseHeight: availableHeight,
      scale: 1,
      renderedWidth: availableWidth,
      renderedHeight: availableHeight,
      slackHeight: 0,
    };
  }

  const baseWidth = availableWidth;
  const baseHeight = availableHeight;
  const scale = 1;
  const renderedWidth = baseWidth;
  const renderedHeight = baseHeight;

  return {
    baseWidth,
    baseHeight,
    scale,
    renderedWidth,
    renderedHeight,
    slackHeight: 0,
  };
}

export function resolveEffectiveViewportWidth(options: {
  layoutWidth: number;
  visualWidth?: number | null;
  screenWidth?: number | null;
}): number {
  const widths = [options.layoutWidth, options.visualWidth, options.screenWidth].filter(
    (value): value is number => typeof value === "number" && Number.isFinite(value) && value > 0,
  );

  return widths.length > 0 ? Math.min(...widths) : 0;
}

export function shouldAutoCollapseSidebar(
  viewportWidth: number,
  threshold = NARROW_VIEWPORT_COLLAPSE_THRESHOLD,
): boolean {
  return viewportWidth > 0 && viewportWidth < threshold;
}
