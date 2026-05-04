<?php

declare(strict_types=1);

use App\Contracts\AIProvider;
use App\Services\AIRouter;
use App\Services\ClaudeService;
use App\Services\GeminiService;
use App\Services\OpenAIService;
use App\Support\DataTransferObjects\AIResponse;
use App\Support\Enums\AiFeature;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

function makeProviderMock(string $name, bool $healthy = true): AIProvider
{
    $mock = Mockery::mock(AIProvider::class);
    $mock->allows('name')->andReturn($name);
    $mock->allows('isHealthy')->andReturn($healthy);
    $mock->allows('estimateCost')->andReturn(0.001);

    return $mock;
}

function makeAIResponse(string $provider = 'claude', string $content = 'Hello'): AIResponse
{
    return new AIResponse(
        content: $content,
        model: 'claude-sonnet-4-6',
        inputTokens: 100,
        outputTokens: 50,
        cost: 0.001,
        provider: $provider,
        durationMs: 200,
    );
}

beforeEach(function () {
    Cache::forget('circuit:claude:open');
    Cache::forget('circuit:openai:open');
    Cache::forget('circuit:gemini:open');
    Cache::forget('ai:provider:claude:disabled');
    Cache::forget('ai:provider:openai:disabled');
    Cache::forget('ai:provider:gemini:disabled');
});

// CRITICAL TEST: routes to Claude first for tutor feature
it('routes to primary provider (Claude) for tutor feature', function () {
    config([
        'ai.routes.tutor' => ['claude', 'openai', 'gemini'],
        'ai.providers.claude' => ['class' => ClaudeService::class, 'daily_budget_usd' => 100, 'enabled' => true],
        'ai.providers.openai' => ['class' => OpenAIService::class, 'daily_budget_usd' => 50, 'enabled' => true],
        'ai.providers.gemini' => ['class' => GeminiService::class, 'daily_budget_usd' => 30, 'enabled' => true],
    ]);

    $mockClaude = Mockery::mock(ClaudeService::class)->makePartial();
    $mockClaude->allows('isHealthy')->andReturn(true);
    $mockClaude->allows('complete')->once()->andReturn(makeAIResponse('claude'));
    $this->app->instance(ClaudeService::class, $mockClaude);

    $mockOpenAI = Mockery::mock(OpenAIService::class)->makePartial();
    $mockOpenAI->allows('complete')->never();
    $this->app->instance(OpenAIService::class, $mockOpenAI);

    $router = app(AIRouter::class);
    $response = $router->complete(AiFeature::Tutor, 'system', 'user');

    expect($response->provider)->toBe('claude');
});

// CRITICAL TEST: falls back to OpenAI when Claude fails
it('falls back to OpenAI when Claude throws', function () {
    config([
        'ai.routes.tutor' => ['claude', 'openai', 'gemini'],
        'ai.providers.claude' => ['class' => ClaudeService::class, 'daily_budget_usd' => 100, 'enabled' => true],
        'ai.providers.openai' => ['class' => OpenAIService::class, 'daily_budget_usd' => 50, 'enabled' => true],
        'ai.providers.gemini' => ['class' => GeminiService::class, 'daily_budget_usd' => 30, 'enabled' => true],
    ]);

    $mockClaude = Mockery::mock(ClaudeService::class)->makePartial();
    $mockClaude->allows('isHealthy')->andReturn(true);
    $mockClaude->allows('complete')->once()->andThrow(new RuntimeException('Claude API down'));
    $this->app->instance(ClaudeService::class, $mockClaude);

    $mockOpenAI = Mockery::mock(OpenAIService::class)->makePartial();
    $mockOpenAI->allows('isHealthy')->andReturn(true);
    $mockOpenAI->allows('complete')->once()->andReturn(makeAIResponse('openai', 'OpenAI response'));
    $this->app->instance(OpenAIService::class, $mockOpenAI);

    $router = app(AIRouter::class);
    $response = $router->complete(AiFeature::Tutor, 'system', 'user');

    expect($response->provider)->toBe('openai');
    expect($response->content)->toBe('OpenAI response');
});

