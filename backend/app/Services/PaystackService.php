<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaystackService
{
    private string $secretKey;

    private string $baseUrl = 'https://api.paystack.co';

    public function __construct()
    {
        $this->secretKey = (string) config('services.paystack.secret_key', '');
    }

    /**
     * @param  array<string, mixed>  $metadata
     * @return array<string, mixed>
     */
    public function initializeTransaction(string $email, int $amountMinor, string $currency, string $reference, array $metadata = []): array
    {
        $response = Http::withToken($this->secretKey)
            ->post($this->baseUrl.'/transaction/initialize', [
                'email' => $email,
                'amount' => $amountMinor,
                'currency' => $currency,
                'reference' => $reference,
                'metadata' => $metadata,
            ]);

        return $response->json();
    }

    /** @return array<string, mixed> */
    public function verifyTransaction(string $reference): array
    {
        $response = Http::withToken($this->secretKey)
            ->get($this->baseUrl.'/transaction/verify/'.$reference);

        return $response->json();
    }

    public function verifyWebhookSignature(string $payload, string $signature): bool
    {
        $computed = hash_hmac('sha512', $payload, $this->secretKey);

        return hash_equals($computed, $signature);
    }

    /** @param array<string, mixed> $event */
    public function processWebhookEvent(array $event): void
    {
        $eventType = $event['event'] ?? '';

        Log::info('Paystack webhook received', ['event' => $eventType]);
    }
}
