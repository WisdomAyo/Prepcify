import Link from "next/link";
import { Check, Crown, Sparkles, School } from "lucide-react";
import { serverFetch } from "@/lib/api/server";
import type { Plan } from "@/lib/api/billing";

/**
 * Server Component that fetches `/api/v1/plans` from Laravel directly and
 * renders the pricing grid in the initial HTML — no client JS, fully
 * crawlable, ISR-cached for an hour.
 *
 * When the backend is unreachable we render a friendly placeholder instead
 * of throwing, so a broken API never blocks the marketing page.
 */

const ICONS: Record<string, typeof Sparkles> = {
  free: Sparkles,
  pro: Crown,
  school: School,
};

function formatPrice(amountMinor: number, currency: string): string {
  if (amountMinor === 0) return currency === "NGN" ? "₦0" : "$0";
  const major = amountMinor / 100;
  if (currency === "NGN") return `₦${major.toLocaleString()}`;
  if (currency === "USD") return `$${major.toLocaleString()}`;
  return `${major.toLocaleString()} ${currency}`;
}

async function loadPlans(): Promise<Plan[] | null> {
  try {
    return await serverFetch<Plan[]>("/plans", {
      anonymous: true,
      next: { revalidate: 3600, tags: ["plans"] },
    });
  } catch {
    return null;
  }
}

export async function ServerPlans() {
  const plans = await loadPlans();

  if (!plans) {
    return (
      <section className="bg-background py-20">
        <div className="container max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Pricing
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight">
            Live plans are loading…
          </h2>
          <p className="mt-3 text-muted-foreground">
            Our pricing API is briefly unreachable. Reload in a moment or
            jump straight to the app.
          </p>
        </div>
      </section>
    );
  }

  const sorted = [...plans].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <section id="live-plans" className="bg-background py-24">
      <div className="container max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
            Pricing · live from the API
          </p>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
            Pick the plan that fits your prep.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Cancel anytime. All prices billed in your local currency through
            Paystack.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {sorted.map((plan) => {
            const Icon = ICONS[plan.code] ?? Sparkles;
            const popular = plan.code === "pro";
            const monthly = plan.prices.find((p) => p.interval === "monthly");
            const priceLabel = monthly
              ? formatPrice(monthly.amount_minor, monthly.currency)
              : "Custom";
            const cycleLabel = monthly ? "/ month" : "per term";

            return (
              <div
                key={plan.code}
                className={`relative rounded-3xl border p-7 ${
                  popular
                    ? "border-accent bg-foreground text-background shadow-card"
                    : "border-border bg-card"
                }`}
              >
                {popular && (
                  <span className="absolute -top-3 left-7 rounded-full bg-accent px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-accent-foreground">
                    Most popular
                  </span>
                )}
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                    popular
                      ? "bg-accent text-accent-foreground"
                      : "bg-secondary"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-display text-2xl font-bold">
                  {plan.name}
                </h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <p className="font-display text-4xl font-bold">
                    {priceLabel}
                  </p>
                  <p
                    className={`text-sm ${popular ? "text-background/60" : "text-muted-foreground"}`}
                  >
                    {cycleLabel}
                  </p>
                </div>
                {plan.description && (
                  <p
                    className={`mt-3 text-sm ${popular ? "text-background/70" : "text-muted-foreground"}`}
                  >
                    {plan.description}
                  </p>
                )}
                <ul className="mt-6 space-y-2.5 text-sm">
                  {Object.entries(plan.entitlements).map(([key, value]) => (
                    <li key={key} className="flex items-start gap-2">
                      <Check
                        className={`mt-0.5 h-4 w-4 shrink-0 ${
                          popular ? "text-accent" : "text-success"
                        }`}
                      />
                      <span>
                        <span className="font-medium">{prettyKey(key)}</span>
                        {value !== true && value !== false && (
                          <span
                            className={
                              popular ? "text-background/70" : "text-muted-foreground"
                            }
                          >
                            {" — "}
                            {String(value)}
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.code === "free" ? "/signup" : "/app/checkout"}
                  className={`mt-7 block w-full rounded-full py-3 text-center text-sm font-semibold ${
                    popular
                      ? "bg-accent text-accent-foreground"
                      : "bg-secondary text-foreground"
                  }`}
                >
                  {plan.code === "free"
                    ? "Get started"
                    : plan.code === "school"
                      ? "Talk to sales"
                      : `Start ${plan.name}`}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function prettyKey(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
