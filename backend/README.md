# Lumio Backend

AI-powered exam preparation platform for Nigerian and international students (WAEC, NECO, JAMB, ICAN, IELTS, Cambridge, A-Levels).

## Tech Stack

- **PHP 8.4+** / **Laravel 12 LTS**
- **MySQL 8** (PostgreSQL 16 compatible schema)
- **Laravel Sanctum** — API token auth
- **spatie/laravel-permission** — RBAC (5 admin roles)
- **Filament 3** — Admin panel at `/admin`
- **Redis** (optional) — cache/queue with graceful database fallback
- **Cloudflare R2 / AWS S3** — object storage via Flysystem
- **Pest** — testing
- **Larastan level 8** — static analysis
- **Laravel Pint** — code style

## Quick Start

```bash
# 1. Install dependencies
composer install

# 2. Copy and configure environment
cp .env.example .env
php artisan key:generate

# 3. Configure your database in .env
# DB_CONNECTION=mysql, DB_DATABASE=lumio, DB_USERNAME=..., DB_PASSWORD=...
# Also set SEED_SUPERADMIN_EMAIL and SEED_SUPERADMIN_PASSWORD

# 4. Run migrations and seed
make fresh
# or: php artisan migrate:fresh --seed

# 5. Start the dev server
php artisan serve
```

## Environment Variables

Copy `.env.example` to `.env`. Every variable is documented with inline comments.

Key variables:

| Variable | Description |
|----------|-------------|
| `DB_*` | MySQL 8 connection settings |
| `CACHE_STORE` | `database` (default) or `redis` |
| `QUEUE_CONNECTION` | `database` (default) or `redis` |
| `FILESYSTEM_DISK` | `local` or `s3` |
| `AWS_*` | S3 / Cloudflare R2 credentials |
| `SEED_SUPERADMIN_EMAIL` | Email for the initial superadmin account |
| `SEED_SUPERADMIN_PASSWORD` | Password for the initial superadmin account |
| `MAIL_MAILER` | `log` (development) or `smtp`/`ses` |

## Common Commands

```bash
make fresh      # php artisan migrate:fresh --seed
make test       # pest with coverage (min 80%)
make format     # Laravel Pint code style fix
make lint       # Pint dry-run check
make analyse    # Larastan static analysis (level 8)
```

## Running Tests

```bash
# Full suite with coverage
make test

# Quick run without coverage
php artisan test

# Specific test file
php artisan test tests/Feature/Auth/AuthTest.php
```

> Tests require a working MySQL connection. Configure `DB_*` in `.env` before running.

## Seeding

```bash
# Seeds permissions, roles, and superadmin
php artisan db:seed

# Or fresh database + seed
make fresh
```

The superadmin seeder reads `SEED_SUPERADMIN_EMAIL` and `SEED_SUPERADMIN_PASSWORD` from `.env`.  
It skips silently if either is not set.

## Admin Panel

Accessible at `http://localhost:8000/admin`.

Access requires:
- `user_type = 'admin'` on the User record
- At least one Spatie admin role assigned (Superadmin, Operations Admin, Content Lead, Content Reviewer, Support Agent)

## API Documentation

See [docs/API.md](docs/API.md) for full endpoint documentation with request/response examples.

**Base URL:** `http://localhost:8000/api/v1`  
**Auth:** Bearer token via Sanctum (obtain from `/api/v1/auth/login` or `/api/v1/auth/register`)

## Project Structure

```
app/
├── Http/Controllers/Api/V1/Auth/  — 9 single-action auth controllers
├── Http/Requests/Auth/            — FormRequests for each endpoint
├── Http/Resources/                — API Resources (UserResource, etc.)
├── Models/                        — Eloquent models (flat)
├── Services/                      — Business logic (AuthService, OtpService, AuditLogService)
├── Support/Enums/                 — PHP 8.1 backed enums (UserType, OtpStatus)
├── Filament/Resources/            — Admin panel resources
├── Policies/                      — Authorization policies
└── Traits/                        — AuditsAdminActions, etc.

database/
├── migrations/                    — Forward-only migrations
└── seeders/                       — PermissionSeeder, RoleSeeder, SuperadminSeeder

docs/
└── API.md                         — Auth API documentation

tests/
├── Feature/Auth/AuthTest.php      — All auth endpoint tests
├── Feature/Admin/                 — Admin panel tests
├── Feature/Permissions/           — Permission enforcement tests
└── Unit/                          — AuthServiceTest, OtpServiceTest
```

## Architecture

See [CLAUDE.md](CLAUDE.md) for full architectural principles followed throughout the project.
