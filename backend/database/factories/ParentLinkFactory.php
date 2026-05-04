<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\ParentLink;
use App\Models\User;
use App\Support\Enums\ParentLinkInvitedBy;
use App\Support\Enums\ParentLinkStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ParentLink>
 */
class ParentLinkFactory extends Factory
{
    protected $model = ParentLink::class;

    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'parent_user_id' => User::factory()->state(['user_type' => 'parent']),
            'student_user_id' => User::factory(),
            'status' => ParentLinkStatus::Active->value,
            'invited_by' => ParentLinkInvitedBy::Parent->value,
            'permissions' => [
                'view_progress' => true,
                'view_attempts' => true,
                'receive_reports' => true,
            ],
            'linked_at' => now()->subDays(7),
            'last_viewed_at' => null,
        ];
    }

    public function pending(): static
    {
        return $this->state(fn () => [
            'status' => ParentLinkStatus::Pending->value,
            'linked_at' => null,
        ]);
    }

    public function active(): static
    {
        return $this->state(fn () => [
            'status' => ParentLinkStatus::Active->value,
            'linked_at' => now()->subDays(7),
        ]);
    }

    public function revoked(): static
    {
        return $this->state(fn () => [
            'status' => ParentLinkStatus::Revoked->value,
        ]);
    }

    public function withRestrictedPermissions(): static
    {
        return $this->state(fn () => [
            'permissions' => [
                'view_progress' => true,
                'view_attempts' => false,
                'receive_reports' => false,
            ],
        ]);
    }
}
