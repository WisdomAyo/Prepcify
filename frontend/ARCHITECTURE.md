# Frontend Architecture

The frontend is a Next.js App Router application. Route files stay thin and delegate real UI/data ownership to `src/` modules.

## Structure

```text
app/                         Route segments, metadata, layouts, and routing only
src/components/              Shared UI, shells, auth layouts, providers
src/contexts/                Cross-route client state such as authenticated session
src/features/                Feature-owned UI, static view data, and local helpers
src/hooks/                   Reusable hooks that are not feature-specific
src/lib/                     API clients, SEO helpers, constants, and utilities
```

## Performance Rules

- Public routes mount only `UiProviders`; auth session hydration is scoped to login, signup, onboarding, admin, and `/app`.
- Route files should avoid large arrays, local mock data, or complex UI sections. Put those in `src/features/<feature>`.
- Shared helpers, such as timer formatting and practice question data, live beside the feature that owns them.
- Keep heavy client dependencies out of the root provider tree. Only add global providers when most routes truly need them.
- Prefer Server Components for route shells and small Client Components for interaction state.

## Current Feature Modules

- `src/features/dashboard`: dashboard cards, subject progress, study task data.
- `src/features/leaderboard`: leaderboard tabs, rankings, achievement data.
- `src/features/practice`: quiz/exam sample data and shared practice utilities.
