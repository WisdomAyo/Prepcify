<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Billing;

use App\Http\Controllers\Controller;
use App\Http\Requests\StartSubscriptionRequest;
use App\Http\Resources\SubscriptionResource;
use App\Models\User;
use App\Services\SubscriptionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubscriptionController extends Controller
{
    public function __construct(private readonly SubscriptionService $subscriptionService) {}

    public function current(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user() ?? abort(401);

        $subscription = $this->subscriptionService->currentSubscription($user);

        if ($subscription === null) {
            return response()->json(['subscription' => null]);
        }

        return response()->json(['subscription' => new SubscriptionResource($subscription)]);
    }

    public function start(StartSubscriptionRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user() ?? abort(401);

        $data = $request->validated();
        $checkout = $this->subscriptionService->startCheckout(
            payer: $user,
            planCode: (string) $data['plan_code'],
            currency: (string) $data['currency'],
            interval: (string) $data['interval'],
        );

        return response()->json($checkout, 201);
    }

    public function cancel(Request $request, int $subscriptionId): SubscriptionResource
    {
        /** @var User $user */
        $user = $request->user() ?? abort(401);

        $subscription = $this->subscriptionService->cancel($user, $subscriptionId);

        return new SubscriptionResource($subscription->load('plan'));
    }

    public function startForStudent(StartSubscriptionRequest $request, int $studentId): JsonResponse
    {
        /** @var User $user */
        $user = $request->user() ?? abort(401);

        $data = $request->validated();
        $checkout = $this->subscriptionService->startCheckout(
            payer: $user,
            planCode: (string) $data['plan_code'],
            currency: (string) $data['currency'],
            interval: (string) $data['interval'],
            forStudentId: $studentId,
        );

        return response()->json($checkout, 201);
    }
}
