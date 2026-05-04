<?php

declare(strict_types=1);

use App\Models\ParentLink;
use App\Models\StudentInviteToken;
use App\Models\User;
use App\Services\FamilyService;
use App\Support\Enums\ParentLinkStatus;
use App\Support\Enums\UserType;

it('inviteNewStudent creates a student invite token', function () {
    $parent = User::factory()->create(['user_type' => UserType::Parent->value]);

    $token = app(FamilyService::class)->inviteNewStudent($parent, [
        'name' => 'Child Name',
        'contact' => 'child@example.com',
    ]);

    expect($token->created_by_parent_id)->toBe($parent->id);
    expect($token->claimed)->toBeFalse();
    expect(strlen($token->token))->toBe(64);
    $this->assertDatabaseHas('student_invite_tokens', ['created_by_parent_id' => $parent->id]);
});

it('claimStudentInvite creates a parent link', function () {
    $parent = User::factory()->create(['user_type' => UserType::Parent->value]);
    $student = User::factory()->create(['user_type' => UserType::Student->value]);

    $invite = StudentInviteToken::create([
        'created_by_parent_id' => $parent->id,
        'invited_name' => 'Test',
        'invited_contact' => 'test@example.com',
        'token' => 'valid-token-string-64-chars-padded-here-for-testing-12345678',
        'claimed' => false,
        'claimed_by_user_id' => null,
        'expires_at' => now()->addDay(),
    ]);

    $link = app(FamilyService::class)->claimStudentInvite($student, $invite->token);

    expect($link->parent_user_id)->toBe($parent->id);
    expect($link->student_user_id)->toBe($student->id);
    expect($link->status)->toBe(ParentLinkStatus::Active);
    $this->assertDatabaseHas('student_invite_tokens', ['id' => $invite->id, 'claimed' => true]);
});

it('requestLinkToExistingStudent creates a pending link', function () {
    $parent = User::factory()->create(['user_type' => UserType::Parent->value]);
    $student = User::factory()->create(['user_type' => UserType::Student->value]);

    $link = app(FamilyService::class)->requestLinkToExistingStudent($parent, $student->id);

    expect($link->status)->toBe(ParentLinkStatus::Pending);
    expect($link->parent_user_id)->toBe($parent->id);
    expect($link->student_user_id)->toBe($student->id);
});

it('requestLinkToExistingStudent returns existing pending link', function () {
    $parent = User::factory()->create(['user_type' => UserType::Parent->value]);
    $student = User::factory()->create(['user_type' => UserType::Student->value]);
    $service = app(FamilyService::class);

    $first = $service->requestLinkToExistingStudent($parent, $student->id);
    $second = $service->requestLinkToExistingStudent($parent, $student->id);

    expect($first->id)->toBe($second->id);
});

it('acceptLinkRequest activates the link', function () {
    $parent = User::factory()->create(['user_type' => UserType::Parent->value]);
    $student = User::factory()->create(['user_type' => UserType::Student->value]);

    $link = ParentLink::create([
        'parent_user_id' => $parent->id,
        'student_user_id' => $student->id,
        'status' => ParentLinkStatus::Pending->value,
        'invited_by' => 'parent',
        'permissions' => ['view_progress' => true],
        'linked_at' => null,
    ]);

    $result = app(FamilyService::class)->acceptLinkRequest($student, $link->id);

    expect($result->status)->toBe(ParentLinkStatus::Active);
    expect($result->linked_at)->not->toBeNull();
});

it('declineLinkRequest deletes the pending link', function () {
    $parent = User::factory()->create(['user_type' => UserType::Parent->value]);
    $student = User::factory()->create(['user_type' => UserType::Student->value]);

    $link = ParentLink::create([
        'parent_user_id' => $parent->id,
        'student_user_id' => $student->id,
        'status' => ParentLinkStatus::Pending->value,
        'invited_by' => 'parent',
        'permissions' => [],
        'linked_at' => null,
    ]);

    app(FamilyService::class)->declineLinkRequest($student, $link->id);

    $this->assertDatabaseMissing('parent_links', ['id' => $link->id]);
});

it('revokeLink sets status to revoked', function () {
    $parent = User::factory()->create(['user_type' => UserType::Parent->value]);
    $student = User::factory()->create(['user_type' => UserType::Student->value]);

    $link = ParentLink::create([
        'parent_user_id' => $parent->id,
        'student_user_id' => $student->id,
        'status' => ParentLinkStatus::Active->value,
        'invited_by' => 'parent',
        'permissions' => [],
        'linked_at' => now(),
    ]);

    app(FamilyService::class)->revokeLink($parent, $link->id);

    $this->assertDatabaseHas('parent_links', ['id' => $link->id, 'status' => 'revoked']);
});

it('updatePermissions merges permissions with defaults', function () {
    $parent = User::factory()->create(['user_type' => UserType::Parent->value]);
    $student = User::factory()->create(['user_type' => UserType::Student->value]);

    $link = ParentLink::create([
        'parent_user_id' => $parent->id,
        'student_user_id' => $student->id,
        'status' => ParentLinkStatus::Active->value,
        'invited_by' => 'parent',
        'permissions' => ['view_progress' => true, 'view_attempts' => true, 'receive_reports' => true],
        'linked_at' => now(),
    ]);

    $updated = app(FamilyService::class)->updatePermissions($parent, $link->id, ['receive_reports' => false]);

    expect($updated->permissions['receive_reports'])->toBeFalse();
    expect($updated->permissions['view_progress'])->toBeTrue();
});
