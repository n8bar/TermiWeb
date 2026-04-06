import { createTermiWebServer } from "./server.js";

const server = await createTermiWebServer();
await server.start();

console.log(`TermiWeb listening on http://${server.config.host}:${server.config.port}`);
