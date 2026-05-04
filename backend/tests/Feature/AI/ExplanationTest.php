<?php

declare(strict_types=1);

use App\Models\Question;
use App\Models\User;
use App\Services\ClaudeService;
use App\Services\ExplanationService;
use App\Support\Enums\QuestionStatus;
use App\Support\Enums\UserType;
use App\Support\ValueObjects\UserContext;
use Illuminate\Support\Facades\Cache;

// CRITICAL TEST: feature flag kill switch
it('returns 503 when ai_explanations_enabled is false', function () {
    config(['features.ai_explanations_enabled' => false]);

    $user = User::factory()->create(['user_type' => UserType::Student->value]);
    $question = Question::factory()->create();

    $response = $this->actingAs($user)
        ->getJson("/api/v1/questions/{$question->id}/explanation");

    $response->assertStatus(503);
});

// CRITICAL TEST: cache hit — no Claude call made
it('returns cached explanation without calling Claude', function () {
    $user = User::factory()->create(['user_type' => UserType::Student->value]);
    $question = Question::factory()->create();

    Cache::forever('explanation:'.$question->id, 'Cached explanation text.');

    $claude = Mockery::mock(ClaudeService::class);
    $claude->shouldNotReceive('completeStream');
    $this->app->instance(ClaudeService::class, $claude);

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

    expect(implode('', $chunks))->toBe('Cached explanation text.');
});

// CRITICAL TEST: unpublished question returns 404
it('returns 404 for unpublished question', function () {
    config(['features.ai_explanations_enabled' => true]);

    $user = User::factory()->create(['user_type' => UserType::Student->value]);
    $question = Question::factory()->create(['status' => QuestionStatus::Draft]);

    $response = $this->actingAs($user)
        ->getJson("/api/v1/questions/{$question->id}/explanation");

    $response->assertNotFound();
});

// CRITICAL TEST: unauthenticated request is rejected
it('returns 401 when unauthenticated', function () {
    $question = Question::factory()->create();

    $response = $this->getJson("/api/v1/questions/{$question->id}/explanation");

    $response->assertUnauthorized();
});

// CRITICAL TEST: explanation cache is set after generation
it('caches explanation after first generation', function () {
    config(['features.ai_explanations_enabled' => true]);

    $user = User::factory()->create(['user_type' => UserType::Student->value]);
    $question = Question::factory()->create();
    Cache::forget('explanation:'.$question->id);

    $claude = Mockery::mock(ClaudeService::class);
    $claude->shouldReceive('completeStream')
        ->once()
        ->andReturn((function () {
            yield 'Generated explanation.';
        })());
    $this->app->instance(ClaudeService::class, $claude);

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

    expect(implode('', $chunks))->toBe('Generated explanation.');
    expect(Cache::get('explanation:'.$question->id))->toBe('Generated explanation.');
});

// CRITICAL TEST: QuestionObserver invalidates cache on stem update
it('invalidates explanation cache when question stem is updated', function () {
    $question = Question::factory()->create();
    Cache::forever('explanation:'.$question->id, 'Old explanation.');

    $question->update(['stem' => 'Updated question stem?']);

    expect(Cache::has('explanation:'.$question->id))->toBeFalse();
});

// CRITICAL TEST: QuestionObserver invalidates cache on delete
it('invalidates explanation cache when question is deleted', function () {
    $question = Question::factory()->create();
    Cache::forever('explanation:'.$question->id, 'Some explanation.');

    $question->delete();

    expect(Cache::has('explanation:'.$question->id))->toBeFalse();
});

// CRITICAL TEST: HTTP layer — controller sets up stream response for published question
it('returns SSE headers for a published question via HTTP', function () {
    config(['features.ai_explanations_enabled' => true]);

    $user = User::factory()->create(['user_type' => UserType::Student->value]);
    $question = Question::factory()->create();
    // Cache hit avoids any AI call; the streaming closure never runs in test context
    Cache::forever('explanation:'.$question->id, 'Cached text.');

    $response = $this->actingAs($user)
        ->get("/api/v1/questions/{$question->id}/explanation");

    $response->assertOk();
    expect($response->headers->get('Content-Type'))->toContain('text/event-stream');
});
