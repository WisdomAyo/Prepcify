<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Services\SubscriptionService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class PaystackWebhookJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    /** @param array<string, mixed> $event */
    public function __construct(
        public readonly string $eventId,
        public readonly array $event,
    ) {
        $this->onQueue('default');
    }

    public function handle(SubscriptionService $subscriptionService): void
    {
        $idempotencyKey = 'paystack_event:'.$this->eventId;

        if (Cache::has($idempotencyKey)) {
            return;
        }

        Cache::put($idempotencyKey, true, now()->addDays(7));

        $eventType = $this->event['event'] ?? '';
        $data = $this->event['data'] ?? [];

        try {
            match ($eventType) {
                'charge.success' => $this->handleChargeSuccess($subscriptionService, $data),
                default => Log::info('Unhandled Paystack event', ['event' => $eventType]),
            };
        } catch (\Throwable $e) {
            Cache::forget($idempotencyKey);
            Log::error('Paystack webhook processing failed', [
                'event_id' => $this->eventId,
                'event_type' => $eventType,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('PaystackWebhookJob permanently failed', [
            'event_id' => $this->eventId,
            'event_type' => $this->event['event'] ?? 'unknown',
            'error' => $exception->getMessage(),
        ]);
    }

    /** @param array<string, mixed> $data */
    private function handleChargeSuccess(SubscriptionService $subscriptionService, array $data): void
    {
        $reference = $data['reference'] ?? null;

        if ($reference === null) {
            return;
        }

        $subscriptionService->handlePaymentSuccess($reference, $data);
    }
}
