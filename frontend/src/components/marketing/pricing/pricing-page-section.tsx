"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Check,
  ChevronDown,
  Database,
  Layers3,
  LifeBuoy,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

type BillingCycle = "monthly" | "yearly";

const plans = [
  {
    eyebrow: "Starter",
    icon: "01",
    monthly: 0,
    yearly: 0,
    description: "Best for students starting structured exam prep.",
    featureIntro: "Everything needed to begin studying:",
    cta: "Start Free",
    footnote: "Free forever. No card required.",
    href: "/signup",
    features: [
      { icon: Layers3, text: "Essential study tools" },
      { icon: BarChart3, text: "Basic readiness insights" },
      { icon: Users, text: "One learner profile" },
      { icon: ShieldCheck, text: "Selected saved progress" },
      { icon: LifeBuoy, text: "Community support" },
    ],
  },
  {
    eyebrow: "Pro",
    icon: "02",
    monthly: 2500,
    yearly: 24000,
    description: "Best for serious WAEC, JAMB, NECO and Cambridge prep.",
    featureIntro: "Everything in Starter plus:",
    cta: "Try Pro",
    footnote: "Yearly saves ₦6,000.",
    href: "/app/checkout",
    popular: true,
    features: [
      { icon: BookOpen, text: "Full past-question archive" },
      { icon: BarChart3, text: "Deep mastery analytics" },
      { icon: Sparkles, text: "Unlimited AI tutor explanations" },
      { icon: ShieldCheck, text: "Timed mock history and review" },
      { icon: LifeBuoy, text: "Priority study support" },
    ],
  },
  {
    eyebrow: "Schools",
    icon: "03",
    monthly: null,
    yearly: null,
    description: "Best for schools, tutors and learning centers.",
    featureIntro: "Everything in Pro plus:",
    cta: "Book a Demo",
    footnote: "Custom pricing by learners and term.",
    href: "/contact",
    features: [
      { icon: Users, text: "Class and teacher dashboards" },
      { icon: BarChart3, text: "Class-wide progress reports" },
      { icon: Database, text: "Learner seats by agreement" },
      { icon: ShieldCheck, text: "School roles and permissions" },
      { icon: LifeBuoy, text: "Dedicated onboarding support" },
    ],
  },
] as const;

const comparisonRows = [
  ["Monthly price", "₦0", "₦2,500", "Custom"],
  ["Yearly price", "₦0", "₦24,000", "Custom"],
  ["Best for", "Personal prep", "Serious students", "Schools and tutors"],
  ["Past questions", "Selected sets", "Full archive", "Archive + assignments"],
  ["AI tutor", "Limited prompts", "Unlimited explanations", "Managed classroom access"],
  ["Mock exams", "Practice mode", "Timed mocks + history", "Teacher-created mocks"],
  ["Reporting", "Basic analytics", "Deep-dive analytics", "Class-wide reporting"],
  ["Support", "Community", "Priority support", "Dedicated onboarding"],
  ["Admin dashboard", false, false, true],
] as const;

const faqItems = [
  {
    q: "Can I switch plans later?",
    a: "Yes. Students can move from Starter to Pro whenever they are ready. Schools can speak with us to adjust seats, cohorts, or billing terms.",
  },
  {
    q: "What is included in the free plan?",
    a: "Starter includes essential study tools, selected question sets, basic progress tracking, and enough structure to begin preparing with discipline.",
  },
  {
    q: "Do you offer discounts for schools or tutorial centers?",
    a: "Yes. School pricing depends on learner count, subjects, admin needs, and onboarding support. We can shape a term-based plan around your workflow.",
  },
  {
    q: "What kind of support is included?",
    a: "Starter gets self-serve resources, Pro gets priority study and billing support, and Schools get onboarding help for admins, teachers, and cohorts.",
  },
] as const;

function formatPrice(value: number | null) {
  if (value === null) return "Custom";
  if (value === 0) return "₦0";

  return `₦${value.toLocaleString("en-NG")}`;
}

function PricingBadge({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="mx-auto inline-flex items-center rounded-full border border-slate-200 bg-white p-1 text-sm shadow-[0_10px_30px_-24px_rgba(15,23,42,0.45)]">
      <span className="rounded-full bg-slate-950 px-4 py-1.5 text-xs font-bold text-white">
        {label}
      </span>
      <span className="flex items-center gap-2 px-3 text-xs font-semibold text-slate-950">
        {value}
        <ArrowRight className="h-3.5 w-3.5" />
      </span>
    </div>
  );
}

