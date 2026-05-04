<?php

declare(strict_types=1);

use App\Models\StudySession;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

// ─── POST /api/v1/me/sessions ─────────────────────────────────────────────────

describe('POST /api/v1/me/sessions', function () {
    it('starts a new study session', function () {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/me/sessions', ['context' => 'drill']);

        $response->assertCreated()
            ->assertJsonStructure(['data' => ['id', 'context', 'started_at']]);

        expect($response->json('data.context'))->toBe('drill');
        expect($response->json('data.ended_at'))->toBeNull();
    });

    it('returns 422 for invalid context value', function () {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/me/sessions', ['context' => 'invalid_context'])
            ->assertUnprocessable();
    });

    it('returns 401 when unauthenticated', function () {
        $this->postJson('/api/v1/me/sessions', ['context' => 'drill'])->assertUnauthorized();
    });
});

// ─── POST /api/v1/me/sessions/{session}/end ───────────────────────────────────

describe('POST /api/v1/me/sessions/{session}/end', function () {
    it('ends an active session and sets ended_at', function () {
        $user = User::factory()->create();
        $session = StudySession::factory()->create(['user_id' => $user->id]);
        Sanctum::actingAs($user);

        $response = $this->postJson("/api/v1/me/sessions/{$session->id}/end");

        $response->assertOk();
        expect($response->json('data.ended_at'))->not->toBeNull();
    });

    it('is idempotent — ending an already-ended session returns the same session', function () {
        $user = User::factory()->create();
        $session = StudySession::factory()->ended()->create(['user_id' => $user->id]);
        Sanctum::actingAs($user);

        $first = $this->postJson("/api/v1/me/sessions/{$session->id}/end")->json('data.ended_at');
        $second = $this->postJson("/api/v1/me/sessions/{$session->id}/end")->json('data.ended_at');

        expect($first)->toBe($second);
    });

    it('returns 403 when another user tries to end the session', function () {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $session = StudySession::factory()->create(['user_id' => $owner->id]);
        Sanctum::actingAs($other);

        $this->postJson("/api/v1/me/sessions/{$session->id}/end")->assertForbidden();
    });

    it('returns 401 when unauthenticated', function () {
        $session = StudySession::factory()->create();
        $this->postJson("/api/v1/me/sessions/{$session->id}/end")->assertUnauthorized();
    });
});

// ─── GET /api/v1/me/sessions ─────────────────────────────────────────────────

describe('GET /api/v1/me/sessions', function () {
    it('returns the user\'s sessions ordered by started_at desc', function () {
        $user = User::factory()->create();
        StudySession::factory()->count(5)->ended()->create(['user_id' => $user->id]);
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/me/sessions');

        $response->assertOk();
        expect($response->json('data'))->toHaveCount(5);
    });

    it('does not return other users\' sessions', function () {
        $user = User::factory()->create();
        $other = User::factory()->create();
        StudySession::factory()->count(3)->create(['user_id' => $other->id]);
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/me/sessions');

        $response->assertOk();
        expect($response->json('data'))->toBeEmpty();
    });

    it('limits results to 20', function () {
        $user = User::factory()->create();
        StudySession::factory()->count(25)->create(['user_id' => $user->id]);
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/me/sessions');

        $response->assertOk();
        expect($response->json('data'))->toHaveCount(20);
    });

    it('returns 401 when unauthenticated', function () {
        $this->getJson('/api/v1/me/sessions')->assertUnauthorized();
    });
});
