<?php

declare(strict_types=1);

use App\Models\Question;
use App\Models\QuestionDraft;
use App\Models\User;
use App\Repositories\QuestionDraftRepository;
use App\Services\QuestionPublishingService;
use App\Support\Enums\DraftStatus;
use App\Support\Enums\QuestionStatus;
use App\Support\Enums\UserType;
use Illuminate\Validation\ValidationException;

// ─── approveDraft ─────────────────────────────────────────────────────────────

describe('QuestionPublishingService::approveDraft', function () {
    it('approves a pending draft and publishes the question', function () {
        $question = Question::factory()->draft()->create();
        $draft = QuestionDraft::factory()->create(['question_id' => $question->id]);
        $reviewer = User::factory()->create(['user_type' => UserType::Admin->value]);

        $service = app(QuestionPublishingService::class);
        $service->approveDraft($draft, $reviewer, 'Looks good.');

        expect($draft->fresh()->status)->toBe(DraftStatus::Approved);
        expect($question->fresh()->status)->toBe(QuestionStatus::Published);
    });

    it('throws when draft is already approved', function () {
        $draft = QuestionDraft::factory()->approved()->create();
        $reviewer = User::factory()->create(['user_type' => UserType::Admin->value]);

        $service = app(QuestionPublishingService::class);

        expect(fn () => $service->approveDraft($draft, $reviewer))
            ->toThrow(ValidationException::class);
    });

    it('records audit log on approval', function () {
        $question = Question::factory()->draft()->create();
        $draft = QuestionDraft::factory()->create(['question_id' => $question->id]);
        $reviewer = User::factory()->create(['user_type' => UserType::Admin->value]);

        app(QuestionPublishingService::class)->approveDraft($draft, $reviewer);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'content.draft.approved',
        ]);
    });
});

// ─── rejectDraft ─────────────────────────────────────────────────────────────

describe('QuestionPublishingService::rejectDraft', function () {
    it('rejects a pending draft with notes', function () {
        $draft = QuestionDraft::factory()->create();
        $reviewer = User::factory()->create(['user_type' => UserType::Admin->value]);

        app(QuestionPublishingService::class)->rejectDraft($draft, $reviewer, 'Needs correction.');

        expect($draft->fresh()->status)->toBe(DraftStatus::Rejected);
        expect($draft->fresh()->reviewer_notes)->toBe('Needs correction.');
    });

    it('throws when draft is already rejected', function () {
        $draft = QuestionDraft::factory()->rejected()->create();
        $reviewer = User::factory()->create(['user_type' => UserType::Admin->value]);

        expect(fn () => app(QuestionPublishingService::class)->rejectDraft($draft, $reviewer, 'x'))
            ->toThrow(ValidationException::class);
    });
});

// ─── escalateDraft ────────────────────────────────────────────────────────────

describe('QuestionPublishingService::escalateDraft', function () {
    it('escalates a draft to senior reviewer', function () {
        $draft = QuestionDraft::factory()->underReview()->create();
        $reviewer = User::factory()->create(['user_type' => UserType::Admin->value]);

        app(QuestionPublishingService::class)->escalateDraft($draft, $reviewer, 'Needs senior review.');

        expect($draft->fresh()->status)->toBe(DraftStatus::Escalated);
    });
});

// ─── QuestionDraftRepository ──────────────────────────────────────────────────

describe('QuestionDraftRepository::listForReview', function () {
    it('returns pending and under-review drafts ordered by created_at', function () {
        QuestionDraft::factory()->count(2)->create(['status' => DraftStatus::Pending]);
        QuestionDraft::factory()->approved()->create();

        $repo = app(QuestionDraftRepository::class);
        $result = $repo->listForReview();

        expect($result->total())->toBe(2);
    });

    it('filters by status', function () {
        QuestionDraft::factory()->count(1)->create(['status' => DraftStatus::Pending]);
        QuestionDraft::factory()->underReview()->create();

        $repo = app(QuestionDraftRepository::class);
        $result = $repo->listForReview(['status' => DraftStatus::Pending->value]);

        expect($result->total())->toBe(1);
    });
});
