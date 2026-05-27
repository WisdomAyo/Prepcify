# prepcify — Frontend (Next.js 15)

The prepcify web client: an AI-powered exam-prep platform for Nigerian and
international students. Migrated from a Vite + React Router SPA to **Next.js 15
(App Router)** with first-class SEO, server rendering, and a tested,
production-grade component library.

---

## Stack

| Concern        | Choice                                              |
| -------------- | --------------------------------------------------- |
| Framework      | Next.js 15 (App Router, React 18, TypeScript)       |
| Styling        | Tailwind CSS + CSS variables (HSL design tokens)    |
| UI primitives  | Radix UI + a custom component library (`src/components/ui`) |
| Data           | TanStack Query + a typed Laravel API client         |
| Auth           | Laravel Sanctum bearer token (cookie-stored)        |
| Animation      | Framer Motion                                       |
| Unit tests     | Vitest + Testing Library                            |
| E2E tests      | Playwright                                          |

---

## Getting started

```bash
npm install          # install dependencies
cp .env.example .env.local   # then edit values
npm run dev          # http://localhost:3000
```

The Laravel API is expected at `LARAVEL_API_ORIGIN` (default
`http://localhost:8000`). In dev, browser requests go through a Next.js rewrite
(`/api/laravel/* → Laravel /api/*`) so cookies stay first-party.

### Scripts

| Command                | Purpose                                  |
| ---------------------- | ---------------------------------------- |
| `npm run dev`          | Dev server                               |
| `npm run build`        | Production build                         |
| `npm run start`        | Serve the production build               |
| `npm run lint`         | ESLint (`next lint`)                     |
| `npm run typecheck`    | `tsc --noEmit`                           |
| `npm run test`         | Vitest unit tests                        |
| `npm run test:coverage`| Unit tests + coverage report             |
| `npm run test:e2e`     | Playwright end-to-end tests              |

---

## Architecture

```
app/                      ← App Router: routes, layouts, metadata
  layout.tsx              ← root layout: fonts, <Providers>, default SEO
  page.tsx                ← marketing home (Server Component + JSON-LD)
  sitemap.ts robots.ts manifest.ts
  login/ signup/ ...      ← public auth routes
  onboarding/             ← post-signup wizard
  app/                    ← protected student app (RouteGuard + WebShell)
  admin/                  ← protected admin panel (RouteGuard + AdminShell)
middleware.ts             ← edge auth-gate for /app and /admin
src/
  components/ui/          ← the reusable component library (see below)
  components/auth|shells|marketing|onboarding/
  contexts/auth-context   ← Sanctum-backed auth provider
  lib/api/                ← typed Laravel API client
  lib/seo.ts site.ts      ← SEO helpers + site config
  hooks/
```

### Server vs Client Components

Pages are **Server Components** by default — they export `metadata` and render
static HTML. Interactivity (forms, animation, the auth context) lives in
**Client Components** marked `"use client"`. Client Components are still
server-rendered for their initial HTML, so all marketing copy is crawlable.

---

## The component library (`src/components/ui`)

Designed to be **reusable, accessible, and production-ready**. Every component
ships JSDoc with usage examples.

### Component architecture

- **Primitives** — `Button`, `Input`, `Label`, `Card`, `Badge`, `Skeleton`,
  `Spinner`, `Progress`.
- **Composed** — `Field` (accessible form-field wrapper), `DataState` /
  `EmptyState` (async-state handling), `DropdownMenu`, `Tooltip`.
- Variants are defined with `class-variance-authority`; class conflicts are
  resolved by `cn()` (clsx + tailwind-merge), so consumers can always override.
- `asChild` (Radix `Slot`) makes `Button` polymorphic — render a `<Link>` with
  button styling without losing link semantics.

### Props design principles

- **Minimal required props, sensible defaults.** `<Button>Save</Button>` works;
  `variant`/`size`/`isLoading` are opt-in.
- **Booleans for states** (`isLoading`, `required`, `isError`) — not strings.
- **Slots for composition** (`leftIcon`, `rightIcon`, `labelAction`,
  `*Fallback`) rather than a wall of style props.
- **Forward refs + spread native props** so components are drop-in replacements
  for the underlying element.

### Built-in production concerns

| Concern          | How it is handled                                            |
| ---------------- | ------------------------------------------------------------ |
| Loading states   | `Button isLoading`, `Spinner`, `Skeleton`, `DataState`       |
| Edge cases       | `DataState` covers loading / error / empty / success; `Progress` clamps values |
| Accessibility    | `Field` wires `aria-invalid` + `aria-describedby`; visible focus rings; `role="status"`/`alert`; skip-link; `prefers-reduced-motion` |
| Responsive       | Mobile-first Tailwind; `WebShell` swaps a top nav for a bottom dock |

