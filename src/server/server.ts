import { createHttpApp } from "./http/app.js";
import { SessionStore } from "./auth/session-store.js";
import { resolveConfig, type TermiWebConfig } from "./config.js";
import { TerminalManager } from "./terminal/terminal-manager.js";
import { WorkspaceStore } from "./workspace/workspace-store.js";

export interface TermiWebServer {
  config: TermiWebConfig;
  terminalManager: TerminalManager;
  start(): Promise<void>;
}

export async function createTermiWebServer(options?: {
  config?: TermiWebConfig;
  viteDevServer?: {
    middlewares: import("express").RequestHandler;
    transformIndexHtml(url: string, html: string): Promise<string>;
  };
}): Promise<TermiWebServer> {
  const config = options?.config ?? resolveConfig();
  const workspaceStore = new WorkspaceStore(config);
  await workspaceStore.initialize();

  const terminalManager = new TerminalManager(config, workspaceStore);
  await terminalManager.initialize();

  const authStore = new SessionStore(config.sessionTtlHours);
  const httpAppOptions = {
    config,
    authStore,
    terminalManager,
    ...(options?.viteDevServer ? { viteDevServer: options.viteDevServer } : {}),
  };

  const { httpServer } = await createHttpApp(httpAppOptions);

  return {
    config,
    terminalManager,
    async start() {
      await new Promise<void>((resolve, reject) => {
        httpServer.once("error", reject);
        httpServer.listen(config.port, config.host, () => {
          httpServer.off("error", reject);
          resolve();
        });
      });
    },
  };
}