function BillingToggle({
  cycle,
  onChange,
}: {
  cycle: BillingCycle;
  onChange: (cycle: BillingCycle) => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-sm items-center rounded-2xl border border-slate-200 bg-white p-1 shadow-[0_18px_45px_-36px_rgba(15,23,42,0.65)]">
      {(["monthly", "yearly"] as const).map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onChange(item)}
          className={cn(
            "relative h-12 flex-1 rounded-xl text-sm font-bold capitalize transition-colors",
            cycle === item ? "text-white" : "text-slate-600 hover:text-slate-950",
          )}
        >
          {cycle === item && (
            <motion.span
              layoutId="billing-pill"
              className="absolute inset-0 rounded-xl bg-emerald-800"
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
            />
          )}
          <span className="relative">{item}</span>
        </button>
      ))}
    </div>
  );
}

function PlanCard({
  cycle,
  plan,
}: {
  cycle: BillingCycle;
  plan: (typeof plans)[number];
}) {
  const popular = "popular" in plan && plan.popular;
  const price = cycle === "monthly" ? plan.monthly : plan.yearly;
  const cycleLabel = price === null ? "" : cycle === "monthly" ? "/month" : "/year";

  return (
    <motion.article
      layout
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className={cn(
        "relative flex h-full flex-col rounded-[1.35rem] border p-4 shadow-[0_20px_60px_-44px_rgba(15,23,42,0.65)]",
        popular
          ? "border-emerald-300 bg-emerald-100"
          : "border-slate-200 bg-slate-50",
      )}
    >
      {popular && (
        <span className="absolute right-4 top-4 rounded-full bg-emerald-700 px-4 py-1.5 text-xs font-bold text-white">
          Most Popular
        </span>
      )}

      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-sm font-bold text-emerald-800 shadow-[0_14px_34px_-26px_rgba(15,23,42,0.55)]">
        {plan.icon}
      </div>

      <h2 className="mt-5 text-2xl font-bold text-slate-950">{plan.eyebrow}</h2>
      <p className="mt-3 min-h-12 text-sm leading-6 text-slate-700">
        {plan.description}
      </p>

      <div className="mt-7 flex items-end gap-2">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={`${plan.eyebrow}-${cycle}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="text-5xl font-bold tracking-tight text-slate-950"
          >
            {formatPrice(price)}
          </motion.span>
        </AnimatePresence>
        <span className="pb-2 text-sm font-semibold text-slate-600">
          {cycleLabel}
        </span>
      </div>

      <div className="mt-6 flex-1 rounded-[1rem] bg-white p-5 shadow-[0_14px_36px_-30px_rgba(15,23,42,0.35)]">
        <p className="text-sm font-bold text-slate-950">{plan.featureIntro}</p>
        <ul className="mt-5 space-y-4">
          {plan.features.map((feature) => (
            <li key={feature.text} className="flex items-center gap-3 text-sm font-semibold text-slate-950">
              <feature.icon className="h-4 w-4 text-emerald-800" />
              {feature.text}
            </li>
          ))}
        </ul>
      </div>

      <Link
        href={plan.href}
        className={cn(
          "mt-6 flex h-12 w-full items-center justify-center rounded-xl text-sm font-bold transition-colors",
          popular
            ? "bg-orange-600 text-white shadow-[0_18px_42px_-24px_rgba(249,115,22,0.95)] hover:bg-orange-500"
            : "border border-slate-300 bg-white text-slate-950 hover:border-emerald-700 hover:text-emerald-800",
        )}
      >
        {plan.cta}
      </Link>
      <p className="mt-4 text-center text-sm text-slate-600">{plan.footnote}</p>
    </motion.article>
  );
}

function PricingHero({
  cycle,
  onCycleChange,
}: {
  cycle: BillingCycle;
  onCycleChange: (cycle: BillingCycle) => void;
}) {
  const savings = useMemo(() => {
    const pro = plans[1];
    return pro.monthly * 12 - pro.yearly;
  }, []);

  return (
    <section className="relative overflow-hidden bg-white px-5 pb-16 pt-24 text-slate-950 sm:px-6 lg:pb-24">
      <div className="pointer-events-none absolute -left-24 top-0 hidden h-[440px] w-[420px] opacity-70 lg:block">
        <div className="h-full w-full bg-[linear-gradient(90deg,rgba(15,23,42,0.08)_1px,transparent_1px),linear-gradient(rgba(15,23,42,0.08)_1px,transparent_1px)] bg-[size:34px_34px] [transform:perspective(520px)_rotateY(58deg)_rotateX(8deg)]" />
      </div>
      <div className="pointer-events-none absolute -right-24 top-0 hidden h-[440px] w-[420px] opacity-70 lg:block">
        <div className="h-full w-full bg-[linear-gradient(90deg,rgba(15,23,42,0.08)_1px,transparent_1px),linear-gradient(rgba(15,23,42,0.08)_1px,transparent_1px)] bg-[size:34px_34px] [transform:perspective(520px)_rotateY(-58deg)_rotateX(8deg)]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="text-center">
          <PricingBadge label="Pricing" value="Built for exam success" />
          <h1 className="mx-auto mt-12 max-w-4xl text-balance text-5xl font-medium leading-[1.06] tracking-tight sm:text-6xl lg:text-7xl">
            Choose the study plan that matches your exam goal.
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-base leading-7 text-slate-700">
            Start free, upgrade when you need deeper AI help, full past-question
            access, mock history, and school-ready reporting.
          </p>
        </div>

        <div className="mt-12">
          <BillingToggle cycle={cycle} onChange={onCycleChange} />
          <p className="mt-4 text-center text-sm font-semibold text-emerald-800">
            Yearly Pro saves ₦{savings.toLocaleString("en-NG")} compared with monthly billing.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-6xl gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard key={plan.eyebrow} plan={plan} cycle={cycle} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ComparePlans({ cycle }: { cycle: BillingCycle }) {
  return (
    <section className="bg-white px-5 py-20 text-slate-950 sm:px-6 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <PricingBadge label="Compare" value={`${cycle} view`} />
          <h2 className="mt-12 text-balance text-5xl font-medium leading-[1.06] tracking-tight sm:text-6xl">
            Compare plans at a glance.
          </h2>
          <p className="mx-auto mt-8 max-w-xl text-sm leading-6 text-slate-600">
            Scan the differences quickly, then choose the plan that fits your
            preparation style, learner count, and support needs.
          </p>
        </div>

        <div className="mt-14 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="bg-slate-50">
                {["Features", "Starter", "Pro", "Schools"].map((heading) => (
                  <th key={heading} className="px-6 py-5 font-bold text-slate-950">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row, rowIndex) => (
                <tr key={row[0]} className={rowIndex % 2 ? "bg-slate-50/70" : "bg-white"}>
                  {row.map((cell, index) => (
                    <td
                      key={`${row[0]}-${index}`}
                      className={cn(
                        "border-t border-slate-100 px-6 py-5 align-middle",
                        index === 0 && "font-semibold text-slate-950",
                        index > 0 && "text-slate-800",
                      )}
                    >
                      {typeof cell === "boolean" ? (
                        cell ? (
                          <Check className="h-5 w-5 text-emerald-700" />
                        ) : (
                          <X className="h-5 w-5 text-red-500" />
                        )
                      ) : (
                        cell
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function PricingFaq() {
  const [open, setOpen] = useState(0);

  return (
    <section className="bg-slate-50 px-5 py-20 text-slate-950 sm:px-6 lg:py-24">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <PricingBadge label="Questions" value="Clear answers" />
          <h2 className="mt-12 text-balance text-5xl font-medium leading-[1.06] tracking-tight sm:text-6xl">
            Need help choosing?
          </h2>
          <p className="mx-auto mt-8 max-w-lg text-sm leading-6 text-slate-600">
            Pricing should not slow down study. Here are the practical answers.
          </p>
        </div>

        <div className="mt-14 space-y-3">
          {faqItems.map((item, index) => {
            const active = open === index;

            return (
              <article key={item.q} className="overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_-48px_rgba(15,23,42,0.65)]">
                <button
                  type="button"
                  onClick={() => setOpen(active ? -1 : index)}
                  className="flex w-full items-center justify-between gap-4 p-6 text-left"
                  aria-expanded={active}
                >
                  <span className="text-lg font-bold">{item.q}</span>
                  <motion.span animate={{ rotate: active ? 180 : 0 }}>
                    <ChevronDown className="h-5 w-5" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {active && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <p className="px-6 pb-6 text-sm leading-6 text-slate-700">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </article>
            );
          })}
        </div>

        <div className="mt-14 text-center">
          <Link
            href="/contact"
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-slate-950 px-6 text-sm font-bold text-white hover:bg-emerald-800"
          >
            Talk to us <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function PricingPageSection() {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");

  return (
    <>
      <PricingHero cycle={cycle} onCycleChange={setCycle} />
      <ComparePlans cycle={cycle} />
      <PricingFaq />
    </>
  );
}
