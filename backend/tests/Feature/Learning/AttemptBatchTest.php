<?php

declare(strict_types=1);

use App\Models\ExamSubject;
use App\Models\Question;
use App\Models\QuestionOption;
use App\Models\User;
use App\Models\UserExamTarget;
use App\Models\UserSubject;
use App\Support\Enums\QuestionStatus;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Queue;
use Laravel\Sanctum\Sanctum;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeBatchContext(): array
{
    $examSubject = ExamSubject::factory()->create();
    $user = User::factory()->create();

    UserExamTarget::factory()->create([
        'user_id' => $user->id,
        'exam_body_id' => $examSubject->exam_body_id,
    ]);

    UserSubject::factory()->create([
        'user_id' => $user->id,
        'subject_id' => $examSubject->subject_id,
        'active' => true,
    ]);

    $question = Question::factory()->create([
        'exam_subject_id' => $examSubject->id,
        'status' => QuestionStatus::Published,
        'format' => 'mcq',
        'marks' => 1,
    ]);

    $option = QuestionOption::factory()->create(['question_id' => $question->id]);
    $question->update(['correct_option_id' => $option->id]);

    return [$user, $examSubject, $question->fresh()];
}

function attemptPayload(Question $question, string $uuid): array
{
    return [
        'question_id' => $question->id,
        'attempt_type' => 'mcq',
        'selected_option_id' => $question->correct_option_id,
        'time_spent_ms' => 5000,
        'context' => 'drill',
        'client_uuid' => $uuid,
    ];
}

// ─── POST /api/v1/attempts/batch ──────────────────────────────────────────────

describe('POST /api/v1/attempts/batch', function () {
    it('records multiple attempts at once', function () {
        Queue::fake();
        [$user, , $question] = makeBatchContext();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/attempts/batch', [
            'attempts' => [
                attemptPayload($question, fake()->uuid()),
                attemptPayload($question, fake()->uuid()),
                attemptPayload($question, fake()->uuid()),
            ],
        ]);

        $response->assertOk();
        expect($response->json('data'))->toHaveCount(3);
    });

    it('is idempotent — duplicate client_uuid produces one row', function () {
        Queue::fake();
        [$user, , $question] = makeBatchContext();
        $uuid = fake()->uuid();
        Sanctum::actingAs($user);

        $payload = ['attempts' => [attemptPayload($question, $uuid)]];

        $this->postJson('/api/v1/attempts/batch', $payload)->assertOk();
        $this->postJson('/api/v1/attempts/batch', $payload)->assertOk();

        expect(DB::table('attempts')
            ->where('client_uuid', $uuid)
            ->where('user_id', $user->id)
            ->count(),
        )->toBe(1);
    });

    it('silently skips questions outside enrolled subjects', function () {
        Queue::fake();
        [$user, , $question] = makeBatchContext();

        $otherExamSubject = ExamSubject::factory()->create();
        $outOfScope = Question::factory()->create([
            'exam_subject_id' => $otherExamSubject->id,
            'status' => QuestionStatus::Published,
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/attempts/batch', [
            'attempts' => [
                attemptPayload($question, fake()->uuid()),
                attemptPayload($outOfScope, fake()->uuid()),
            ],
        ]);

        $response->assertOk();
        // Only the in-scope question is recorded
        expect($response->json('data'))->toHaveCount(1);
    });

    it('returns the existing attempt on duplicate without re-inserting', function () {
        Queue::fake();
        [$user, , $question] = makeBatchContext();
        $uuid = fake()->uuid();
        Sanctum::actingAs($user);

        $first = $this->postJson('/api/v1/attempts/batch', [
            'attempts' => [attemptPayload($question, $uuid)],
        ])->json('data.0.id');

        $second = $this->postJson('/api/v1/attempts/batch', [
            'attempts' => [attemptPayload($question, $uuid)],
        ])->json('data.0.id');

        expect($first)->toBe($second);
    });

    it('returns 401 when unauthenticated', function () {
        $this->postJson('/api/v1/attempts/batch', ['attempts' => []])->assertUnauthorized();
    });

    it('returns 422 when attempts array is missing', function () {
        [$user] = makeBatchContext();
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/attempts/batch', [])->assertUnprocessable();
    });
});
