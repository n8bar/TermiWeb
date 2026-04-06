import { randomUUID } from "node:crypto";

interface SessionRecord {
  expiresAt: number;
}

export class SessionStore {
  readonly #sessions = new Map<string, SessionRecord>();
  readonly #ttlMs: number;

  constructor(ttlHours: number) {
    this.#ttlMs = ttlHours * 60 * 60 * 1000;
  }

  issue(now = Date.now()): string {
    const token = randomUUID();
    this.#sessions.set(token, {
      expiresAt: now + this.#ttlMs,
    });

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
      return false;
    }

    record.expiresAt = now + this.#ttlMs;
    return true;
  }

  revoke(token: string | undefined): void {
    if (!token) {
      return;
    }

    this.#sessions.delete(token);
  }
}
