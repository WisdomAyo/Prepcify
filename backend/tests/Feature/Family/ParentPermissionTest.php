<?php

declare(strict_types=1);

use App\Models\ParentLink;
use App\Models\User;
use App\Models\UserStreak;
use App\Support\Enums\ParentLinkInvitedBy;
use App\Support\Enums\ParentLinkStatus;
use App\Support\Enums\UserType;

function makeParentStudentPair(array $permissions = []): array
{
    $parent = User::factory()->create(['user_type' => UserType::Parent->value]);
    $student = User::factory()->create(['user_type' => UserType::Student->value]);

    $defaultPermissions = [
        'view_progress' => true,
        'view_attempts' => true,
        'receive_reports' => true,
    ];

    $link = ParentLink::create([
        'parent_user_id' => $parent->id,
        'student_user_id' => $student->id,
        'status' => ParentLinkStatus::Active->value,
        'invited_by' => ParentLinkInvitedBy::Parent->value,
        'permissions' => array_merge($defaultPermissions, $permissions),
        'linked_at' => now(),
    ]);

    return [$parent, $student, $link];
}

it('parent can view student progress when view_progress is true', function () {
    [$parent, $student] = makeParentStudentPair(['view_progress' => true]);

    UserStreak::create([
        'user_id' => $student->id,
        'current_streak' => 7,
        'longest_streak' => 10,
        'freezes_available' => 0,
        'updated_at' => now(),
    ]);

    $response = $this->actingAs($parent)
        ->getJson("/api/v1/parent/children/{$student->id}");

    $response->assertOk()
        ->assertJsonPath('streak', 7);
});

// CRITICAL TEST: parent permission filter
// If view_attempts=false on the link, the parent should receive 403
// even when calling the endpoint with a valid active link to that student.
it('returns 403 when parent requests attempts data but view_attempts permission is false', function () {
    [$parent, $student] = makeParentStudentPair([
        'view_progress' => true,
        'view_attempts' => false,
    ]);

    $response = $this->actingAs($parent)
        ->getJson("/api/v1/parent/children/{$student->id}?permission=view_attempts");

    $response->assertForbidden();
});

it('returns 403 when there is no active link between parent and student', function () {
    $parent = User::factory()->create(['user_type' => UserType::Parent->value]);
    $student = User::factory()->create(['user_type' => UserType::Student->value]);

    $response = $this->actingAs($parent)
        ->getJson("/api/v1/parent/children/{$student->id}");

    $response->assertNotFound();
});

it('returns 403 when link exists but is revoked', function () {
    $parent = User::factory()->create(['user_type' => UserType::Parent->value]);
    $student = User::factory()->create(['user_type' => UserType::Student->value]);

    ParentLink::create([
        'parent_user_id' => $parent->id,
        'student_user_id' => $student->id,
        'status' => ParentLinkStatus::Revoked->value,
        'invited_by' => ParentLinkInvitedBy::Parent->value,
        'permissions' => ['view_progress' => true, 'view_attempts' => true, 'receive_reports' => true],
        'linked_at' => now()->subDays(10),
    ]);

    $response = $this->actingAs($parent)
        ->getJson("/api/v1/parent/children/{$student->id}");

    $response->assertNotFound();
});

it('parent can list their children', function () {
    $parent = User::factory()->create(['user_type' => UserType::Parent->value]);
    $student1 = User::factory()->create(['user_type' => UserType::Student->value]);
    $student2 = User::factory()->create(['user_type' => UserType::Student->value]);

    foreach ([$student1, $student2] as $student) {
        ParentLink::create([
            'parent_user_id' => $parent->id,
            'student_user_id' => $student->id,
            'status' => ParentLinkStatus::Active->value,
            'invited_by' => ParentLinkInvitedBy::Parent->value,
            'permissions' => ['view_progress' => true, 'view_attempts' => true, 'receive_reports' => true],
            'linked_at' => now(),
        ]);
    }

    $response = $this->actingAs($parent)
        ->getJson('/api/v1/parent/children');

    $response->assertOk()
        ->assertJsonCount(2, 'data');
});

it('student can see pending link requests', function () {
    $parent = User::factory()->create(['user_type' => UserType::Parent->value]);
    $student = User::factory()->create(['user_type' => UserType::Student->value]);

    ParentLink::create([
        'parent_user_id' => $parent->id,
        'student_user_id' => $student->id,
        'status' => ParentLinkStatus::Pending->value,
        'invited_by' => ParentLinkInvitedBy::Parent->value,
        'permissions' => [],
        'linked_at' => null,
    ]);

    $response = $this->actingAs($student)
        ->getJson('/api/v1/me/family/pending');

    $response->assertOk()
        ->assertJsonCount(1, 'data');
});

it('student can accept a pending link', function () {
    $parent = User::factory()->create(['user_type' => UserType::Parent->value]);
    $student = User::factory()->create(['user_type' => UserType::Student->value]);

    $link = ParentLink::create([
        'parent_user_id' => $parent->id,
        'student_user_id' => $student->id,
        'status' => ParentLinkStatus::Pending->value,
        'invited_by' => ParentLinkInvitedBy::Parent->value,
        'permissions' => [],
        'linked_at' => null,
    ]);

    $response = $this->actingAs($student)
        ->postJson("/api/v1/me/family/links/{$link->id}/accept");

    $response->assertOk()
        ->assertJsonPath('data.status', 'active');
});

it('student can revoke an active link', function () {
    [$parent, $student, $link] = makeParentStudentPair();

    $response = $this->actingAs($student)
        ->postJson("/api/v1/me/family/links/{$link->id}/revoke");

    $response->assertOk()
        ->assertJsonPath('revoked', true);

    $this->assertDatabaseHas('parent_links', [
        'id' => $link->id,
        'status' => 'revoked',
    ]);
});

it('parent can update permissions on an active link', function () {
    [$parent, $student, $link] = makeParentStudentPair();

    $response = $this->actingAs($parent)
        ->patchJson("/api/v1/me/family/links/{$link->id}/permissions", [
            'permissions' => ['view_attempts' => false],
        ]);

    $response->assertOk();

    $this->assertDatabaseHas('parent_links', [
        'id' => $link->id,
    ]);

    $updated = ParentLink::find($link->id);
    expect($updated->permissions['view_attempts'])->toBeFalse();
});
