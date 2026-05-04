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
use App\Support\Enums\ReportReason;
use Laravel\Sanctum\Sanctum;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeUserWithSubject(): array
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

// ─── Index ────────────────────────────────────────────────────────────────────

describe('GET /api/v1/questions', function () {
    it('returns paginated published questions for user context', function () {
        [$user, $examSubject] = makeUserWithSubject();

        Question::factory()->count(3)->create([
            'exam_subject_id' => $examSubject->id,
            'status' => QuestionStatus::Published,
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/questions');

        $response->assertOk()
            ->assertJsonStructure(['data', 'meta' => ['next_cursor']]);

        expect($response->json('data'))->toHaveCount(3);
    });

    it('excludes draft questions', function () {
        [$user, $examSubject] = makeUserWithSubject();

        Question::factory()->draft()->create(['exam_subject_id' => $examSubject->id]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/questions');

        $response->assertOk();
        expect($response->json('data'))->toHaveCount(0);
    });

    it('filters by topic_id', function () {
        [$user, $examSubject] = makeUserWithSubject();

        $topic = Topic::factory()->create(['exam_subject_id' => $examSubject->id]);

        $q1 = Question::factory()->create(['exam_subject_id' => $examSubject->id, 'status' => QuestionStatus::Published]);
        $q2 = Question::factory()->create(['exam_subject_id' => $examSubject->id, 'status' => QuestionStatus::Published]);
        $q1->topics()->attach($topic->id, ['source' => 'manual']);

        Sanctum::actingAs($user);

        $response = $this->getJson("/api/v1/questions?topic_id={$topic->id}");

        $response->assertOk();
        expect($response->json('data'))->toHaveCount(1);
        expect($response->json('data.0.id'))->toBe($q1->id);
    });

    it('returns 401 without authentication', function () {
        $this->getJson('/api/v1/questions')->assertUnauthorized();
    });

    it('returns 422 for invalid format filter', function () {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->getJson('/api/v1/questions?format=invalid')->assertUnprocessable();
    });
});

// ─── Show ─────────────────────────────────────────────────────────────────────

describe('GET /api/v1/questions/{id}', function () {
    it('returns question with options and diagrams', function () {
        $question = Question::factory()
            ->has(QuestionOption::factory()->count(4), 'options')
            ->create(['status' => QuestionStatus::Published]);

        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->getJson("/api/v1/questions/{$question->id}");

        $response->assertOk()
            ->assertJsonPath('data.id', $question->id)
            ->assertJsonStructure(['data' => ['id', 'format', 'stem', 'options', 'diagrams', 'topics']]);
    });

    it('returns 404 for non-existent question', function () {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->getJson('/api/v1/questions/99999')->assertNotFound();
    });

    it('returns 401 without authentication', function () {
        $this->getJson('/api/v1/questions/1')->assertUnauthorized();
    });
});

// ─── Report ───────────────────────────────────────────────────────────────────

describe('POST /api/v1/questions/{id}/report', function () {
    it('creates a report for a question', function () {
        $question = Question::factory()->create(['status' => QuestionStatus::Published]);
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson("/api/v1/questions/{$question->id}/report", [
            'reason' => ReportReason::IncorrectAnswer->value,
            'detail' => 'The answer is wrong.',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('question_reports', [
            'question_id' => $question->id,
            'reported_by' => $user->id,
            'reason' => ReportReason::IncorrectAnswer->value,
        ]);
    });

    it('prevents duplicate open reports from same user', function () {
        $question = Question::factory()->create(['status' => QuestionStatus::Published]);
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson("/api/v1/questions/{$question->id}/report", [
            'reason' => ReportReason::IncorrectAnswer->value,
        ]);

        $response = $this->postJson("/api/v1/questions/{$question->id}/report", [
            'reason' => ReportReason::IncorrectAnswer->value,
        ]);

        $response->assertUnprocessable();
    });

    it('returns 422 when reason is missing', function () {
        $question = Question::factory()->create();
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson("/api/v1/questions/{$question->id}/report", [])
            ->assertUnprocessable();
    });

    it('returns 401 without authentication', function () {
        $question = Question::factory()->create();

        $this->postJson("/api/v1/questions/{$question->id}/report", [
            'reason' => ReportReason::IncorrectAnswer->value,
        ])->assertUnauthorized();
    });
});

// ─── Similar ─────────────────────────────────────────────────────────────────

describe('GET /api/v1/questions/{id}/similar', function () {
    it('returns similar questions from the same exam subject', function () {
        $examSubject = ExamSubject::factory()->create();
        $question = Question::factory()->create([
            'exam_subject_id' => $examSubject->id,
            'status' => QuestionStatus::Published,
        ]);
        Question::factory()->count(3)->create([
            'exam_subject_id' => $examSubject->id,
            'status' => QuestionStatus::Published,
        ]);

        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->getJson("/api/v1/questions/{$question->id}/similar");

        $response->assertOk();
        expect($response->json('data'))->not->toBeEmpty();
        collect($response->json('data'))->each(
            fn ($q) => expect($q['id'])->not->toBe($question->id),
        );
    });

    it('returns 401 without authentication', function () {
        $question = Question::factory()->create();
        $this->getJson("/api/v1/questions/{$question->id}/similar")->assertUnauthorized();
    });
});
