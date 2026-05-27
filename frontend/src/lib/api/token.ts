/**
 * Session cookie name.
 *
 * The Sanctum bearer token is stored in an **HttpOnly** cookie set by the
 * BFF Route Handlers (`app/api/bff/auth/*`). It is invisible to JavaScript
 * — XSS cannot read it — and is automatically sent on same-origin requests
 * to `/api/bff/*`, where the server-side proxy reads it and attaches the
 * `Authorization: Bearer …` header on its way to Laravel.
 *
 * The constant is the only thing client code (and Edge middleware) need to
 * know about session storage. There are no `getToken()`/`setToken()` helpers
 * on the client side because the token is not accessible there by design.
 */
export const TOKEN_COOKIE = "prepcify_token";

/** Cookie lifetime in seconds. Sanctum tokens are revocable server-side. */
export const TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
