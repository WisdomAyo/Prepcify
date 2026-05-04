<?php

declare(strict_types=1);

namespace App\Filament\Pages;

use App\Models\QuestionDraft;
use App\Models\User;
use App\Services\ReviewerWorkbenchService;
use App\Support\Enums\DraftStatus;
use Filament\Notifications\Notification;
use Filament\Pages\Page;

class ReviewWorkbenchPage extends Page
{
    protected static ?string $navigationIcon = 'heroicon-o-magnifying-glass';

    protected static ?string $navigationLabel = 'Review Workbench';

    protected static ?string $navigationGroup = 'Content';

    protected static ?int $navigationSort = 21;

    protected static string $view = 'filament.pages.review-workbench';

    public ?int $currentDraftId = null;

    public ?string $reviewerNotes = null;

    /** @var array<string, mixed>|null */
    public ?array $currentDraft = null;

    /** @var array<string, mixed> */
    public array $queue = [];

    public int $queueCount = 0;

    public static function canAccess(): bool
    {
        return auth()->user()?->hasAnyPermission([
            'questions.review',
            'questions.approve',
            'questions.reject',
        ]) ?? false;
    }

    private function reviewer(): User
    {
        /** @var User */
        return auth()->user();
    }

    public function mount(): void
    {
        $this->loadQueue();
        $this->loadNext();
    }

    public function loadNext(): void
    {
        $draft = app(ReviewerWorkbenchService::class)->nextPending($this->reviewer());

        if ($draft instanceof QuestionDraft) {
            $this->currentDraftId = $draft->id;
            $this->reviewerNotes = null;
            $this->currentDraft = $this->serializeDraft($draft);
        } else {
            $this->currentDraftId = null;
            $this->currentDraft = null;
        }
    }

    public function approve(?int $durationMs = null): void
    {
        if ($this->currentDraftId === null) {
            return;
        }

        app(ReviewerWorkbenchService::class)->approve($this->reviewer(), $this->currentDraftId, $durationMs);

        Notification::make()->title('Approved')->success()->send();
        $this->loadQueue();
        $this->loadNext();
    }

    public function reject(?int $durationMs = null): void
    {
        if ($this->currentDraftId === null) {
            return;
        }

        app(ReviewerWorkbenchService::class)->reject($this->reviewer(), $this->currentDraftId, $this->reviewerNotes, $durationMs);

        Notification::make()->title('Rejected')->warning()->send();
        $this->loadQueue();
        $this->loadNext();
    }

    public function escalate(?int $durationMs = null): void
    {
        if ($this->currentDraftId === null) {
            return;
        }

        app(ReviewerWorkbenchService::class)->escalate($this->reviewer(), $this->currentDraftId, $this->reviewerNotes, $durationMs);

        Notification::make()->title('Escalated')->info()->send();
        $this->loadQueue();
        $this->loadNext();
    }

    public function skip(?int $durationMs = null): void
    {
        if ($this->currentDraftId === null) {
            return;
        }

        app(ReviewerWorkbenchService::class)->skip($this->reviewer(), $this->currentDraftId, $durationMs);

        $this->loadNext();
    }

    private function loadQueue(): void
    {
        $this->queueCount = QuestionDraft::where('status', DraftStatus::Pending)->count();
    }

    /** @return array<string, mixed> */
    private function serializeDraft(QuestionDraft $draft): array
    {
        $question = $draft->question;

        return [
            'id' => $draft->id,
            'submitted_at' => $draft->submitted_at?->toDateTimeString(),
            'submitter' => $draft->submitter?->display_name,
            'reviewer_notes' => $draft->reviewer_notes,
            'question' => $question !== null ? [
                'id' => $question->id,
                'stem' => $question->stem,
                'format' => $question->format->value,
                'explanation' => $question->explanation,
            ] : null,
        ];
    }
}
