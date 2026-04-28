import { describe, expect, it } from "vitest";

import {
  applyTerminalInputAttributes,
  terminalInputAttributeEntries,
} from "../../src/client/ui/terminalInput.js";

describe("terminal input attributes", () => {
  it("disables browser text assistance on the live terminal textarea", () => {
    const attributes = new Map<string, string>();
    const textarea = {
      spellcheck: true,
      setAttribute(name: string, value: string) {
        attributes.set(name, value);
      },
    };

    applyTerminalInputAttributes(textarea);

    expect(textarea.spellcheck).toBe(false);
    expect(Object.fromEntries(attributes)).toEqual(
      Object.fromEntries(terminalInputAttributeEntries),
    );
  });

  it("uses non-restrictive terminal typing hints", () => {
    expect(terminalInputAttributeEntries).toContainEqual(["autocapitalize", "off"]);
    expect(terminalInputAttributeEntries).toContainEqual(["enterkeyhint", "enter"]);
    expect(terminalInputAttributeEntries).not.toContainEqual(["inputmode", "numeric"]);
  });
});
