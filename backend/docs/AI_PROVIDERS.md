# Lumio AI Provider Architecture

Lumio supports three AI providers — Claude (Anthropic), OpenAI, and Google Gemini — with automatic failover and per-feature provider routing.

---

## How the Routing Model Works

Every AI call goes through `AIRouter`. The router never calls an API directly; it delegates to the appropriate `AIProvider` implementation (ClaudeService, OpenAIService, GeminiService).

For each AI feature, `config/ai.php` defines an ordered provider preference list:

```php
'routes' => [
    'tutor'               => ['claude', 'openai', 'gemini'],
    'explanation'         => ['claude', 'openai', 'gemini'],
    'study_plan'          => ['claude', 'openai', 'gemini'],
    'grading'             => ['claude', 'openai'],
    'question_extraction' => ['gemini', 'openai', 'claude'],
    'embedding'           => ['openai'],
],
```

The router tries each provider in order and skips any that are:
1. **Disabled** — `enabled: false` in config or toggled off at runtime via the AI Routing admin page
2. **Unhealthy** — circuit breaker is open (5+ failures in 60 seconds)
3. **Over daily budget** — today's spend in `ai_call_log` ≥ `daily_budget_usd`

If a provider fails during a call, the router catches the exception, logs a warning, and tries the next provider. The `ai_call_log.fallback_from` column records which provider was tried first.

---

## Changing Provider Preferences

Edit `config/ai.php` → `routes` key. The order of the array determines priority. After editing, clear the config cache:

```bash
php artisan config:clear
```

No deploy required for development environments; in production, clear the cache on the server.

---

## Handling a Provider Outage

### Automatic recovery
The circuit breaker opens after 5 consecutive failures within 60 seconds and automatically closes after 5 minutes. During that window, the router skips the failing provider and uses the next one in the preference list. No manual action needed for brief outages.

### Manual intervention
If you need to force-disable a provider immediately (e.g., API billing issue):

**Via Admin Panel:**
1. Log in to `/admin`
2. Navigate to **AI → AI Routing**
3. Click **Disable** under the affected provider
4. The disable flag lasts 24 hours; click **Enable** to restore early

**Via Artisan/Tinker:**
```php
// Disable for 24 hours
Cache::put('ai:provider:claude:disabled', true, now()->addDay());

// Re-enable
Cache::forget('ai:provider:claude:disabled');
```

**Via config (permanent, requires deploy):**
```env
CLAUDE_ENABLED=false
```

### Clearing a stuck circuit breaker
If the outage is resolved but the circuit breaker is still open:
```bash
php artisan tinker
>>> Cache::forget('circuit:claude:open');
>>> Cache::forget('circuit:claude:failures');
```

Or use the **Clear Circuit** button on the AI Routing admin page.

---

## Adding a Fourth Provider

1. **Implement the interface:**

```php
// app/Services/MyNewService.php
class MyNewService implements \App\Contracts\AIProvider
{
    public function name(): string { return 'mynew'; }
    public function isHealthy(): bool { ... }
    public function estimateCost(int $in, int $out, string $model): float { ... }
    public function complete(string $system, string $user, array $opts = []): AIResponse { ... }
    public function completeStream(string $system, string $user, array $opts = []): Generator { ... }
}
```

2. **Register in config/ai.php:**

```php
'providers' => [
    // ... existing providers ...
    'mynew' => [
        'class' => \App\Services\MyNewService::class,
        'api_key' => env('MYNEW_API_KEY'),
        'default_model' => 'mynew-model-v1',
        'fallback_model' => 'mynew-model-lite',
        'daily_budget_usd' => (float) env('MYNEW_DAILY_BUDGET_USD', 20),
        'enabled' => (bool) env('MYNEW_ENABLED', true),
    ],
],
```

3. **Add to feature routes:**

```php
'routes' => [
    'tutor' => ['claude', 'openai', 'mynew', 'gemini'],
    // ...
],
```

4. **Add to AiRoutingPage** to display status in the admin panel:

```php
// In AiRoutingPage::loadStatus(), add to $providers:
'mynew' => app(MyNewService::class),
```

5. **Wire up environment variables** in `.env` and `.env.example`.

No other changes are needed — the router discovers providers by reading the config.

---

## Known Limitations

### Streaming compromise
All three provider implementations buffer the full HTTP response before parsing SSE events. This means `completeStream()` methods do not yield chunks in real time during the HTTP transfer — they yield after the complete body arrives. True incremental streaming would require replacing `Http::post()` with a Guzzle streaming adapter or a native curl handler with callbacks.

This is intentional for simplicity. The SSE output to the browser is still streamed incrementally (each yielded chunk is flushed immediately), but the latency-to-first-token equals the full API round-trip time.

A proper streaming implementation is tracked as a future refactor. It does not require any interface changes; only the provider implementations need updating.

---

## Cost Tracking

All AI calls are logged to `ai_call_log` with:
- `provider` — which provider served the call
- `fallback_from` — the provider that failed before this one (null = primary succeeded)
- `cost_usd` — calculated from each provider's token pricing

View costs by provider and feature on the **AI Cost Dashboard** widget on the admin home page.

---

## Per-Provider Pricing Reference

| Provider | Model | Input $/1M | Output $/1M |
|----------|-------|-----------|------------|
| Claude | claude-sonnet-4-6 | $3.00 | $15.00 |
| Claude | claude-haiku-4-5 | $0.80 | $4.00 |
| Claude | claude-opus-4-7 | $15.00 | $75.00 |
| OpenAI | gpt-4o | $5.00 | $15.00 |
| OpenAI | gpt-4o-mini | $0.15 | $0.60 |
| Gemini | gemini-2.5-pro | $1.25 | $10.00 |
| Gemini | gemini-2.0-flash | $0.10 | $0.40 |

Prices correct as of April 2026 — verify at provider dashboards before capacity planning.
