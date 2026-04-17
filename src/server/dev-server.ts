import { createServer as createViteServer } from "vite";

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

const vite = await createViteServer({
  server: {
    middlewareMode: true,
  },
  appType: "custom",
});

const server = await createTermiWebServer({
  viteDevServer: vite,
});

await server.start();

console.log(`TermiWeb dev server listening on http://${server.config.host}:${server.config.port}`);
