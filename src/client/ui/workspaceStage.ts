export const MIN_STAGE_ASPECT_RATIO = 4 / 3;
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
  minAspectRatio?: number;
}): StageLayout {
  const availableWidth = Math.max(0, options.availableWidth);
  const availableHeight = Math.max(0, options.availableHeight);
  const minAspectRatio = options.minAspectRatio ?? MIN_STAGE_ASPECT_RATIO;

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

  const maxHeightAtAvailableWidth = availableWidth / minAspectRatio;
  const baseWidth = availableWidth;
  const baseHeight = Math.min(availableHeight, maxHeightAtAvailableWidth);
  const scale = 1;
  const renderedWidth = baseWidth;
  const renderedHeight = baseHeight;

  return {
    baseWidth,
    baseHeight,
    scale,
    renderedWidth,
    renderedHeight,
    slackHeight: Math.max(0, availableHeight - renderedHeight),
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
