"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, ChevronDown, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { MarketingPill, PerspectiveGrid } from "../shared/perspective-grid";

const categories = [
  { id: "all", label: "View All", icon: "", count: 29 },
  { id: "plans", label: "Plans & Pricing", icon: "", count: 6 },
  { id: "security", label: "Security & Data", icon: "", count: 5 },
  { id: "using", label: "Using prepcify", icon: "", count: 6 },
  { id: "accounts", label: "Accounts & Teams", icon: "🤝", count: 6 },
  { id: "billing", label: "Billing & Payment", icon: "💳", count: 6 },
] as const;

type CategoryId = (typeof categories)[number]["id"];

const faqItems: Array<{
  question: string;
  answer: string;
  category: Exclude<CategoryId, "all">;
}> = [
  {
    question: "What kind of support is included?",
    answer:
      "Free learners get self-serve Help Center resources. Pro learners get priority email support for billing, AI tutor, and mock-exam issues. School plans include onboarding support for admins, teachers, and learner cohorts.",
    category: "plans",
  },
  {
    question: "Can I switch plans later?",
    answer:
      "Yes. You can move between Free, Pro, and School plans as your preparation needs change. Upgrades take effect immediately, while downgrades apply at the end of the active billing cycle.",
    category: "plans",
  },
  {
    question: "Do you offer discounts for schools or tutorial centers?",
    answer:
      "Yes. Schools, tutorial centers, and learning communities can request volume pricing for cohorts, admin dashboards, reporting, and onboarding support.",
    category: "plans",
  },
  {
    question: "What's included in the free plan?",
    answer:
      "The free plan includes access to selected study tools, basic exam-body setup, limited practice questions, and enough onboarding to understand how prepcify supports your study rhythm.",
    category: "plans",
  },
  {
    question: "Can I get a refund if I cancel early?",
    answer:
      "Refunds depend on the billing period, usage, and plan type. If there is a billing issue, contact support and we will review the account history fairly.",
    category: "billing",
  },
  {
    question: "Is there an API available?",
    answer:
      "API access is planned for verified school and partner accounts that need secure integrations with existing learning systems, reporting tools, or student portals.",
    category: "using",
  },
  {
    question: "What security measures should schools look for before using an exam-prep platform?",
    answer:
      "Look for role-based access, secure authentication, encrypted transport, careful data retention, auditability, and clear administrator controls for learners and teachers.",
    category: "security",
  },
  {
    question: "How can I ensure my school's learner data remains private on prepcify?",
    answer:
      "Use strong admin roles, invite only verified staff, avoid shared accounts, and keep learner access scoped to the right classes, subjects, and exam programs.",
    category: "security",
  },
  {
    question: "What are the most common data security risks in online exam platforms?",
    answer:
      "The most common risks are weak passwords, excessive admin access, exported reports stored insecurely, shared devices, and integrations that do not follow least-privilege access.",
    category: "security",
  },
  {
    question: "How should we handle compliance requirements when moving exam prep online?",
    answer:
      "Start by documenting who can access learner records, how long records are kept, how support requests are handled, and how your school approves digital tools.",
    category: "security",
  },
  {
    question: "What should our disaster recovery plan include for student learning data?",
    answer:
      "Include account recovery, export procedures, admin handover, backup access to key reports, and a communication process for teachers and learners if service access is interrupted.",
    category: "security",
  },
  {
    question: "How do I invite teammates or teachers?",
    answer:
      "School admins can invite teachers and team members from their workspace, assign roles, and limit access to the classes or subjects each person manages.",
    category: "accounts",
  },
  {
    question: "Can parents or guardians track progress?",
    answer:
      "Progress visibility depends on the account type. School and family workflows can provide summaries without exposing unnecessary private learner data.",
    category: "accounts",
  },
  {
    question: "How do I start preparing for a new exam body?",
    answer:
      "Choose your exam body, subjects, and target date. prepcify then adapts your study plan, past questions, mock exams, and AI explanations around that goal.",
    category: "using",
  },
  {
    question: "Can I use prepcify on mobile?",
    answer:
      "Yes. The core study workflow is responsive, so learners can review study plans, practice questions, and track progress on mobile, tablet, and desktop.",
    category: "using",
  },
  {
    question: "When will my payment reflect?",
    answer:
      "Successful payments usually update immediately. If your plan does not update after payment, contact support with the account email and payment reference.",
    category: "billing",
  },
] as const;

