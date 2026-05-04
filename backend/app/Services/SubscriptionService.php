<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Payment;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use App\Support\Enums\PaymentStatus;
use App\Support\Enums\SubscriptionStatus;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SubscriptionService
{
    public function __construct(
        private readonly PaystackService $paystackService,
        private readonly EntitlementService $entitlementService,
    ) {}

    /** @return array<string, mixed> */
    public function startCheckout(User $payer, string $planCode, string $currency, string $interval, ?int $forStudentId = null): array
    {
        $beneficiary = $forStudentId !== null
            ? User::findOrFail($forStudentId)
            : $payer;

        $plan = Plan::where('code', $planCode)->where('active', true)->firstOrFail();
        $price = $plan->prices()
            ->where('currency', $currency)
            ->where('interval', $interval)
            ->firstOrFail();

        $reference = 'lumio_'.Str::random(24);
        $email = $payer->email ?? ($payer->phone.'@phone.lumio');

        $checkoutMetadata = [
            'payer_id' => $payer->id,
            'beneficiary_id' => $beneficiary->id,
            'plan_id' => $plan->id,
            'plan_price_id' => $price->id,
            'interval' => $interval,
        ];

        $paystackData = $this->paystackService->initializeTransaction(
            email: $email,
            amountMinor: $price->amount_minor,
            currency: $currency,
            reference: $reference,
            metadata: $checkoutMetadata,
        );

        Payment::create([
            'user_id' => $payer->id,
            'subscription_id' => null,
            'amount_minor' => $price->amount_minor,
            'currency' => $currency,
            'status' => PaymentStatus::Pending->value,
            'paystack_reference' => $reference,
            'paid_at' => null,
            'metadata' => array_merge($checkoutMetadata, [
                'paystack_initialize_response' => $paystackData,
            ]),
        ]);

        return [
            'authorization_url' => $paystackData['data']['authorization_url'] ?? null,
            'reference' => $reference,
        ];
    }

    /** @param array<string, mixed> $paystackData */
    public function handlePaymentSuccess(string $reference, array $paystackData): void
    {
        DB::transaction(function () use ($reference, $paystackData): void {
            $payment = Payment::where('paystack_reference', $reference)
                ->lockForUpdate()
                ->firstOrFail();

            if ($payment->status === PaymentStatus::Success) {
                return;
            }

            $metadata = $payment->metadata ?? [];
            $beneficiaryId = $metadata['beneficiary_id'] ?? $payment->user_id;
            $payerId = $metadata['payer_id'] ?? $payment->user_id;
            $planId = $metadata['plan_id'] ?? null;
            $interval = $metadata['interval'] ?? 'monthly';

            if ($planId === null) {
                throw new \RuntimeException("Payment {$reference} is missing checkout plan metadata.");
            }

            $payment->update([
                'status' => PaymentStatus::Success->value,
                'paid_at' => now(),
            ]);

            $periodEnd = $interval === 'yearly'
                ? Carbon::now()->addYear()
                : Carbon::now()->addMonth();

            $subscription = Subscription::create([
                'user_id' => $beneficiaryId,
                'paid_by_user_id' => $payerId !== $beneficiaryId ? $payerId : null,
                'plan_id' => $planId,
                'status' => SubscriptionStatus::Active->value,
                'started_at' => now(),
                'current_period_start' => now(),
                'current_period_end' => $periodEnd,
                'paystack_subscription_code' => $paystackData['subscription_code'] ?? null,
                'paystack_customer_code' => $paystackData['customer']['customer_code'] ?? null,
                'metadata' => $paystackData,
            ]);

            $payment->update(['subscription_id' => $subscription->id]);

            $this->entitlementService->invalidate((int) $beneficiaryId);
        });
    }

    public function cancel(User $user, int $subscriptionId): Subscription
    {
        $subscription = Subscription::where('id', $subscriptionId)
            ->where('user_id', $user->id)
            ->where('status', SubscriptionStatus::Active->value)
            ->firstOrFail();

        $subscription->update([
            'status' => SubscriptionStatus::Cancelled->value,
            'cancelled_at' => now(),
        ]);

        $this->entitlementService->invalidate($user->id);

        return $subscription->refresh();
    }

    public function currentSubscription(User $user): ?Subscription
    {
        return Subscription::where('user_id', $user->id)
            ->where('status', SubscriptionStatus::Active->value)
            ->where('current_period_end', '>', now())
            ->with('plan')
            ->latest('started_at')
            ->first();
    }
}
