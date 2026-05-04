<?php

declare(strict_types=1);

use App\Services\OpenAIService;
use App\Support\DataTransferObjects\AIResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    Cache::forget('circuit:openai:failures');
    Cache::forget('circuit:openai:open');
    config(['ai.providers.openai.default_model' => 'gpt-4o']);
});

it('name returns openai', function () {
    expect(app(OpenAIService::class)->name())->toBe('openai');
});

it('isHealthy returns true when circuit is closed', function () {
    expect(app(OpenAIService::class)->isHealthy())->toBeTrue();
});

it('isHealthy returns false when circuit is open', function () {
    Cache::put('circuit:openai:open', true, 300);
    expect(app(OpenAIService::class)->isHealthy())->toBeFalse();
});

it('estimateCost uses gpt-4o rates', function () {
    $cost = app(OpenAIService::class)->estimateCost(1_000_000, 1_000_000, 'gpt-4o');
    expect($cost)->toBeGreaterThan(0);
    // $5/M input + $15/M output = $20 per million each
    expect($cost)->toEqual(round(5.0 + 15.0, 6));
});

it('estimateCost uses gpt-4o-mini rates', function () {
    $cost = app(OpenAIService::class)->estimateCost(1_000_000, 1_000_000, 'gpt-4o-mini');
    expect($cost)->toBeLessThan(app(OpenAIService::class)->estimateCost(1_000_000, 1_000_000, 'gpt-4o'));
});

it('estimateCost falls back to default rates for unknown model', function () {
    $cost = app(OpenAIService::class)->estimateCost(100, 50, 'gpt-unknown');
    expect($cost)->toBeGreaterThan(0);
});

it('complete throws immediately when circuit is open', function () {
    Cache::put('circuit:openai:open', true, 300);

    expect(fn () => app(OpenAIService::class)->complete('system', 'user'))
        ->toThrow(RuntimeException::class, 'circuit breaker');
});

it('complete returns AIResponse on successful API call', function () {
    Http::fake([
        'https://api.openai.com/v1/chat/completions' => Http::response([
            'choices' => [['message' => ['content' => 'Hello from GPT']]],
            'usage' => ['prompt_tokens' => 50, 'completion_tokens' => 25],
        ]),
    ]);

    $response = app(OpenAIService::class)->complete('Be helpful.', 'What is 2+2?');

    expect($response)->toBeInstanceOf(AIResponse::class);
    expect($response->content)->toBe('Hello from GPT');
    expect($response->provider)->toBe('openai');
    expect($response->inputTokens)->toBe(50);
    expect($response->outputTokens)->toBe(25);
    expect($response->model)->toBe('gpt-4o');
});

it('complete logs call to ai_call_log on success', function () {
    Http::fake([
        'https://api.openai.com/v1/chat/completions' => Http::response([
            'choices' => [['message' => ['content' => 'Logged response']]],
            'usage' => ['prompt_tokens' => 10, 'completion_tokens' => 5],
        ]),
    ]);

    app(OpenAIService::class)->complete('sys', 'usr');

    $this->assertDatabaseHas('ai_call_log', [
        'provider' => 'openai',
        'model' => 'gpt-4o',
        'succeeded' => true,
    ]);
});

it('complete respects model override in opts', function () {
    Http::fake([
        'https://api.openai.com/v1/chat/completions' => Http::response([
            'choices' => [['message' => ['content' => 'mini response']]],
            'usage' => ['prompt_tokens' => 5, 'completion_tokens' => 5],
        ]),
    ]);

    $response = app(OpenAIService::class)->complete('sys', 'usr', ['model' => 'gpt-4o-mini']);

    expect($response->model)->toBe('gpt-4o-mini');
});

it('complete throws and logs failure after all retries exhausted', function () {
    Http::fake([
        'https://api.openai.com/v1/chat/completions' => Http::response(null, 500),
    ]);

    expect(fn () => app(OpenAIService::class)->complete('sys', 'usr'))
        ->toThrow(RuntimeException::class, 'OpenAI API failed after');

    $this->assertDatabaseHas('ai_call_log', ['provider' => 'openai', 'succeeded' => false]);
})->skip(fn () => true, 'Slow test — retries use usleep (1.5s). Enable when checking circuit logic explicitly.');

it('completeStream throws immediately when circuit is open', function () {
    Cache::put('circuit:openai:open', true, 300);

    $gen = app(OpenAIService::class)->completeStream('system', 'user');

    expect(fn () => iterator_to_array($gen))
        ->toThrow(RuntimeException::class, 'circuit breaker');
});

it('completeStream yields text chunks from SSE response', function () {
    $sseBody = implode('', [
        "data: {\"choices\":[{\"delta\":{\"content\":\"Hello\"}}]}\n\n",
        "data: {\"choices\":[{\"delta\":{\"content\":\" world\"}}]}\n\n",
        "data: [DONE]\n\n",
    ]);

    Http::fake([
        'https://api.openai.com/v1/chat/completions' => Http::response($sseBody),
    ]);

    $chunks = iterator_to_array(app(OpenAIService::class)->completeStream('sys', 'usr'));

    expect(implode('', $chunks))->toBe('Hello world');
});

it('completeStream logs call to ai_call_log after streaming completes', function () {
    Http::fake([
        'https://api.openai.com/v1/chat/completions' => Http::response(
            "data: {\"choices\":[{\"delta\":{\"content\":\"chunk\"}}]}\n\ndata: [DONE]\n\n",
        ),
    ]);

    iterator_to_array(app(OpenAIService::class)->completeStream('sys', 'usr'));

    $this->assertDatabaseHas('ai_call_log', ['provider' => 'openai', 'succeeded' => true]);
});

it('recordSuccess clears the failure counter', function () {
    Cache::put('circuit:openai:failures', 3, 60);

    Http::fake([
        'https://api.openai.com/v1/chat/completions' => Http::response([
            'choices' => [['message' => ['content' => 'ok']]],
            'usage' => ['prompt_tokens' => 1, 'completion_tokens' => 1],
        ]),
    ]);

    app(OpenAIService::class)->complete('sys', 'usr');

    expect(Cache::get('circuit:openai:failures'))->toBeNull();
});
