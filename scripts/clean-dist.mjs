import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const distRoot = path.join(repoRoot, "dist");

fs.rmSync(distRoot, { recursive: true, force: true });
