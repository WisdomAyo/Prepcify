import { ApiError, type ApiErrorBody } from "./types";

/**
 * Client-side fetch wrapper.
 *
 * Targets `/api/bff/v1/<path>` — the Next.js BFF Route Handlers — which
 * read the HttpOnly session cookie server-side and forward the request to
 * Laravel with the Sanctum bearer header attached. The browser never sees
 * the token.
 *
 * - Same-origin: session cookie is sent automatically by the browser.
 * - No `Authorization` header is set here (the BFF adds it).
 * - JSON body is serialised and `Content-Type` is set.
 * - Laravel's `{ data: ... }` envelope is unwrapped.
 * - Non-2xx → throws a typed `ApiError`.
 *
 * For RSC (Server Components), use `serverFetch` in `./server.ts` instead.
 */
const BFF_BASE = "/api/bff/v1";

interface RequestOptions extends Omit<RequestInit, "body"> {
  /** JSON-serialisable request body. */
  body?: unknown;
  /**
   * Strip Laravel's `{ data: ... }` envelope from the response. Defaults to
   * true. Set to false for endpoints that return paginated collections
   * (`{ data: [...], meta: {...}, links: {...} }`) where the envelope itself
   * carries information the caller needs (cursors, totals).
   */
  unwrap?: boolean;
}

export async function apiFetch<T>(
  path: string,
  { body, headers, unwrap = true, ...init }: RequestOptions = {},
): Promise<T> {
  const res = await fetch(`${BFF_BASE}${path}`, {
    ...init,
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return undefined as T;

  const payload = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(res.status, payload as ApiErrorBody);
  }

  if (!unwrap) return payload as T;

  // Laravel API Resources wrap single/collection responses in `data`.
  return (payload?.data ?? payload) as T;
}

export const api = {
  get: <T>(path: string, opts?: RequestOptions) =>
    apiFetch<T>(path, { ...opts, method: "GET" }),
  post: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    apiFetch<T>(path, { ...opts, method: "POST", body }),
  patch: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    apiFetch<T>(path, { ...opts, method: "PATCH", body }),
  delete: <T>(path: string, opts?: RequestOptions) =>
    apiFetch<T>(path, { ...opts, method: "DELETE" }),
};
