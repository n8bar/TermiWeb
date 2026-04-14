import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const outputPath = path.join(repoRoot, "THIRD_PARTY_NOTICES.md");
const npmCommand = process.platform === "win32" ? "npm" : "npm";

function normalizeRepositoryUrl(value) {
  if (!value) {
    return "";
  }

  const trimmed = value.trim();
  if (trimmed.startsWith("git+")) {
    return normalizeRepositoryUrl(trimmed.slice(4));
  }

  if (trimmed.startsWith("git://github.com/")) {
    return `https://github.com/${trimmed.slice("git://github.com/".length).replace(/\.git$/u, "")}`;
  }

  if (trimmed.startsWith("https://github.com/") || trimmed.startsWith("http://github.com/")) {
    return trimmed.replace(/^http:\/\//u, "https://").replace(/\.git$/u, "");
  }

  if (/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/u.test(trimmed)) {
    return `https://github.com/${trimmed}`;
  }

  return trimmed;
}

function readInstalledPackage(name) {
  const packageJsonPath = path.join(repoRoot, "node_modules", ...name.split("/"), "package.json");
  if (!fs.existsSync(packageJsonPath)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
}

function collectProductionPackages() {
  const tree = JSON.parse(
    execSync(`${npmCommand} ls --omit=dev --all --json`, {
      cwd: repoRoot,
      encoding: "utf8",
      maxBuffer: 20 * 1024 * 1024,
      shell: true,
    }),
  );

  const seen = new Set();
  const packages = [];

  function visit(name, node) {
    if (!name || !node || !node.version) {
      return;
    }

    const key = `${name}@${node.version}`;
    if (seen.has(key)) {
      return;
    }

    const installedPackage = readInstalledPackage(name);
    if (!installedPackage) {
      return;
    }

    seen.add(key);

    const repository =
      typeof installedPackage.repository === "string"
        ? installedPackage.repository
        : installedPackage.repository?.url;

    packages.push({
      name,
      version: node.version,
      license:
        typeof installedPackage.license === "string"
          ? installedPackage.license
          : JSON.stringify(installedPackage.license ?? installedPackage.licenses ?? "UNKNOWN"),
      source: normalizeRepositoryUrl(installedPackage.homepage || repository || ""),
    });

    for (const [childName, childNode] of Object.entries(node.dependencies ?? {})) {
      visit(childName, childNode);
    }
  }

  for (const [name, node] of Object.entries(tree.dependencies ?? {})) {
    visit(name, node);
  }

  packages.sort((left, right) => {
    return left.name.localeCompare(right.name) || left.version.localeCompare(right.version);
  });

  return packages;
}

function renderNotices(packages) {
  const licenseCounts = new Map();
  for (const pkg of packages) {
    licenseCounts.set(pkg.license, (licenseCounts.get(pkg.license) ?? 0) + 1);
  }

  const licenseSummary = [...licenseCounts.entries()]
    .sort((left, right) => left[0].localeCompare(right[0]))
    .map(([license, count]) => `- \`${license}\`: ${count} package${count === 1 ? "" : "s"}`)
    .join("\n");

  const entries = packages
    .map((pkg, index) => {
      const sourceLine = pkg.source ? `  - Source: \`${pkg.source}\`\n` : "";
      return `${index + 1}. \`${pkg.name}@${pkg.version}\`\n  - License: \`${pkg.license}\`\n${sourceLine}`;
    })
    .join("\n");

  return [
    "# Third-Party Notices",
    "",
    "This file records the current installed production dependency set that TermiWeb expects to ship in the `0.1` Windows release package.",
    "",
    "Regenerate it with `npm run notices:third-party` whenever the production dependency graph changes.",
    "",
    "## Summary",
    "",
    `- Production packages listed: ${packages.length}`,
    licenseSummary,
    "",
    "## Production Dependency Inventory",
    "",
    entries,
  ].join("\n");
}

const packages = collectProductionPackages();
const content = renderNotices(packages);
fs.writeFileSync(outputPath, `${content}\n`, "utf8");

console.log(`Wrote ${packages.length} production package notices to ${outputPath}`);
