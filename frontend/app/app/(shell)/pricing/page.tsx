import Link from "next/link";
import { Check, Crown, Sparkles, School } from "lucide-react";
import { PageHeader } from "@/components/shells/page-header";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "₦0",
    cycle: "Forever",
    features: ["50 questions / day", "Basic AI tutor (10 msgs/day)", "Public leaderboard", "1 mock exam / week"],
    cta: "Current plan",
    icon: Sparkles,
    accent: false,
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "₦2,400",
    cycle: "/ month",
    features: ["Unlimited questions", "Unlimited AI tutor", "Full past papers archive", "Unlimited mocks", "Detailed analytics", "Offline downloads"],
    cta: "Start Pro",
    icon: Crown,
    accent: true,
    popular: true,
  },
  {
    id: "school",
    name: "School",
    price: "Custom",
    cycle: "Per student / term",
    features: ["Everything in Pro", "Class dashboards", "Bulk onboarding", "Teacher tools", "Performance reports", "Priority support"],
    cta: "Talk to sales",
    icon: School,
    accent: false,
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <div className="max-w-6xl">
      <PageHeader
        eyebrow="Plans"
        title="Pick the plan that fits how you study"
        description="Cancel anytime. Refunds within 7 days."
      />
      <div className="grid gap-5 lg:grid-cols-3">
        {plans.map((p) => (
          <div
            key={p.id}
            className={`relative rounded-3xl border p-7 ${
              p.accent
                ? "border-accent bg-foreground text-background shadow-card"
                : "border-border bg-card"
            }`}
          >
            {p.popular && (
              <span className="absolute -top-3 left-7 rounded-full bg-accent px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-accent-foreground">
                Most popular
              </span>
            )}
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                p.accent
                  ? "bg-accent text-accent-foreground"
                  : "bg-secondary"
              }`}
            >
              <p.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-5 font-display text-2xl font-bold">
              {p.name}
            </h3>
            <div className="mt-2 flex items-baseline gap-1">
              <p className="font-display text-4xl font-bold">{p.price}</p>
              <p
                className={`text-sm ${
                  p.accent ? "text-background/60" : "text-muted-foreground"
                }`}
              >
                {p.cycle}
              </p>
            </div>
            <ul className="mt-6 space-y-2.5 text-sm">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check
                    className={`mt-0.5 h-4 w-4 shrink-0 ${
                      p.accent ? "text-accent" : "text-success"
                    }`}
                  />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Link
              href={p.id === "free" ? "/app" : "/app/checkout"}
              className={`mt-7 block w-full rounded-full py-3 text-center text-sm font-semibold ${
                p.accent
                  ? "bg-accent text-accent-foreground"
                  : "bg-secondary text-foreground"
              }`}
            >
              {p.cta}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
