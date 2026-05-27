"use client";

import Link from "next/link";
import { Crown, CreditCard, Calendar } from "lucide-react";
import { PageHeader } from "@/components/shells/page-header";
import { DataState } from "@/components/ui/data-state";
import { useSubscription, useCancelSubscription } from "@/features/billing/hooks";
import { toast } from "sonner";

export default function SettingsSubscriptionPage() {
  const subQuery = useSubscription();
  const cancel = useCancelSubscription();
  const sub = subQuery.data?.subscription ?? null;
  const planName = sub?.plan?.name ?? "Free";
  const renewsOn = sub?.current_period_end
    ? new Date(sub.current_period_end).toLocaleDateString(undefined, {
        month: "short", day: "numeric", year: "numeric",
      })
    : null;

  async function handleCancel() {
    if (!sub) return;
    try {
      await cancel.mutateAsync(sub.id);
      toast.success("Subscription cancelled", {
        description: "You keep Pro until the end of the current period.",
      });
    } catch {
      toast.error("Could not cancel — please try again.");
    }
  }

  return (
    <div className="max-w-2xl">
      <PageHeader
        crumbs={[
          { label: "Settings", href: "/app/settings" },
          { label: "Subscription" },
        ]}
        eyebrow="Settings"
        title="Subscription"
      />

      <DataState
        isLoading={subQuery.isLoading}
        isError={subQuery.isError}
        error={subQuery.error}
        onRetry={() => void subQuery.refetch()}
      >
      <div className="mb-5 rounded-3xl bg-foreground p-6 text-background">
        <div className="flex items-center gap-3">
          <Crown className="h-5 w-5 text-accent" />
          <p className="text-xs uppercase tracking-wider text-background/60">
            Current plan
          </p>
        </div>
        <p className="mt-3 font-display text-3xl font-bold">
          prepcify {planName}
        </p>
        <p className="mt-1 text-sm text-background/70">
          {sub ? `Status: ${sub.status}` : "No active subscription"}
          {renewsOn && ` · renews ${renewsOn}`}
        </p>
        <div className="mt-5 flex gap-3">
          <Link
            href="/app/pricing"
            className="rounded-full bg-accent px-5 py-2 text-xs font-semibold text-accent-foreground"
          >
            Change plan
          </Link>
          {sub && (
            <button
              onClick={handleCancel}
              disabled={cancel.isPending}
              className="rounded-full bg-background/10 px-5 py-2 text-xs font-semibold disabled:opacity-60"
            >
              {cancel.isPending ? "Cancelling…" : "Cancel subscription"}
            </button>
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="flex items-center gap-2 font-semibold">
            <CreditCard className="h-4 w-4" /> Payment method
          </p>
          <button className="text-xs font-semibold text-accent">Update</button>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-secondary p-4">
          <div className="flex h-9 w-12 items-center justify-center rounded-md bg-foreground text-[10px] font-bold text-background">
            VISA
          </div>
          <div>
            <p className="text-sm">•••• •••• •••• 4242</p>
            <p className="text-xs text-muted-foreground">Expires 09/27</p>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-3xl border border-border bg-card p-6">
        <p className="mb-4 flex items-center gap-2 font-semibold">
          <Calendar className="h-4 w-4" /> Billing history
        </p>
        <div className="space-y-2 text-sm">
          {["Apr 18, 2026", "Mar 18, 2026", "Feb 18, 2026"].map((d) => (
            <div
              key={d}
              className="flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-secondary/40"
            >
              <span>{d}</span>
              <span className="text-muted-foreground">₦2,400</span>
              <button className="text-xs font-semibold text-accent">
                Receipt
              </button>
            </div>
          ))}
        </div>
      </div>
      </DataState>
    </div>
  );
}
