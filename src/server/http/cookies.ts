import { parse, serialize } from "cookie";

export const SESSION_COOKIE_NAME = "termiweb_session";

export function createSessionCookie(token: string, maxAgeSeconds: number): string {
  return serialize(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "strict",
    path: "/",
    maxAge: maxAgeSeconds,
  });
}

export function clearSessionCookie(): string {
  return serialize(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
}

export function readSessionCookie(cookieHeader: string | undefined): string | undefined {
  if (!cookieHeader) {
    return undefined;
  }

  const parsed = parse(cookieHeader);
  return parsed[SESSION_COOKIE_NAME];
}
