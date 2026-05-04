<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $roles = config('permissions.roles', []);

        foreach ($roles as $roleName => $perms) {
            $role = Role::firstOrCreate(
                ['name' => $roleName, 'guard_name' => 'web'],
            );

            if ($perms === '*') {
                // Superadmin gets every permission
                $role->syncPermissions(Permission::all());
                $this->command->info("Role '{$roleName}': assigned all permissions");

                continue;
            }

            // Expand wildcard entries like 'questions.*'
            $expanded = collect($perms)
                ->flatMap(function (string $perm) {
                    if (str_ends_with($perm, '.*')) {
                        $prefix = substr($perm, 0, -1); // remove trailing *

                        return Permission::where('name', 'like', $prefix.'%')->pluck('name');
                    }

                    return [$perm];
                })
                ->unique()
                ->values()
                ->toArray();

            $role->syncPermissions($expanded);
            $this->command->info("Role '{$roleName}': assigned ".count($expanded).' permissions');
        }
    }
}
