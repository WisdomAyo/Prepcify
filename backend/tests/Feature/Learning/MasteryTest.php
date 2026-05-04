<?php

declare(strict_types=1);

use App\Models\ExamSubject;
use App\Models\Question;
use App\Models\QuestionOption;
use App\Models\Topic;
use App\Models\User;
use App\Models\UserExamTarget;
use App\Models\UserSubject;
use App\Support\Enums\QuestionStatus;
use App\Support\Enums\UserType;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Queue;
use Laravel\Sanctum\Sanctum;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeMasteryContext(): array
{
    $examSubject = ExamSubject::factory()->create();
    $user = User::factory()->create(['user_type' => UserType::Student]);

    UserExamTarget::factory()->create([
        'user_id' => $user->id,
        'exam_body_id' => $examSubject->exam_body_id,
    ]);

    UserSubject::factory()->create([
        'user_id' => $user->id,
        'subject_id' => $examSubject->subject_id,
        'active' => true,
    ]);

    $topic = Topic::factory()->create(['exam_subject_id' => $examSubject->id]);

    return [$user, $examSubject, $topic];
}

// ─── GET /api/v1/me/mastery ───────────────────────────────────────────────────

describe('GET /api/v1/me/mastery', function () {
    it('returns mastery by exam and subject', function () {
        [$user] = makeMasteryContext();
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/me/mastery');

        $response->assertOk()
            ->assertJsonStructure(['data' => ['by_exam', 'by_subject']]);
    });

    it('returns default mastery (0.5) when no attempts made', function () {
        [$user, $examSubject] = makeMasteryContext();
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/me/mastery');

        $response->assertOk();
        $byExam = $response->json('data.by_exam');
        expect($byExam)->toHaveKey((string) $examSubject->exam_body_id);
        expect($byExam[$examSubject->exam_body_id]['mastery_score'])->toBe(0.5);
    });

    it('returns 401 when unauthenticated', function () {
        $this->getJson('/api/v1/me/mastery')->assertUnauthorized();
    });
});

// ─── GET /api/v1/me/mastery/topics/{topic} ────────────────────────────────────

describe('GET /api/v1/me/mastery/topics/{topic}', function () {
    it('returns topic mastery after attempts are recorded', function () {
        Queue::fake();
        [$user, $examSubject, $topic] = makeMasteryContext();

        $question = Question::factory()->create([
            'exam_subject_id' => $examSubject->id,
            'status' => QuestionStatus::Published,
            'marks' => 1,
        ]);

        $option = QuestionOption::factory()->create(['question_id' => $question->id]);
        $question->update(['correct_option_id' => $option->id]);

        DB::table('question_topics')->insert([
            'question_id' => $question->id,
            'topic_id' => $topic->id,
            'source' => 'manual',
            'confidence' => 1.0,
        ]);

        // Directly seed attempts and pre-compute mastery
        DB::table('attempts')->insert([
            'user_id' => $user->id,
            'question_id' => $question->id,
            'attempt_type' => 'mcq',
            'is_correct' => 1,
            'marks_awarded' => 1,
            'marks_available' => 1,
            'graded_by' => 'system',
            'graded_at' => now()->toDateTimeString(),
            'time_spent_ms' => 5000,
            'context' => 'drill',
            'client_uuid' => fake()->uuid(),
            'requires_regrade' => 0,
            'attempted_at' => now()->toDateTimeString(),
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson("/api/v1/me/mastery/topics/{$topic->id}");

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'topic_id',
                    'topic_name',
                    'mastery_score',
                    'confidence',
                    'attempts_count',
                    'correct_count',
                    'last_attempted_at',
                ],
            ]);

        expect($response->json('data.attempts_count'))->toBe(1);
        expect($response->json('data.correct_count'))->toBe(1);
    });

    it('returns 403 for topic outside enrolled subjects', function () {
        [$user] = makeMasteryContext();

        $otherExamSubject = ExamSubject::factory()->create();
        $outOfScopeTopic = Topic::factory()->create(['exam_subject_id' => $otherExamSubject->id]);

        Sanctum::actingAs($user);

        $this->getJson("/api/v1/me/mastery/topics/{$outOfScopeTopic->id}")->assertForbidden();
    });

    it('returns 401 when unauthenticated', function () {
        $topic = Topic::factory()->create();
        $this->getJson("/api/v1/me/mastery/topics/{$topic->id}")->assertUnauthorized();
    });
});
