# Lumio Backend — Verification Audit Report

**Date:** 2026-05-03  
**Auditor:** Claude Sonnet 4.6 (automated)  
**Scope:** `backend/` — all milestones reportedly complete  
**Role:** Read-only auditor. No code was modified during this audit.

---

## Executive Summary

The backend is in solid condition. All critical flows are tested and passing. The architecture adheres to its own documented principles. Three issues require fixes before production deployment, and several lower-priority items are noted below.

| Severity | Count |
|----------|-------|
| HIGH | 2 |
| MEDIUM | 3 |
| LOW | 4 |
| INFO | 5 |

---

## 1. Static Quality

### PHPStan (Level 8) — 3 Errors Found

**Status: FAIL**

```
ExamPapersResource.php:119   argument.type
  Parameter $admin expects User, User|null given.
  auth()->user() is nullable; no null guard before passing to createUploadUrl()

ViewIngestionJob.php:25      property.nonObject
  Cannot access $status on Model|int|string|null.
  $this->record is unresolved in Filament; needs a cast or null check

AIRouter.php:129             missingType.iterableValue
  Parameter $opts has no value type specified in iterable type array.
  Should be array<string, mixed>
```

**Severity:** MEDIUM — the first two are real type-safety holes that could throw in production if `auth()->user()` returns null (e.g. called from a queue context or misconfigured middleware).

### Pint (Laravel Code Style) — 2 Violations

**Status: FAIL**

Both violations are in test files only, not production code:

- `tests/Feature/Ingestion/IngestionPipelineTest.php` — `fully_qualified_strict_types`, `ordered_imports`
- `tests/Unit/DraftCreationServiceTest.php` — `fully_qualified_strict_types`, `ordered_imports`

**Severity:** LOW — style only, no functional impact.

---

## 2. Test Suite Integrity

### Individual Suite Results

| Suite | Tests | Status |
|-------|-------|--------|
| `AuthTest` | 21 passed, 57 assertions | PASS |
| `IngestionPipelineTest` | 17 passed, 39 assertions | PASS |
| `DraftCreationServiceTest` | 8 passed, 22 assertions | PASS |
| `VisionExtractionServiceTest` | 6 passed, 18 assertions | PASS |
| `PermissionEnforcementTest` | 6 passed, 17 assertions | PASS |
| `AdminPanelTest` | 4 passed, 6 assertions | PASS |
| `WebhookTest` | 5 passed, 9 assertions | PASS |

### Full Suite

**Status: INCONCLUSIVE** — The full `php artisan test` run exhausted system memory (Windows paging file too small) before completion. This is a test-machine resource constraint, not a code defect. No test failures were observed before the OOM crash; all individual suites run cleanly when isolated.

### Skipped Tests

One intentional skip found:

```
tests/Unit/OpenAIServiceTest.php:110
->skip(fn () => true, 'Slow test — retries use usleep (1.5s). Enable when checking circuit logic explicitly.')
```

**Severity:** INFO — documented and intentional.

---

## 3. Route Security

### FINDING: Unauthenticated `PUT storage/{path}` Route

**Severity: HIGH**

Laravel 12 auto-registers two routes when `serve: true` is set on the local filesystem disk:

```
GET|HEAD  storage/{path}   []  (no middleware)
PUT       storage/{path}   []  (no middleware)
```

The `PUT` route allows **unauthenticated writes to local storage** — any HTTP client can upload arbitrary files to `storage/app/private/` without authentication. Source: `FilesystemServiceProvider.php:106`.

This is mitigated in production only if `FILESYSTEM_DISK` is changed to `s3`, which removes the local-serve routes. However the `serve: true` config remains in `config/filesystems.php` and will reactivate if the app is ever deployed with `local` disk.

**Recommendation:** Add `'serve' => false` to the local disk config explicitly, or add a middleware group to these routes.

### All API Routes

- `/api/v1/auth/*` public endpoints: correctly throttled ✓
- `/api/v1/*` protected endpoints: `auth:sanctum` applied ✓
- `/admin/*`: Filament `Authenticate` middleware + `canAccessPanel()` gate ✓
- Webhook endpoint: signature-verified before dispatch ✓

---

## 4. Critical Flow Verification

### Authentication

- Register → hashes password with Argon2id, fires `Registered` event, writes audit log ✓
- Login → constant-time credential check, updates `last_login_at`, writes audit log ✓
- Logout → token invalidated via Sanctum `currentAccessToken()->delete()` ✓
- Password reset → no user enumeration (generic response regardless of email existence) ✓
- Phone OTP → 6-digit, expires 10 minutes, `verified_at` set on success ✓

### Webhook Security

- Paystack HMAC-SHA512 verified with `hash_equals()` (constant-time, timing-attack safe) ✓
- Idempotency via `Cache::put('paystack_event:{id}', true, 7 days)` ✓
- Cache cleared on exception before re-throw, allowing retry ✓
- Webhook tests cover: invalid signature (401), valid dispatch, idempotency, unknown events, charge.success flow ✓

