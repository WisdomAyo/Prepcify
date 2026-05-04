<?php

declare(strict_types=1);

use App\Models\User;
use App\Policies\UserPolicy;
use App\Support\Enums\UserType;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    $this->seed(PermissionSeeder::class);
    $this->seed(RoleSeeder::class);
    app()[PermissionRegistrar::class]->forgetCachedPermissions();
});

it('Support Agent can search and view users', function () {
    $agent = User::factory()->create(['user_type' => UserType::Admin->value]);
    $agent->assignRole('Support Agent');

    expect($agent->hasPermissionTo('users.search'))->toBeTrue();
    expect($agent->hasPermissionTo('users.view'))->toBeTrue();
});

it('Support Agent cannot create or delete questions', function () {
    $agent = User::factory()->create(['user_type' => UserType::Admin->value]);
    $agent->assignRole('Support Agent');

    expect($agent->hasPermissionTo('questions.create'))->toBeFalse();
    expect($agent->hasPermissionTo('questions.delete'))->toBeFalse();
});

it('Content Lead can manage questions but not billing', function () {
    $lead = User::factory()->create(['user_type' => UserType::Admin->value]);
    $lead->assignRole('Content Lead');

    expect($lead->hasPermissionTo('questions.create'))->toBeTrue();
    expect($lead->hasPermissionTo('questions.approve'))->toBeTrue();
    expect($lead->hasPermissionTo('plans.create'))->toBeFalse();
    expect($lead->hasPermissionTo('payments.refund_large'))->toBeFalse();
});

it('Content Reviewer can only review questions', function () {
    $reviewer = User::factory()->create(['user_type' => UserType::Admin->value]);
    $reviewer->assignRole('Content Reviewer');

    expect($reviewer->hasPermissionTo('questions.review'))->toBeTrue();
    expect($reviewer->hasPermissionTo('questions.approve'))->toBeTrue();
    expect($reviewer->hasPermissionTo('questions.create'))->toBeFalse();
    expect($reviewer->hasPermissionTo('questions.delete'))->toBeFalse();
});

it('Superadmin has all permissions', function () {
    $admin = User::factory()->create(['user_type' => UserType::Admin->value]);
    $admin->assignRole('Superadmin');

    expect($admin->hasPermissionTo('users.impersonate'))->toBeTrue();
    expect($admin->hasPermissionTo('payments.refund_large'))->toBeTrue();
    expect($admin->hasPermissionTo('ai.config.edit'))->toBeTrue();
});

it('UserPolicy viewAny is gated on users.view permission', function () {
    $withPerm = User::factory()->create(['user_type' => UserType::Admin->value]);
    $withPerm->assignRole('Support Agent');

    $withoutPerm = User::factory()->create(['user_type' => UserType::Student->value]);

    $policy = new UserPolicy;

    expect($policy->viewAny($withPerm))->toBeTrue();
    expect($policy->viewAny($withoutPerm))->toBeFalse();
});