// CRITICAL TEST: skips unhealthy provider (circuit breaker open)
it('skips provider with open circuit breaker', function () {
    config([
        'ai.routes.explanation' => ['claude', 'openai'],
        'ai.providers.claude' => ['class' => ClaudeService::class, 'daily_budget_usd' => 100, 'enabled' => true],
        'ai.providers.openai' => ['class' => OpenAIService::class, 'daily_budget_usd' => 50, 'enabled' => true],
    ]);

    $mockClaude = Mockery::mock(ClaudeService::class)->makePartial();
    $mockClaude->allows('isHealthy')->andReturn(false); // circuit open
    $mockClaude->allows('complete')->never();
    $this->app->instance(ClaudeService::class, $mockClaude);

    $mockOpenAI = Mockery::mock(OpenAIService::class)->makePartial();
    $mockOpenAI->allows('isHealthy')->andReturn(true);
    $mockOpenAI->allows('complete')->once()->andReturn(makeAIResponse('openai'));
    $this->app->instance(OpenAIService::class, $mockOpenAI);

    $router = app(AIRouter::class);
    $response = $router->complete(AiFeature::Explanation, 'system', 'user');

    expect($response->provider)->toBe('openai');
});

// CRITICAL TEST: budget enforcement skips provider
it('skips provider that has exceeded daily budget', function () {
    config([
        'ai.routes.tutor' => ['claude', 'openai'],
        'ai.providers.claude' => ['class' => ClaudeService::class, 'daily_budget_usd' => 0.001, 'enabled' => true],
        'ai.providers.openai' => ['class' => OpenAIService::class, 'daily_budget_usd' => 50, 'enabled' => true],
    ]);

    // Pre-insert a spend record that exceeds Claude's budget
    DB::table('ai_call_log')->insert([
        'user_id' => null,
        'feature' => 'tutor',
        'model' => 'claude-sonnet-4-6',
        'input_tokens' => 1000,
        'output_tokens' => 500,
        'cost_usd' => 0.005, // exceeds 0.001 budget
        'duration_ms' => 200,
        'succeeded' => true,
        'error' => null,
        'provider' => 'claude',
        'fallback_from' => null,
        'created_at' => now(),
    ]);

    $mockClaude = Mockery::mock(ClaudeService::class)->makePartial();
    $mockClaude->allows('isHealthy')->andReturn(true);
    $mockClaude->allows('complete')->never(); // skipped due to budget
    $this->app->instance(ClaudeService::class, $mockClaude);

    $mockOpenAI = Mockery::mock(OpenAIService::class)->makePartial();
    $mockOpenAI->allows('isHealthy')->andReturn(true);
    $mockOpenAI->allows('complete')->once()->andReturn(makeAIResponse('openai'));
    $this->app->instance(OpenAIService::class, $mockOpenAI);

    $router = app(AIRouter::class);
    $response = $router->complete(AiFeature::Tutor, 'system', 'user');

    expect($response->provider)->toBe('openai');
});

// CRITICAL TEST: runtime disable via cache flag
it('skips provider disabled via runtime cache flag', function () {
    config([
        'ai.routes.tutor' => ['claude', 'openai'],
        'ai.providers.claude' => ['class' => ClaudeService::class, 'daily_budget_usd' => 100, 'enabled' => true],
        'ai.providers.openai' => ['class' => OpenAIService::class, 'daily_budget_usd' => 50, 'enabled' => true],
    ]);

    Cache::put('ai:provider:claude:disabled', true, 60);

    $mockClaude = Mockery::mock(ClaudeService::class)->makePartial();
    $mockClaude->allows('complete')->never();
    $this->app->instance(ClaudeService::class, $mockClaude);

    $mockOpenAI = Mockery::mock(OpenAIService::class)->makePartial();
    $mockOpenAI->allows('isHealthy')->andReturn(true);
    $mockOpenAI->allows('complete')->once()->andReturn(makeAIResponse('openai'));
    $this->app->instance(OpenAIService::class, $mockOpenAI);

    $router = app(AIRouter::class);
    $response = $router->complete(AiFeature::Tutor, 'system', 'user');

    expect($response->provider)->toBe('openai');
});

