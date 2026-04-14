import { parse, serialize } from "cookie";

export function createSessionCookie(
  cookieName: string,
  token: string,
  maxAgeSeconds: number,
): string {
  return serialize(cookieName, token, {
    httpOnly: true,
    sameSite: "strict",
    path: "/",
    maxAge: maxAgeSeconds,
  });
}

export function clearSessionCookie(cookieName: string): string {
  return serialize(cookieName, "", {
    httpOnly: true,
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
}

export function readSessionCookie(
  cookieName: string,
  cookieHeader: string | undefined,
): string | undefined {
  if (!cookieHeader) {
    return undefined;
  }

  const parsed = parse(cookieHeader);
  return parsed[cookieName];
}
