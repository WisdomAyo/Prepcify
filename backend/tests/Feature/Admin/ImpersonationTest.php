<?php

declare(strict_types=1);

use App\Models\User;
use App\Services\ImpersonationService;
use App\Support\Enums\UserType;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

function makeImpersonator(): User
{
    Permission::firstOrCreate(['name' => 'users.impersonate', 'guard_name' => 'web']);

    $role = Role::firstOrCreate(['name' => 'Superadmin', 'guard_name' => 'web']);
    $role->givePermissionTo('users.impersonate');

    $admin = User::factory()->create(['user_type' => UserType::Admin->value]);
    $admin->assignRole('Superadmin');

    return $admin;
}

// CRITICAL TEST: audit log written on impersonation start
it('writes audit log when impersonation starts', function () {
    $actor = makeImpersonator();
    $target = User::factory()->create();

    $service = app(ImpersonationService::class);
    $result = $service->start($actor, $target->id);

    expect($result)->toHaveKeys(['token', 'expires_at']);

    $this->assertDatabaseHas('audit_logs', [
        'action' => 'admin.impersonation.start',
        'actor_user_id' => $actor->id,
        'target_id' => $target->id,
    ]);
});

// CRITICAL TEST: audit log written on impersonation end
it('writes audit log when impersonation ends', function () {
    $actor = makeImpersonator();
    $target = User::factory()->create();

    $service = app(ImpersonationService::class);
    $data = $service->start($actor, $target->id);

    $service->end($data['token']);

    $this->assertDatabaseHas('audit_logs', [
        'action' => 'admin.impersonation.end',
        'target_id' => $target->id,
    ]);
});

it('resolve returns null for unknown token', function () {
    $service = app(ImpersonationService::class);

    expect($service->resolve('nonexistent_token_xyz'))->toBeNull();
});

it('end is idempotent for expired or unknown token', function () {
    $service = app(ImpersonationService::class);

    expect(fn () => $service->end('ghost_token_xyz'))->not->toThrow(Throwable::class);
});

// CRITICAL TEST: read-only enforcement during impersonation
// Real flow: admin has both a Sanctum token (acting as target) AND X-Impersonation-Token.
// The middleware must block any non-GET even when fully authenticated.
it('read-only middleware blocks POST during impersonation', function () {
    $actor = makeImpersonator();
    $target = User::factory()->create();

    $service = app(ImpersonationService::class);
    $data = $service->start($actor, $target->id);

    // actingAs provides Sanctum auth; impersonation header triggers the read-only guard
    $response = $this->actingAs($target)
        ->withHeaders(['X-Impersonation-Token' => $data['token']])
        ->postJson('/api/v1/attempts', []);

    $response->assertForbidden();
});

it('read-only middleware allows GET during impersonation', function () {
    $actor = makeImpersonator();
    $target = User::factory()->create();

    $service = app(ImpersonationService::class);
    $data = $service->start($actor, $target->id);

    $response = $this->actingAs($target)
        ->withHeaders(['X-Impersonation-Token' => $data['token']])
        ->getJson('/api/v1/auth/me');

    // GET is allowed — response is 200 or any non-403
    expect($response->status())->not->toBe(403);
});

it('API endpoint starts impersonation and returns token', function () {
    $actor = makeImpersonator();
    $target = User::factory()->create();

    $response = $this->actingAs($actor)
        ->postJson('/api/v1/admin/impersonation/start', ['user_id' => $target->id]);

    $response->assertOk()
        ->assertJsonStructure(['data' => ['token', 'expires_at']]);
});

it('API endpoint ends impersonation', function () {
    $actor = makeImpersonator();
    $target = User::factory()->create();

    $service = app(ImpersonationService::class);
    $data = $service->start($actor, $target->id);

    $response = $this->actingAs($actor)
        ->postJson('/api/v1/admin/impersonation/end', ['token' => $data['token']]);

    $response->assertOk()->assertJsonPath('ended', true);
});
