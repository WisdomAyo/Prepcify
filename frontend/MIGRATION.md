# Vite → Next.js Migration Guide

How the SPA was converted, and the recipe for porting the remaining
`.legacy-vite/src/pages/**` pages.

## What changed structurally

| Vite / React Router            | Next.js App Router                              |
| ------------------------------ | ----------------------------------------------- |
| `src/main.tsx` + `<BrowserRouter>` | `app/layout.tsx` (root) + file-based routing |
| `<Routes>` / `<Route>`         | folders under `app/` (`app/login/page.tsx`)     |
| `<Outlet/>` in a shell         | a `layout.tsx` wrapping `{children}`            |
| `react-router-dom` `<Link to>` | `next/link` `<Link href>`                       |
| `useNavigate()`                | `useRouter()` from `next/navigation`            |
| `useLocation()` / `useParams()`| `usePathname()` / `useParams()` / `useSearchParams()` |
| `<ProtectedRoute>`             | `middleware.ts` (edge) + `<RouteGuard>` (client)|
| `import img from "@/assets/x"` | `"/assets/x"` string (files live in `public/`)  |
| Supabase / Lovable auth        | `src/lib/api/*` + `AuthContext` (Laravel Sanctum) |
| `index.html` `<meta>` tags     | `metadata` export + `src/lib/seo.ts`            |
| Google Fonts `@import`         | `next/font/google` in `app/layout.tsx`          |

## Recipe — porting one page

1. **Create the route file.** A Vite route `path="/app/subjects"` →
   `app/app/subjects/page.tsx`. Dynamic `:subjectId` → `[subjectId]`.
2. **Copy the component** from `.legacy-vite/src/pages/...`.
3. **Add `"use client"`** at the top if it uses hooks, state, effects, event
   handlers, or Framer Motion. Pure presentational pages can stay Server
   Components.
4. **Fix imports:**
   - `react-router-dom` → `next/link` + `next/navigation`.
   - `<Link to="/x">` → `<Link href="/x">`.
   - `@/components/Progress` → `@/components/ui/progress`.
   - `@/integrations/supabase/*` → `@/lib/api/*`.
   - asset imports → `/assets/<file>` strings.
5. **Add SEO** — for a Server Component page, `export const metadata`
   (use `createMetadata()`); for client pages, set it in the parent
   `layout.tsx` or a sibling Server Component.
6. **Wire data** — replace Supabase queries with `api.get/post(...)`, ideally
   inside a TanStack Query hook, and render via `<DataState>`.
7. **Test** — add a `*.test.tsx` for any new component logic.

## Notes

- Client Components are still server-rendered for first paint — good for SEO.
- `useSearchParams()` must be inside a `<Suspense>` boundary (see
  `app/login/page.tsx`).
- Once all pages are ported and verified, delete `.legacy-vite/`.
- The Laravel API response shapes in `src/lib/api/types.ts` are best-effort;
  reconcile them with `app/Http/Resources` on the backend as you wire data.
