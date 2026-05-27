import { NextResponse, type NextRequest } from "next/server";
import { TOKEN_COOKIE } from "@/lib/api/token";

/**
 * Edge middleware — auth gate + per-request nonce-based CSP.
 *
 * Every request gets a fresh base64 nonce. The nonce is forwarded to the
 * Next.js renderer via the `x-nonce` request header — Next reads it and
 * stamps it on every inline `<script>` it emits (bootstrap, hydration, RSC
 * payload). The same nonce lands on the response `Content-Security-Policy`
 * header, so the browser only accepts those scripts.
 *
 * `'strict-dynamic'` lets the nonced bootstrap script load further scripts
 * by source, which is how Next's chunk loader works — without it the CSP
 * would block every dynamic import. `'unsafe-inline'` is intentionally
 * **not** in `script-src`: nonces supersede it in CSP3-aware browsers, and
 * we don't want it as a fallback.
 *
 * `style-src` keeps `'unsafe-inline'` — Radix UI, Framer Motion, and the
 * Next dev runtime inject inline styles dynamically and can't be reliably
 * nonced. Style-based XSS is rare and far less dangerous than script-based.
 *
 * Side effect: any route this middleware matcher covers becomes
 * dynamically rendered, because the nonce is request-scoped and skips
 * static caching. For our app this is correct — every gated route already
 * varied by cookie, so it was opting out of static rendering anyway.
 */
const PROTECTED_PREFIXES = ["/app", "/admin"];
const AUTH_ROUTES = ["/login", "/signup"];
const LARAVEL_ORIGIN =
  process.env.LARAVEL_API_ORIGIN || "http://localhost:8000";

function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function buildCsp(nonce: string, isDev: boolean): string {
  const scriptSrc = isDev
    ? // dev needs eval for Fast Refresh; keep unsafe-inline as a safety net
      // for a few webpack-dev runtime scripts that skip the nonce.
      `'self' 'unsafe-eval' 'unsafe-inline'`
    : `'self' 'nonce-${nonce}' 'strict-dynamic'`;
  const connectSrc = isDev
    ? `'self' ${LARAVEL_ORIGIN} ws: wss: https:`
    : `'self' ${LARAVEL_ORIGIN} https:`;
  const directives: Record<string, string> = {
    "default-src": "'self'",
    "script-src": scriptSrc,
    "style-src": "'self' 'unsafe-inline'",
    "img-src": "'self' data: blob: https:",
    "font-src": "'self' data:",
    "connect-src": connectSrc,
    "media-src": "'self' https:",
    "frame-ancestors": "'none'",
    "form-action": "'self'",
    "base-uri": "'self'",
    "object-src": "'none'",
  };
  if (!isDev) directives["upgrade-insecure-requests"] = "";
  return Object.entries(directives)
    .map(([k, v]) => (v ? `${k} ${v}` : k))
    .join("; ");
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = Boolean(req.cookies.get(TOKEN_COOKIE)?.value);

  // ── Auth redirects ────────────────────────────────────────────────────
  // Skip auth-redirects for Next.js router prefetches. When middleware
  // 307s a prefetched URL, the router treats the redirect target as a new
  // prefetch destination and loops indefinitely (e.g. a `<Link href="/login">`
  // on `/app` would bounce between the two). Letting prefetches through is
  // safe — the protected page itself renders a `<RouteGuard>` that does the
  // real redirect on actual navigation, and unauthenticated RSC payloads
  // only ever contain the loading shell because the underlying API calls
  // 401 without a session cookie.
  const isPrefetch =
    req.headers.get("next-router-prefetch") === "1" ||
    req.headers.get("purpose") === "prefetch" ||
    req.headers.get("x-purpose") === "prefetch" ||
    req.headers.get("sec-purpose")?.includes("prefetch") === true;

  if (!isPrefetch) {
    const isProtected = PROTECTED_PREFIXES.some(
      (p) => pathname === p || pathname.startsWith(`${p}/`),
    );
    if (isProtected && !hasSession) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
    if (hasSession && AUTH_ROUTES.includes(pathname)) {
      const url = req.nextUrl.clone();
      url.pathname = "/app";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  // ── Per-request nonce + CSP ───────────────────────────────────────────
  const nonce = generateNonce();
  const isDev = process.env.NODE_ENV !== "production";
  const csp = buildCsp(nonce, isDev);

  // Make the nonce available to Server Components via `headers()`.
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const res = NextResponse.next({ request: { headers: requestHeaders } });
  res.headers.set("Content-Security-Policy", csp);
  return res;
}

export const config = {
  // Skip Next internals, BFF route handlers, and static asset paths.
  // BFF route handlers ship JSON; CSP doesn't apply there.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|assets|og|robots.txt|sitemap.xml|manifest.webmanifest).*)",
  ],
};