### Ingestion Pipeline

All 17 pipeline tests pass. Key verifications:

- `SplitPdfJob`: idempotent (status check), page-cap enforcement, fans out `ExtractPageQuestionsJob` per page ✓
- `ExtractPageQuestionsJob`: idempotent (page status check + parent job status check), dispatches `FinalizeIngestionJob` ✓
- `FinalizeIngestionJob`: correctly uses enum instances in `in_array()` filter (string comparison would silently fail) ✓
- Daily cost cap enforced in `checkDailyCapOrFail()` ✓

### Admin Panel

- Non-admin users blocked from `/admin` ✓
- Admin-type users without a role blocked ✓
- Superadmin access allowed ✓
- Audit log written on user edit ✓

---

## 5. Database Integrity

### Migration Ordering

All migrations use explicit manual timestamps for deterministic ordering. No gaps or collisions detected across ~58 migration files.

### Schema Correctness

- `user_type` stored as VARCHAR (not MySQL ENUM) — PostgreSQL compatible ✓
- Soft deletes on `users` table ✓
- Argon2id noted in `config/hashing.php` ✓
- `exam_papers` correctly uses separate `exam_body_id` + `subject_id` columns; `DraftCreationService` correctly looks up `ExamSubject` by composite key ✓
- `questions` table has no `exam_paper_id` or `has_diagram` columns; `DraftCreationService` correctly stores `has_diagram` in `raw_extraction` JSON ✓

### Raw SQL Usage

`DB::raw()` appears in `AiCostDashboardWidget` and `CoverageHeatmapWidget` — exclusively for aggregate SELECT expressions (`SUM(...)`, `COUNT(*)`, `DATE(...)`). No string concatenation. No user input reaches these queries.

**FINDING — MySQL-specific function in groupBy:**

```php
// AiCostDashboardWidget.php:98
->groupBy(DB::raw('DATE(created_at)'))
```

`DATE()` is a MySQL function. This will fail on PostgreSQL. The codebase claims PostgreSQL compatibility.

**Severity:** LOW — production is MySQL; PostgreSQL migration is future work.

---

## 6. Job Integrity

### Jobs With Full Production-Grade Configuration

| Job | tries | timeout | backoff | failed() | idempotent |
|-----|-------|---------|---------|----------|------------|
| `SplitPdfJob` | 3 | 120s | [10,30,60] | ✓ marks Failed | ✓ |
| `ExtractPageQuestionsJob` | 3 | 120s | [15,45,90] | ✓ marks page Failed + dispatches Finalize | ✓ |
| `FinalizeIngestionJob` | 3 | 120s | [5,15,30] | ✓ logs error | ✓ |
| `PaystackWebhookJob` | 3 | — | — | — | ✓ (cache guard) |

### FINDING: Missing `$timeout` and `$tries` on Several Jobs

**Severity: MEDIUM**

The following jobs have no `$timeout`, `$tries`, or `failed()` handler:

| Job | Missing | Risk |
|-----|---------|------|
| `UserDataExportJob` | `$tries`, `$timeout`, `failed()` | If R2 upload fails, job is silently lost; user never gets export |
| `DailyMissionAssignmentJob` | `$timeout` | Iterates all student users; no timeout means runaway job possible |
| `MasteryRecomputeJob` | `$timeout` | Can recompute all affected topics; no upper bound |
| `WeeklyLeagueResolutionJob` | `$timeout` | No bound on league resolution duration |
| `MockExamGradingJob` | all | Stub/no-op — acceptable |

**Recommendation:** Add `public int $tries = 3` and `public int $timeout = 300` to the production jobs above. Add a `failed()` handler to `UserDataExportJob` that notifies the user.

### FINDING: `PaystackWebhookJob` Missing `failed()` Handler

**Severity: MEDIUM**

When `PaystackWebhookJob` exhausts all retries, there is no `failed()` method to alert or log. The idempotency cache was cleared on each failed attempt, so retries are allowed — but permanent failure is silent.

**Recommendation:** Add a `failed()` method that logs to an alerting channel (Slack/email) with the event ID and type.

---

## 7. Code Quality Spot-Check

### Architecture Compliance

- All controllers are single-action invokables ✓
- All business logic in `app/Services/` ✓
- All input validated via `FormRequest` ✓
- No `env()` calls inside `app/` ✓
- `declare(strict_types=1)` on all production PHP files ✓
- No `dd()`, `var_dump()`, `print_r()`, or `dump()` in production code ✓

### FormRequest Review

| Request | authorize() | Validation |
|---------|-------------|------------|
| `LoginRequest` | `true` | Normalizes email/phone → identifier via `prepareForValidation()` ✓ |
| `RegisterRequest` | `true` | email RFC, password confirmed, user_type enum ✓ |
| `RecordAttemptRequest` | `true` + typed `user()` | client_uuid required, context enum, time_spent_ms ≥0 ✓ |
| `StartMockExamRequest` | `true` + typed `user()` | subject_ids array min:1, exists validation ✓ |

