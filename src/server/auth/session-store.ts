import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

import { z } from "zod";

interface SessionRecord {
  expiresAt: number;
}

interface SessionStoreOptions {
  ttlHours: number;
  dataDir?: string;
}

const sessionFileSchema = z.object({
  sessions: z.array(
    z.object({
      token: z.string().uuid(),
      expiresAt: z.number().int().nonnegative(),
    }),
  ).default([]),
});

export class SessionStore {
  readonly #sessions = new Map<string, SessionRecord>();
  readonly #ttlMs: number;
  readonly #stateFile: string | null;

  constructor(options: number | SessionStoreOptions) {
    const resolved = typeof options === "number" ? { ttlHours: options } : options;

    this.#ttlMs = resolved.ttlHours * 60 * 60 * 1000;
    this.#stateFile = resolved.dataDir ? path.join(resolved.dataDir, "auth-sessions.json") : null;
    this.#restore(Date.now());
  }

  issue(now = Date.now()): string {
    this.#pruneExpired(now);

    const token = randomUUID();
    this.#sessions.set(token, {
      expiresAt: now + this.#ttlMs,
    });
    this.#persist();

    return token;
  }

  validate(token: string | undefined, now = Date.now()): boolean {
    if (!token) {
      return false;
    }

    const record = this.#sessions.get(token);
    if (!record) {
      return false;
    }

    if (record.expiresAt <= now) {
      this.#sessions.delete(token);
      this.#persist();
      return false;
    }

    record.expiresAt = now + this.#ttlMs;
    this.#persist();
    return true;
  }

  revoke(token: string | undefined): void {
    if (!token) {
      return;
    }

    if (this.#sessions.delete(token)) {
      this.#persist();
    }
  }

  #restore(now: number): void {
    if (!this.#stateFile) {
      return;
    }

    try {
      const raw = readFileSync(this.#stateFile, "utf8");
      const parsed = sessionFileSchema.parse(JSON.parse(raw));

      for (const session of parsed.sessions) {
        if (session.expiresAt <= now) {
          continue;
        }

        this.#sessions.set(session.token, {
          expiresAt: session.expiresAt,
        });
      }
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: string }).code === "ENOENT"
      ) {
        return;
      }

      this.#sessions.clear();
    }
  }

  #pruneExpired(now: number): void {
    for (const [token, record] of this.#sessions.entries()) {
      if (record.expiresAt <= now) {
        this.#sessions.delete(token);
      }
    }
  }

  #persist(): void {
    if (!this.#stateFile) {
      return;
    }

    mkdirSync(path.dirname(this.#stateFile), { recursive: true });
    writeFileSync(
      this.#stateFile,
      `${JSON.stringify(
        {
          sessions: [...this.#sessions.entries()].map(([token, record]) => ({
            token,
            expiresAt: record.expiresAt,
          })),
        },
        null,
        2,
      )}\n`,
      "utf8",
    );
  }
}
