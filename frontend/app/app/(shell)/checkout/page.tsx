"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { toast } from "sonner";
import { Lock, Check, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/shells/page-header";
import { Button } from "@/components/ui/button";
import { DataState } from "@/components/ui/data-state";
import { usePlans, useStartSubscription } from "@/features/billing/hooks";
import { useAuth } from "@/contexts/auth-context";
import { ApiError } from "@/lib/api/types";
import type { Plan } from "@/lib/api/billing";

/**
 * Paystack-backed checkout.
 *
 * The Sanctum-authenticated `POST /me/subscription/start` returns a
 * Paystack `authorization_url`. We hand the browser off to Paystack with
 * `window.location.assign(...)` — they collect the card, fire the webhook,
 * and redirect the user back to `/app/checkout/success` (or `/failed`).
 *
 * No card data ever touches our frontend.
 */
function pickPlan(plans: Plan[] | undefined, code: string): Plan | undefined {
  return plans?.find((p) => p.code === code);
}

function formatPrice(amountMinor: number, currency: string): string {
  const major = amountMinor / 100;
  if (currency === "NGN") return `₦${major.toLocaleString()}`;
  if (currency === "USD") return `$${major.toLocaleString()}`;
  return `${major.toLocaleString()} ${currency}`;
}

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const planCode = searchParams.get("plan") ?? "pro";
  const interval =
    (searchParams.get("interval") as "monthly" | "yearly") ?? "monthly";

  const { user } = useAuth();
  const plansQuery = usePlans();
  const startSub = useStartSubscription();

  const plan = useMemo(
    () => pickPlan(plansQuery.data, planCode),
    [plansQuery.data, planCode],
  );
  const price = plan?.prices.find((p) => p.interval === interval);

  async function startCheckout() {
    if (!plan || !price) return;
    try {
      const checkout = await startSub.mutateAsync({
        plan_code: plan.code,
        currency: price.currency,
        interval,
      });
      // Hand off to Paystack. The webhook fires asynchronously; the success
      // page polls `/me/subscription` until the status flips.
      window.location.assign(checkout.authorization_url);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Couldn't start checkout";
      toast.error("Checkout failed", { description: message });
    }
  }

  return (
    <div className="max-w-5xl">
      <PageHeader
        eyebrow="Checkout"
        title="Complete your purchase"
        description="Secure payment via Paystack. Your card never touches our servers."
      />

      <DataState
        isLoading={plansQuery.isLoading}
        isError={plansQuery.isError}
        error={plansQuery.error}
        isEmpty={plansQuery.data?.length === 0}
        onRetry={() => void plansQuery.refetch()}
      >
        {plan && price ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-5 rounded-3xl border border-border bg-card p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Billing email
                </p>
                <p className="mt-2 rounded-xl border border-border bg-background px-4 py-3 text-sm">
                  {user?.email ?? "—"}
                </p>
              </div>

              <div className="rounded-2xl border border-accent/20 bg-accent/5 p-5">
                <div className="flex items-center gap-2 text-accent">
                  <Sparkles className="h-4 w-4" />
                  <p className="text-xs font-semibold uppercase tracking-wider">
                    What happens next
                  </p>
                </div>
                <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li>
                    <span className="font-semibold text-foreground">1.</span>{" "}
                    We&apos;ll redirect you to Paystack&apos;s hosted checkout.
                  </li>
                  <li>
                    <span className="font-semibold text-foreground">2.</span>{" "}
                    Pay with card, bank transfer, or USSD.
                  </li>
                  <li>
                    <span className="font-semibold text-foreground">3.</span>{" "}
                    You&apos;ll land back here with your plan activated within
                    seconds.
                  </li>
                </ol>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Lock className="h-3.5 w-3.5" /> PCI-compliant — Paystack is the
                only system that sees your card.
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  size="lg"
                  className="flex-1"
                  isLoading={startSub.isPending}
                  loadingText="Redirecting"
                  onClick={startCheckout}
                >
                  Continue to Paystack · {formatPrice(price.amount_minor, price.currency)}
                </Button>
                <Link
                  href="/app/pricing"
                  className="rounded-full bg-secondary px-5 py-3 text-sm font-semibold"
                >
                  Change plan
                </Link>
              </div>
            </div>

            <aside className="h-fit rounded-3xl bg-foreground p-6 text-background">
              <p className="text-xs uppercase tracking-wider text-background/60">
                Order summary
              </p>
              <p className="mt-3 font-display text-2xl font-bold">
                prepcify {plan.name} ·{" "}
                {interval === "monthly" ? "Monthly" : "Yearly"}
              </p>
              {plan.description && (
                <p className="mt-1 text-sm text-background/70">
                  {plan.description}
                </p>
              )}
              <ul className="mt-5 space-y-2 text-sm text-background/80">
                {Object.keys(plan.entitlements).slice(0, 4).map((key) => (
                  <li key={key} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-accent" />
                    <span className="capitalize">{key.replace(/_/g, " ")}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 space-y-2 border-t border-background/10 pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-background/60">Subtotal</span>
                  <span>{formatPrice(price.amount_minor, price.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-background/60">VAT</span>
                  <span>{formatPrice(0, price.currency)}</span>
                </div>
                <div className="flex justify-between border-t border-background/10 pt-2 font-bold">
                  <span>Total</span>
                  <span>{formatPrice(price.amount_minor, price.currency)}</span>
                </div>
              </div>
            </aside>
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-border bg-secondary/30 p-12 text-center">
            <p className="font-display text-lg font-bold">Plan not found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Pick a plan from the pricing page to get started.
            </p>
            <Link
              href="/app/pricing"
              className="mt-5 inline-block rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background"
            >
              Browse plans
            </Link>
          </div>
        )}
      </DataState>
    </div>
  );
}
