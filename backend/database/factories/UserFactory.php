<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\User;
use App\Support\Enums\UserType;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    protected static ?string $password = null;

    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'email' => fake()->unique()->safeEmail(),
            'phone' => null,
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'display_name' => fake()->name(),
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'user_type' => UserType::Student->value,
            'timezone' => 'Africa/Lagos',
            'locale' => 'en_NG',
            'remember_token' => Str::random(10),
        ];
    }

    public function unverified(): static
    {
        return $this->state(fn () => ['email_verified_at' => null]);
    }

    public function admin(): static
    {
        return $this->state(fn () => [
            'user_type' => UserType::Admin->value,
            'email_verified_at' => now(),
        ]);
    }

    public function student(): static
    {
        return $this->state(fn () => ['user_type' => UserType::Student->value]);
    }
}
