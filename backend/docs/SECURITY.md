# Lumio Security Runbook

Security procedures for the Lumio backend.

---

## 2FA Enrollment for Admin Users

Lumio uses TOTP 2FA (via `laravel/fortify` or a custom implementation if added).

**Self-service enrollment:**
1. Admin logs in at `/admin`
2. Navigate to account settings
3. Scan the QR code with Google Authenticator / Authy
4. Enter the 6-digit code to confirm

**Forced enrollment (Superadmin action):**
```bash
php artisan tinker
>>> $user = \App\Models\User::find(ADMIN_ID);
>>> // See fortify/two-factor implementation for specific commands
```

Note: Two-factor fields (`two_factor_secret`, `two_factor_recovery_codes`) are stored encrypted in the `users` table. The recovery codes are encrypted with `APP_KEY`.

---

## Admin Password Reset

If an admin cannot log in:

**Via Filament (requires another Superadmin):**
1. Log into `/admin` as Superadmin
2. Navigate to Users → find the user
3. Edit → set a new password

**Via Artisan:**
```bash
php artisan tinker
>>> $user = \App\Models\User::find(ADMIN_ID);
>>> $user->update(['password' => \Illuminate\Support\Facades\Hash::make('new_temp_password')]);
```

Force the user to change their password on next login (if feature is implemented).

---

## Responding to Suspected Admin Account Compromise

**Immediate actions (do these within minutes):**

1. **Revoke all tokens:**
```bash
php artisan tinker
>>> \App\Models\User::find(COMPROMISED_USER_ID)->tokens()->delete();
```

2. **Invalidate 2FA:**
```sql
UPDATE users SET two_factor_secret = NULL, two_factor_recovery_codes = NULL, two_factor_confirmed_at = NULL WHERE id = COMPROMISED_USER_ID;
```

3. **Force password reset:**
```bash
php artisan tinker
>>> $user = \App\Models\User::find(COMPROMISED_USER_ID);
>>> $user->update(['password' => \Illuminate\Support\Facades\Hash::make(\Illuminate\Support\Str::random(32))]);
```

4. **Review audit log** for actions taken by the compromised account:
```sql
SELECT * FROM audit_logs WHERE actor_user_id = COMPROMISED_USER_ID ORDER BY created_at DESC LIMIT 100;
```

5. **Check for suspicious data changes** — look for `admin.user.updated`, `admin.impersonation.start` entries.

6. **Notify affected users** if impersonation occurred.

7. **Rotate `APP_KEY`** if the attacker had server access (this invalidates all encrypted fields, sessions, and signed URLs).

---

## Data Export Procedure for Regulator Requests

For NDPR/GDPR data subject access requests:

**Via API (user-triggered):**
```
POST /api/v1/me/data-export
```
The job runs asynchronously and emails the user a 24-hour download link.

**Admin-triggered (for users who cannot log in):**
Via Filament → Users → find user → "Export Data" action button.

**Manual export (for legal/compliance teams):**
```bash
php artisan tinker
>>> $job = new \App\Jobs\UserDataExportJob(USER_ID);
>>> $job->handle();
```

The exported ZIP is stored on R2 and the download URL is emailed to the user's registered address.

**Idempotency:** A second export within 24 hours is skipped (cache-gated). Clear the cache to force re-export:
```bash
php artisan tinker
>>> \Illuminate\Support\Facades\Cache::forget('user_data_export:' . USER_ID);
```

---

## Environment Variable Security

- `APP_KEY` — rotate immediately on any suspected server compromise
- `PAYSTACK_SECRET_KEY` — stored in `.env` only; never committed to git
- `ANTHROPIC_API_KEY` — stored in `.env` only; monitor usage on the Anthropic console
- `DB_PASSWORD` — use a dedicated MySQL user with least-privilege grants

**What NOT to store in .env:**
- User PII, token hashes, or any data that belongs in the database

---

## Audit Log Retention

Audit logs are append-only (`$timestamps = false`, manual `created_at`). They are never updated or soft-deleted.

Hard deletion policy: retain for minimum 2 years to satisfy regulatory requirements.

```sql
-- Safe to delete entries older than 2 years only
DELETE FROM audit_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 2 YEAR);
```
