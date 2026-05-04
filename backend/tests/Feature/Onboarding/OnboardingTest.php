<?php

declare(strict_types=1);

use App\Models\ExamBody;
use App\Models\Subject;
use App\Models\User;
use App\Models\UserExamTarget;
use App\Models\UserSubject;
use App\Support\Enums\ExamCategory;
use Illuminate\Support\Facades\Hash;

// ─── POST /onboarding/exam-targets ───────────────────────────────────────────

describe('POST /onboarding/exam-targets', function () {
    it('sets exam targets and replaces existing ones', function () {
        $user = User::factory()->create(['password' => Hash::make('pass')]);
        $token = $user->createToken('test')->plainTextToken;

        $body1 = ExamBody::factory()->create(['code' => 'jamb', 'category' => ExamCategory::SecondaryNg->value, 'status' => 'active']);
        $body2 = ExamBody::factory()->create(['code' => 'waec', 'category' => ExamCategory::SecondaryNg->value, 'status' => 'active']);

        // First call
        $this->withToken($token)->postJson('/api/v1/onboarding/exam-targets', [
            'exam_body_ids' => [$body1->id],
            'target_date' => now()->addYear()->toDateString(),
        ])->assertOk();

        expect(UserExamTarget::where('user_id', $user->id)->count())->toBe(1);

        // Second call replaces
        $this->withToken($token)->postJson('/api/v1/onboarding/exam-targets', [
            'exam_body_ids' => [$body1->id, $body2->id],
            'target_date' => now()->addYear()->toDateString(),
        ])->assertOk();

        expect(UserExamTarget::where('user_id', $user->id)->count())->toBe(2);
    });

    it('rejects past target_date', function () {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;
        $body = ExamBody::factory()->create(['code' => 'jamb', 'category' => ExamCategory::SecondaryNg->value]);

        $this->withToken($token)->postJson('/api/v1/onboarding/exam-targets', [
            'exam_body_ids' => [$body->id],
            'target_date' => now()->subDay()->toDateString(),
        ])->assertUnprocessable()->assertJsonValidationErrors(['target_date']);
    });

    it('requires authentication', function () {
        $this->postJson('/api/v1/onboarding/exam-targets', [])->assertUnauthorized();
    });

    it('rejects nonexistent exam body ids', function () {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $this->withToken($token)->postJson('/api/v1/onboarding/exam-targets', [
            'exam_body_ids' => [99999],
            'target_date' => now()->addYear()->toDateString(),
        ])->assertUnprocessable()->assertJsonValidationErrors(['exam_body_ids.0']);
    });
});

// ─── POST /onboarding/subjects ───────────────────────────────────────────────

describe('POST /onboarding/subjects', function () {
    it('sets subjects idempotently', function () {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;
        $body = ExamBody::factory()->create(['code' => 'jamb', 'category' => ExamCategory::SecondaryNg->value]);
        $sub = Subject::factory()->create(['name' => 'Physics', 'slug' => 'physics']);

        $payload = [
            'selections' => [
                ['exam_body_id' => $body->id, 'subject_id' => $sub->id],
            ],
        ];

        $this->withToken($token)->postJson('/api/v1/onboarding/subjects', $payload)->assertOk();
        $this->withToken($token)->postJson('/api/v1/onboarding/subjects', $payload)->assertOk();

        expect(UserSubject::where('user_id', $user->id)->count())->toBe(1);
    });

    it('requires authentication', function () {
        $this->postJson('/api/v1/onboarding/subjects', [])->assertUnauthorized();
    });

    it('rejects empty selections', function () {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $this->withToken($token)->postJson('/api/v1/onboarding/subjects', [
            'selections' => [],
        ])->assertUnprocessable()->assertJsonValidationErrors(['selections']);
    });
});

// ─── POST /onboarding/complete ───────────────────────────────────────────────

describe('POST /onboarding/complete', function () {
    it('marks onboarding_completed_at on student profile', function () {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $this->withToken($token)->postJson('/api/v1/onboarding/complete')->assertOk();

        expect($user->fresh()->studentProfile?->onboarding_completed_at)->not->toBeNull();
    });

    it('requires authentication', function () {
        $this->postJson('/api/v1/onboarding/complete')->assertUnauthorized();
    });
});
