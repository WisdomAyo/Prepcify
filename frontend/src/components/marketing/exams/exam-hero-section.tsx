"use client";

import type { CSSProperties, PointerEvent } from "react";
import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Brain, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const floatingExams = [
  {
    label: "WAEC",
    caption: "Past questions",
    headline: "Master WAEC with topic-by-topic revision",
    body: "Practise real-style questions, track weak areas, and build confidence across core subjects before exam week.",
    image: "/assets/auth-student-1.jpg",
    href: "/app/past-questions/waec",
    className: "left-[7%] top-[16%]",
    motion: { x: [0, 12, 0], y: [0, -10, 0] },
  },
  {
    label: "JAMB",
    caption: "Mock mode",
    headline: "Train for JAMB speed and accuracy",
    body: "Use timed practice, instant review, and AI explanations to improve your score before the next mock.",
    image: "/assets/onboard-1.jpg",
    href: "/app/past-questions/jamb",
    className: "left-[16%] top-[48%]",
    motion: { x: [0, -10, 0], y: [0, 12, 0] },
  },
  {
    label: "NECO",
    caption: "Topic review",
    headline: "Close your NECO knowledge gaps",
    body: "See the topics costing you marks, review the explanation, then retry similar questions until they stick.",
    image: "/assets/onboard-2.jpg",
    href: "/app/past-questions/neco",
    className: "left-[31%] bottom-[13%]",
    motion: { x: [0, 10, 0], y: [0, -8, 0] },
  },
  {
    label: "ICAN",
    caption: "Study plan",
    headline: "Keep professional exam prep structured",
    body: "Break bigger study goals into daily actions with progress tracking and focused revision prompts.",
    image: "/assets/auth-detail-1.jpg",
    href: "/onboarding",
    className: "right-[31%] bottom-[16%]",
    motion: { x: [0, -12, 0], y: [0, 9, 0] },
  },
  {
    label: "Cambridge",
    caption: "AI tutor",
    headline: "Prepare for Cambridge with deeper explanations",
    body: "Ask follow-up questions, review reasoning steps, and practise until difficult concepts become familiar.",
    image: "/assets/onboard-3.jpg",
    href: "/app/tutor",
    className: "right-[15%] top-[33%]",
    motion: { x: [0, 9, 0], y: [0, -12, 0] },
  },
  {
    label: "IELTS",
    caption: "Practice flow",
    headline: "Build consistent IELTS practice habits",
    body: "Plan practice sessions, review feedback, and keep your preparation moving with a clear next step.",
    image: "/assets/landing-hero.jpg",
    href: "/onboarding",
    className: "right-[7%] bottom-[20%]",
    motion: { x: [0, -9, 0], y: [0, 11, 0] },
  },
] as const;

type FloatingExam = (typeof floatingExams)[number];

const examActions = [
  { label: "Past questions", icon: BookOpen, href: "/app/past-questions" },
  { label: "Mock exams", icon: ClipboardCheck, href: "/app/exam/setup" },
  { label: "AI tutor", icon: Brain, href: "/app/tutor" },
] as const;

function FloatingExamCard({
  exam,
  index,
  activeExam,
  onSelect,
}: {
  exam: FloatingExam;
  index: number;
  activeExam: FloatingExam;
  onSelect: (exam: FloatingExam) => void;
}) {
  return (
    <div
      className={cn("absolute hidden sm:block", exam.className)}
      style={
        {
          "--float-x": `${exam.motion.x[1]}px`,
          "--float-y": `${exam.motion.y[1]}px`,
          animationDelay: `${index * -0.45}s`,
          animationDuration: `${5 + index * 0.35}s`,
          transform: "perspective(900px) rotateX(var(--card-rotate-x)) rotateY(var(--card-rotate-y))",
        } as CSSProperties
      }
    >
      <button
        type="button"
        onClick={() => onSelect(exam)}
        onMouseEnter={() => onSelect(exam)}
        aria-pressed={activeExam.label === exam.label}
        className={cn(
          "group flex items-center gap-3 rounded-full border p-2 pr-4 text-left shadow-[0_22px_60px_-36px_rgba(0,0,0,0.85)] backdrop-blur-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80",
          activeExam.label === exam.label
            ? "border-orange-300 bg-white/25"
            : "border-white/25 bg-white/12 hover:bg-white/20",
          "animate-[exam-card-float_var(--float-duration,6s)_ease-in-out_infinite] transition-transform duration-200 hover:-translate-y-1 hover:scale-[1.08]",
        )}
        style={{ "--float-duration": `${5 + index * 0.35}s` } as CSSProperties}
      >
        <Image
          src={exam.image}
          alt=""
          width={64}
          height={64}
          className="h-14 w-14 rounded-full border border-white/40 object-cover"
        />
        <span className="hidden text-left lg:block">
          <span className="block text-sm font-bold text-white">{exam.label}</span>
          <span className="block text-xs font-semibold text-white/70">{exam.caption}</span>
        </span>
      </button>
    </div>
  );
}

