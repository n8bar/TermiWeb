import path from "node:path";
import { fileURLToPath } from "node:url";

import { writeMilestonesIcs } from "../src/shared/milestone-calendar.js";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const planPath = path.join(repoRoot, "docs", "PLAN.md");
const outputPath = path.join(repoRoot, "assets", "milestones.ics");

const milestones = writeMilestonesIcs({
  planPath,
  outputPath,
});

console.log(`Wrote ${milestones.length} milestone events to ${outputPath}`);
