import "server-only";

import { cookies } from "next/headers";
import { ApiError, type ApiErrorBody } from "./types";
import { TOKEN_COOKIE } from "./token";

/**
 * Server-side fetch wrapper for React Server Components and Route Handlers.
 *
 * Reads the HttpOnly session cookie via `next/headers` and calls Laravel
 * directly (no extra hop through the BFF). Use this in RSC pages that need
 * authenticated data; use `apiFetch` from `./client.ts` in Client Components.
 *
 * For public endpoints, pass `{ anonymous: true }` to skip the cookie read
 * and benefit from response caching (the underlying `fetch` is the Next.js
 * data cache fetch).
 */
const LARAVEL_API_ORIGIN =
  process.env.LARAVEL_API_ORIGIN || "http://localhost:8000";

interface ServerRequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  anonymous?: boolean;
  /** Forwarded to Next.js `fetch` for ISR-style caching. */
  next?: { revalidate?: number | false; tags?: string[] };
}

export async function serverFetch<T>(
  path: string,
  { body, anonymous, headers, next, ...init }: ServerRequestOptions = {},
): Promise<T> {
  let token: string | undefined;
  if (!anonymous) {
    const store = await cookies();
    token = store.get(TOKEN_COOKIE)?.value;
  }

  const res = await fetch(`${LARAVEL_API_ORIGIN}/api/v1${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    next,
  });

  if (res.status === 204) return undefined as T;

  const payload = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(res.status, payload as ApiErrorBody);
  }

  return (payload?.data ?? payload) as T;
}
