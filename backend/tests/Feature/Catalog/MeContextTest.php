<?php

declare(strict_types=1);

use App\Models\ExamBody;
use App\Models\User;
use App\Support\Enums\ExamCategory;
use Illuminate\Support\Facades\Cache;

describe('GET /me/context', function () {
    it('returns user context for authenticated user', function () {
        $user = User::factory()->create(['timezone' => 'Africa/Lagos', 'locale' => 'en_NG']);
        $token = $user->createToken('test')->plainTextToken;

        $this->withToken($token)
            ->getJson('/api/v1/me/context')
            ->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'user_id', 'exam_body_ids', 'exam_subject_ids', 'subject_ids',
                    'topic_ids', 'nearest_exam_date', 'daily_minutes',
                    'timezone', 'locale', 'user_type', 'permissions',
                ],
            ]);
    });

    it('caches the context on first call', function () {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        Cache::flush();

        $this->withToken($token)->getJson('/api/v1/me/context')->assertOk();

        expect(Cache::has("user_context:{$user->id}"))->toBeTrue();
    });

    it('invalidates cache when exam targets are updated', function () {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;
        $body = ExamBody::factory()->create(['code' => 'jamb', 'category' => ExamCategory::SecondaryNg->value]);

        Cache::flush();

        // Prime the cache
        $this->withToken($token)->getJson('/api/v1/me/context')->assertOk();
        expect(Cache::has("user_context:{$user->id}"))->toBeTrue();

        // Set exam targets should bust the cache
        $this->withToken($token)->postJson('/api/v1/onboarding/exam-targets', [
            'exam_body_ids' => [$body->id],
            'target_date' => now()->addYear()->toDateString(),
        ])->assertOk();

        expect(Cache::has("user_context:{$user->id}"))->toBeFalse();
    });

    it('returns 401 when unauthenticated', function () {
        $this->getJson('/api/v1/me/context')->assertUnauthorized();
    });
});
