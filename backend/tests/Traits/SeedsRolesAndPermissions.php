<?php

declare(strict_types=1);

namespace Tests\Traits;

use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Spatie\Permission\PermissionRegistrar;

trait SeedsRolesAndPermissions
{
    protected function setUpRolesAndPermissions(): void
    {
        $this->seed(PermissionSeeder::class);
        $this->seed(RoleSeeder::class);

        // Clear Spatie's cache so freshly seeded roles/permissions are visible
        app()[PermissionRegistrar::class]->forgetCachedPermissions();
    }
}
