# Lumio Operations Runbook

Common admin tasks and their resolution paths.

---

## Clearing Stuck Jobs

**Symptom:** Queue workers appear stuck; jobs not processing.

```bash
# Check current queue depth
php artisan queue:monitor

# List failed jobs
php artisan queue:failed

# Retry all failed jobs
php artisan queue:retry all

# Flush all failed jobs (use with care)
php artisan queue:flush

# Restart queue workers gracefully (signals workers to stop after current job)
php artisan queue:restart
```

If a job is stuck in `processing` state:
```sql
-- Identify stuck jobs (processing > 10 minutes)
SELECT * FROM jobs WHERE reserved_at < UNIX_TIMESTAMP(NOW() - INTERVAL 10 MINUTE);

-- Release stuck jobs back to queue
UPDATE jobs SET reserved_at = NULL, attempts = 0 WHERE reserved_at < UNIX_TIMESTAMP(NOW() - INTERVAL 10 MINUTE);
```

---

## Regenerating UserContext Cache

UserContext is cached per-user for 1 hour under key `entitlements:{userId}`.

```bash
# Invalidate for a single user (run in tinker)
php artisan tinker
>>> app(\App\Services\EntitlementService::class)->invalidate(USER_ID);

# Flush entire entitlements cache (all users)
php artisan cache:clear
```

Note: This also clears explanation, circuit breaker, and all other cache keys. Use `Cache::forget('entitlements:' . $userId)` for surgical invalidation.

---

## Force-Publishing a Question

Via Filament Admin (`/admin/questions`):
1. Find the question (filter by status = `draft` or `under_review`)
2. Click Edit
3. Change `status` to `published`
4. Save

Via Artisan/Tinker:
```bash
php artisan tinker
>>> \App\Models\Question::find(QUESTION_ID)->update(['status' => 'published']);
```

Note: Publishing via Tinker bypasses the review workflow and audit log. Prefer the Filament action.

---

## Handling a Failed Paystack Webhook

**Step 1 — Check failed jobs:**
```bash
php artisan queue:failed | grep PaystackWebhook
```

**Step 2 — Retry specific job:**
```bash
php artisan queue:retry JOB_ID
```

**Step 3 — Manual replay (if job is fully gone):**
```bash
php artisan tinker
>>> $event = ['id' => 'evt_xxx', 'event' => 'charge.success', 'data' => ['reference' => 'lumio_ref_xxx']];
>>> $job = new \App\Jobs\PaystackWebhookJob('evt_xxx', $event);
>>> $job->handle(app(\App\Services\SubscriptionService::class));
```

**Step 4 — Verify payment record:**
```sql
SELECT * FROM payments WHERE paystack_reference = 'lumio_ref_xxx';
SELECT * FROM subscriptions WHERE user_id = USER_ID ORDER BY created_at DESC LIMIT 1;
```

---

## Restoring a Soft-Deleted User

Via Filament Admin (`/admin/users`):
1. Enable the "Trashed" filter
2. Find the user
3. Click "Restore"

Via Tinker:
```bash
php artisan tinker
>>> \App\Models\User::withTrashed()->find(USER_ID)->restore();
```

Note: Restoring a user does NOT restore their subscription if it was manually cancelled.

---

## Clearing the Claude Circuit Breaker

If the circuit breaker opened erroneously (e.g., brief API outage now resolved):

```bash
php artisan tinker
>>> \Illuminate\Support\Facades\Cache::forget('circuit:claude:open');
>>> \Illuminate\Support\Facades\Cache::forget('circuit:claude:failures');
```

The next Claude call will proceed normally.

---

## Invalidating an Explanation Cache Entry

If a question's explanation is stale (e.g., the question was edited externally):

```bash
php artisan tinker
>>> \App\Services\ExplanationService::invalidate(QUESTION_ID);
```

The next request for that explanation will regenerate from Claude.
