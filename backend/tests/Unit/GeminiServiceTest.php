<?php

declare(strict_types=1);

use App\Services\GeminiService;
use App\Support\DataTransferObjects\AIResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    Cache::forget('circuit:gemini:failures');
    Cache::forget('circuit:gemini:open');
    config(['ai.providers.gemini.default_model' => 'gemini-2.5-pro']);
});

it('name returns gemini', function () {
    expect(app(GeminiService::class)->name())->toBe('gemini');
});

it('isHealthy returns true when circuit is closed', function () {
    expect(app(GeminiService::class)->isHealthy())->toBeTrue();
});

it('isHealthy returns false when circuit is open', function () {
    Cache::put('circuit:gemini:open', true, 300);
    expect(app(GeminiService::class)->isHealthy())->toBeFalse();
});

it('estimateCost uses gemini-2.5-pro rates', function () {
    $cost = app(GeminiService::class)->estimateCost(1_000_000, 1_000_000, 'gemini-2.5-pro');
    expect($cost)->toBeGreaterThan(0);
});

it('estimateCost uses gemini-2.0-flash rates (cheaper)', function () {
    $pro = app(GeminiService::class)->estimateCost(1_000_000, 1_000_000, 'gemini-2.5-pro');
    $flash = app(GeminiService::class)->estimateCost(1_000_000, 1_000_000, 'gemini-2.0-flash');
    expect($flash)->toBeLessThan($pro);
});

it('estimateCost falls back to defaults for unknown model', function () {
    $cost = app(GeminiService::class)->estimateCost(100, 50, 'gemini-unknown');
    expect($cost)->toBeGreaterThan(0);
});

it('complete throws immediately when circuit is open', function () {
    Cache::put('circuit:gemini:open', true, 300);

    expect(fn () => app(GeminiService::class)->complete('system', 'user'))
        ->toThrow(RuntimeException::class, 'circuit breaker');
});

it('complete returns AIResponse on successful API call', function () {
    Http::fake([
        'https://generativelanguage.googleapis.com/*' => Http::response([
            'candidates' => [[
                'content' => ['parts' => [['text' => 'Gemini says hi']]],
            ]],
            'usageMetadata' => ['promptTokenCount' => 30, 'candidatesTokenCount' => 20],
        ]),
    ]);

    $response = app(GeminiService::class)->complete('Be concise.', 'What is AI?');

    expect($response)->toBeInstanceOf(AIResponse::class);
    expect($response->content)->toBe('Gemini says hi');
    expect($response->provider)->toBe('gemini');
    expect($response->inputTokens)->toBe(30);
    expect($response->outputTokens)->toBe(20);
});

it('complete logs successful call to ai_call_log', function () {
    Http::fake([
        'https://generativelanguage.googleapis.com/*' => Http::response([
            'candidates' => [['content' => ['parts' => [['text' => 'ok']]]]],
            'usageMetadata' => ['promptTokenCount' => 5, 'candidatesTokenCount' => 5],
        ]),
    ]);

    app(GeminiService::class)->complete('sys', 'usr');

    $this->assertDatabaseHas('ai_call_log', ['provider' => 'gemini', 'succeeded' => true]);
});

it('complete respects model override in opts', function () {
    Http::fake([
        'https://generativelanguage.googleapis.com/*' => Http::response([
            'candidates' => [['content' => ['parts' => [['text' => 'flash']]]]],
            'usageMetadata' => ['promptTokenCount' => 5, 'candidatesTokenCount' => 5],
        ]),
    ]);

    $response = app(GeminiService::class)->complete('sys', 'usr', ['model' => 'gemini-2.0-flash']);

    expect($response->model)->toBe('gemini-2.0-flash');
});

it('completeStream throws immediately when circuit is open', function () {
    Cache::put('circuit:gemini:open', true, 300);

    $gen = app(GeminiService::class)->completeStream('system', 'user');

    expect(fn () => iterator_to_array($gen))
        ->toThrow(RuntimeException::class, 'circuit breaker');
});

it('completeStream yields text chunks from SSE response', function () {
    $sseBody = implode('', [
        "data: {\"candidates\":[{\"content\":{\"parts\":[{\"text\":\"Hello \"}]}}]}\n\n",
        "data: {\"candidates\":[{\"content\":{\"parts\":[{\"text\":\"Gemini\"}]}}],\"usageMetadata\":{\"promptTokenCount\":5,\"candidatesTokenCount\":2}}\n\n",
    ]);

    Http::fake([
        'https://generativelanguage.googleapis.com/*' => Http::response($sseBody),
    ]);

    $chunks = iterator_to_array(app(GeminiService::class)->completeStream('sys', 'usr'));

    expect(implode('', $chunks))->toBe('Hello Gemini');
});

it('completeStream logs call to ai_call_log after streaming completes', function () {
    Http::fake([
        'https://generativelanguage.googleapis.com/*' => Http::response(
            "data: {\"candidates\":[{\"content\":{\"parts\":[{\"text\":\"done\"}]}}]}\n\n",
        ),
    ]);

    iterator_to_array(app(GeminiService::class)->completeStream('sys', 'usr'));

    $this->assertDatabaseHas('ai_call_log', ['provider' => 'gemini', 'succeeded' => true]);
});

it('recordSuccess clears the failure counter', function () {
    Cache::put('circuit:gemini:failures', 2, 60);

    Http::fake([
        'https://generativelanguage.googleapis.com/*' => Http::response([
            'candidates' => [['content' => ['parts' => [['text' => 'ok']]]]],
            'usageMetadata' => ['promptTokenCount' => 1, 'candidatesTokenCount' => 1],
        ]),
    ]);

    app(GeminiService::class)->complete('sys', 'usr');

    expect(Cache::get('circuit:gemini:failures'))->toBeNull();
});