export function FaqPageSection() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>("all");
  const [openQuestion, setOpenQuestion] = useState(faqItems[0]?.question ?? "");
  const [visibleCount, setVisibleCount] = useState(10);

  const filteredFaqs = useMemo(() => {
    if (activeCategory === "all") {
      return faqItems;
    }

    return faqItems.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  const visibleFaqs = filteredFaqs.slice(0, visibleCount);
  const featuredFaq = filteredFaqs.find((item) => item.question === openQuestion) ?? filteredFaqs[0];

  function selectCategory(category: CategoryId) {
    const nextFaq = category === "all"
      ? faqItems[0]
      : faqItems.find((item) => item.category === category);

    setActiveCategory(category);
    setVisibleCount(10);
    setOpenQuestion(nextFaq?.question ?? "");
  }

  return (
    <section className="relative overflow-hidden bg-white text-slate-950">
      <PerspectiveGrid />

      <div className="relative mx-auto max-w-[1474px] px-5 pb-24 pt-24 sm:px-6 lg:pt-28">
        <div className="text-center">
          <MarketingPill label="FAQs" text="Answers, simplified." />
          <h1 className="mx-auto mt-16 max-w-4xl text-balance text-5xl font-medium leading-[1.06] tracking-tight sm:text-6xl lg:text-7xl">
            Got Questions?
            <br />
            We&apos;ve Got Answers.
          </h1>
          <p className="mx-auto mt-9 max-w-2xl text-base leading-6 text-slate-700">
            Whether you&apos;re just getting started or already preparing seriously,
            our FAQ section covers everything you need, from plans to exam
            features, to make your experience smoother.
          </p>
        </div>

        <div
          className="mx-auto mt-24 flex max-w-5xl flex-wrap justify-center gap-2.5"
          role="tablist"
          aria-label="FAQ categories"
        >
          {categories.map((category) => {
            const active = activeCategory === category.id;

            return (
              <button
                key={category.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => selectCategory(category.id)}
                className={cn(
                  "h-10 rounded-full px-5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
                  active
                    ? "bg-slate-950 font-bold text-white"
                    : "border border-slate-300 bg-white font-semibold text-slate-950 hover:border-emerald-500 hover:text-emerald-700",
                )}
              >
                {category.icon && <span className="mr-1.5" aria-hidden>{category.icon}</span>}
                {category.label} ({category.count})
              </button>
            );
          })}
        </div>

        <div className="mx-auto mt-24 max-w-[1180px] rounded-[1.35rem] bg-slate-50 px-5 py-16 sm:px-12 lg:px-20">
          <article className="mx-auto max-w-4xl rounded-2xl bg-white p-7 shadow-[0_24px_60px_-44px_rgba(15,23,42,0.55)] sm:p-8">
            <h2 className="text-xl font-bold">{featuredFaq.question}</h2>
            <p className="mt-5 text-base text-slate-700">
              {featuredFaq.answer}
            </p>
            <p className="mt-5 text-sm text-slate-700">📌 Need more details?</p>
            <Link href="/contact" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">
              View our full support options in the Help Center <ArrowRight className="h-4 w-4" />
            </Link>
          </article>

          <div className="mx-auto mt-14 max-w-4xl divide-y divide-slate-200/80" role="tabpanel">
            {visibleFaqs.map((item) => {
              const open = openQuestion === item.question;

              return (
                <div key={item.question}>
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setOpenQuestion(open ? "" : item.question)}
                    className="flex w-full items-center justify-between gap-5 py-8 text-left text-base font-bold text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                  >
                    <span>{item.question}</span>
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 shrink-0 text-slate-500 transition-transform",
                        open && "rotate-180 text-emerald-700",
                      )}
                    />
                  </button>
                  <div
                    className={cn(
                      "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
                      open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                    )}
                  >
                    <div className="overflow-hidden">
                      <p className="pb-8 pr-10 text-base leading-7 text-slate-700">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {visibleCount < filteredFaqs.length && (
            <div className="mt-12 text-center">
            <button
              type="button"
              onClick={() => setVisibleCount((count) => count + 5)}
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-slate-950 px-6 text-sm font-bold text-white transition-colors hover:bg-emerald-800"
            >
              Load More <RotateCw className="h-4 w-4" />
            </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
