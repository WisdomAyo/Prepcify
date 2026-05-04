<?php

declare(strict_types=1);

use App\Models\Question;
use App\Models\User;
use App\Services\ContentIntegrityService;
use App\Support\Enums\QuestionStatus;
use App\Support\Enums\UserType;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

it('flagAttemptsForRegrade updates attempts and flags question', function () {
    $question = Question::factory()->create(['status' => QuestionStatus::Published]);

    // Seed a fake attempt row using DB directly since AttemptFactory may not exist yet
    $user = User::factory()->create(['user_type' => UserType::Student->value]);

    DB::table('attempts')->insert([
        'user_id' => $user->id,
        'question_id' => $question->id,
        'attempt_type' => 'practice',
        'context' => 'quiz',
        'client_uuid' => Str::uuid()->toString(),
        'is_correct' => true,
        'requires_regrade' => false,
        'attempted_at' => now(),
    ]);

    app(ContentIntegrityService::class)->flagAttemptsForRegrade($question);

    $this->assertDatabaseHas('attempts', ['id' => 1, 'requires_regrade' => true]);
    $this->assertDatabaseHas('questions', ['id' => $question->id, 'status' => QuestionStatus::FlaggedForRegrade->value]);
});

it('flagAttemptsForRegrade is a no-op when attempts table does not exist', function () {
    Schema::shouldReceive('hasTable')->with('attempts')->andReturn(false);

    $question = Question::factory()->create(['status' => QuestionStatus::Published]);

    expect(fn () => app(ContentIntegrityService::class)->flagAttemptsForRegrade($question))->not->toThrow(Throwable::class);
});
