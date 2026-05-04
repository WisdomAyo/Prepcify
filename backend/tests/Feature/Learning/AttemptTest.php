<?php

declare(strict_types=1);

use App\Jobs\MasteryRecomputeJob;
use App\Models\ExamSubject;
use App\Models\Question;
use App\Models\QuestionOption;
use App\Models\Topic;
use App\Models\User;
use App\Models\UserExamTarget;
use App\Models\UserSubject;
use App\Support\Enums\QuestionStatus;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Queue;
use Laravel\Sanctum\Sanctum;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeAttemptContext(): array
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

    return [$user, $examSubject];
}

function makePublishedMcqQuestion(int $examSubjectId): Question
{
    $question = Question::factory()->create([
        'exam_subject_id' => $examSubjectId,
        'status' => QuestionStatus::Published,
        'format' => 'mcq',
        'marks' => 1,
    ]);

    $option = QuestionOption::factory()->create(['question_id' => $question->id]);
    $question->update(['correct_option_id' => $option->id]);

    return $question->fresh();
}

// ─── POST /api/v1/attempts ────────────────────────────────────────────────────

describe('POST /api/v1/attempts', function () {
    it('records a correct MCQ attempt', function () {
        Queue::fake();
        [$user, $examSubject] = makeAttemptContext();
        $question = makePublishedMcqQuestion($examSubject->id);
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/attempts', [
            'question_id' => $question->id,
            'attempt_type' => 'mcq',
            'selected_option_id' => $question->correct_option_id,
            'time_spent_ms' => 8000,
            'context' => 'drill',
            'client_uuid' => fake()->uuid(),
        ]);

        $response->assertCreated();
        $response->assertJsonPath('data.is_correct', true);
        $response->assertJsonPath('data.marks_awarded', '1.00');
    });

    it('records an incorrect MCQ attempt', function () {
        Queue::fake();
        [$user, $examSubject] = makeAttemptContext();
        $question = makePublishedMcqQuestion($examSubject->id);
        $wrongOption = QuestionOption::factory()->create(['question_id' => $question->id]);
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/attempts', [
            'question_id' => $question->id,
            'attempt_type' => 'mcq',
            'selected_option_id' => $wrongOption->id,
            'time_spent_ms' => 5000,
            'context' => 'drill',
            'client_uuid' => fake()->uuid(),
        ]);

        $response->assertCreated();
        $response->assertJsonPath('data.is_correct', false);
        $response->assertJsonPath('data.marks_awarded', '0.00');
    });

    it('is idempotent for duplicate client_uuid', function () {
        Queue::fake();
        [$user, $examSubject] = makeAttemptContext();
        $question = makePublishedMcqQuestion($examSubject->id);
        $uuid = fake()->uuid();
        Sanctum::actingAs($user);

        $payload = [
            'question_id' => $question->id,
            'attempt_type' => 'mcq',
            'selected_option_id' => $question->correct_option_id,
            'time_spent_ms' => 5000,
            'context' => 'drill',
            'client_uuid' => $uuid,
        ];

        $this->postJson('/api/v1/attempts', $payload)->assertCreated();
        // Second call: existing attempt returned → 200 (wasRecentlyCreated = false)
        $this->postJson('/api/v1/attempts', $payload)->assertOk();

        expect(DB::table('attempts')->where('client_uuid', $uuid)->where('user_id', $user->id)->count())->toBe(1);
    });

    it('returns 403 for a question outside enrolled subjects', function () {
        Queue::fake();
        [$user] = makeAttemptContext();

        // Question in a different exam subject the user is NOT enrolled in
        $otherExamSubject = ExamSubject::factory()->create();
        $question = Question::factory()->create([
            'exam_subject_id' => $otherExamSubject->id,
            'status' => QuestionStatus::Published,
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/attempts', [
            'question_id' => $question->id,
            'attempt_type' => 'mcq',
            'time_spent_ms' => 5000,
            'context' => 'drill',
            'client_uuid' => fake()->uuid(),
        ]);

        $response->assertForbidden();
    });

    it('returns 401 when unauthenticated', function () {
        $this->postJson('/api/v1/attempts', [])->assertUnauthorized();
    });

    it('returns 422 for missing required fields', function () {
        [$user] = makeAttemptContext();
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/attempts', [])->assertUnprocessable();
    });

    it('dispatches MasteryRecomputeJob after recording', function () {
        Queue::fake();
        [$user, $examSubject] = makeAttemptContext();
        $question = makePublishedMcqQuestion($examSubject->id);
        $topic = Topic::factory()->create(['exam_subject_id' => $examSubject->id]);

        DB::table('question_topics')->insert([
            'question_id' => $question->id,
            'topic_id' => $topic->id,
            'source' => 'manual',
            'confidence' => 1.0,
        ]);

        Sanctum::actingAs($user);

        $this->postJson('/api/v1/attempts', [
            'question_id' => $question->id,
            'attempt_type' => 'mcq',
            'selected_option_id' => $question->correct_option_id,
            'time_spent_ms' => 5000,
            'context' => 'drill',
            'client_uuid' => fake()->uuid(),
        ])->assertCreated();

        Queue::assertPushed(MasteryRecomputeJob::class);
    });
});

// ─── Performance ─────────────────────────────────────────────────────────────

describe('performance', function () {
    it('submits an attempt with p95 latency under 200ms', function () {
        Queue::fake();
        [$user, $examSubject] = makeAttemptContext();
        $question = makePublishedMcqQuestion($examSubject->id);
        Sanctum::actingAs($user);

        $latencies = [];

        for ($i = 0; $i < 20; $i++) {
            $start = microtime(true);
            $this->postJson('/api/v1/attempts', [
                'question_id' => $question->id,
                'attempt_type' => 'mcq',
                'selected_option_id' => $question->correct_option_id,
                'time_spent_ms' => 5000,
                'context' => 'drill',
                'client_uuid' => fake()->uuid(),
            ])->assertCreated();
            $latencies[] = (microtime(true) - $start) * 1000;
        }

        sort($latencies);
        $p95 = $latencies[(int) ceil(0.95 * count($latencies)) - 1];

        expect($p95)->toBeLessThan(200);
    })->group('performance');
});
