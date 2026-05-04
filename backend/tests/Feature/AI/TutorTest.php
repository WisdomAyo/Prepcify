<?php

declare(strict_types=1);

use App\Models\TutorMessage;
use App\Models\TutorSession;
use App\Models\User;
use App\Services\ClaudeService;
use App\Services\TutorService;
use App\Support\Enums\MessageRole;
use App\Support\Enums\UserType;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;

// CRITICAL TEST: feature flag kill switch on start session
it('returns 503 when ai_tutor_enabled is false on session start', function () {
    config(['features.ai_tutor_enabled' => false]);

    $user = User::factory()->create(['user_type' => UserType::Student->value]);

    $response = $this->actingAs($user)
        ->postJson('/api/v1/me/tutor/sessions');

    $response->assertStatus(503);
});

// CRITICAL TEST: start session creates DB record
it('start session returns 201 and persists the session', function () {
    config(['features.ai_tutor_enabled' => true]);

    $user = User::factory()->create(['user_type' => UserType::Student->value]);

    $response = $this->actingAs($user)
        ->postJson('/api/v1/me/tutor/sessions');

    $response->assertCreated()
        ->assertJsonStructure(['data' => ['id', 'started_at', 'message_count']]);

    $this->assertDatabaseHas('tutor_sessions', ['user_id' => $user->id]);
});

// CRITICAL TEST: list sessions returns user's sessions only
it('list sessions only returns sessions for the authenticated user', function () {
    $user = User::factory()->create(['user_type' => UserType::Student->value]);
    $other = User::factory()->create(['user_type' => UserType::Student->value]);

    TutorSession::factory()->create(['user_id' => $user->id]);
    TutorSession::factory()->create(['user_id' => $other->id]);

    $response = $this->actingAs($user)
        ->getJson('/api/v1/me/tutor/sessions');

    $response->assertOk();
    expect($response->json('data'))->toHaveCount(1);
});

// CRITICAL TEST: feature flag kill switch on send message
it('returns 503 when ai_tutor_enabled is false on send message', function () {
    config(['features.ai_tutor_enabled' => false]);

    $user = User::factory()->create(['user_type' => UserType::Student->value]);
    $session = TutorSession::factory()->create(['user_id' => $user->id]);

    $response = $this->actingAs($user)
        ->postJson("/api/v1/me/tutor/sessions/{$session->id}/messages", [
            'message' => 'Hello',
        ]);

    $response->assertStatus(503);
});

// CRITICAL TEST: daily cap enforcement
it('enforces daily message cap and returns 429 when exceeded', function () {
    config(['features.ai_tutor_enabled' => true]);

    $user = User::factory()->create(['user_type' => UserType::Student->value]);
    $date = now()->toDateString();

    // Simulate daily limit already reached
    $dailyKey = 'tutor:daily:'.$user->id.':'.$date;
    Cache::put($dailyKey, 50, now()->endOfDay());

    $service = app(TutorService::class);

    expect(fn () => iterator_to_array($service->sendMessage(
        TutorSession::factory()->create(['user_id' => $user->id]),
        'test message',
    )))->toThrow(TooManyRequestsHttpException::class);
});

// CRITICAL TEST: sending a message creates user + assistant messages in DB
it('send message persists user and assistant messages', function () {
    config(['features.ai_tutor_enabled' => true]);

    $user = User::factory()->create(['user_type' => UserType::Student->value]);
    $session = TutorSession::factory()->create(['user_id' => $user->id]);

    $claude = Mockery::mock(ClaudeService::class)->makePartial();
    $claude->shouldReceive('completeStream')
        ->once()
        ->andReturn((function () {
            yield 'Great question!';
        })());
    $this->app->instance(ClaudeService::class, $claude);

    $service = app(TutorService::class);
    $chunks = iterator_to_array($service->sendMessage($session, 'Explain photosynthesis.'));

    expect(implode('', $chunks))->toBe('Great question!');

    $this->assertDatabaseHas('tutor_messages', [
        'tutor_session_id' => $session->id,
        'role' => 'user',
        'content' => 'Explain photosynthesis.',
    ]);

    $this->assertDatabaseHas('tutor_messages', [
        'tutor_session_id' => $session->id,
        'role' => 'assistant',
        'content' => 'Great question!',
    ]);
});

// CRITICAL TEST: cannot access another user's session messages
it('returns 404 when accessing another user session messages', function () {
    $user = User::factory()->create(['user_type' => UserType::Student->value]);
    $other = User::factory()->create(['user_type' => UserType::Student->value]);
    $session = TutorSession::factory()->create(['user_id' => $other->id]);

    $response = $this->actingAs($user)
        ->getJson("/api/v1/me/tutor/sessions/{$session->id}/messages");

    $response->assertNotFound();
});

// CRITICAL TEST: unauthenticated rejected
it('returns 401 when unauthenticated on session list', function () {
    $response = $this->getJson('/api/v1/me/tutor/sessions');
    $response->assertUnauthorized();
});

// CRITICAL TEST: messages endpoint returns messages for own session
it('returns messages for the authenticated user own session', function () {
    $user = User::factory()->create(['user_type' => UserType::Student->value]);
    $session = TutorSession::factory()->create(['user_id' => $user->id]);

    TutorMessage::create([
        'tutor_session_id' => $session->id,
        'role' => MessageRole::User,
        'content' => 'What is osmosis?',
        'created_at' => now(),
    ]);
    TutorMessage::create([
        'tutor_session_id' => $session->id,
        'role' => MessageRole::Assistant,
        'content' => 'Osmosis is the movement of water.',
        'created_at' => now(),
    ]);

    $response = $this->actingAs($user)
        ->getJson("/api/v1/me/tutor/sessions/{$session->id}/messages");

    $response->assertOk();
    expect($response->json('data'))->toHaveCount(2);
    expect($response->json('data.0.role'))->toBe('user');
    expect($response->json('data.1.role'))->toBe('assistant');
});

// CRITICAL TEST: sendMessage via HTTP controller returns SSE headers
it('sendMessage via HTTP controller sets up SSE response headers', function () {
    config(['features.ai_tutor_enabled' => true]);

    $user = User::factory()->create(['user_type' => UserType::Student->value]);
    $session = TutorSession::factory()->create(['user_id' => $user->id]);

    // The streaming closure never executes in test context; no AI mock needed
    // Override TutorService to avoid any DB/AI calls inside the closure
    $mock = Mockery::mock(TutorService::class)->makePartial();
    $this->app->instance(TutorService::class, $mock);

    $response = $this->actingAs($user)
        ->post("/api/v1/me/tutor/sessions/{$session->id}/messages", [
            'message' => 'Explain DNA.',
        ]);

    $response->assertOk();
    expect($response->headers->get('Content-Type'))->toContain('text/event-stream');
});
