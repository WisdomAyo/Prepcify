# Lumio Backend — Architectural Principles

Read this before touching any code. These rules are non-negotiable across all milestones.

## Project

Lumio is an AI-powered exam prep platform for Nigerian and international students.  
Tech stack: Laravel 12, MySQL 8, Sanctum, spatie/laravel-permission, Filament 3, Pest.

## The Golden Rules

### 1. Strict types everywhere
Every PHP file starts with `declare(strict_types=1);`.  
Typed properties, typed method signatures, typed return types. No `mixed` unless unavoidable.

### 2. Thin controllers
Controllers handle HTTP only: validate via FormRequest, call one service method, return an API Resource.  
**No** business logic in controllers. **No** direct Eloquent queries in controllers beyond `findOrFail`.

### 3. Business logic in Services only
All business logic lives in `app/Services/`. Services are plain PHP classes, constructor-injected.  
Models hold relationships, scopes, accessors, casts. Nothing else.

### 4. FormRequest always
Every controller action that accepts input uses a FormRequest.  
**No** validation in controllers. **No** validation in services.

### 5. No repository pattern
Query Eloquent directly in services. No `app/Repositories/` folder — the project is not big enough to justify the indirection.

### 6. Config-driven, not code-driven
Exam bodies, subjects, plans, feature flags live in the database.  
Permissions live in `config/permissions.php`. Adding a new exam body is a seeder, not a deploy.

### 7. No premature abstraction
No interfaces for services until there are two implementations or a test double is needed.  
No events until there are multiple listeners. Three similar lines > premature helper.

### 8. Explicit eager loading
N+1 queries are prohibited. Eager load relationships explicitly.  
`Model::preventLazyLoading()` is active in non-production — violations will throw.

## Directory Layout

```
app/
├── Http/Controllers/Api/V1/{Resource}/   ← versioned API controllers (single-action)
├── Http/Requests/                        ← all FormRequests, flat
├── Http/Resources/                       ← all API Resources, flat
├── Models/                               ← all Eloquent models, flat
├── Services/                             ← all service classes, flat
├── Support/Enums/                        ← all PHP 8.1+ backed enums
├── Support/ValueObjects/                 ← value objects (e.g. UserContext)
├── Observers/                            ← model observers, flat
├── Policies/                             ← authorization policies, flat
├── Traits/                               ← reusable traits
└── Filament/Resources/                   ← Filament admin resources
```

Nested subdirectories are only allowed at:
- `app/Http/Controllers/Api/V1/`
- `app/Support/Enums/`
- `app/Support/ValueObjects/`

Everything else is flat.

## Security Non-Negotiables

- Passwords hashed with Argon2id (`config/hashing.php`)
- No raw SQL string concatenation — ever
- No sensitive data (tokens, password hashes, emails) in logs
- Audit log every admin write via `AuditsAdminActions` trait
- Soft deletes on User; 30-day retention before hard delete
- Rate limiting on every public endpoint (see AppServiceProvider)

## Testing

- Feature tests: `tests/Feature/Auth/AuthTest.php` (all auth in one file)
- Unit tests: one file per service in `tests/Unit/`
- Target: ≥ 80% coverage on auth layer
- Run: `make test`
- Base `TestCase` uses `RefreshDatabase` (required for Spatie permission cache)

## Common Commands

```bash
make fresh      # migrate:fresh + seed
make test       # pest with coverage
make format     # pint (fix style)
make lint       # pint --test (check only)
make analyse    # phpstan level 8
```

## Redis Graceful Fallback

Set `CACHE_STORE=redis` / `QUEUE_CONNECTION=redis` in production `.env`.  
`AppServiceProvider` pings Redis at boot. If unavailable, it silently downgrades to `database` drivers.  
In local dev, leave drivers as `database` — the ping never fires.

## User Types vs. Roles

`user_type` (VARCHAR) is the top-level classification: `student | parent | admin`.  
Spatie roles provide fine-grained admin permissions.  
`User::canAccessPanel()` checks BOTH: `user_type === 'admin'` AND `hasAnyRole([admin roles])`.

## Cache Key Registry

| Key | TTL | Invalidated by |
|-----|-----|---------------|
| `entitlements:{userId}` | 1 hour | `EntitlementService::invalidate()` — on subscription change |
| `explanation:{questionId}` | Forever | `QuestionObserver::updated/deleted` — on stem/explanation edit |
| `tutor:daily:{userId}:{date}` | End of day | Expires naturally at midnight |
| `impersonation_token:{token}` | 30 min | `ImpersonationService::end()` |
| `circuit:claude:failures` | 60 sec | `ClaudeService::recordSuccess()` |
| `circuit:claude:open` | 5 min | Expires naturally |
| `user_data_export:{userId}` | 24 hours | Expires naturally |
| `paystack_event:{eventId}` | 7 days | Expires naturally (idempotency guard) |

## AI Features

All AI calls are logged to `ai_call_log`. Kill switches in `config/features.php`:
- `AI_TUTOR_ENABLED` — disables POST /me/tutor/sessions/{id}/messages (returns 503)
- `AI_EXPLANATIONS_ENABLED` — disables GET /questions/{id}/explanation
- `AI_STUDY_PLAN_ENABLED` — disables GET/POST /me/study-plan

Circuit breaker: 5 failures in 60s → open for 5 minutes. State stored in cache.

## Performance Notes

Indexes added in `2026_04_26_500005_performance_indexes`:
- `attempts(question_id, is_correct)` — mastery calculation
- `questions(exam_subject_id, status, year)` — catalog + reviewer queue
- `question_drafts(status, submitted_at)` — reviewer workbench ordering
- `subscriptions(user_id, status, current_period_end)` — hot entitlement lookup

The `questions.embedding` JSON column is a placeholder for pgvector when the DB migrates to PostgreSQL.  
See `EmbeddingService::findSimilar()` for the TODO comment.