export function ExamHeroSection() {
  const [activeExam, setActiveExam] = useState<FloatingExam>(floatingExams[0]);
  const sectionRef = useRef<HTMLElement | null>(null);

  function updatePointer(event: PointerEvent<HTMLElement>) {
    const section = sectionRef.current;
    if (!section) return;

    const rect = section.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    section.style.setProperty("--tilt-x", x.toFixed(3));
    section.style.setProperty("--tilt-y", y.toFixed(3));
    section.style.setProperty("--hero-rotate-x", `${(-y * 14).toFixed(2)}deg`);
    section.style.setProperty("--hero-rotate-y", `${(x * 18).toFixed(2)}deg`);
    section.style.setProperty("--card-rotate-x", `${(-y * 8).toFixed(2)}deg`);
    section.style.setProperty("--card-rotate-y", `${(x * 10).toFixed(2)}deg`);
    section.style.setProperty("--glow-x", `${18 + (x + 0.5) * 64}%`);
    section.style.setProperty("--glow-y", `${18 + (y + 0.5) * 64}%`);
  }

  function resetPointer() {
    const section = sectionRef.current;
    if (!section) return;

    section.style.setProperty("--tilt-x", "0");
    section.style.setProperty("--tilt-y", "0");
    section.style.setProperty("--hero-rotate-x", "0deg");
    section.style.setProperty("--hero-rotate-y", "0deg");
    section.style.setProperty("--card-rotate-x", "0deg");
    section.style.setProperty("--card-rotate-y", "0deg");
    section.style.setProperty("--glow-x", "50%");
    section.style.setProperty("--glow-y", "50%");
  }

  return (
    <section
      ref={sectionRef}
      className="relative isolate overflow-hidden bg-emerald-950 px-5 py-24 text-white sm:px-6 lg:py-32"
      onPointerMove={updatePointer}
      onPointerLeave={resetPointer}
      style={
        {
          "--tilt-x": "0",
          "--tilt-y": "0",
          "--hero-rotate-x": "0deg",
          "--hero-rotate-y": "0deg",
          "--card-rotate-x": "0deg",
          "--card-rotate-y": "0deg",
          "--glow-x": "50%",
          "--glow-y": "50%",
        } as CSSProperties
      }
    >
      <div
        className="pointer-events-none absolute left-[var(--glow-x)] top-[var(--glow-y)] h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime-300/20 blur-[120px] transition-[left,top] duration-200"
      />
      <div className="pointer-events-none absolute inset-0 opacity-25">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.14)_0_1px,transparent_1px_48px)]" />
        <svg className="absolute inset-x-0 bottom-0 h-full w-full" viewBox="0 0 1200 520" aria-hidden="true">
          <path d="M0 390 C190 310 310 450 500 360 C690 270 770 90 980 170 C1090 212 1145 290 1200 260" fill="none" stroke="white" strokeOpacity="0.18" strokeWidth="1.4" />
          <path d="M120 510 L290 250 L440 425 L620 155 L780 405 L1010 120 L1170 355" fill="none" stroke="white" strokeOpacity="0.16" strokeWidth="1.2" />
        </svg>
      </div>

      {floatingExams.map((exam, index) => (
        <FloatingExamCard
          key={exam.label}
          exam={exam}
          index={index}
          activeExam={activeExam}
          onSelect={setActiveExam}
        />
      ))}

      <div
        className="relative mx-auto flex min-h-[28rem] max-w-4xl flex-col items-center justify-center text-center transition-transform duration-200"
        style={{
          transform: "perspective(1200px) rotateX(var(--hero-rotate-x)) rotateY(var(--hero-rotate-y))",
        }}
      >
        <div
          className="inline-flex animate-in fade-in slide-in-from-bottom-4 items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-white shadow-[0_18px_50px_-34px_rgba(0,0,0,0.85)] backdrop-blur duration-700"
        >
          <span className="h-px w-8 bg-white/45" />
          Choose your exam path
          <span className="h-px w-8 bg-white/45" />
        </div>

        <h1
          className="mt-6 max-w-3xl text-balance font-display text-5xl font-medium leading-[1.06] tracking-tight sm:text-6xl lg:text-7xl"
        >
          <span key={activeExam.headline} className="block animate-in fade-in slide-in-from-bottom-3 duration-300">
            {activeExam.headline}
          </span>
        </h1>

        <p
          className="mt-7 max-w-2xl text-lg font-medium leading-8 text-white/82 sm:text-xl"
        >
          <span key={activeExam.body} className="block animate-in fade-in slide-in-from-bottom-2 duration-300">
            {activeExam.body}
          </span>
        </p>

        <div
          className="mt-6 flex items-center gap-2 rounded-full border border-white/20 bg-white/10 p-1.5 backdrop-blur-xl"
        >
          {floatingExams.map((exam) => (
            <button
              key={exam.label}
              type="button"
              onClick={() => setActiveExam(exam)}
              className={cn(
                "relative rounded-full px-3 py-1.5 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80",
                activeExam.label === exam.label ? "bg-white text-emerald-950" : "text-white/70 hover:text-white",
              )}
            >
              {exam.label}
            </button>
          ))}
        </div>

        <div
          className="mt-8 flex animate-in fade-in slide-in-from-bottom-4 flex-wrap justify-center gap-3 duration-700"
        >
          {examActions.map((action) => (
            <Button
              key={action.label}
              asChild
              variant="outline"
              className="h-12 rounded-full border-white/30 bg-white/10 px-5 font-bold text-white backdrop-blur hover:bg-white hover:text-emerald-950"
            >
              <Link href={action.href}>
                <action.icon className="h-4 w-4" />
                {action.label}
              </Link>
            </Button>
          ))}
        </div>

        <div
          className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700"
        >
          <Button asChild className="h-12 rounded-full bg-orange-600 px-6 font-bold text-white shadow-[0_18px_44px_-20px_rgba(249,115,22,0.9)] hover:bg-orange-500">
            <Link href={activeExam.href}>
              Open {activeExam.label} path
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
