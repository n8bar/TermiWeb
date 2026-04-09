import { mkdtempSync, rmSync } from "node:fs";
import { EventEmitter } from "node:events";
import os from "node:os";
import path from "node:path";

import request from "supertest";
import { afterEach, describe, expect, it } from "vitest";

import { SessionStore } from "../../src/server/auth/session-store.js";
import { createHttpApp } from "../../src/server/http/app.js";
import type { TermiWebConfig } from "../../src/server/config.js";

class TerminalManagerStub extends EventEmitter {
  async ensureSessionAvailable() {
    return undefined;
  }

  listSessions() {
    return [];
  }

  getActiveSessionId() {
    return null;
  }
}

const config: TermiWebConfig = {
  host: "127.0.0.1",
  port: 4317,
  password: "let-me-in",
  allowLan: false,
  fixedCols: 80,
  maxSessions: 8,
  sessionTtlHours: 168,
  dataDir: ".termiweb",
  historyLimit: 200_000,
};

const tempDirs: string[] = [];

function createTempDataDir(): string {
  const dir = mkdtempSync(path.join(os.tmpdir(), "termiweb-auth-test-"));
  tempDirs.push(dir);
  return dir;
}

afterEach(() => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    if (dir) {
      rmSync(dir, { recursive: true, force: true });
    }
  }
});

describe("auth routes", () => {
  it("sets a session cookie on valid login and protects workspace routes", async () => {
    const authStore = new SessionStore(config.sessionTtlHours);
    const { app } = await createHttpApp({
      config,
      authStore,
      terminalManager: new TerminalManagerStub() as never,
    });

    const unauthorized = await request(app).get("/api/workspaces");
    expect(unauthorized.status).toBe(401);

    const login = await request(app).post("/api/auth/login").send({
      password: config.password,
    });

    expect(login.status).toBe(200);
    expect(login.body.hostname).toEqual(expect.any(String));
    expect(login.body.fixedCols).toBe(80);
    const cookies = login.headers["set-cookie"];
    expect(cookies).toBeTruthy();
    if (!cookies) {
      throw new Error("Expected auth cookie");
    }

    const authorized = await request(app)
      .get("/api/workspaces")
      .set("Cookie", cookies);

    expect(authorized.status).toBe(200);
    expect(authorized.body.sessions).toEqual([]);
    expect(authorized.body.activeSessionId).toBeNull();
  });

  it("rejects an incorrect shared password", async () => {
    const { app } = await createHttpApp({
      config,
      authStore: new SessionStore(config.sessionTtlHours),
      terminalManager: new TerminalManagerStub() as never,
    });

    const login = await request(app).post("/api/auth/login").send({
      password: "wrong",
    });

    expect(login.status).toBe(401);
  });

  it("reports hostname and auth state before login", async () => {
    const { app } = await createHttpApp({
      config,
      authStore: new SessionStore(config.sessionTtlHours),
      terminalManager: new TerminalManagerStub() as never,
    });

    const session = await request(app).get("/api/auth/session");

    expect(session.status).toBe(200);
    expect(session.body.authenticated).toBe(false);
    expect(session.body.hostname).toEqual(expect.any(String));
    expect(session.body.fixedCols).toBe(80);
  });

  it("keeps an authenticated cookie valid across a server restart when session state persists", async () => {
    const dataDir = createTempDataDir();
    const persistentConfig = {
      ...config,
      dataDir,
    };
    const firstStore = new SessionStore({
      ttlHours: persistentConfig.sessionTtlHours,
      dataDir,
    });
    const firstApp = await createHttpApp({
      config: persistentConfig,
      authStore: firstStore,
      terminalManager: new TerminalManagerStub() as never,
    });

    const login = await request(firstApp.app).post("/api/auth/login").send({
      password: persistentConfig.password,
    });
    const cookies = login.headers["set-cookie"];
    expect(cookies).toBeTruthy();
    if (!cookies) {
      throw new Error("Expected auth cookie");
    }

    const restartedStore = new SessionStore({
      ttlHours: persistentConfig.sessionTtlHours,
      dataDir,
    });
    const restartedApp = await createHttpApp({
      config: persistentConfig,
      authStore: restartedStore,
      terminalManager: new TerminalManagerStub() as never,
    });

    const session = await request(restartedApp.app)
      .get("/api/auth/session")
      .set("Cookie", cookies);

    expect(session.status).toBe(200);
    expect(session.body.authenticated).toBe(true);
  });
});
