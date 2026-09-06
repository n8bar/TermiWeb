import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const packageJsonPath = path.join(repoRoot, "package.json");
const packageLockPath = path.join(repoRoot, "package-lock.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

const artifactRoot = path.join(repoRoot, "artifacts", "release");
const packageDirName = `TermiWeb-${packageJson.version}-windows-x64`;
const stageRoot = path.join(artifactRoot, packageDirName);
const zipPath = path.join(artifactRoot, `${packageDirName}.zip`);
const installerBaseName = `${packageDirName}-setup`;
const installerPath = path.join(artifactRoot, `${installerBaseName}.exe`);
const installerScript = path.join(repoRoot, "installer", "TermiWeb.iss");
const npmExecutable = process.platform === "win32" ? "npm.cmd" : "npm";
const powerShellExecutable = process.platform === "win32" ? "powershell.exe" : "pwsh";

const runtimePackageJson = {
  name: packageJson.name,
  version: packageJson.version,
  private: true,
  description: packageJson.description,
  license: packageJson.license,
  type: packageJson.type,
  engines: packageJson.engines,
  dependencies: packageJson.dependencies,
};

const rootFiles = [
  ".env.example",
  "1.Start-Here.md",
  "DISCLAIMER.md",
  "LICENSE",
  "ReadMe.txt",
  "THIRD_PARTY_NOTICES.md",
  "Set Up TermiWeb.cmd",
  "Enable TermiWeb Auto Start.cmd",
  "Disable TermiWeb Auto Start.cmd",
  "Start TermiWeb.cmd",
  "Restart TermiWeb.cmd",
  "Stop TermiWeb.cmd",
  "Uninstall TermiWeb.cmd",
];

const scriptFiles = [
  "scripts/auto-start-common.ps1",
  "scripts/disable-auto-start.ps1",
  "scripts/enable-auto-start.ps1",
  "scripts/layout-common.ps1",
  "scripts/set-firewall-rule.ps1",
  "scripts/setup.ps1",
  "scripts/start-hidden.ps1",
  "scripts/stop-hidden.ps1",
  "scripts/uninstall.ps1",
];

function run(command, args, cwd = repoRoot) {
  const isWindowsCmd = process.platform === "win32" && command.toLowerCase().endsWith(".cmd");
  const executable = isWindowsCmd ? (process.env.ComSpec ?? "cmd.exe") : command;
  const commandArgs = isWindowsCmd ? ["/d", "/s", "/c", command, ...args] : args;

  execFileSync(executable, commandArgs, {
    cwd,
    stdio: "inherit",
  });
}

function ensureCleanDirectory(directoryPath) {
  fs.rmSync(directoryPath, { recursive: true, force: true });
  fs.mkdirSync(directoryPath, { recursive: true });
}

function copyRelativePath(relativePath) {
  const sourcePath = path.join(repoRoot, relativePath);
  const destinationPath = path.join(stageRoot, relativePath);

  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Missing required release file: ${relativePath}`);
  }

  fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
  fs.cpSync(sourcePath, destinationPath, { recursive: true, force: true });
}

function writeRuntimePackageJson() {
  const destinationPath = path.join(stageRoot, "package.json");
  fs.writeFileSync(destinationPath, `${JSON.stringify(runtimePackageJson, null, 2)}\n`, "utf8");
}

function installProductionDependencies() {
  fs.copyFileSync(packageJsonPath, path.join(stageRoot, "package.json"));
  fs.copyFileSync(packageLockPath, path.join(stageRoot, "package-lock.json"));
  run(npmExecutable, ["ci", "--omit=dev", "--no-audit", "--fund=false"], stageRoot);
  writeRuntimePackageJson();
  fs.rmSync(path.join(stageRoot, "package-lock.json"), { force: true });
}

function copyBuildOutput() {
  const clientSource = path.join(repoRoot, "dist", "client");
  const serverSource = path.join(repoRoot, "dist", "server", "server");
  const sharedSource = path.join(repoRoot, "dist", "server", "shared");

  if (!fs.existsSync(clientSource) || !fs.existsSync(serverSource) || !fs.existsSync(sharedSource)) {
    throw new Error("Missing built output. Expected dist/client, dist/server/server, and dist/server/shared.");
  }

  fs.cpSync(clientSource, path.join(stageRoot, "dist", "client"), { recursive: true, force: true });
  fs.cpSync(serverSource, path.join(stageRoot, "dist", "server", "server"), { recursive: true, force: true });
  fs.cpSync(sharedSource, path.join(stageRoot, "dist", "server", "shared"), { recursive: true, force: true });
}

function copyBundledNode() {
  const destinationPath = path.join(stageRoot, "runtime", "node", "node.exe");
  fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
  fs.copyFileSync(process.execPath, destinationPath);
}

function createZip() {
  fs.rmSync(zipPath, { force: true });
  run(powerShellExecutable, [
    "-NoLogo",
    "-NoProfile",
    "-ExecutionPolicy",
    "Bypass",
    "-Command",
    `Compress-Archive -LiteralPath '${stageRoot.replace(/'/g, "''")}' -DestinationPath '${zipPath.replace(/'/g, "''")}' -Force`,
  ]);
}

function findInnoSetupCompiler() {
  const candidates = [
    process.env.TERMIWEB_ISCC,
    process.env["ProgramFiles(x86)"] && path.join(process.env["ProgramFiles(x86)"], "Inno Setup 6", "ISCC.exe"),
    process.env.ProgramFiles && path.join(process.env.ProgramFiles, "Inno Setup 6", "ISCC.exe"),
    process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, "Programs", "Inno Setup 6", "ISCC.exe"),
  ].filter(Boolean);

  const found = candidates.find((candidate) => fs.existsSync(candidate));
  if (!found) {
    throw new Error(
      "Inno Setup 6 was not found. Install it (winget install JRSoftware.InnoSetup) or set TERMIWEB_ISCC to the ISCC.exe path.",
    );
  }

  return found;
}

// The installer is compiled from the same staged layout as the zip so the two
// artifacts cannot drift apart.
function buildInstaller() {
  fs.rmSync(installerPath, { force: true });
  const compiler = findInnoSetupCompiler();
  execFileSync(
    compiler,
    [
      "/Qp",
      `/DAppVersion=${packageJson.version}`,
      `/DStageDir=${stageRoot}`,
      `/DOutputDir=${artifactRoot}`,
      `/DOutputBaseFilename=${installerBaseName}`,
      installerScript,
    ],
    { cwd: repoRoot, stdio: "inherit" },
  );

  if (!fs.existsSync(installerPath)) {
    throw new Error(`Inno Setup finished without producing ${installerPath}.`);
  }
}

console.log(`Assembling ${packageDirName}...`);
fs.mkdirSync(artifactRoot, { recursive: true });
ensureCleanDirectory(stageRoot);

run(npmExecutable, ["run", "build"]);
run(npmExecutable, ["run", "notices:third-party"]);
installProductionDependencies();
copyBuildOutput();
copyBundledNode();

for (const relativePath of rootFiles) {
  copyRelativePath(relativePath);
}

for (const relativePath of scriptFiles) {
  copyRelativePath(relativePath);
}

createZip();
buildInstaller();

console.log(`Release folder: ${stageRoot}`);
console.log(`Release installer: ${installerPath}`);
console.log(`Release zip: ${zipPath}`);
