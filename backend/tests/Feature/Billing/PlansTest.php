<?php

declare(strict_types=1);

use App\Models\Plan;
use App\Models\PlanPrice;

it('GET /api/v1/plans returns active plans ordered by sort_order', function () {
    Plan::factory()->create(['active' => true, 'sort_order' => 2, 'name' => 'Pro']);
    Plan::factory()->create(['active' => true, 'sort_order' => 1, 'name' => 'Free']);
    Plan::factory()->create(['active' => false, 'sort_order' => 0, 'name' => 'Hidden']);

    $response = $this->getJson('/api/v1/plans');

    $response->assertOk();
    $data = $response->json('data');
    expect($data)->toHaveCount(2);
    expect($data[0]['name'])->toBe('Free');
    expect($data[1]['name'])->toBe('Pro');
});

it('GET /api/v1/plans returns empty array when no active plans exist', function () {
    Plan::factory()->create(['active' => false]);

    $response = $this->getJson('/api/v1/plans');

    $response->assertOk();
    expect($response->json('data'))->toHaveCount(0);
});

it('GET /api/v1/plans includes prices with each plan', function () {
    $plan = Plan::factory()->create(['active' => true]);
    PlanPrice::create([
        'plan_id' => $plan->id,
        'currency' => 'NGN',
        'interval' => 'monthly',
        'amount_minor' => 500000,
    ]);

    $response = $this->getJson('/api/v1/plans');

    $response->assertOk();
    expect($response->json('data.0'))->toHaveKey('prices');
});

it('GET /api/v1/plans is publicly accessible without auth', function () {
    $response = $this->getJson('/api/v1/plans');
    $response->assertOk();
});
