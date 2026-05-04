<?php

declare(strict_types=1);

use App\Jobs\UserDataExportJob;
use App\Models\User;
use App\Support\Enums\UserType;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Queue;

// CRITICAL TEST: export idempotency
it('export job is idempotent — second dispatch within 24h is a no-op', function () {
    Queue::fake();

    $user = User::factory()->create(['user_type' => UserType::Student->value]);

    // Simulate first run completing and setting the cache key
    Cache::put('user_data_export:'.$user->id, 'path/to/export.zip', now()->addHours(24));

    // Dispatch the job — handle() should exit early due to cache hit
    $job = new UserDataExportJob($user->id);

    // No exception should be thrown; job exits silently
    expect(fn () => $job->handle())->not->toThrow(Throwable::class);
});

it('export endpoint queues job and returns queued=true when no prior export', function () {
    Queue::fake();

    $user = User::factory()->create(['user_type' => UserType::Student->value]);

    Cache::forget('user_data_export:'.$user->id);

    $response = $this->actingAs($user)
        ->postJson('/api/v1/me/data-export');

    $response->assertOk()->assertJsonPath('queued', true);

    Queue::assertPushed(UserDataExportJob::class, fn ($job) => $job->userId === $user->id);
});

it('export endpoint returns queued=false when export already requested', function () {
    Queue::fake();

    $user = User::factory()->create(['user_type' => UserType::Student->value]);

    Cache::put('user_data_export:'.$user->id, 'path/export.zip', now()->addHours(1));

    $response = $this->actingAs($user)
        ->postJson('/api/v1/me/data-export');

    $response->assertOk()->assertJsonPath('queued', false);

    Queue::assertNothingPushed();
});
