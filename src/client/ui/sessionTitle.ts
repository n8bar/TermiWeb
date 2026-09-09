export function getDisplaySessionTitle(title: string, collapsed: boolean): string {
  if (!collapsed) {
    return title;
  }

  const match = /^Instance (\d+)$/.exec(title.trim());
  if (match) {
    return match[1] ?? title;
  }

  return title;
}

/**
 * Display precedence: the shell-provided title when present and non-empty,
 * otherwise the workspace default.
 */
export function resolveDisplayedSessionTitle(session: {
  title: string;
  shellTitle?: string | null;
}): string {
  const shellTitle = session.shellTitle?.trim();
  return shellTitle ? shellTitle : session.title;
}

export interface TitleScrollPlan {
  distancePx: number;
  durationMs: number;
}

const TITLE_SCROLL_PX_PER_SECOND = 40;
const TITLE_SCROLL_MIN_DURATION_MS = 2500;

/**
 * Decides whether an overflowing title should scroll back and forth so it can
 * be read where hover does not exist. Returns null when the title fits, when the
 * device has a fine pointer (hover and the native tooltip cover it), or when the
 * user prefers reduced motion. The duration covers one direction of travel.
 */
export function resolveTitleScroll(options: {
  contentWidth: number;
  slotWidth: number;
  coarsePointer: boolean;
  reducedMotion: boolean;
}): TitleScrollPlan | null {
  const distancePx = Math.ceil(options.contentWidth - options.slotWidth);
  if (distancePx <= 0 || !options.coarsePointer || options.reducedMotion) {
    return null;
  }

  const durationMs = Math.max(
    TITLE_SCROLL_MIN_DURATION_MS,
    Math.round((distancePx / TITLE_SCROLL_PX_PER_SECOND) * 1000),
  );
  return { distancePx, durationMs };
}

const TITLE_SCROLL_CLASS = "is-title-overflowing";
const TITLE_SCROLL_CANDIDATE_CLASS = "is-title-scroll-candidate";
const TITLE_SCROLL_DISTANCE = "--title-scroll-distance";
const TITLE_SCROLL_DURATION = "--title-scroll-duration";

function scrollSpanOf(slot: HTMLElement): HTMLElement | null {
  const first = slot.firstElementChild;
  return first instanceof HTMLElement && first.classList.contains("title-scroll") ? first : null;
}

/**
 * Puts text into a title slot. The scrolling span is kept and only its text is
 * replaced, so a running back-and-forth scroll is not restarted by a title
 * change; the next overflow sync re-measures and adjusts the travel. A slot that
 * stops being scrollable loses its scroll here, since the sync skips it.
 */
export function setTitleSlotText(slot: HTMLElement, text: string, scrollable: boolean): void {
  let inner = scrollSpanOf(slot);
  if (!inner) {
    inner = slot.ownerDocument.createElement("span");
    inner.className = "title-scroll";
    slot.replaceChildren(inner);
  }
  if (inner.textContent !== text) {
    inner.textContent = text;
  }
  slot.dataset.titleText = text;
  if (slot.classList.contains(TITLE_SCROLL_CANDIDATE_CLASS) !== scrollable) {
    slot.classList.toggle(TITLE_SCROLL_CANDIDATE_CLASS, scrollable);
  }
  delete slot.dataset.titleScrollKey;
  if (!scrollable) {
    applyTitleScrollPlan(slot, null);
  }
}

/**
 * Layout width of the slot's text. The text span is measured rather than the
 * slot's scroll extent, so the scroll transform cannot skew the number and the
 * animation does not have to be switched off to measure.
 */
export function measureTitleSlotContentWidth(slot: HTMLElement): number {
  const inner = scrollSpanOf(slot);
  return inner ? Math.ceil(inner.getBoundingClientRect().width) : slot.scrollWidth;
}

function setStyleProperty(element: HTMLElement, name: string, value: string | null): void {
  const current = element.style.getPropertyValue(name);
  if (value === null) {
    if (current !== "") {
      element.style.removeProperty(name);
    }
    return;
  }
  if (current !== value) {
    element.style.setProperty(name, value);
  }
}

/**
 * Applies a scroll plan to a slot, touching only what differs from the current
 * state. An unchanged plan changes nothing, so the CSS animation keeps running,
 * and a new travel distance updates the custom property under the running
 * animation instead of restarting it.
 */
export function applyTitleScrollPlan(slot: HTMLElement, plan: TitleScrollPlan | null): void {
  if (!plan) {
    if (slot.classList.contains(TITLE_SCROLL_CLASS)) {
      slot.classList.remove(TITLE_SCROLL_CLASS);
    }
    setStyleProperty(slot, TITLE_SCROLL_DISTANCE, null);
    setStyleProperty(slot, TITLE_SCROLL_DURATION, null);
    return;
  }

  setStyleProperty(slot, TITLE_SCROLL_DISTANCE, `${plan.distancePx}px`);
  setStyleProperty(slot, TITLE_SCROLL_DURATION, `${plan.durationMs}ms`);
  if (!slot.classList.contains(TITLE_SCROLL_CLASS)) {
    slot.classList.add(TITLE_SCROLL_CLASS);
  }
}
