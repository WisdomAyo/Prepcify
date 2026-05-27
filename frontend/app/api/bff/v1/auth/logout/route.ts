import "server-only";

import { NextResponse } from "next/server";
import { clearSessionCookie, getSessionToken } from "@/lib/api/session-cookie";

/**
 * Logout proxy. Tells Laravel to revoke the current token, then clears the
 * HttpOnly session cookie. Always succeeds locally even if the upstream
 * call fails (the cookie still gets cleared, so the user is signed out).
 */
const LARAVEL_API_ORIGIN =
  process.env.LARAVEL_API_ORIGIN || "http://localhost:8000";

export async function POST(): Promise<Response> {
  const token = await getSessionToken();

  if (token) {
    try {
      await fetch(`${LARAVEL_API_ORIGIN}/api/v1/auth/logout`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {
      // Swallow — we still want to clear the cookie locally.
    }
  }

  await clearSessionCookie();
  return NextResponse.json({ message: "Logged out." });
}
