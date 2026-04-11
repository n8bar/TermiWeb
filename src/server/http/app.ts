import os from "node:os";
import path from "node:path";
import { createServer } from "node:http";
import type { IncomingMessage } from "node:http";
import { randomUUID } from "node:crypto";

import express, { type NextFunction, type Request, type Response } from "express";
import { WebSocket, WebSocketServer } from "ws";
import { z } from "zod";

import type { ServerEvent } from "../../shared/protocol.js";
import { parseClientEvent } from "../../shared/protocol.js";
import type { TermiWebConfig } from "../config.js";
import type { SessionStore } from "../auth/session-store.js";
import { verifySharedPassword } from "../auth/password.js";
import { clearSessionCookie, createSessionCookie, readSessionCookie } from "./cookies.js";
import type { TerminalManager } from "../terminal/terminal-manager.js";

const loginBodySchema = z.object({
  password: z.string().min(1),
});

interface CreateHttpAppOptions {
  config: TermiWebConfig;
  authStore: SessionStore;
  terminalManager: TerminalManager;
  viteDevServer?: {
    middlewares: express.RequestHandler;
    transformIndexHtml(url: string, html: string): Promise<string>;
  };
}

export async function createHttpApp(options: CreateHttpAppOptions) {
  const app = express();
  const clientSockets = new Map<string, WebSocket>();
  const hostname = os.hostname();

  app.disable("x-powered-by");
  app.use(express.json());

  const sessionTtlSeconds = options.config.sessionTtlHours * 60 * 60;

  const authenticateRequest = (
    request: Request | IncomingMessage,
  ): boolean => {
    const token = readSessionCookie(request.headers.cookie);
    return options.authStore.validate(token);
  };

  const requireAuth = (
    request: Request,
    response: Response,
    next: NextFunction,
  ): void => {
    if (!authenticateRequest(request)) {
      response.status(401).json({ error: "Authentication required." });
      return;
    }

    next();
  };

  app.get("/api/health", (_request, response) => {
    response.json({ ok: true });
  });

  app.get("/api/auth/session", (request, response) => {
    response.json({
      authenticated: authenticateRequest(request),
      hostname,
      fixedCols: options.config.fixedCols,
    });
  });

  app.post("/api/auth/login", (request, response) => {
    const parsed = loginBodySchema.safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({ error: "Password is required." });
      return;
    }

    if (!verifySharedPassword(options.config.password, parsed.data.password)) {
      response.status(401).json({ error: "Incorrect password." });
      return;
    }

    const token = options.authStore.issue();
    response.setHeader("Set-Cookie", createSessionCookie(token, sessionTtlSeconds));
    response.json({
      authenticated: true,
      hostname,
      fixedCols: options.config.fixedCols,
    });
  });

  app.post("/api/auth/logout", (request, response) => {
    const token = readSessionCookie(request.headers.cookie);
    options.authStore.revoke(token);
    response.setHeader("Set-Cookie", clearSessionCookie());
    response.json({ authenticated: false });
  });

  app.get("/api/workspaces", requireAuth, async (_request, response) => {
    await options.terminalManager.ensureSessionAvailable();
    response.json({
      sessions: options.terminalManager.listSessions(),
      activeSessionId: options.terminalManager.getActiveSessionId(),
    });
  });

  if (options.viteDevServer) {
    app.use(options.viteDevServer.middlewares);
    app.use(async (request, response, next) => {
      if (request.path.startsWith("/api/")) {
        next();
        return;
      }

      try {
        const rawHtml = await import("node:fs/promises").then((fs) =>
          fs.readFile(path.resolve("src/client/index.html"), "utf8"),
        );
        const html = await options.viteDevServer!.transformIndexHtml(
          request.originalUrl,
          rawHtml,
        );
        response.status(200).type("html").send(html);
      } catch (error) {
        next(error);
      }
    });
  } else {
    const clientDir = path.resolve("dist/client");
    app.use(express.static(clientDir));
    app.get(/^(?!\/api\/).*/, (_request, response) => {
      response.sendFile(path.join(clientDir, "index.html"));
    });
  }

  const httpServer = createServer(app);
  const websocketServer = new WebSocketServer({ noServer: true });

  const send = (socket: WebSocket, event: ServerEvent) => {
    socket.send(JSON.stringify(event));
  };

  const createSessionListEvent = (): ServerEvent => ({
    type: "session/list",
    sessions: options.terminalManager.listSessions(),
    activeSessionId: options.terminalManager.getActiveSessionId(),
  });

  const broadcastSessions = () => {
    const event = createSessionListEvent();

    for (const socket of clientSockets.values()) {
      send(socket, event);
    }
  };

  options.terminalManager.on("sessions", () => {
    broadcastSessions();
  });

  options.terminalManager.on("output", (sessionId, data) => {
    for (const socket of clientSockets.values()) {
      if (socket.readyState !== WebSocket.OPEN) {
        continue;
      }

      if ((socket as WebSocket & { sessionId?: string }).sessionId !== sessionId) {
        continue;
      }

      send(socket, {
        type: "session/output",
        sessionId,
        data,
      });
    }
  });

  websocketServer.on("connection", (socket) => {
    const clientId = randomUUID();
    clientSockets.set(clientId, socket);
    void options.terminalManager.ensureSessionAvailable().then(() => {
      send(socket, createSessionListEvent());
    });

    socket.on("message", async (raw) => {
      try {
        const parsed = parseClientEvent(JSON.parse(raw.toString("utf8")));
        switch (parsed.type) {
          case "ping":
            send(socket, { type: "pong" });
            return;
          case "session/list.request":
            await options.terminalManager.ensureSessionAvailable();
            send(socket, createSessionListEvent());
            return;
          case "session/snapshot.request":
            send(socket, {
              type: "session/snapshot",
              snapshot: options.terminalManager.getSnapshot(parsed.sessionId, clientId),
            });
            return;
          case "session/create": {
            const created = await options.terminalManager.createSession(parsed.title);
            send(socket, { type: "session/created", session: created });
            return;
          }
          case "session/close":
            await options.terminalManager.closeSession(parsed.sessionId);
            return;
          case "session/select": {
            const snapshot = await options.terminalManager.attachClient(clientId, parsed.sessionId, {
              cols: parsed.cols,
              rows: parsed.rows,
            });
            (socket as WebSocket & { sessionId?: string }).sessionId = parsed.sessionId;
            send(socket, {
              type: "session/snapshot",
              snapshot,
            });
            return;
          }
          case "terminal/input":
            await options.terminalManager.write(parsed.sessionId, parsed.data, clientId);
            return;
          case "terminal/resize":
            options.terminalManager.resize(
              parsed.sessionId,
              parsed.cols,
              parsed.rows,
              clientId,
            );
            return;
          case "session/cols":
            await options.terminalManager.setSessionFixedCols(
              parsed.sessionId,
              parsed.cols,
              parsed.rows,
              clientId,
            );
            return;
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown protocol error.";
        send(socket, {
          type: "error",
          message,
        });
      }
    });

    socket.on("close", () => {
      clientSockets.delete(clientId);
      options.terminalManager.detachClient(clientId);
    });
  });

  httpServer.on("upgrade", (request, socket, head) => {
    if (request.url !== "/ws" || !authenticateRequest(request)) {
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
      return;
    }

    websocketServer.handleUpgrade(request, socket, head, (websocket) => {
      websocketServer.emit("connection", websocket, request);
    });
  });

  return { app, httpServer };
}
