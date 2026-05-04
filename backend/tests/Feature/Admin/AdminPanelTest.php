<?php

declare(strict_types=1);

use App\Models\AuditLog;
use App\Models\User;
use App\Services\AuditLogService;
use App\Support\Enums\UserType;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

beforeEach(function () {
    $this->seed(PermissionSeeder::class);
    $this->seed(RoleSeeder::class);
    app()[PermissionRegistrar::class]->forgetCachedPermissions();
});

it('blocks non-admin users from the admin panel', function () {
    /** @var TestCase $this */
    $student = User::factory()->create([
        'user_type' => UserType::Student->value,
        'password' => Hash::make('password'),
    ]);

    // Authenticated users who fail canAccessPanel() get 403, not a login redirect
    $this->actingAs($student)
        ->get('/admin')
        ->assertForbidden();
});

it('blocks admin-type users without any role from the panel', function () {
    /** @var TestCase $this */
    $user = User::factory()->create([
        'user_type' => UserType::Admin->value,
        'password' => Hash::make('password'),
    ]);

    $this->actingAs($user)
        ->get('/admin')
        ->assertForbidden();
});

it('allows a superadmin to access the panel', function () {
    /** @var TestCase $this */
    $admin = User::factory()->create([
        'user_type' => UserType::Admin->value,
        'email_verified_at' => now(),
        'password' => Hash::make('password'),
    ]);
    $admin->assignRole('Superadmin');

    $this->actingAs($admin)
        ->get('/admin')
        ->assertOk();
});

it('audit log is written when admin edits a user', function () {
    $admin = User::factory()->create([
        'user_type' => UserType::Admin->value,
        'email_verified_at' => now(),
        'password' => Hash::make('password'),
    ]);
    $admin->assignRole('Superadmin');

    $target = User::factory()->create();
    $service = app(AuditLogService::class);

    $log = $service->log(
        action: 'admin.user.updated',
        targetType: User::class,
        targetId: $target->id,
        before: ['display_name' => 'Old'],
        after: ['display_name' => 'New'],
        actor: $admin,
    );

    expect(AuditLog::where('action', 'admin.user.updated')->exists())->toBeTrue();
    expect($log)->not->toBeNull();
    expect($log->actor_user_id)->toBe($admin->id);
});
