import "server-only";

import { NextResponse, type NextRequest } from "next/server";
import { getSessionToken } from "@/lib/api/session-cookie";

/**
 * Catch-all BFF proxy for every authenticated browser → Laravel call.
 *
 * - The browser hits `/api/bff/v1/<path>` (same-origin → HttpOnly cookie sent).
 * - This handler reads the cookie, attaches `Authorization: Bearer …`, and
 *   forwards the request to `${LARAVEL_API_ORIGIN}/api/v1/<path>`.
 * - The body and query string are piped through unchanged.
 * - The upstream response — JSON *or* `text/event-stream` — is streamed back.
 * - Client-sent `Authorization`, `Cookie`, and `Host` headers are stripped to
 *   prevent header injection or cookie leakage to Laravel.
 *
 * Auth endpoints (`/auth/login`, `/auth/register`, `/auth/logout`) have their
 * own dedicated handlers — they need to set/clear the cookie, which the
 * generic catch-all cannot do.
 */
const LARAVEL_API_ORIGIN =
  process.env.LARAVEL_API_ORIGIN || "http://localhost:8000";

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "transfer-encoding",
  "te",
  "trailer",
  "upgrade",
  "proxy-authorization",
  "proxy-authenticate",
]);

/** Reserved BFF paths handled by dedicated route files. */
const RESERVED_PREFIXES = ["v1/auth/login", "v1/auth/register", "v1/auth/logout"];

async function proxy(req: NextRequest, segments: string[]): Promise<Response> {
  const joined = segments.join("/");
  if (RESERVED_PREFIXES.some((p) => joined === p)) {
    // The matching dedicated handler should have caught this. Defensive 404.
    return NextResponse.json(
      { message: "Use the dedicated auth route." },
      { status: 404 },
    );
  }

  const url = new URL(`${LARAVEL_API_ORIGIN}/api/${joined}`);
  url.search = req.nextUrl.search;

  const token = await getSessionToken();
  const headers = new Headers();
  // Copy safe headers from the incoming request.
  req.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (HOP_BY_HOP_HEADERS.has(lower)) return;
    if (lower === "host" || lower === "authorization" || lower === "cookie") return;
    headers.set(key, value);
  });
  headers.set("Accept", req.headers.get("accept") ?? "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  // Forward body for non-GET/HEAD verbs. `req.body` is a ReadableStream so we
  // pipe it; Node's fetch needs `duplex: "half"` for streamed bodies.
  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  const init: RequestInit & { duplex?: "half" } = {
    method: req.method,
    headers,
    body: hasBody ? req.body : undefined,
    duplex: hasBody ? "half" : undefined,
    redirect: "manual",
  };

  let upstream: Response;
  try {
    upstream = await fetch(url, init);
  } catch (err) {
    return NextResponse.json(
      {
        message: "Could not reach the API.",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 502 },
    );
  }

  // Stream the response back with safe headers.
  const out = new Headers();
  upstream.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (HOP_BY_HOP_HEADERS.has(lower)) return;
    if (lower === "set-cookie") return; // never leak upstream cookies to the browser
    out.set(key, value);
  });

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: out,
  });
}

type RouteContext = { params: Promise<{ path: string[] }> };

async function handle(req: NextRequest, ctx: RouteContext): Promise<Response> {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const PUT = handle;
export const DELETE = handle;
export const HEAD = handle;
