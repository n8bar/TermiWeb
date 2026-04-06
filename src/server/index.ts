import { loadDotEnvFile } from "./env.js";
import { createTermiWebServer } from "./server.js";

loadDotEnvFile();

const server = await createTermiWebServer();
await server.start();

console.log(`TermiWeb listening on http://${server.config.host}:${server.config.port}`);
