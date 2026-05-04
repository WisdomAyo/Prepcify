<?php

declare(strict_types=1);

use App\Filament\Pages\ReviewWorkbenchPage;
use App\Models\QuestionDraft;
use App\Models\User;
use App\Services\ReviewerWorkbenchService;
use App\Support\Enums\DraftStatus;
use App\Support\Enums\UserType;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

function makeReviewer(): User
{
    Permission::firstOrCreate(['name' => 'questions.review', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'questions.approve', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'questions.reject', 'guard_name' => 'web']);

    $role = Role::firstOrCreate(['name' => 'Content Reviewer', 'guard_name' => 'web']);
    $role->givePermissionTo(['questions.review', 'questions.approve', 'questions.reject']);

    $reviewer = User::factory()->create(['user_type' => UserType::Admin->value]);
    $reviewer->assignRole('Content Reviewer');

    return $reviewer;
}

// CRITICAL TEST: workbench permission enforcement
it('reviewer without permission cannot access review workbench page', function () {
    $user = User::factory()->create(['user_type' => UserType::Student->value]);

    $page = new ReviewWorkbenchPage;

    auth()->login($user);

    expect(ReviewWorkbenchPage::canAccess())->toBeFalse();
});

it('reviewer with permission can access review workbench page', function () {
    $reviewer = makeReviewer();

    auth()->login($reviewer);

    expect(ReviewWorkbenchPage::canAccess())->toBeTrue();
});

// CRITICAL TEST: approve state transition
it('approve transitions draft to approved and records telemetry', function () {
    $reviewer = makeReviewer();
    $draft = QuestionDraft::factory()->create(['status' => DraftStatus::Pending]);

    $service = app(ReviewerWorkbenchService::class);
    $result = $service->approve($reviewer, $draft->id, 1500);

    expect($result->status)->toBe(DraftStatus::Approved);
    expect($result->reviewed_at)->not->toBeNull();

    $this->assertDatabaseHas('reviewer_actions', [
        'reviewer_id' => $reviewer->id,
        'draft_id' => $draft->id,
        'action' => 'approve',
        'duration_ms' => 1500,
    ]);
});

// CRITICAL TEST: reject state transition
it('reject transitions draft to rejected with notes', function () {
    $reviewer = makeReviewer();
    $draft = QuestionDraft::factory()->create(['status' => DraftStatus::Pending]);

    $service = app(ReviewerWorkbenchService::class);
    $result = $service->reject($reviewer, $draft->id, 'Incorrect solution', 800);

    expect($result->status)->toBe(DraftStatus::Rejected);
    expect($result->reviewer_notes)->toBe('Incorrect solution');

    $this->assertDatabaseHas('reviewer_actions', [
        'draft_id' => $draft->id,
        'action' => 'reject',
    ]);
});

it('escalate transitions draft to escalated status', function () {
    $reviewer = makeReviewer();
    $draft = QuestionDraft::factory()->create(['status' => DraftStatus::Pending]);

    $service = app(ReviewerWorkbenchService::class);
    $result = $service->escalate($reviewer, $draft->id, 'Needs content lead review');

    expect($result->status)->toBe(DraftStatus::Escalated);
    $this->assertDatabaseHas('reviewer_actions', ['draft_id' => $draft->id, 'action' => 'escalate']);
});

it('skip records telemetry without changing draft status', function () {
    $reviewer = makeReviewer();
    $draft = QuestionDraft::factory()->create(['status' => DraftStatus::Pending]);

    $service = app(ReviewerWorkbenchService::class);
    $service->skip($reviewer, $draft->id, 200);

    $draft->refresh();
    expect($draft->status)->toBe(DraftStatus::Pending);
    $this->assertDatabaseHas('reviewer_actions', ['draft_id' => $draft->id, 'action' => 'skip']);
});

it('cannot approve an already-approved draft', function () {
    $reviewer = makeReviewer();
    $draft = QuestionDraft::factory()->approved()->create();

    $service = app(ReviewerWorkbenchService::class);

    expect(fn () => $service->approve($reviewer, $draft->id))
        ->toThrow(AccessDeniedHttpException::class);
});
