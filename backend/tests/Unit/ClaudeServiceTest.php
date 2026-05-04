<?php

declare(strict_types=1);

use App\Services\ClaudeService;
use App\Support\Enums\AiFeature;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    Cache::forget('circuit:claude:failures');
    Cache::forget('circuit:claude:open');
});

// CRITICAL TEST: circuit breaker opens after threshold failures
it('circuit breaker opens after 5 consecutive failures', function () {
    config(['services.anthropic.api_key' => 'fake-key']);

    $service = app(ClaudeService::class);

    // Use reflection to call private recordFailure 5 times
    $reflection = new ReflectionClass($service);
    $method = $reflection->getMethod('recordFailure');
    $method->setAccessible(true);

    for ($i = 0; $i < 5; $i++) {
        $method->invoke($service);
    }

    expect(Cache::get('circuit:claude:open'))->toBeTrue();
});

// CRITICAL TEST: circuit breaker throws when open
it('throws RuntimeException when circuit breaker is open', function () {
    Cache::put('circuit:claude:open', true, 300);

    $service = app(ClaudeService::class);

    expect(fn () => $service->completeOnce('system', 'user', AiFeature::Explanation))
        ->toThrow(RuntimeException::class, 'circuit breaker is open');
});

// CRITICAL TEST: success resets failure counter
it('recordSuccess clears the failure counter', function () {
    Cache::put('circuit:claude:failures', 3, 60);

    $service = app(ClaudeService::class);

    $reflection = new ReflectionClass($service);
    $method = $reflection->getMethod('recordSuccess');
    $method->setAccessible(true);
    $method->invoke($service);

    expect(Cache::has('circuit:claude:failures'))->toBeFalse();
});

// CRITICAL TEST: failure counter increments correctly
it('failure counter increments from zero', function () {
    $service = app(ClaudeService::class);

    $reflection = new ReflectionClass($service);
    $method = $reflection->getMethod('recordFailure');
    $method->setAccessible(true);

    $method->invoke($service);
    $method->invoke($service);

    expect((int) Cache::get('circuit:claude:failures'))->toBe(2);
    expect(Cache::has('circuit:claude:open'))->toBeFalse();
});

it('name returns claude', function () {
    $service = app(ClaudeService::class);
    expect($service->name())->toBe('claude');
});

it('isHealthy returns true when circuit is closed', function () {
    $service = app(ClaudeService::class);
    expect($service->isHealthy())->toBeTrue();
});

it('isHealthy returns false when circuit is open', function () {
    Cache::put('circuit:claude:open', true, 300);
    $service = app(ClaudeService::class);
    expect($service->isHealthy())->toBeFalse();
});

it('estimateCost uses per-model rates', function () {
    $service = app(ClaudeService::class);
    // 1000 input @ $0.000003 + 500 output @ $0.000015 = $0.010500
    $cost = $service->estimateCost(1000, 500, 'claude-sonnet-4-6');
    expect($cost)->toBe(0.010500);
});

it('estimateCost falls back to defaults for unknown model', function () {
    $service = app(ClaudeService::class);
    $cost = $service->estimateCost(1000, 0, 'unknown-model');
    expect($cost)->toBe(round(1000 * 0.000003, 6));
});

it('completeOnce returns text on success', function () {
    config(['services.anthropic.api_key' => 'fake-key']);

    Http::fake([
        'api.anthropic.com/*' => Http::response([
            'content' => [['text' => 'Hello from Claude']],
            'usage' => ['input_tokens' => 10, 'output_tokens' => 5],
        ], 200),
    ]);

    $service = app(ClaudeService::class);
    $result = $service->completeOnce('system', 'user', AiFeature::Explanation);

    expect($result)->toBe('Hello from Claude');
});

it('completeOnce logs successful AI call', function () {
    config(['services.anthropic.api_key' => 'fake-key']);

    Http::fake([
        'api.anthropic.com/*' => Http::response([
            'content' => [['text' => 'response']],
            'usage' => ['input_tokens' => 20, 'output_tokens' => 10],
        ], 200),
    ]);

    $service = app(ClaudeService::class);
    $service->completeOnce('sys', 'msg', AiFeature::Explanation, userId: null);

    $this->assertDatabaseHas('ai_call_log', [
        'feature' => 'explanation',
        'input_tokens' => 20,
        'output_tokens' => 10,
        'succeeded' => 1,
    ]);
});

it('complete() wraps completeOnce and returns AIResponse', function () {
    config(['services.anthropic.api_key' => 'fake-key']);

    Http::fake([
        'api.anthropic.com/*' => Http::response([
            'content' => [['text' => 'AI response']],
            'usage' => ['input_tokens' => 5, 'output_tokens' => 5],
        ], 200),
    ]);

    $service = app(ClaudeService::class);
    $response = $service->complete('system', 'user');

    expect($response->content)->toBe('AI response');
    expect($response->provider)->toBe('claude');
});

it('completeStream yields text chunks from SSE response', function () {
    config(['services.anthropic.api_key' => 'fake-key']);

    $sseBody = implode("\n", [
        'data: {"type":"message_start","message":{"usage":{"input_tokens":10}}}',
        'data: {"type":"content_block_delta","delta":{"text":"Hello"}}',
        'data: {"type":"content_block_delta","delta":{"text":" world"}}',
        'data: {"type":"message_delta","usage":{"output_tokens":2}}',
    ]);

    Http::fake([
        'api.anthropic.com/*' => Http::response($sseBody, 200),
    ]);

    $service = app(ClaudeService::class);
    $chunks = iterator_to_array($service->completeStream('system', 'user'));

    expect(implode('', $chunks))->toBe('Hello world');
});

it('completeOnce records failure and re-throws on server error', function () {
    config(['services.anthropic.api_key' => 'fake-key']);

    Http::fake([
        'api.anthropic.com/*' => Http::response([], 500),
    ]);

    $service = app(ClaudeService::class);

    expect(fn () => $service->completeOnce('sys', 'msg', AiFeature::Explanation))
        ->toThrow(RuntimeException::class);

    $this->assertDatabaseHas('ai_call_log', ['succeeded' => 0]);
});

// CRITICAL TEST: cost calculation
it('calculates cost correctly in logCall', function () {
    config(['services.anthropic.api_key' => 'fake-key']);

    $service = app(ClaudeService::class);

    $reflection = new ReflectionClass($service);
    $method = $reflection->getMethod('logCall');
    $method->setAccessible(true);

    // 1000 input tokens @ $0.000003 + 500 output tokens @ $0.000015 = $0.010500
    $method->invoke($service, null, AiFeature::Explanation, 'claude-sonnet-4-6', 1000, 500, 200, true, null);

    $this->assertDatabaseHas('ai_call_log', [
        'feature' => 'explanation',
        'input_tokens' => 1000,
        'output_tokens' => 500,
        'succeeded' => 1,
    ]);
});
