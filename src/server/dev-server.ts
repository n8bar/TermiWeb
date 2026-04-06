import { createServer as createViteServer } from "vite";

import { loadDotEnvFile } from "./env.js";
import { createTermiWebServer } from "./server.js";

loadDotEnvFile();

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
