<?php

declare(strict_types=1);

use App\Jobs\MockExamGradingJob;
use App\Models\ExamBody;
use App\Models\ExamSubject;
use App\Models\MockExam;
use App\Models\Question;
use App\Models\QuestionOption;
use App\Models\Subject;
use App\Models\User;
use App\Models\UserExamTarget;
use App\Models\UserSubject;
use App\Support\Enums\MockExamStatus;
use App\Support\Enums\QuestionStatus;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Queue;
use Laravel\Sanctum\Sanctum;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeMockExamContext(): array
{
    $examBody = ExamBody::factory()->create();
    $subject = Subject::factory()->create();
    $examSubject = ExamSubject::factory()->create([
        'exam_body_id' => $examBody->id,
        'subject_id' => $subject->id,
    ]);
    $user = User::factory()->create();

    UserExamTarget::factory()->create([
        'user_id' => $user->id,
        'exam_body_id' => $examBody->id,
    ]);

    UserSubject::factory()->create([
        'user_id' => $user->id,
        'subject_id' => $subject->id,
        'active' => true,
    ]);

    return [$user, $examBody, $subject, $examSubject];
}

function makePublishedQuestion(int $examSubjectId): Question
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

// ─── POST /api/v1/me/mock-exams ───────────────────────────────────────────────

describe('POST /api/v1/me/mock-exams', function () {
    it('creates a new in-progress mock exam', function () {
        [$user, $examBody, $subject] = makeMockExamContext();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/me/mock-exams', [
            'exam_body_id' => $examBody->id,
            'subject_ids' => [$subject->id],
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.status', 'in_progress');

        expect(MockExam::where('user_id', $user->id)->count())->toBe(1);
    });

    it('abandons existing in-progress mock before starting a new one', function () {
        [$user, $examBody, $subject] = makeMockExamContext();

        $existing = MockExam::factory()->create([
            'user_id' => $user->id,
            'exam_body_id' => $examBody->id,
            'status' => MockExamStatus::InProgress,
        ]);

        Sanctum::actingAs($user);

        $this->postJson('/api/v1/me/mock-exams', [
            'exam_body_id' => $examBody->id,
            'subject_ids' => [$subject->id],
        ])->assertCreated();

        expect($existing->fresh()->status)->toBe(MockExamStatus::Abandoned);
    });

    it('returns 422 when exam_body_id does not exist', function () {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/me/mock-exams', [
            'exam_body_id' => 99999,
            'subject_ids' => [1],
        ])->assertUnprocessable();
    });

    it('returns 401 when unauthenticated', function () {
        $this->postJson('/api/v1/me/mock-exams', [])->assertUnauthorized();
    });
});

// ─── GET /api/v1/me/mock-exams/{mock}/next ────────────────────────────────────

