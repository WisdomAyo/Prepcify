import "server-only";

import { NextResponse, type NextRequest } from "next/server";
import { setSessionCookie } from "@/lib/api/session-cookie";

/**
 * Dedicated login proxy. We can't use the catch-all because we need to set
 * the HttpOnly session cookie from the Laravel response before returning
 * the user payload to the browser.
 */
const LARAVEL_API_ORIGIN =
  process.env.LARAVEL_API_ORIGIN || "http://localhost:8000";

export async function POST(req: NextRequest): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${LARAVEL_API_ORIGIN}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    return NextResponse.json(
      {
        message: "Could not reach the API.",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 502 },
    );
  }

  const payload = await upstream.json().catch(() => ({}));

  if (!upstream.ok) {
    return NextResponse.json(payload, { status: upstream.status });
  }

  const token = (payload as { token?: string }).token;
  if (typeof token !== "string" || token.length === 0) {
    return NextResponse.json(
      { message: "Login response was missing a session token." },
      { status: 502 },
    );
  }

  await setSessionCookie(token);

  // Never echo the token back to the browser.
  const { token: _t, ...safe } = payload as Record<string, unknown>;
  void _t;
  return NextResponse.json(safe, { status: upstream.status });
}
