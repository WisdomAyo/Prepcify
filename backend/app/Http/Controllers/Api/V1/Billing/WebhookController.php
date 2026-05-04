<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Billing;

use App\Http\Controllers\Controller;
use App\Jobs\PaystackWebhookJob;
use App\Services\PaystackService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class WebhookController extends Controller
{
    public function __construct(private readonly PaystackService $paystackService) {}

    public function paystack(Request $request): JsonResponse
    {
        $signature = $request->header('X-Paystack-Signature', '');
        $payload = $request->getContent();

        if (! $this->paystackService->verifyWebhookSignature($payload, (string) $signature)) {
            return response()->json(['message' => 'Invalid signature'], 401);
        }

        /** @var array<string, mixed> $event */
        $event = $request->json()->all();

        $eventId = (string) ($event['id'] ?? Str::uuid()->toString());

        PaystackWebhookJob::dispatch($eventId, $event);

        return response()->json(['status' => 'queued']);
    }
}
