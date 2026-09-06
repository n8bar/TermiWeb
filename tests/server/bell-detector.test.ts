import { describe, expect, it } from "vitest";

import { BellDetector } from "../../src/server/terminal/bell-detector.js";

describe("BellDetector", () => {
  it("counts bare bell bytes", () => {
    const detector = new BellDetector();
    expect(detector.feed("done\u0007")).toBe(1);
    expect(detector.feed("\u0007\u0007")).toBe(2);
    expect(detector.feed("quiet")).toBe(0);
  });

  it("ignores the bell that terminates an OSC title sequence", () => {
    const detector = new BellDetector();
    expect(detector.feed("\u001b]0;build watcher\u0007prompt> ")).toBe(0);
    expect(detector.feed("\u001b]2;vim\u0007\u0007")).toBe(1);
  });

  it("tracks an OSC sequence split across chunks", () => {
    const detector = new BellDetector();
    expect(detector.feed("\u001b]0;build")).toBe(0);
    expect(detector.feed(" watcher\u0007")).toBe(0);
    expect(detector.feed("\u0007")).toBe(1);
  });

  it("tracks an escape byte split from its bracket across chunks", () => {
    const detector = new BellDetector();
    expect(detector.feed("text\u001b")).toBe(0);
    expect(detector.feed("]0;title\u0007")).toBe(0);
  });

  it("handles string-terminator endings and C1 OSC", () => {
    const detector = new BellDetector();
    expect(detector.feed("\u001b]0;title\u001b\\\u0007")).toBe(1);
    expect(detector.feed("\u009d0;title\u009c\u0007")).toBe(1);
  });

  it("does not treat CSI sequences as OSC", () => {
    const detector = new BellDetector();
    expect(detector.feed("\u001b[31mred\u0007")).toBe(1);
  });
});
