// @vitest-environment jsdom

import { describe, expect, it } from "vitest";

import { applyTitleScrollPlan, setTitleSlotText } from "../../src/client/ui/sessionTitle.js";

const SCROLLING = "is-title-overflowing";

function makeSlot(): HTMLElement {
  const slot = document.createElement("span");
  document.body.append(slot);
  return slot;
}

/** Attribute names changed on the slot itself while `run` executes. */
function slotAttributeChanges(slot: HTMLElement, run: () => void): string[] {
  const observer = new MutationObserver(() => {});
  observer.observe(slot, { attributes: true, childList: true });
  run();
  const records = observer.takeRecords();
  observer.disconnect();
  return records.map((record) =>
    record.type === "attributes" ? (record.attributeName ?? "") : record.type,
  );
}

describe("setTitleSlotText", () => {
  it("creates the scroll span on first use", () => {
    const slot = makeSlot();
    setTitleSlotText(slot, "Instance 1", true);
    expect(slot.firstElementChild?.className).toBe("title-scroll");
    expect(slot.firstElementChild?.textContent).toBe("Instance 1");
    expect(slot.dataset.titleText).toBe("Instance 1");
    expect(slot.classList.contains("is-title-scroll-candidate")).toBe(true);
  });

  it("keeps the scroll span and its running scroll when the title changes", () => {
    const slot = makeSlot();
    setTitleSlotText(slot, "⠋ codex: working on the rail", true);
    applyTitleScrollPlan(slot, { distancePx: 40, durationMs: 2500 });
    const inner = slot.firstElementChild;

    const changes = slotAttributeChanges(slot, () => {
      setTitleSlotText(slot, "⠙ codex: working on the rail", true);
    });

    expect(slot.firstElementChild).toBe(inner);
    expect(inner?.textContent).toBe("⠙ codex: working on the rail");
    expect(slot.classList.contains(SCROLLING)).toBe(true);
    expect(changes).not.toContain("class");
    expect(changes).not.toContain("childList");
    expect(slot.dataset.titleScrollKey).toBeUndefined();
  });

  it("stops the scroll when the slot stops being scrollable", () => {
    const slot = makeSlot();
    setTitleSlotText(slot, "a long title", true);
    applyTitleScrollPlan(slot, { distancePx: 40, durationMs: 2500 });

    setTitleSlotText(slot, "12", false);

    expect(slot.classList.contains("is-title-scroll-candidate")).toBe(false);
    expect(slot.classList.contains(SCROLLING)).toBe(false);
    expect(slot.style.getPropertyValue("--title-scroll-distance")).toBe("");
  });
});

describe("applyTitleScrollPlan", () => {
  it("starts a scroll with its travel and duration", () => {
    const slot = makeSlot();
    setTitleSlotText(slot, "a long title", true);
    applyTitleScrollPlan(slot, { distancePx: 40, durationMs: 2500 });
    expect(slot.classList.contains(SCROLLING)).toBe(true);
    expect(slot.style.getPropertyValue("--title-scroll-distance")).toBe("40px");
    expect(slot.style.getPropertyValue("--title-scroll-duration")).toBe("2500ms");
  });

  it("touches nothing when the plan is unchanged", () => {
    const slot = makeSlot();
    setTitleSlotText(slot, "a long title", true);
    applyTitleScrollPlan(slot, { distancePx: 40, durationMs: 2500 });

    const changes = slotAttributeChanges(slot, () => {
      applyTitleScrollPlan(slot, { distancePx: 40, durationMs: 2500 });
    });

    expect(changes).toEqual([]);
  });

  it("adjusts the travel in place without touching the class", () => {
    const slot = makeSlot();
    setTitleSlotText(slot, "a long title", true);
    applyTitleScrollPlan(slot, { distancePx: 40, durationMs: 2500 });

    const changes = slotAttributeChanges(slot, () => {
      applyTitleScrollPlan(slot, { distancePx: 64, durationMs: 2500 });
    });

    expect(changes).toEqual(["style"]);
    expect(slot.style.getPropertyValue("--title-scroll-distance")).toBe("64px");
    expect(slot.classList.contains(SCROLLING)).toBe(true);
  });

  it("clears a scroll once and then leaves the slot alone", () => {
    const slot = makeSlot();
    setTitleSlotText(slot, "a long title", true);
    applyTitleScrollPlan(slot, { distancePx: 40, durationMs: 2500 });

    applyTitleScrollPlan(slot, null);
    expect(slot.classList.contains(SCROLLING)).toBe(false);
    expect(slot.style.getPropertyValue("--title-scroll-distance")).toBe("");
    expect(slot.style.getPropertyValue("--title-scroll-duration")).toBe("");

    const changes = slotAttributeChanges(slot, () => {
      applyTitleScrollPlan(slot, null);
    });
    expect(changes).toEqual([]);
  });
});
