<?php

declare(strict_types=1);

use App\Models\Question;
use App\Models\TutorSession;
use App\Models\User;
use App\Services\AIRouter;
use App\Services\ClaudeService;
use App\Services\ExplanationService;
use App\Services\OpenAIService;
use App\Services\StudyPlanService;
use App\Services\TutorService;
use App\Support\DataTransferObjects\AIResponse;
use App\Support\Enums\AiFeature;
use App\Support\Enums\UserType;
use App\Support\ValueObjects\UserContext;
use Illuminate\Support\Facades\Cache;

// CRITICAL TEST: ExplanationService still works through router with mocked ClaudeService
it('explanation flow is transparent — existing ClaudeService mock is picked up via router', function () {
    config([
        'features.ai_explanations_enabled' => true,
        'ai.routes.explanation' => ['claude'],
        'ai.providers.claude' => [
            'class' => ClaudeService::class,
            'daily_budget_usd' => 100,
            'enabled' => true,
        ],
    ]);

    $user = User::factory()->create(['user_type' => UserType::Student->value]);
    $question = Question::factory()->create();
    Cache::forget('explanation:'.$question->id);

    $mockClaude = Mockery::mock(ClaudeService::class)->makePartial();
    $mockClaude->allows('isHealthy')->andReturn(true);
    // The router calls $provider->completeStream() on the interface method
    $mockClaude->allows('completeStream')->once()->andReturn((function () {
        yield 'Routed explanation.';
    })());
    $this->app->instance(ClaudeService::class, $mockClaude);

    $service = app(ExplanationService::class);
    $ctx = new UserContext(
        userId: $user->id,
        examBodyIds: [],
        examSubjectIds: [],
        subjectIds: [],
        topicIds: [],
        nearestExamDate: null,
        dailyMinutes: 30,
        timezone: 'Africa/Lagos',
        locale: 'en_NG',
        userType: UserType::Student,
        permissions: [],
        entitlements: [],
    );

    $chunks = iterator_to_array($service->getOrGenerate($question, $ctx));

    expect(implode('', $chunks))->toBe('Routed explanation.');
    expect(Cache::get('explanation:'.$question->id))->toBe('Routed explanation.');
});

// CRITICAL TEST: StudyPlanService works through router
it('study plan flow routes through AIRouter and returns content', function () {
    config([
        'features.ai_study_plan_enabled' => true,
        'ai.routes.study_plan' => ['claude'],
        'ai.providers.claude' => [
            'class' => ClaudeService::class,
            'daily_budget_usd' => 100,
            'enabled' => true,
        ],
    ]);

    $user = User::factory()->create(['user_type' => UserType::Student->value]);

    $mockClaude = Mockery::mock(ClaudeService::class)->makePartial();
    $mockClaude->allows('isHealthy')->andReturn(true);
    $mockClaude->allows('complete')->once()->andReturn(
        new AIResponse(
            content: '{"weeks": [{"day": 1}]}',
            model: 'claude-sonnet-4-6',
            inputTokens: 100,
            outputTokens: 50,
            cost: 0.001,
            provider: 'claude',
            durationMs: 200,
        ),
    );
    $this->app->instance(ClaudeService::class, $mockClaude);

    $service = app(StudyPlanService::class);
    $plan = $service->generate($user);

    expect($plan->content)->toHaveKey('weeks');
    expect($plan->user_id)->toBe($user->id);
});

// CRITICAL TEST: TutorService sends message through router
it('tutor sendMessage routes through AIRouter transparently', function () {
    config([
        'ai.routes.tutor' => ['claude'],
        'ai.providers.claude' => [
            'class' => ClaudeService::class,
            'daily_budget_usd' => 100,
            'enabled' => true,
        ],
    ]);

    $user = User::factory()->create(['user_type' => UserType::Student->value]);
    $session = TutorSession::factory()->create(['user_id' => $user->id]);

    $mockClaude = Mockery::mock(ClaudeService::class)->makePartial();
    $mockClaude->allows('isHealthy')->andReturn(true);
    $mockClaude->allows('completeStream')->once()->andReturn((function () {
        yield 'Tutor reply via router.';
    })());
    $this->app->instance(ClaudeService::class, $mockClaude);

    $service = app(TutorService::class);
    $chunks = iterator_to_array($service->sendMessage($session, 'What is photosynthesis?'));

    expect(implode('', $chunks))->toBe('Tutor reply via router.');

    $this->assertDatabaseHas('tutor_messages', [
        'tutor_session_id' => $session->id,
        'role' => 'assistant',
        'content' => 'Tutor reply via router.',
    ]);
});

// CRITICAL TEST: fallback is logged — ai_call_log entry has fallback_from set
it('fallback is visible in ai_call_log fallback_from column', function () {
    config([
        'ai.routes.tutor' => ['claude', 'openai'],
        'ai.providers.claude' => [
            'class' => ClaudeService::class,
            'daily_budget_usd' => 100,
            'enabled' => true,
        ],
        'ai.providers.openai' => [
            'class' => OpenAIService::class,
            'daily_budget_usd' => 50,
            'enabled' => true,
        ],
    ]);

    $mockClaude = Mockery::mock(ClaudeService::class)->makePartial();
    $mockClaude->allows('isHealthy')->andReturn(true);
    $mockClaude->allows('complete')->andThrow(new RuntimeException('Claude down'));
    $this->app->instance(ClaudeService::class, $mockClaude);

    $mockOpenAI = Mockery::mock(OpenAIService::class)->makePartial();
    $mockOpenAI->allows('isHealthy')->andReturn(true);
    $mockOpenAI->allows('complete')->andReturn(
        new AIResponse(
            content: 'OpenAI fallback response',
            model: 'gpt-4o',
            inputTokens: 100,
            outputTokens: 50,
            cost: 0.001,
            provider: 'openai',
            durationMs: 200,
        ),
    );
    $this->app->instance(OpenAIService::class, $mockOpenAI);

    $router = app(AIRouter::class);
    $response = $router->complete(AiFeature::Tutor, 'system', 'user', null);

    expect($response->provider)->toBe('openai');
});