// CRITICAL TEST: throws when all providers fail
it('throws RuntimeException when all providers fail', function () {
    config([
        'ai.routes.tutor' => ['claude'],
        'ai.providers.claude' => ['class' => ClaudeService::class, 'daily_budget_usd' => 100, 'enabled' => true],
    ]);

    $mockClaude = Mockery::mock(ClaudeService::class)->makePartial();
    $mockClaude->allows('isHealthy')->andReturn(true);
    $mockClaude->allows('complete')->andThrow(new RuntimeException('Hard failure'));
    $this->app->instance(ClaudeService::class, $mockClaude);

    $router = app(AIRouter::class);

    expect(fn () => $router->complete(AiFeature::Tutor, 'system', 'user'))
        ->toThrow(RuntimeException::class, 'All AI providers failed');
});

// CRITICAL TEST: Gemini preferred for question_extraction
it('routes question_extraction to Gemini first', function () {
    config([
        'ai.routes.question_extraction' => ['gemini', 'openai', 'claude'],
        'ai.providers.gemini' => ['class' => GeminiService::class, 'daily_budget_usd' => 30, 'enabled' => true],
        'ai.providers.openai' => ['class' => OpenAIService::class, 'daily_budget_usd' => 50, 'enabled' => true],
        'ai.providers.claude' => ['class' => ClaudeService::class, 'daily_budget_usd' => 100, 'enabled' => true],
    ]);

    $mockGemini = Mockery::mock(GeminiService::class)->makePartial();
    $mockGemini->allows('isHealthy')->andReturn(true);
    $mockGemini->allows('complete')->once()->andReturn(makeAIResponse('gemini', 'Extracted question'));
    $this->app->instance(GeminiService::class, $mockGemini);

    $mockOpenAI = Mockery::mock(OpenAIService::class)->makePartial();
    $mockOpenAI->allows('complete')->never();
    $this->app->instance(OpenAIService::class, $mockOpenAI);

    $router = app(AIRouter::class);
    $response = $router->complete(AiFeature::QuestionExtraction, 'system', 'user');

    expect($response->provider)->toBe('gemini');
    expect($response->content)->toBe('Extracted question');
});

// CRITICAL TEST: stream fallback when first provider throws on rewind
it('stream falls back to OpenAI when Claude throws on first iteration', function () {
    config([
        'ai.routes.tutor' => ['claude', 'openai'],
        'ai.providers.claude' => ['class' => ClaudeService::class, 'daily_budget_usd' => 100, 'enabled' => true],
        'ai.providers.openai' => ['class' => OpenAIService::class, 'daily_budget_usd' => 50, 'enabled' => true],
    ]);

    $mockClaude = Mockery::mock(ClaudeService::class)->makePartial();
    $mockClaude->allows('isHealthy')->andReturn(true);
    $mockClaude->allows('completeStream')->andReturn((function () {
        throw new RuntimeException('Claude stream failed');
        yield 'never';
    })());
    $this->app->instance(ClaudeService::class, $mockClaude);

    $mockOpenAI = Mockery::mock(OpenAIService::class)->makePartial();
    $mockOpenAI->allows('isHealthy')->andReturn(true);
    $mockOpenAI->allows('completeStream')->once()->andReturn((function () {
        yield 'OpenAI chunk 1';
        yield ' chunk 2';
    })());
    $this->app->instance(OpenAIService::class, $mockOpenAI);

    $router = app(AIRouter::class);
    $chunks = iterator_to_array($router->completeStream(AiFeature::Tutor, 'system', 'user'));

    expect(implode('', $chunks))->toBe('OpenAI chunk 1 chunk 2');
});
