"use client";

import Link from "next/link";
import { useEffect } from "react";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import { useQueryClient } from "@tanstack/react-query";
import { useSubscription, billingKeys } from "@/features/billing/hooks";

/**
 * Checkout success page.
 *
 * Paystack's webhook activates the subscription asynchronously, so on
 * landing here the user's `/me/subscription` may still report the previous
 * status. We poll briefly (every 3 seconds for up to 30 seconds) until the
 * status flips to `active`, then trigger celebration confetti.
 */
export default function CheckoutSuccessPage() {
  const qc = useQueryClient();
  const subQuery = useSubscription();
  const sub = subQuery.data?.subscription;
  const isActive = sub?.status === "active";

  // Light polling until the webhook activates the subscription.
  useEffect(() => {
    if (isActive) return;
    const interval = window.setInterval(() => {
      void qc.invalidateQueries({ queryKey: billingKeys.subscription });
    }, 3000);
    const timeout = window.setTimeout(() => window.clearInterval(interval), 30_000);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [isActive, qc]);

  // Celebrate once when the status flips.
  useEffect(() => {
    if (!isActive) return;
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, [isActive]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-6 py-12">
      <div className="max-w-lg text-center">
        <div
          className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${
            isActive
              ? "bg-success text-success-foreground"
              : "bg-secondary text-muted-foreground"
          }`}
        >
          {isActive ? (
            <CheckCircle2 className="h-10 w-10" />
          ) : (
            <Loader2 className="h-10 w-10 animate-spin" />
          )}
        </div>
        <p
          className={`mt-6 text-[11px] font-semibold uppercase tracking-[0.2em] ${
            isActive ? "text-success" : "text-muted-foreground"
          }`}
        >
          {isActive ? "Payment received" : "Activating your plan…"}
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">
          {isActive
            ? `Welcome to prepcify ${sub?.plan?.name ?? "Pro"}`
            : "Almost there"}
        </h1>
        <p className="mt-3 text-muted-foreground">
          {isActive
            ? "Receipt sent to your email. Pro perks are unlocked across the app right now."
            : "We're confirming with Paystack — this usually takes just a few seconds."}
        </p>
        {isActive && (
          <div className="mt-8 flex items-center gap-3 rounded-2xl bg-foreground p-5 text-left text-background">
            <Sparkles className="h-5 w-5 text-accent" />
            <p className="text-sm">
              Try the unlocked features — full past papers archive and unlimited
              AI tutor.
            </p>
          </div>
        )}
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/app/past-questions"
            className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-accent-foreground"
          >
            Browse past questions
          </Link>
          <Link
            href="/app"
            className="rounded-full bg-secondary px-6 py-2.5 text-sm font-semibold"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