describe('GET /api/v1/me/mock-exams/{mock}/next', function () {
    it('returns the next unattempted question', function () {
        [$user, $examBody, $subject, $examSubject] = makeMockExamContext();
        makePublishedQuestion($examSubject->id);
        makePublishedQuestion($examSubject->id);

        $mock = MockExam::factory()->create([
            'user_id' => $user->id,
            'exam_body_id' => $examBody->id,
            'subject_ids' => [$subject->id],
            'status' => MockExamStatus::InProgress,
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson("/api/v1/me/mock-exams/{$mock->id}/next");

        $response->assertOk()
            ->assertJsonStructure(['data' => ['id', 'stem']]);
    });

    it('returns null data when no questions remain', function () {
        [$user, $examBody, $subject] = makeMockExamContext();

        $mock = MockExam::factory()->create([
            'user_id' => $user->id,
            'exam_body_id' => $examBody->id,
            'subject_ids' => [$subject->id],
            'status' => MockExamStatus::InProgress,
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson("/api/v1/me/mock-exams/{$mock->id}/next");

        $response->assertOk();
        expect($response->json('data'))->toBeNull();
    });

    it('returns 403 when another user accesses the mock', function () {
        [$user, $examBody, $subject] = makeMockExamContext();
        $mock = MockExam::factory()->create([
            'user_id' => $user->id,
            'exam_body_id' => $examBody->id,
            'subject_ids' => [$subject->id],
        ]);

        Sanctum::actingAs(User::factory()->create());

        $this->getJson("/api/v1/me/mock-exams/{$mock->id}/next")->assertForbidden();
    });

    it('returns 401 when unauthenticated', function () {
        $mock = MockExam::factory()->create();
        $this->getJson("/api/v1/me/mock-exams/{$mock->id}/next")->assertUnauthorized();
    });
});

// ─── POST /api/v1/me/mock-exams/{mock}/submit ────────────────────────────────

describe('POST /api/v1/me/mock-exams/{mock}/submit', function () {
    it('submits a mock exam and returns submitted status with scores', function () {
        Queue::fake();
        [$user, $examBody, $subject, $examSubject] = makeMockExamContext();
        $question = makePublishedQuestion($examSubject->id);

        $mock = MockExam::factory()->create([
            'user_id' => $user->id,
            'exam_body_id' => $examBody->id,
            'subject_ids' => [$subject->id],
            'status' => MockExamStatus::InProgress,
            'started_at' => now()->subMinutes(30),
        ]);

        // Seed an attempt for this mock
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
            'context' => 'mock_exam',
            'client_uuid' => fake()->uuid(),
            'requires_regrade' => 0,
            'attempted_at' => now()->subMinutes(10)->toDateTimeString(),
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson("/api/v1/me/mock-exams/{$mock->id}/submit");

        $response->assertOk()
            ->assertJsonPath('data.status', 'submitted');

        expect($response->json('data.total_score'))->not->toBeNull();
        expect($response->json('data.submitted_at'))->not->toBeNull();
    });

    it('returns 422 when trying to submit an already-submitted mock', function () {
        Queue::fake();
        [$user, $examBody, $subject] = makeMockExamContext();

        $mock = MockExam::factory()->submitted()->create([
            'user_id' => $user->id,
            'exam_body_id' => $examBody->id,
            'subject_ids' => [$subject->id],
        ]);

        Sanctum::actingAs($user);

        $this->postJson("/api/v1/me/mock-exams/{$mock->id}/submit")->assertUnprocessable();
    });

    it('returns 403 when another user tries to submit', function () {
        [$user, $examBody, $subject] = makeMockExamContext();

        $mock = MockExam::factory()->create([
            'user_id' => $user->id,
            'exam_body_id' => $examBody->id,
            'subject_ids' => [$subject->id],
            'status' => MockExamStatus::InProgress,
        ]);

        Sanctum::actingAs(User::factory()->create());

        $this->postJson("/api/v1/me/mock-exams/{$mock->id}/submit")->assertForbidden();
    });

    it('dispatches MockExamGradingJob after submit', function () {
        Queue::fake();
        [$user, $examBody, $subject] = makeMockExamContext();

        $mock = MockExam::factory()->create([
            'user_id' => $user->id,
            'exam_body_id' => $examBody->id,
            'subject_ids' => [$subject->id],
            'status' => MockExamStatus::InProgress,
            'started_at' => now()->subMinutes(5),
        ]);

        Sanctum::actingAs($user);

        $this->postJson("/api/v1/me/mock-exams/{$mock->id}/submit")->assertOk();

        Queue::assertPushed(MockExamGradingJob::class);
    });

    it('returns 401 when unauthenticated', function () {
        $mock = MockExam::factory()->create();
        $this->postJson("/api/v1/me/mock-exams/{$mock->id}/submit")->assertUnauthorized();
    });
});

// ─── Full lifecycle ───────────────────────────────────────────────────────────

describe('full mock exam lifecycle', function () {
    it('start → next → submit succeeds end to end', function () {
        Queue::fake();
        [$user, $examBody, $subject, $examSubject] = makeMockExamContext();
        makePublishedQuestion($examSubject->id);

        Sanctum::actingAs($user);

        // 1. Start
        $startRes = $this->postJson('/api/v1/me/mock-exams', [
            'exam_body_id' => $examBody->id,
            'subject_ids' => [$subject->id],
        ]);
        $startRes->assertCreated();
        $mockId = $startRes->json('data.id');

        // 2. Next question
        $nextRes = $this->getJson("/api/v1/me/mock-exams/{$mockId}/next");
        $nextRes->assertOk();
        expect($nextRes->json('data'))->not->toBeNull();

        // 3. Submit
        $submitRes = $this->postJson("/api/v1/me/mock-exams/{$mockId}/submit");
        $submitRes->assertOk()
            ->assertJsonPath('data.status', 'submitted');
    });
});
