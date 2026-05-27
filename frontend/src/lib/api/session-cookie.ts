import "server-only";

import { cookies } from "next/headers";
import { TOKEN_COOKIE, TOKEN_MAX_AGE } from "./token";

/**
 * Session cookie helpers — only callable from Route Handlers and Server
 * Components. They set the **HttpOnly** Sanctum token cookie so the browser
 * cannot read it, and clear it on logout.
 */

export async function setSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set({
    name: TOKEN_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TOKEN_MAX_AGE,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set({
    name: TOKEN_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getSessionToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(TOKEN_COOKIE)?.value;
}
