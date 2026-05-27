"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronDown,
  Globe,
  Heart,
  Layers3,
  Plus,
  Sparkles,
  Star,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { faqs } from "../faqs";
import {
  examBodyLogos,
  features,
  feedbackColumns,
  habitBadges,
  landingImages,
  marketplacePoints,
  tutorAvatars,
} from "./data";
import { Reveal } from "./motion";

const prepSteps = [
  {
    step: "Step 1",
    title: "Set Your Exam Goal",
    description: "Choose your exam body, target date, and subjects so prepcify can shape your study plan.",
    cta: "Start Setup",
    href: "/onboarding",
    variant: "plan",
    image: landingImages.examGoal,
  },
  {
    step: "Step 2",
    title: "Practise Past Questions",
    description: "Work through WAEC, JAMB, NECO, and Cambridge-style questions in focused daily sessions.",
    cta: "Practise Now",
    href: "/app/past-questions",
    variant: "practice",
    image: landingImages.pastQuestions,
  },
  {
    step: "Step 3",
    title: "Review With AI",
    description: "See your weak topics, ask the AI tutor for explanations, and retry until the concept sticks.",
    cta: "Review Smarter",
    href: "/app/tutor",
    variant: "review",
  },
] as const;

function StepIllustration({ variant }: { variant: "plan" | "practice" | "review" }) {
  const accent = variant === "plan" ? "#f97316" : variant === "practice" ? "#0f766e" : "#d97706";

  return (
    <svg
      viewBox="0 0 260 150"
      role="img"
      aria-label={`${variant} step illustration`}
      className="mx-auto h-36 w-full max-w-[230px]"
    >
      <rect x="58" y="54" width="104" height="58" rx="8" fill="#0f5f4f" />
      <rect x="66" y="62" width="88" height="42" rx="4" fill="#f8fafc" />
      <circle cx="110" cy="113" r="5" fill="#f8fafc" />
      <path d="M84 123h80" stroke="#0f5f4f" strokeWidth="8" strokeLinecap="round" />
      <circle cx="142" cy="39" r="22" fill="#ffe8c7" />
      <path d="M120 40c6-22 34-27 46-8 5 8 4 17 0 25-12-4-21-12-28-24-4 10-10 15-18 7z" fill="#0b0f14" />
      <path d="M132 58h20l5 26h-30l5-26z" fill="#ffe8c7" />
      <path d="M108 88c8-22 22-33 38-33s29 11 37 33l-13 28h-49l-13-28z" fill="#f7d7a7" />
      <path d="M74 42h44v28H74z" fill="#fff7ed" stroke="#cbd5e1" strokeWidth="2" />
      <path d="M82 51h26M82 59h20" stroke="#0f766e" strokeWidth="3" strokeLinecap="round" />
      {variant === "practice" && (
        <>
          <circle cx="190" cy="57" r="22" fill="#f8fafc" stroke="#94a3b8" strokeWidth="3" />
          <path d="M184 53a8 8 0 1 1 12 7c-4 2-5 4-5 8" stroke="#0f5f4f" strokeWidth="4" strokeLinecap="round" fill="none" />
          <circle cx="191" cy="74" r="2.5" fill="#0f5f4f" />
        </>
      )}
      {variant === "review" && (
        <>
          <rect x="180" y="42" width="48" height="58" rx="6" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" />
          {[54, 66, 78].map((y) => (
            <g key={y}>
              <circle cx="190" cy={y} r="3" fill="#0f766e" />
              <path d={`M198 ${y}h18`} stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
            </g>
          ))}
        </>
      )}
      {variant === "plan" && (
        <>
          <path d="M186 73h34M203 56v34" stroke={accent} strokeWidth="3" strokeLinecap="round" strokeDasharray="1 8" />
          <path d="M40 82h20M50 72v20" stroke={accent} strokeWidth="3" strokeLinecap="round" />
        </>
      )}
      <path d="M32 128c46 14 140 14 196 0" stroke="#e5e7eb" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

function StepVisual({ item }: { item: (typeof prepSteps)[number] }) {
  if ("image" in item) {
    return (
      <div className="relative mx-auto flex h-36 w-full max-w-[230px] items-center justify-center">
        <Image
          src={item.image}
          alt=""
          width={220}
          height={150}
          className="max-h-36 w-auto object-contain"
        />
      </div>
    );
  }

  return <StepIllustration variant={item.variant} />;
}

export function InteractionStrip() {
  return (
    <section className="relative overflow-hidden bg-white py-20 text-slate-950 lg:py-28">
      <div className="container max-w-7xl">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <div className="flex items-center justify-center gap-4 text-sm font-bold text-emerald-800">
              <span className="h-px w-8 bg-emerald-800/40" />
              <span>A Step-by-Step Guide</span>
              <span className="h-px w-8 bg-emerald-800/40" />
            </div>
            <h2 className="mt-4 text-balance font-display text-4xl font-medium leading-[1.06] tracking-tight sm:text-5xl">
              Prepare for your exam in easy steps
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              prepcify turns exam prep into a simple loop: set your goal,
              practise the right questions, and review every weak topic with AI.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid auto-rows-fr gap-5 lg:grid-cols-4">
          {prepSteps.map((item, index) => (
            <Reveal key={item.step} delay={index} className="h-full">
              <article className="flex h-full min-h-[27rem] flex-col items-center rounded-[10px] bg-[#f8f6f2] px-7 py-8 text-center shadow-[0_18px_55px_-48px_rgba(15,23,42,0.65)] ring-1 ring-slate-950/[0.03]">
                <span className="rounded-full bg-slate-100 px-5 py-2 text-xs font-bold uppercase tracking-wide text-slate-600">
                  {item.step}
                </span>
                <div className="mt-5">
                  <StepVisual item={item} />
                </div>
                <h3 className="mt-3 font-display text-xl font-bold text-emerald-900">
                  {item.title}
                </h3>
                <p className="mt-4 min-h-16 text-base leading-7 text-slate-600">
                  {item.description}
                </p>
                <Button
                  asChild
                  variant="outline"
                  className="mt-auto h-11 rounded-lg border-orange-300 bg-white px-6 font-bold text-slate-700 hover:bg-orange-50 hover:text-slate-950"
                >
                  <Link href={item.href}>{item.cta}</Link>
                </Button>
              </article>
            </Reveal>
          ))}

          <Reveal delay={3} className="h-full">
            <aside className="relative flex h-full min-h-[27rem] flex-col items-center justify-center overflow-hidden rounded-[10px] bg-emerald-800 px-8 py-10 text-center text-white">
              <div className="absolute -bottom-28 -right-16 h-64 w-64 rounded-full bg-emerald-700/60" />
              <div className="absolute bottom-0 left-0 h-40 w-full bg-[linear-gradient(35deg,rgba(255,255,255,0.12)_0_1px,transparent_1px_140px)]" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-lg bg-white/10 text-white">
                <Layers3 className="h-8 w-8" />
              </div>
              <h3 className="relative mt-9 font-display text-xl font-bold">
                Start Your Prep Journey
              </h3>
              <p className="relative mt-4 max-w-[15rem] text-base font-medium leading-7 text-white/90">
                Build your study plan, practise past questions, and enter exam
                day with a clearer strategy.
              </p>
              <Button asChild className="relative mt-8 h-11 rounded-lg bg-orange-600 px-6 font-bold text-white hover:bg-orange-500">
                <Link href="/onboarding">
                  Get Started Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </aside>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function WorkflowSection() {
  const marqueeRows = [
    examBodyLogos.slice(0, 6),
    examBodyLogos.slice(4, 10),
    examBodyLogos.slice(8, 14),
    examBodyLogos.slice(10, 16),
  ];

  return (
    <section className="relative overflow-hidden bg-white py-16 text-slate-950 lg:py-24">
      <div className="container grid max-w-7xl items-center gap-10 lg:grid-cols-[1.24fr_0.96fr] xl:grid-cols-[1.3fr_0.95fr]">
        <Reveal>
          <div className="max-w-2xl">
            <p className="inline-flex rounded-lg bg-orange-100 px-4 py-2 text-sm font-bold text-orange-800">
              Exam Bodies Made Easy
            </p>
            <h2 className="mt-7 max-w-2xl text-balance font-display text-4xl font-medium leading-[1.06] tracking-tight sm:text-5xl">
              Prepare for <span className="text-orange-500">16+ exam bodies</span>{" "}
              from one focused workspace
            </h2>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600">
              Choose your exam goal once and prepcify adapts your study plan,
              past questions, mock exams, and AI explanations around the body you
              are preparing for.
            </p>
          </div>
        </Reveal>

        <Reveal delay={1}>
          <div className="relative -mx-4 overflow-hidden py-1 sm:mx-0 lg:max-w-[620px] xl:max-w-[660px]">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-white via-white/95 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-white via-white/95 to-transparent" />
            <div className="space-y-3">
              {marqueeRows.map((row, rowIndex) => (
                <div key={rowIndex} className="overflow-hidden">
                  <div
                    className={cn(
                      "flex w-max gap-3 will-change-transform",
                      rowIndex % 2 === 0
                        ? "animate-[marquee_26s_linear_infinite]"
                        : "animate-[marquee_26s_linear_infinite_reverse]",
                    )}
                  >
                    {[...row, ...row, ...row].map((exam, index) => (
                      <div
                        key={`${rowIndex}-${exam.label}-${index}`}
                        className="flex h-14 w-[150px] shrink-0 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.7)]"
                      >
                        <Image
                          src={exam.src}
                          alt=""
                          width={34}
                          height={24}
                          className="h-7 w-10 shrink-0 object-contain"
                        />
                        <span className="truncate text-sm font-bold text-slate-700">
                          {exam.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function ExamMarquee() {
  return <WorkflowSection />;
}

export function MarketplaceSection() {
  return (
    <section className="relative overflow-hidden bg-emerald-950 py-20 text-white lg:py-28">
      <div className="absolute -left-48 -top-40 h-96 w-96 rounded-full bg-white/5 lg:h-[34rem] lg:w-[34rem]" />

      <div className="container relative z-10 max-w-7xl">
        <div className="max-w-xl lg:w-1/2">
          <Reveal>
            <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-xl bg-white/10 text-amber-400">
              <CalendarDays className="h-8 w-8" />
            </div>
            <div className="flex items-center gap-3 text-sm font-bold">
              <span className="h-px w-6 bg-white/30" />
              <span>Why Choose Us</span>
              <span className="h-px w-6 bg-white/30" />
            </div>
            <h2 className="mt-4 text-balance font-display text-4xl font-medium leading-[1.06] tracking-tight sm:text-5xl">
              Why Our Prep System
              <br />
              Stands Out
            </h2>
            <p className="mt-7 text-base font-medium leading-8 text-white/90 sm:text-lg">
              A focused exam-prep workflow that helps students practise, review,
              and repeat the right work before exam day.
            </p>
            <ul className="mt-8 space-y-3">
              {marketplacePoints.map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm font-bold leading-6 sm:text-base">
                  <Sparkles className="mt-1 h-4 w-4 shrink-0 fill-white text-white" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            <Button asChild className="mt-8 h-12 rounded-lg bg-orange-600 px-6 font-bold text-white shadow-lg hover:bg-orange-500">
              <Link href="/signup">Get Started Now</Link>
            </Button>
          </Reveal>
        </div>
      </div>

      <Reveal delay={1} className="relative z-10 mt-12 lg:absolute lg:right-0 lg:top-40 lg:mt-0 lg:w-1/2">
        <div className="relative ml-auto max-w-3xl px-6 lg:max-w-none lg:px-0">
          <motion.div
            className="relative overflow-hidden rounded-l-3xl border-y-8 border-l-8 border-slate-950 bg-slate-950 shadow-2xl lg:rounded-r-none"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          >
            <Image
              src={landingImages.students}
              alt="Students studying with prepcify"
              width={980}
              height={990}
              sizes="(min-width: 1024px) 52vw, 100vw"
              className="h-[22rem] w-full object-cover sm:h-[28rem] lg:h-[36rem]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/10 to-transparent" />
          </motion.div>

          <motion.div
            className="absolute left-4 top-14 hidden rounded-2xl bg-white/20 p-3 text-white shadow-xl backdrop-blur-md sm:block lg:-left-8"
            animate={{ y: [0, 9, 0], rotate: [-1, 1, -1] }}
            transition={{ duration: 5.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <p className="px-1 text-xs font-bold">43k+ Students onboard</p>
            <div className="mt-2 flex items-center">
              {tutorAvatars.map((avatar, index) => (
                <span
                  key={avatar}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-orange-100 text-xs font-bold text-slate-900"
                  style={{ marginLeft: index === 0 ? 0 : -8 }}
                >
                  {avatar}
                </span>
              ))}
              <span className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-orange-600 text-white">
                <Plus className="h-4 w-4" />
              </span>
            </div>
          </motion.div>

          <motion.div
            className="absolute bottom-12 left-6 hidden items-center gap-3 rounded-2xl bg-white px-3 py-2 text-emerald-800 shadow-xl sm:flex lg:-left-6"
            animate={{ x: [0, -8, 0], rotate: [-4, -1, -4] }}
            transition={{ duration: 5.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <Heart className="h-5 w-5 fill-lime-500 text-lime-500" />
            <span className="font-bold">Daily streak active</span>
          </motion.div>
        </div>
      </Reveal>
    </section>
  );
}



export function FeaturesSection() {
  return (
    <section id="features" className="relative overflow-hidden bg-gradient-to-b from-[#101521] via-[#111827] to-[#101521] py-24 md:py-32">
      <div className="container relative max-w-7xl">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-300">
              What makes prepcify different
            </p>
            <h2 className="mt-4 text-balance font-display text-5xl font-medium leading-[1.06] tracking-tight md:text-6xl">
              One root. <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent italic">Four branches of progress.</span>
            </h2>
            <p className="mt-5 text-lg text-slate-50/60">
              Everything in prepcify grows from one idea: calm, daily practice.
            </p>
          </div>
        </Reveal>

        <div className="relative mt-16 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Reveal key={feature.n} delay={index + 1}>
              <motion.article
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl"
              >
                <div className={cn("absolute -right-32 -top-32 h-64 w-64 rounded-full bg-gradient-to-br opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-50", feature.color)} />
                <div className="flex items-start justify-between">
                  <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-slate-50 shadow-lg", feature.color)}>
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <span className="font-display text-2xl font-bold text-slate-50/20">{feature.n}</span>
                </div>
                <h3 className="mt-5 font-display text-xl font-bold leading-tight md:text-2xl">{feature.title}</h3>
                <p className="mt-2 text-sm text-slate-50/60">{feature.body}</p>
                <div className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-50/80 group-hover:text-slate-50">
                  Learn more <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>
              </motion.article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HabitSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#f8fafc] via-[#edf1f7] to-[#dbe3ee] py-24 text-[#101521] md:py-32">
      <div className="container grid max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#101521]/60">A daily study habit</p>
            <h2 className="mt-4 text-balance font-display text-5xl font-medium leading-[1.06] tracking-tight md:text-6xl">
              One quiet ritual.
              <br />
              <span className="font-semibold italic">Months</span> of compounding.
            </h2>
            <p className="mt-6 max-w-md text-lg text-[#101521]/70">
              Open the app. Get your cards for the day. Review what you missed.
              Repeat until exam day feels familiar.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {habitBadges.map((badge) => (
                <div key={badge.label} className="flex items-center gap-2 rounded-full bg-[#101521] px-4 py-2 text-sm font-medium text-slate-50">
                  <badge.icon className="h-4 w-4 text-slate-300" /> {badge.label}
                </div>
              ))}
            </div>
          </div>
        </Reveal>
        <Reveal delay={1}>
          <Image
            src={landingImages.notebook}
            alt="Student writing study notes in a notebook"
            width={720}
            height={900}
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="aspect-[4/5] w-full rounded-[32px] object-cover shadow-pop"
          />
        </Reveal>
      </div>
    </section>
  );
}

export function StatsSection() {
  const impactStats = [
    { value: "40+", label: "Supported exam categories" },
    { value: "1,200+", label: "Practice sets launched with prepcify" },
    { value: "99.9+", label: "Reliable study access across devices" },
    { value: "∞", label: "Flexible learning across every exam path" },
  ];

  return (
    <section className="relative overflow-hidden bg-black text-white">
      <div className="mx-auto grid min-h-[500px] max-w-[1424px] px-6 py-16 sm:px-8 lg:grid-cols-[520px_1fr] lg:gap-[46px] lg:px-0 lg:py-0">
        <Reveal className="flex items-center">
          <div className="max-w-[520px] lg:pl-0">
            <h2 className="text-balance text-[44px] font-normal leading-[1.12] tracking-[-0.045em] text-white [font-family:Georgia,serif] sm:text-[58px]">
              Trusted by students.
              <br />
              built for results.
            </h2>
            <p className="mt-8 max-w-[360px] text-[16px] leading-[1.5] text-white/60">
              Real numbers. Real progress. See how prepcify helps learners prepare faster and stay consistent.
            </p>
            <Button
              asChild
              className="mt-10 h-12 rounded-full bg-gradient-to-r from-[#8b6dff] to-[#f7f2ff] px-7 text-[14px] font-bold uppercase text-black hover:from-[#9d86ff] hover:to-white"
            >
              <Link href="/signup">Start preparing</Link>
            </Button>
          </div>
        </Reveal>

        <div className="relative grid overflow-hidden sm:grid-cols-2 lg:my-10">
          <div className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-px bg-gradient-to-b from-transparent via-[#a987ff]/40 to-transparent sm:block" />
          <div className="pointer-events-none absolute left-0 top-1/2 hidden h-px w-full bg-gradient-to-r from-transparent via-[#a987ff]/35 to-transparent sm:block" />
          {impactStats.map((stat, index) => (
            <Reveal key={stat.label} delay={index} className="h-full">
              <div className="relative flex min-h-[210px] flex-col items-center justify-center px-6 py-10 text-center sm:min-h-[220px]">
                <p className="text-[58px] font-normal leading-none tracking-[-0.055em] text-[#b992ff] [font-family:Georgia,serif] sm:text-[72px]">
                  {stat.value}
                </p>
                <p className="mt-5 max-w-[290px] text-[16px] font-bold leading-5 text-white/[0.82]">
                  {stat.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TrustedStudentsStrip() {
  const avatars = [
    "/assets/auth-detail-1.jpg",
    "/assets/onboard-1.jpg",
    "/assets/onboard-2.jpg",
    "/assets/auth-student-1.jpg",
    "/assets/onboard-3.jpg",
  ];

  return (
    <section className="bg-white px-5 pb-12 text-slate-950">
      <Reveal>
        <motion.div
          className="mx-auto flex w-fit max-w-full flex-col items-center gap-3 rounded-full bg-slate-100/90 px-5 py-3 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.55)] ring-1 ring-slate-950/5 sm:flex-row"
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
        >
          <div className="flex">
            {avatars.map((avatar, index) => (
              <Image
                key={avatar}
                src={avatar}
                alt=""
                width={42}
                height={42}
                className="h-10 w-10 rounded-full border-2 border-slate-100 object-cover"
                style={{ marginLeft: index === 0 ? 0 : -10 }}
              />
            ))}
          </div>
          <div className="text-center sm:text-left">
            <div className="flex justify-center gap-0.5 text-orange-400 sm:justify-start">
              {[...Array(5)].map((_, index) => (
                <Star key={index} className="h-4 w-4 fill-orange-400 text-orange-400" />
              ))}
            </div>
            <p className="mt-1 text-sm font-bold text-slate-950">
              Trusted by 2,500+ successful students
            </p>
          </div>
        </motion.div>
      </Reveal>
    </section>
  );
}

function FeedbackMark({ mark, className }: { mark: string; className: string }) {
  return (
    <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-bold", className)}>
      {mark || <span className="h-5 w-5 rounded-full border-2 border-white/90 border-l-transparent" />}
    </span>
  );
}

export function FeedbackSection() {
  return (
    <section className="relative bg-white py-20 text-slate-950 lg:py-28">
      <div className="container max-w-7xl">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <div className="flex items-center justify-center gap-3 text-sm font-bold text-emerald-800">
              <span className="h-px w-7 bg-emerald-800/40" />
              <span>Real Feedback from Our Users</span>
              <span className="h-px w-7 bg-emerald-800/40" />
            </div>
            <h2 className="mt-4 text-balance font-display text-4xl font-medium leading-[1.06] tracking-tight sm:text-5xl">
              What Students Are Saying
            </h2>
            <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-600">
              Students, parents, and schools use prepcify to make exam preparation clearer and easier to repeat.
            </p>
          </div>
        </Reveal>

        <div className="mx-auto mt-14 grid max-w-6xl gap-8 md:grid-cols-3">
          {feedbackColumns.map((column, columnIndex) => (
            <div key={columnIndex} className="space-y-8">
              {column.map((item, itemIndex) => (
                <Reveal key={item.name} delay={columnIndex + itemIndex}>
                  <figure className="rounded-2xl bg-[#faf8f5] p-6 shadow-[0_18px_50px_-42px_rgba(15,23,42,0.55)]">
                    <blockquote className="text-base leading-7 text-slate-700">
                      {item.quote}
                    </blockquote>
                    <div className="mt-4 flex gap-1">
                      {[...Array(5)].map((_, index) => (
                        <Star
                          key={index}
                          className={cn(
                            "h-4 w-4",
                            index < item.rating ? "fill-orange-400 text-orange-400" : "fill-orange-200 text-orange-200",
                          )}
                        />
                      ))}
                    </div>
                    <figcaption className="mt-6 flex items-center justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <Image
                          src={item.avatar}
                          alt=""
                          width={48}
                          height={48}
                          className="h-12 w-12 rounded-md object-cover"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-950">{item.name}</p>
                          <p className="text-sm text-slate-600">{item.role}</p>
                        </div>
                      </div>
                      <FeedbackMark mark={item.mark} className={item.markClass} />
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const landingPricingCards = [
  {
    name: "Starter Access",
    subtitle: "Ideal for beginners building a study habit",
    price: "₦0",
    note: "Perfect for students who need structure, selected practice, and a clean way to begin.",
    features: ["Free forever", "Daily study plan", "Selected past questions"],
    iconClass: "bg-emerald-600",
  },
  {
    name: "Pro Plus",
    subtitle: "Advanced tools for serious candidates",
    price: "₦2,500",
    note: "Unlimited AI explanations, full question archive, and mock history for focused exam prep.",
    features: ["Unlimited AI tutor", "Full past-question archive", "Timed mock exam reviews"],
    iconClass: "bg-rose-500",
    popular: true,
  },
  {
    name: "Elite Mastery",
    subtitle: "For schools, tutors, and cohort support",
    price: "Custom",
    oldPrice: "Term",
    note: "Class reporting, admin tools, assignments, and onboarding for learning teams.",
    features: ["Teacher dashboards", "Class progress reports", "Dedicated onboarding"],
    iconClass: "bg-slate-800",
    discount: "School",
  },
] as const;

export function PricingSection() {
  return (
    <section id="pricing" className="relative overflow-hidden bg-[#edf5f8] py-20 text-[#122040] lg:py-28">
      <div className="container grid max-w-9xl items-center gap-8 lg:grid-cols-[0.78fr_2.2fr]">
        <Reveal className="relative h-full">
          <div className="flex h-full min-h-[32rem] flex-col justify-center py-4">
            <h2 className="text-balance font-display text-4xl font-medium leading-[1.06] tracking-tight sm:text-5xl">
              Subscription Plans
              <br />
              For You
            </h2>
            <p className="mt-6 max-w-xs text-base leading-7 text-slate-500">
              Unlock unlimited exam practice, AI explanations, progress insight,
              and school-ready support. Choose the plan that fits your prep.
            </p>
            <ul className="mt-7 space-y-3 text-sm font-semibold text-slate-500">
              {["Unlimited course access", "Flexible payment options", "Regular content updates"].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" />
                  {item}
                </li>
              ))}
            </ul>
            <Button asChild className="mt-8 h-14 w-fit rounded-2xl bg-emerald-700 px-8 font-bold text-white shadow-[0_18px_45px_-22px_rgba(4,120,87,0.9)] hover:bg-emerald-600">
              <Link href="/signup">
                <Sparkles className="h-4 w-4" />
                Become VIP Member
              </Link>
            </Button>
            <Image
              src={landingImages.cash}
              alt=""
              width={150}
              height={150}
              className="mt-10 hidden h-28 w-28 rotate-[-28deg] object-contain drop-shadow-2xl sm:block"
            />
          </div>
        </Reveal>

        <div className="grid auto-rows-fr gap-5 md:grid-cols-3">
          {landingPricingCards.map((plan, index) => (
            <Reveal key={plan.name} delay={index} className="h-full">
              <article className="relative flex h-full min-h-[32rem] flex-col overflow-hidden rounded-[26px] bg-white p-5 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.55)]">
                {"popular" in plan && plan.popular && (
                  <span className="absolute right-5 top-5 rounded-full bg-emerald-700 px-4 py-2 text-xs font-bold text-white">
                    Popular
                  </span>
                )}
                <div className="mx-auto mt-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50">
                  <div className={cn("flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_16px_36px_-20px_rgba(15,23,42,0.65)]", plan.iconClass)}>
                    <Sparkles className="h-6 w-6 fill-white" />
                  </div>
                </div>

                <h3 className="mt-8 font-display text-xl font-bold">{plan.name}</h3>
                <p className="mt-2 min-h-10 text-sm font-medium leading-5 text-slate-400">
                  {plan.subtitle}
                </p>
                <div className="mt-6 flex items-end gap-3">
                  <span className="font-display text-5xl font-bold tracking-tight">{plan.price}</span>
                  {"oldPrice" in plan && plan.oldPrice && (
                    <span className="pb-2 text-sm font-semibold text-slate-400 line-through">
                      {plan.oldPrice}
                    </span>
                  )}
                  {"discount" in plan && plan.discount && (
                    <span className="mb-2 ml-auto rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
                      {plan.discount}
                    </span>
                  )}
                </div>

                <div className="mt-7 rounded-2xl bg-slate-50 px-4 py-4 text-sm leading-5 text-slate-400">
                  {plan.note}
                </div>

                <ul className="mt-6 flex-1 space-y-3 text-sm font-semibold text-slate-500">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-500" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button asChild className="mt-7 h-12 rounded-lg bg-emerald-700 font-semibold text-white hover:bg-emerald-600">
                  <Link href={plan.name === "Elite Mastery" ? "/contact" : "/signup"}>
                    Purchase
                  </Link>
                </Button>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FaqSection({ openFaq, setOpenFaq }: { openFaq: number | null; setOpenFaq: (index: number | null) => void }) {
  return (
    <section id="faq" className="relative bg-[#101521] py-24 md:py-32">
      <div className="container max-w-4xl">
        <Reveal>
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-300">Frequently asked</p>
            <h2 className="mt-4 text-balance font-display text-5xl font-medium leading-[1.06] tracking-tight md:text-6xl">Questions, answered.</h2>
          </div>
        </Reveal>
        <ul className="mt-14 space-y-3">
          {faqs.map((faq, index) => {
            const open = openFaq === index;

            return (
              <li key={faq.q} className={cn("overflow-hidden rounded-2xl border transition-colors", open ? "border-white/40 bg-white/[0.04]" : "border-white/10 bg-white/[0.02]")}>
                <button
                  type="button"
                  onClick={() => setOpenFaq(open ? null : index)}
                  className="flex w-full items-center justify-between gap-4 p-6 text-left"
                  aria-expanded={open}
                >
                  <span className="font-display text-lg font-bold md:text-xl">{faq.q}</span>
                  <motion.div animate={{ rotate: open ? 180 : 0 }}>
                    <ChevronDown className="h-5 w-5 shrink-0" />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="px-6 pb-6 text-slate-50/70">{faq.a}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export function CtaSection() {
  return (
    <section className="relative bg-[#101521] py-20">
      <div className="container max-w-7xl">
        <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-slate-950 via-slate-800 to-primary p-10 text-center md:p-16">
          <div className="relative">
            <Globe className="mx-auto mb-6 h-10 w-10 text-slate-50/80" />
            <h2 className="mx-auto max-w-3xl text-balance font-display text-5xl font-medium leading-[1.06] tracking-tight text-slate-50 md:text-6xl">
              Your best result is one daily habit away.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base text-slate-50/85 md:text-lg">
              Join 42,000+ students preparing the smart way. Free forever to start.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="xl" className="border-0 bg-[#101521] text-slate-50 hover:bg-[#111827]">
                <Link href="/onboarding">Start learning free <ArrowRight /></Link>
              </Button>
              <Button asChild size="xl" variant="outline" className="border-white/40 bg-white/10 text-slate-50 backdrop-blur hover:bg-white/20">
                <Link href="/app">Open the app</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