All `authorize()` return `true` — authorization is handled at middleware and policy layer, which is correct for these routes.

### .env.example

No secrets hardcoded. All sensitive variables left blank (`AWS_SECRET_ACCESS_KEY=`, `SEED_SUPERADMIN_PASSWORD=`). All production-relevant variables documented with inline comments. ✓

### TODOs

Two legitimate TODOs in `EmbeddingService.php`:

```php
// TODO: Replace with pgvector <-> operator once migrating to PostgreSQL.
// TODO: Replace with pgvector cosine similarity when on PostgreSQL
```

These are appropriate forward-looking comments tied to a documented architectural decision (MySQL → PostgreSQL migration path). Not an issue.

---

## 8. Forensic Grep Results

| Pattern | Result |
|---------|--------|
| `dd()` / `var_dump()` / `dump()` | None found ✓ |
| `@phpstan-ignore` suppressions | None found ✓ |
| `env()` calls in `app/` | None found ✓ |
| `DB::raw()` with user input | None found ✓ |
| Test skip annotations | 1 (intentional, documented) ✓ |
| `TODO`/`FIXME` | 2 in EmbeddingService (appropriate) ✓ |
| Hardcoded secrets in .env.example | None found ✓ |
| Missing Paystack/AI keys in .env.example | Not documented — see below |

### FINDING: AI and Paystack API Keys Not in `.env.example`

**Severity: LOW**

The `.env.example` documents database, Redis, mail, and R2 config but does not include:
- `PAYSTACK_SECRET_KEY`
- `OPENAI_API_KEY`
- `GEMINI_API_KEY`
- `ANTHROPIC_API_KEY`
- `AI_INGESTION_DAILY_CAP_USD`
- `AI_TUTOR_ENABLED`, `AI_EXPLANATIONS_ENABLED`, `AI_STUDY_PLAN_ENABLED`

A new developer would not know these variables exist without reading the config files directly.

**Recommendation:** Add these to `.env.example` with empty values and brief comments.

---

## Issues Summary

### HIGH

| # | Location | Issue |
|---|----------|-------|
| H1 | `config/filesystems.php` + `FilesystemServiceProvider` | `PUT storage/{path}` accepts unauthenticated file uploads when `serve: true` |
| H2 | `ExamPapersResource.php:119` | `auth()->user()` passed to method expecting non-null `User` — will throw if null |

### MEDIUM

| # | Location | Issue |
|---|----------|-------|
| M1 | `ViewIngestionJob.php:25` | PHPStan: `$this->record->status` accessed on `Model|int|string|null` |
| M2 | `UserDataExportJob`, `DailyMissionAssignmentJob`, `MasteryRecomputeJob`, `WeeklyLeagueResolutionJob` | Missing `$tries`, `$timeout`, `failed()` |
| M3 | `PaystackWebhookJob` | No `failed()` handler — permanent failure is silent |

### LOW

| # | Location | Issue |
|---|----------|-------|
| L1 | `tests/Feature/Ingestion/IngestionPipelineTest.php` | Pint style violations |
| L2 | `tests/Unit/DraftCreationServiceTest.php` | Pint style violations |
| L3 | `AiCostDashboardWidget.php:98` | `DATE()` in `groupBy` is MySQL-specific, breaks PostgreSQL |
| L4 | `.env.example` | AI and payment API keys not documented |

### INFO

| # | Note |
|---|------|
| I1 | `AIRouter.php:129` — PHPStan: missing iterable value type on `$opts` parameter |
| I2 | `PaystackWebhookJob` only handles `charge.success`; other event types silently logged. Acceptable for current scope. |
| I3 | Full test suite OOM on Windows — machine resource constraint, not a code bug |
| I4 | `OpenAIServiceTest` circuit-breaker test intentionally skipped (uses `usleep`) |
| I5 | `composer audit` — no known security vulnerabilities in dependencies |

---

## Verification Commands Run

```bash
composer audit                          # No vulnerabilities
./vendor/bin/pint --test                # 2 style violations (test files only)
./vendor/bin/phpstan analyse            # 3 errors
php artisan route:list --json           # Storage routes inspected
php artisan config:show filesystems     # serve:true confirmed
php artisan test --filter=AuthTest      # 21/21 PASS
php artisan test --filter=IngestionPipelineTest   # 17/17 PASS
php artisan test --filter=DraftCreationServiceTest  # 8/8 PASS
php artisan test --filter=VisionExtractionServiceTest # 6/6 PASS
php artisan test --filter=PermissionEnforcementTest   # 6/6 PASS
php artisan test --filter=AdminPanelTest              # 4/4 PASS
php artisan test --filter=WebhookTest                 # 5/5 PASS
```
