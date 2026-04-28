import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  parseMilestonesFromPlan,
  renderMilestonesIcs,
  writeMilestonesIcs,
} from "../../src/shared/milestone-calendar.js";

const tempDirs: string[] = [];

afterEach(() => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();

    if (dir) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }
});

describe("milestone calendar generation", () => {
  it("parses milestone date ranges from the plan and renders all-day ICS events", () => {
    const planText = `
- [x] M1: Bootstrap and baseline
  - Summary: Create the initial project skeleton.
  - Start: 2026-04-06
  - End: 2026-04-06
- [ ] M2: Release prep
  - Summary: Prepare the release surface.
  - Start: 2026-04-19
  - Target End: 2026-04-25
`;

    const milestones = parseMilestonesFromPlan(planText);
    const ics = renderMilestonesIcs(milestones, new Date("2026-04-21T12:34:56Z"));
    const unfoldedIcs = ics.replace(/\r\n /gu, "");

    expect(milestones).toEqual([
      {
        code: "M1",
        title: "Bootstrap and baseline",
        summary: "Create the initial project skeleton.",
        start: "2026-04-06",
        end: "2026-04-06",
        endLabel: "End",
        completed: true,
      },
      {
        code: "M2",
        title: "Release prep",
        summary: "Prepare the release surface.",
        start: "2026-04-19",
        end: "2026-04-25",
        endLabel: "Target End",
        completed: false,
      },
    ]);

    expect(ics).toContain("BEGIN:VCALENDAR\r\n");
    expect(unfoldedIcs).toContain("SUMMARY:M1: Bootstrap and baseline");
    expect(unfoldedIcs).toContain("DTSTART;VALUE=DATE:20260406");
    expect(unfoldedIcs).toContain("DTEND;VALUE=DATE:20260407");
    expect(unfoldedIcs).toContain("SUMMARY:M2: Release prep");
    expect(unfoldedIcs).toContain("DTSTART;VALUE=DATE:20260419");
    expect(unfoldedIcs).toContain("DTEND;VALUE=DATE:20260426");
    expect(unfoldedIcs).toContain("Target end: 2026-04-25");
  });

  it("writes the generated ICS file to disk", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "termiweb-milestones-"));
    tempDirs.push(tempDir);

    const planPath = path.join(tempDir, "PLAN.md");
    const outputPath = path.join(tempDir, "assets", "milestones.ics");

    fs.writeFileSync(
      planPath,
      `
- [ ] M7: Release and website
  - Summary: Publish the release surface.
  - Start: 2026-04-19
  - Target End: 2026-04-25
`,
      "utf8",
    );

    const milestones = writeMilestonesIcs({
      planPath,
      outputPath,
      generatedAt: new Date("2026-04-21T12:34:56Z"),
    });

    expect(milestones).toHaveLength(1);
    expect(fs.existsSync(outputPath)).toBe(true);
    expect(fs.readFileSync(outputPath, "utf8")).toContain("SUMMARY:M7: Release and website");
  });

  it("folds long ICS lines without trailing whitespace", () => {
    const ics = renderMilestonesIcs(
      [
        {
          code: "M8",
          title: "Search and discovery foundation for an open-source, free-to-use product",
          summary:
            "This milestone prepares the public surface without pushing broad attention yet.",
          start: "2026-04-24",
          end: "2026-04-26",
          endLabel: "End",
          completed: true,
        },
      ],
      new Date("2026-04-21T12:34:56Z"),
    );

    expect(ics.split("\r\n").filter((line) => /\s$/u.test(line))).toEqual([]);
  });
});
