<?php

declare(strict_types=1);

use App\Models\ExamSubject;
use App\Models\Question;
use App\Models\Topic;
use App\Models\User;
use App\Services\MasteryService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

beforeEach(function () {
    $this->service = new MasteryService;
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function seedAttempts(int $userId, int $questionId, int $topicId, int $correct, int $total, bool $recent = true): void
{
    DB::table('question_topics')->insertOrIgnore([
        'question_id' => $questionId,
        'topic_id' => $topicId,
        'source' => 'manual',
        'confidence' => 1.0,
    ]);

    $date = $recent ? now()->subDays(5)->toDateTimeString() : now()->subDays(60)->toDateTimeString();

    for ($i = 0; $i < $total; $i++) {
        DB::table('attempts')->insert([
            'user_id' => $userId,
            'question_id' => $questionId,
            'attempt_type' => 'mcq',
            'is_correct' => $i < $correct ? 1 : 0,
            'marks_awarded' => $i < $correct ? 1 : 0,
            'marks_available' => 1,
            'graded_by' => 'system',
            'graded_at' => $date,
            'time_spent_ms' => 5000,
            'context' => 'drill',
            'client_uuid' => Str::uuid(),
            'requires_regrade' => 0,
            'attempted_at' => $date,
        ]);
    }
}

// ─── Laplace formula ─────────────────────────────────────────────────────────

describe('Laplace formula', function () {
    it('computes mastery with known inputs (all correct)', function () {
        $user = User::factory()->create();
        $examSubject = ExamSubject::factory()->create();
        $topic = Topic::factory()->create(['exam_subject_id' => $examSubject->id]);
        $question = Question::factory()->create(['exam_subject_id' => $examSubject->id]);

        seedAttempts($user->id, $question->id, $topic->id, 10, 10);

        $this->service->computeForTopic($user->id, $topic->id);

        $row = DB::table('topic_mastery')
            ->where('user_id', $user->id)
            ->where('topic_id', $topic->id)
            ->first();

        expect($row)->not->toBeNull();

        // 10 correct recent (×1.5) = 15 weighted_correct, 15 weighted_attempts
        // mastery = (15 + 2) / (15 + 4) = 17/19 ≈ 0.895
        expect((float) $row->mastery_score)->toBeGreaterThan(0.88)->toBeLessThan(0.91);
    });

    it('computes mastery with all incorrect answers', function () {
        $user = User::factory()->create();
        $examSubject = ExamSubject::factory()->create();
        $topic = Topic::factory()->create(['exam_subject_id' => $examSubject->id]);
        $question = Question::factory()->create(['exam_subject_id' => $examSubject->id]);

        seedAttempts($user->id, $question->id, $topic->id, 0, 10);

        $this->service->computeForTopic($user->id, $topic->id);

        $row = DB::table('topic_mastery')
            ->where('user_id', $user->id)
            ->where('topic_id', $topic->id)
            ->first();

        // 0 correct recent, 10 attempts (×1.5) = 15 weighted_attempts
        // mastery = (0 + 2) / (15 + 4) = 2/19 ≈ 0.105
        expect((float) $row->mastery_score)->toBeLessThan(0.15);
    });

    it('returns the Laplace prior (0.5) when no attempts exist', function () {
        $user = User::factory()->create();
        $examSubject = ExamSubject::factory()->create();
        $topic = Topic::factory()->create(['exam_subject_id' => $examSubject->id]);

        // Do not insert any attempts — computeForTopic should early-return
        $this->service->computeForTopic($user->id, $topic->id);

        $row = DB::table('topic_mastery')
            ->where('user_id', $user->id)
            ->where('topic_id', $topic->id)
            ->first();

        // No row written when attempts_count == 0
        expect($row)->toBeNull();
    });

    it('confidence caps at 1.0 for 20+ attempts', function () {
        $user = User::factory()->create();
        $examSubject = ExamSubject::factory()->create();
        $topic = Topic::factory()->create(['exam_subject_id' => $examSubject->id]);
        $question = Question::factory()->create(['exam_subject_id' => $examSubject->id]);

        seedAttempts($user->id, $question->id, $topic->id, 20, 20);

        $this->service->computeForTopic($user->id, $topic->id);

        $row = DB::table('topic_mastery')
            ->where('user_id', $user->id)
            ->where('topic_id', $topic->id)
            ->first();

        expect((float) $row->confidence)->toBe(1.0);
    });

    it('confidence is fractional for fewer than 20 attempts', function () {
        $user = User::factory()->create();
        $examSubject = ExamSubject::factory()->create();
        $topic = Topic::factory()->create(['exam_subject_id' => $examSubject->id]);
        $question = Question::factory()->create(['exam_subject_id' => $examSubject->id]);

        seedAttempts($user->id, $question->id, $topic->id, 5, 10);

        $this->service->computeForTopic($user->id, $topic->id);

        $row = DB::table('topic_mastery')
            ->where('user_id', $user->id)
            ->where('topic_id', $topic->id)
            ->first();

        // confidence = min(1, 10/20) = 0.5
        expect((float) $row->confidence)->toBe(0.5);
    });
});

// ─── Time-decay weighting ─────────────────────────────────────────────────────

describe('time-decay weighting', function () {
    it('weights recent attempts 1.5× more than old ones', function () {
        $user = User::factory()->create();
        $examSubject = ExamSubject::factory()->create();
        $topic = Topic::factory()->create(['exam_subject_id' => $examSubject->id]);
        $question = Question::factory()->create(['exam_subject_id' => $examSubject->id]);

        DB::table('question_topics')->insertOrIgnore([
            'question_id' => $question->id,
            'topic_id' => $topic->id,
            'source' => 'manual',
            'confidence' => 1.0,
        ]);

        // 4 old attempts, all correct
        for ($i = 0; $i < 4; $i++) {
            DB::table('attempts')->insert([
                'user_id' => $user->id,
                'question_id' => $question->id,
                'attempt_type' => 'mcq',
                'is_correct' => 1,
                'marks_awarded' => 1,
                'marks_available' => 1,
                'graded_by' => 'system',
                'graded_at' => now()->subDays(60)->toDateTimeString(),
                'time_spent_ms' => 5000,
                'context' => 'drill',
                'client_uuid' => Str::uuid(),
                'requires_regrade' => 0,
                'attempted_at' => now()->subDays(60)->toDateTimeString(),
            ]);
        }

        // 4 recent attempts, all wrong
        for ($i = 0; $i < 4; $i++) {
            DB::table('attempts')->insert([
                'user_id' => $user->id,
                'question_id' => $question->id,
                'attempt_type' => 'mcq',
                'is_correct' => 0,
                'marks_awarded' => 0,
                'marks_available' => 1,
                'graded_by' => 'system',
                'graded_at' => now()->subDays(5)->toDateTimeString(),
                'time_spent_ms' => 5000,
                'context' => 'drill',
                'client_uuid' => Str::uuid(),
                'requires_regrade' => 0,
                'attempted_at' => now()->subDays(5)->toDateTimeString(),
            ]);
        }

        $this->service->computeForTopic($user->id, $topic->id);

        $row = DB::table('topic_mastery')
            ->where('user_id', $user->id)
            ->where('topic_id', $topic->id)
            ->first();

        // old=4 correct, recent=0 correct (4 wrong, ×1.5 weight)
        // weightedCorrect = 4 + 0*1.5 = 4; weightedAttempts = 4 + 4*1.5 = 10
        // mastery = (4+2)/(10+4) = 6/14 ≈ 0.429
        expect((float) $row->mastery_score)->toBeGreaterThan(0.40)->toBeLessThan(0.46);
    });

    it('produces higher mastery when recent attempts improve vs old failures', function () {
        $user = User::factory()->create();
        $examSubject = ExamSubject::factory()->create();
        $topic = Topic::factory()->create(['exam_subject_id' => $examSubject->id]);
        $question = Question::factory()->create(['exam_subject_id' => $examSubject->id]);

        DB::table('question_topics')->insertOrIgnore([
            'question_id' => $question->id,
            'topic_id' => $topic->id,
            'source' => 'manual',
            'confidence' => 1.0,
        ]);

        // 6 old wrong
        for ($i = 0; $i < 6; $i++) {
            DB::table('attempts')->insert([
                'user_id' => $user->id,
                'question_id' => $question->id,
                'attempt_type' => 'mcq',
                'is_correct' => 0,
                'marks_awarded' => 0,
                'marks_available' => 1,
                'graded_by' => 'system',
                'graded_at' => now()->subDays(90)->toDateTimeString(),
                'time_spent_ms' => 5000,
                'context' => 'drill',
                'client_uuid' => Str::uuid(),
                'requires_regrade' => 0,
                'attempted_at' => now()->subDays(90)->toDateTimeString(),
            ]);
        }

        // 6 recent correct
        for ($i = 0; $i < 6; $i++) {
            DB::table('attempts')->insert([
                'user_id' => $user->id,
                'question_id' => $question->id,
                'attempt_type' => 'mcq',
                'is_correct' => 1,
                'marks_awarded' => 1,
                'marks_available' => 1,
                'graded_by' => 'system',
                'graded_at' => now()->subDays(3)->toDateTimeString(),
                'time_spent_ms' => 5000,
                'context' => 'drill',
                'client_uuid' => Str::uuid(),
                'requires_regrade' => 0,
                'attempted_at' => now()->subDays(3)->toDateTimeString(),
            ]);
        }

        $this->service->computeForTopic($user->id, $topic->id);

        $row = DB::table('topic_mastery')
            ->where('user_id', $user->id)
            ->where('topic_id', $topic->id)
            ->first();

        // weightedCorrect = 0 + 6*1.5 = 9; weightedAttempts = 6 + 6*1.5 = 15
        // mastery = (9+2)/(15+4) = 11/19 ≈ 0.579
        // Should be above 0.5 since recent attempts reversed old trend
        expect((float) $row->mastery_score)->toBeGreaterThan(0.5);
    });
});

// ─── computeForUserSubject ────────────────────────────────────────────────────

describe('computeForUserSubject', function () {
    it('returns defaults when no mastery rows exist', function () {
        $user = User::factory()->create();
        $examSubject = ExamSubject::factory()->create();

        $result = $this->service->computeForUserSubject($user->id, $examSubject->subject_id);

        expect($result['mastery_score'])->toBe(0.5);
        expect($result['confidence'])->toBe(0.0);
        expect($result['topics_covered'])->toBe(0);
    });

    it('averages mastery across topics', function () {
        $user = User::factory()->create();
        $examSubject = ExamSubject::factory()->create();
        $topic1 = Topic::factory()->create(['exam_subject_id' => $examSubject->id]);
        $topic2 = Topic::factory()->create(['exam_subject_id' => $examSubject->id]);

        // Manually insert mastery rows
        DB::table('topic_mastery')->insert([
            ['user_id' => $user->id, 'topic_id' => $topic1->id, 'mastery_score' => 0.8, 'confidence' => 0.6, 'attempts_count' => 12, 'correct_count' => 10, 'total_marks_awarded' => 10, 'total_marks_available' => 12, 'last_attempted_at' => now(), 'updated_at' => now()],
            ['user_id' => $user->id, 'topic_id' => $topic2->id, 'mastery_score' => 0.6, 'confidence' => 0.4, 'attempts_count' => 8, 'correct_count' => 5, 'total_marks_awarded' => 5, 'total_marks_available' => 8, 'last_attempted_at' => now(), 'updated_at' => now()],
        ]);

        $result = $this->service->computeForUserSubject($user->id, $examSubject->subject_id);

        expect($result['mastery_score'])->toBe(0.7);
        expect($result['topics_covered'])->toBe(2);
        expect($result['total_topics'])->toBe(2);
    });
});

// ─── Performance ─────────────────────────────────────────────────────────────

describe('performance', function () {
    it('recomputes mastery for 10k attempts in under 500ms', function () {
        $user = User::factory()->create();
        $examSubject = ExamSubject::factory()->create();
        $topic = Topic::factory()->create(['exam_subject_id' => $examSubject->id]);
        $question = Question::factory()->create(['exam_subject_id' => $examSubject->id]);

        DB::table('question_topics')->insert([
            'question_id' => $question->id,
            'topic_id' => $topic->id,
            'source' => 'manual',
            'confidence' => 1.0,
        ]);

        // Insert 10k attempts in chunks for speed
        $chunks = array_chunk(array_fill(0, 10000, null), 500);
        $now = now()->subDays(10)->toDateTimeString();

        foreach ($chunks as $chunk) {
            $rows = array_map(fn () => [
                'user_id' => $user->id,
                'question_id' => $question->id,
                'attempt_type' => 'mcq',
                'is_correct' => rand(0, 1),
                'marks_awarded' => rand(0, 1),
                'marks_available' => 1,
                'graded_by' => 'system',
                'graded_at' => $now,
                'time_spent_ms' => 5000,
                'context' => 'drill',
                'client_uuid' => Str::uuid(),
                'requires_regrade' => 0,
                'attempted_at' => $now,
            ], $chunk);

            DB::table('attempts')->insert($rows);
        }

        $start = microtime(true);
        $this->service->recomputeAllAffectedTopics($user->id);
        $elapsedMs = (microtime(true) - $start) * 1000;

        expect($elapsedMs)->toBeLessThan(500);
    })->group('performance');
});