### Usage examples

```tsx
// Button — loading state, icon slot, polymorphic
<Button variant="accent" isLoading loadingText="Signing in">Sign in</Button>
<Button asChild variant="outline"><Link href="/app">Open app</Link></Button>

// Field — accessible form field (ARIA wiring is automatic)
<Field label="Email" error={errors.email} required>
  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
</Field>

// DataState — one place for every async UI state
<DataState
  isLoading={query.isLoading}
  isError={query.isError}
  error={query.error}
  isEmpty={query.data?.length === 0}
  onRetry={query.refetch}
>
  {query.data?.map((row) => <Row key={row.id} {...row} />)}
</DataState>
```

---

## SEO

- **Metadata API** — every route exports `metadata`; `createMetadata()`
  (`src/lib/seo.ts`) generates canonical URL + Open Graph + Twitter cards.
- **Structured data** — Organization, WebSite, SoftwareApplication and FAQ
  JSON-LD on the home page via `<JsonLd>`.
- **`sitemap.ts` / `robots.ts`** — generated `/sitemap.xml` and `/robots.txt`;
  private `/app` and `/admin` are disallowed and `noindex`.
- **Fonts** — self-hosted via `next/font` (no render-blocking request, no CLS).
- **`manifest.ts`** — installable PWA manifest.
- Server-rendered HTML means crawlers see full content without running JS.

---

## Auth & API

- `src/lib/api/client.ts` — typed `fetch` wrapper; attaches the Sanctum bearer
  token, unwraps Laravel's `{ data }` envelope, throws a typed `ApiError`.
- `AuthContext` hydrates the session from the token cookie and exposes
  `login` / `register` / `logout` / `refresh`.
- `middleware.ts` gates `/app` + `/admin` at the edge (no auth flash);
  `RouteGuard` adds onboarding + user-type checks that need an API call.

---

## Testing

- **Unit** (`*.test.tsx` next to the source) — the component library, focused
  on behaviour and accessibility (ARIA wiring, loading/disabled, edge cases).
- **E2E** (`e2e/`) — Playwright smoke tests over the production build:
  rendering, SEO tags, structured data, and route protection.

```bash
npm run test           # unit
npm run test:e2e       # end-to-end
```

---

## UI & animation libraries

Installed for richer UI work — import directly where needed:

| Library                       | Use                                            |
| ------------------------------ | ---------------------------------------------- |
| `@heroui/react`               | HeroUI component library (wired via `HeroUIProvider` + Tailwind plugin) |
| `framer-motion`               | Page/element animation (used across marketing) |
| `lottie-react`                | Lottie JSON animations                         |
| `@formkit/auto-animate`       | Zero-config list/layout transitions            |
| `canvas-confetti`             | Celebration effects (quiz/exam results)        |
| `react-icons`                 | Aggregated icon sets                           |
| `@phosphor-icons/react`       | Phosphor icon set                              |
| `lucide-react`                | Primary icon set (used throughout)             |
| `@dicebear/core` + `collection` | Generated avatar illustrations               |
| `embla-carousel-react`        | Carousels                                      |

HeroUI shares the prepcify cloud-blue as its `primary` token (see
`tailwind.config.ts`), so its components match the existing design system.

## Migration status

This repo replaced the Vite SPA. The original source is preserved in
`.legacy-vite/` as a reference.

**Migrated (55 routes):** project foundation, Laravel API layer, auth +
middleware, SEO infrastructure, the component library, marketing home, the
full auth flow (`login` / `signup` / `forgot-password` / `reset-password`),
`onboarding`, the entire student app under `/app/*` (dashboard, subjects +
topics, tutor, leaderboard, profile, past-questions browser, quiz + mock-exam
flows, achievements, battles, study plan, community, notifications, activity,
pricing + checkout, settings, playground tools) and the admin panel under
`/admin/*` (overview, questions + bulk upload, exams, users, content,
gamification).

The `/app` routes are split into two groups: `(shell)` (WebShell nav chrome)
and `(full)` (focused full-screen flows — quizzes, mock exams, live battles,
checkout results).

**Not migrated (intentional):** the standalone `/welcome` marketing page and
the `/m/*` mobile design-prototype gallery — both are non-product surfaces.
See `MIGRATION.md` for the porting recipe if they are needed later.
