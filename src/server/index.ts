import { relaunchProcessElevatedIfNeeded } from "./elevation.js";
import { loadDotEnvFile } from "./env.js";
import { createTermiWebServer } from "./server.js";

if (
  relaunchProcessElevatedIfNeeded({
    platform: process.platform,
    env: process.env,
    execPath: process.execPath,
    execArgv: process.execArgv,
    argv: process.argv,
    cwd: process.cwd(),
  })
) {
  process.exit(0);
}

loadDotEnvFile({
  overridePrefixes: ["TERMIWEB_"],
});

const server = await createTermiWebServer();
await server.start();

console.log(`TermiWeb listening on http://${server.config.host}:${server.config.port}`);
