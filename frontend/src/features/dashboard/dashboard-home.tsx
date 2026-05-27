"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import {
  ArrowRight,
  Award,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  FileSpreadsheet,
  GraduationCap,
  Layers3,
  MessageCircle,
  Star,
  Trophy,
  Video,
} from "lucide-react";
import { BarProgress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { useMasterySummary } from "./hooks";

const continueCards = [
  {
    date: "25 May 2026",
    href: "/app/past-questions/jamb",
    icon: FileSpreadsheet,
    lessons: "5 topics",
    progress: 0,
    title: "JAMB Mathematics from Beginner to Exam Ready",
  },
  {
    date: "27 May 2026",
    href: "/app/tutor",
    icon: GraduationCap,
    lessons: "3 lessons",
    progress: 66.67,
    title: "Physics: Energy, Work, and Power",
  },
] as const;

const overviewRows = [
  {
    author: "Prepcify Study Plan",
    color: "bg-emerald-100 text-emerald-700",
    icon: ClipboardCheck,
    meta: "1/1",
    progress: 80,
    title: "Master Algebra before Friday",
  },
  {
    author: "AI Tutor",
    color: "bg-indigo-100 text-indigo-700",
    icon: Layers3,
    meta: "0/1",
    progress: 50,
    title: "Review English comprehension drills",
  },
  {
    author: "Mock Exam Engine",
    color: "bg-slate-100 text-slate-600",
    icon: ClipboardCheck,
    meta: "0/1",
    progress: 85.71,
    title: "Simulate JAMB CBT timing",
  },
  {
    author: "Past Questions",
    color: "bg-emerald-100 text-emerald-700",
    icon: FileSpreadsheet,
    meta: "0/1",
    progress: 0,
    title: "Excel through 2021 WAEC Chemistry",
  },
  {
    author: "Goal Tracker",
    color: "bg-teal-100 text-teal-700",
    icon: BookOpen,
    meta: "2/2",
    progress: 100,
    title: "Travel Management reading practice",
  },
] as const;

const notices = [
  {
    body: "Your private WAEC revision path is ready. Start with weak topics and review explanations after each attempt.",
    date: "Today 08:10",
    title: "New Private Study Path",
  },
  {
    body: "Effective Time Management has been added to your weekly plan for final certificate preparation.",
    date: "Yesterday 21:45",
    title: "New Class Published",
  },
] as const;

const upcomingEvents = [
  { day: "25", label: "Mock exam window", sub: "JAMB CBT Practice Session" },
  { day: "28", label: "AI tutor review", sub: "Skill-building package" },
] as const;

const calendarDays = [
  ["Sa", "2", "9", "16", "23", "30"],
  ["Fr", "1", "8", "15", "22", "29"],
  ["Th", "30", "7", "14", "21", "28"],
  ["We", "29", "6", "13", "20", "27"],
  ["Tu", "28", "5", "12", "19", "26"],
  ["Mo", "27", "4", "11", "18", "25"],
  ["Su", "26", "3", "10", "17", "24"],
] as const;

function StatBubble({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BookOpen;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/18 text-white ring-1 ring-white/20">
        <Icon className="h-4 w-4" />
      </span>
      <span>
        <span className="block text-sm font-bold text-white">{value}</span>
        <span className="block text-xs font-medium text-white/78">{label}</span>
      </span>
    </div>
  );
}

function ContinueCard({ card }: { card: (typeof continueCards)[number] }) {
  return (
    <Link
      href={card.href}
      className="group rounded-[1.2rem] bg-white p-4 shadow-[0_16px_38px_-30px_rgba(15,23,42,0.45)] ring-1 ring-slate-100 transition-transform hover:-translate-y-0.5"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
          <card.icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold text-slate-950">{card.title}</p>
          <p className="mt-1 text-[11px] font-medium text-slate-400">{card.date}</p>
        </div>
      </div>
      <div className="mt-4">
        <BarProgress
          value={card.progress}
          height={4}
          indicatorClassName="bg-emerald-500"
          label={`${card.title} progress`}
        />
        <p className="mt-2 text-[11px] font-semibold text-slate-500">
          {card.progress}% <span className="font-medium text-slate-400">Completed</span>
        </p>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] font-semibold text-slate-400">
        <span className="inline-flex items-center gap-1">
          <CalendarDays className="h-3.5 w-3.5" />
          {card.lessons}
        </span>
        <span className="inline-flex items-center gap-1 text-emerald-600">
          Continue <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

function HeroPanel() {
  const { user } = useAuth();
  const firstName = user?.first_name || user?.display_name?.split(" ")[0] || "Student";

  return (
    <section className="relative mb-28 min-h-[348px] overflow-visible rounded-[1.55rem] px-4 pt-5 text-white sm:px-6 lg:mb-24 lg:min-h-[330px]">
      <div className="absolute inset-0 overflow-hidden rounded-[1.55rem] bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 shadow-[0_26px_70px_-38px_rgba(6,95,70,0.85)]">
        <div className="pointer-events-none absolute inset-0 opacity-30">
          <div className="absolute inset-y-0 left-[48%] w-44 -skew-x-[24deg] bg-white/14 blur-[1px]" />
          <div className="absolute inset-y-0 left-[58%] w-36 -skew-x-[24deg] bg-white/10 blur-[1px]" />
          <div className="absolute inset-y-0 left-[69%] w-20 -skew-x-[24deg] bg-white/10 blur-[1px]" />
        </div>
      </div>
      <div className="pointer-events-none absolute right-3 -top-7 z-20 hidden h-[316px] w-[278px] lg:block xl:right-10 xl:-top-8 xl:h-[350px] xl:w-[306px]">
        <Image
          src="/assets/hello-box-user-vector.webp"
          alt=""
          width={316}
          height={360}
          priority
          sizes="(min-width: 1280px) 306px, 278px"
          className="h-full w-full object-contain object-bottom drop-shadow-[0_26px_44px_rgba(4,47,46,0.22)]"
        />
      </div>

      <div className="relative z-10 max-w-[570px]">
        <h2 className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
          Hello, {firstName} <span aria-hidden>👋</span>
        </h2>
        <p className="mt-2 text-sm font-medium text-white/82">
          Welcome! Let&apos;s continue your exam preparation journey.
        </p>

        <div className="mt-7 grid max-w-lg grid-cols-2 gap-x-12 gap-y-6">
          <StatBubble icon={BookOpen} label="Study Paths" value="11" />
          <StatBubble icon={Video} label="Live Sessions" value="0" />
          <StatBubble icon={Award} label="Achievements" value="2" />
          <StatBubble icon={ClipboardCheck} label="Quizzes Passed" value="1" />
        </div>

        <p className="mt-9 text-sm font-bold">Continue</p>
      </div>

      <div className="absolute inset-x-4 -bottom-20 z-30 grid gap-3 sm:inset-x-6 lg:-bottom-16 lg:grid-cols-2">
        {continueCards.map((card) => (
          <ContinueCard key={card.title} card={card} />
        ))}
      </div>
    </section>
  );
}

function UpgradeCard() {
  return (
    <Link
      href="/app/pricing"
      className="relative block overflow-visible rounded-[1.45rem] bg-gradient-to-br from-emerald-600 to-emerald-800 p-5 text-white shadow-[0_24px_60px_-42px_rgba(6,95,70,0.8)]"
    >
      <div className="absolute inset-0 overflow-hidden rounded-[1.45rem] bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:26px_26px]" />
      <Image
        src="/assets/upgrade.png"
        alt=""
        width={512}
        height={512}
        className="absolute -right-3 -top-9 z-10 h-32 w-32 rotate-12 object-contain drop-shadow-xl sm:-right-2 sm:-top-11 sm:h-36 sm:w-36"
      />
      <div className="relative">
        <p className="text-base font-bold">Upgrade to PRO!</p>
        <p className="mt-2 max-w-[180px] text-xs leading-5 text-white/80">
          Unlock AI explanations, full mock exams, and advanced readiness reports.
        </p>
        <span className="mt-4 inline-flex rounded-full bg-white px-5 py-2 text-xs font-bold text-emerald-700">
          Upgrade
        </span>
      </div>
    </Link>
  );
}

function ReadinessCard({ readiness }: { readiness: number }) {
  return (
    <section className="rounded-[1.45rem] bg-white p-3 shadow-[0_20px_44px_-36px_rgba(15,23,42,0.55)]">
      <div className="relative overflow-hidden rounded-[1.1rem] bg-gradient-to-br from-emerald-600 to-emerald-800 px-4 py-5 text-white">
        <div className="absolute -right-8 bottom-[-56px] h-36 w-36 rounded-full border-[22px] border-white/8" />
        <p className="text-sm font-bold">Exam Readiness</p>
        <p className="mt-1 text-[11px] font-medium text-white/78">Updated today</p>
        <p className="mt-8 text-4xl font-bold tracking-tight">{readiness}%</p>
        <div className="-mx-4 -mb-5 mt-6 bg-emerald-950/70 px-4 py-3 text-[11px] font-medium text-white/70">
          {Math.max(0, 100 - readiness)}% left to reach full readiness
        </div>
      </div>
      <div className="flex items-center justify-between px-2 py-4">
        <span>
          <span className="block text-sm font-bold text-slate-950">Progress Wallet</span>
          <span className="text-[11px] font-medium text-slate-400">Manage your study points</span>
        </span>
        <Link
          href="/app/achievements"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-100 text-slate-400 hover:text-emerald-700"
        >
          <ArrowRight className="h-4 w-4" />
          <span className="sr-only">Open achievements</span>
        </Link>
      </div>
    </section>
  );
}

function CourseOverview() {
  return (
    <section className="rounded-[1.45rem] bg-white p-5 shadow-[0_20px_44px_-38px_rgba(15,23,42,0.35)]">
      <h3 className="text-sm font-bold text-slate-950">Course Overview</h3>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {[
          { icon: CalendarDays, label: "Total Paths", value: "11", tone: "bg-emerald-100 text-emerald-700" },
          { icon: CheckCircle2, label: "Completed Paths", value: "2", tone: "bg-teal-100 text-teal-700" },
          { icon: MessageCircle, label: "Open Questions", value: "9", tone: "bg-amber-100 text-amber-700" },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4">
            <span>
              <span className="block text-[11px] font-medium text-slate-400">{item.label}</span>
              <span className="mt-3 block text-2xl font-bold text-slate-950">{item.value}</span>
            </span>
            <span className={cn("flex h-10 w-10 items-center justify-center rounded-2xl", item.tone)}>
              <item.icon className="h-4 w-4" />
            </span>
          </div>
        ))}
      </div>

      <div className="mt-5 space-y-3">
        {overviewRows.map((row) => (
          <Link
            key={row.title}
            href="/app/study-plan"
            className="grid items-center gap-3 rounded-2xl px-2 py-2 transition-colors hover:bg-slate-50 md:grid-cols-[minmax(220px,1fr)_260px_52px]"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl", row.color)}>
                <row.icon className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-xs font-bold text-slate-950">{row.title}</span>
                <span className="block truncate text-[11px] font-medium text-slate-400">By {row.author}</span>
              </span>
            </div>
            <div>
              <p className="mb-2 text-[11px] font-semibold text-slate-500">
                {row.progress}% <span className="font-medium text-slate-400">Progress</span>
              </p>
              <BarProgress value={row.progress} height={4} indicatorClassName="bg-emerald-500" label={`${row.title} progress`} />
            </div>
            <span className="hidden justify-self-end text-[11px] font-semibold text-slate-400 md:block">
              {row.meta}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function Noticeboard() {
  return (
    <section className="rounded-[1.45rem] bg-white p-4 shadow-[0_20px_44px_-38px_rgba(15,23,42,0.35)]">
      <h3 className="text-sm font-bold text-slate-950">Noticeboard</h3>
      <div className="mt-4 space-y-3">
        {notices.map((notice) => (
          <article key={notice.title} className="rounded-2xl bg-slate-50 p-4">
            <div className="flex gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                <GraduationCap className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-slate-950">{notice.title}</p>
                <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-slate-400">{notice.body}</p>
                <p className="mt-2 text-[10px] font-semibold text-slate-400">Platform · {notice.date}</p>
              </div>
              <Link href="/app/notifications" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-100 text-slate-400 hover:text-emerald-700">
                <ArrowRight className="h-3.5 w-3.5" />
                <span className="sr-only">Open notice</span>
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function CalendarPanel() {
  return (
    <section className="rounded-[1.45rem] bg-white p-5 shadow-[0_20px_44px_-38px_rgba(15,23,42,0.35)]">
      <div className="flex items-start justify-between">
        <span>
          <span className="block text-sm font-bold text-slate-950">Events Calendar</span>
          <span className="text-[11px] font-medium text-slate-400">Manage your activities using the calendar</span>
        </span>
      </div>
      <div className="mt-6 flex items-center justify-center gap-8 text-xs font-bold text-slate-950">
        <button className="text-slate-300" type="button">{"<"}</button>
        2026 May
        <button className="text-slate-300" type="button">{">"}</button>
      </div>
      <div className="mt-5 grid grid-cols-7 gap-1 text-center text-[11px]">
        {calendarDays.map((column) => (
          <div key={column[0]} className="space-y-4">
            <p className="font-bold text-slate-950">{column[0]}</p>
            {column.slice(1).map((day) => (
              <p
                key={`${column[0]}-${day}`}
                className={cn(
                  "mx-auto flex h-8 w-8 items-center justify-center rounded-xl font-medium",
                  day === "25" ? "bg-slate-50 text-slate-950" : "text-slate-300",
                  ["30", "29", "28", "27", "26"].includes(day) && "text-slate-950",
                )}
              >
                {day}
              </p>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

function EventsPanel() {
  return (
    <section className="rounded-[1.45rem] bg-white p-5 shadow-[0_20px_44px_-38px_rgba(15,23,42,0.35)]">
      <div className="flex items-center justify-between">
        <span>
          <span className="block text-sm font-bold text-slate-950">Upcoming Events</span>
          <span className="text-[11px] font-medium text-slate-400">3 Total Events</span>
        </span>
        <Link href="/app/study-plan" className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-100 text-slate-400">
          <ArrowRight className="h-4 w-4" />
          <span className="sr-only">Open events</span>
        </Link>
      </div>
      <div className="mt-4 space-y-3">
        {upcomingEvents.map((event) => (
          <div key={event.label} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
            <span className="flex h-11 w-11 flex-col items-center justify-center rounded-2xl bg-white text-center">
              <span className="text-sm font-bold text-slate-950">{event.day}</span>
              <span className="text-[9px] font-medium text-slate-300">May</span>
            </span>
            <span className="min-w-0">
              <span className="block truncate text-xs font-bold text-slate-950">{event.label}</span>
              <span className="block truncate text-[11px] font-medium text-slate-400">{event.sub}</span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function LiveSessionsPanel() {
  return (
    <section className="rounded-[1.45rem] bg-white p-5 shadow-[0_20px_44px_-38px_rgba(15,23,42,0.35)]">
      <h3 className="text-sm font-bold text-slate-950">Upcoming Live Sessions</h3>
      <div className="mt-5 flex min-h-[122px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
          <Video className="h-5 w-5" />
        </span>
        <p className="mt-3 text-xs font-bold text-slate-950">No Live Sessions!</p>
        <p className="mt-1 max-w-[260px] text-[11px] leading-4 text-slate-400">
          No upcoming live sessions. Browse and enroll in live courses.
        </p>
      </div>
      <Link href="/app/subjects" className="mt-4 flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
          <Trophy className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-xs font-bold text-slate-950">How to Travel Around the Exam Topics</span>
          <span className="mt-1 flex text-amber-400">
            {[...Array(5)].map((_, index) => (
              <Star key={index} className="h-3 w-3 fill-current" />
            ))}
          </span>
        </span>
        <ChevronRight className="h-4 w-4 text-slate-300" />
      </Link>
    </section>
  );
}

export function DashboardHome() {
  const mastery = useMasterySummary();
  const readiness = useMemo(() => {
    const buckets = Object.values(mastery.data?.by_exam ?? {});
    if (!buckets.length) return 59;
    return Math.round(
      (buckets.reduce((sum, item) => sum + item.mastery_score, 0) / buckets.length) * 100,
    );
  }, [mastery.data]);

  return (
    <div className="grid gap-4 2xl:grid-cols-[minmax(0,1.55fr)_minmax(360px,0.75fr)]">
      <div className="space-y-4">
        <HeroPanel />
        <CourseOverview />
      </div>

      <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-1">
        <div className="space-y-4">
          <UpgradeCard />
          <ReadinessCard readiness={readiness} />
          <Noticeboard />
        </div>
        <div className="space-y-4">
          <CalendarPanel />
          <EventsPanel />
          <LiveSessionsPanel />
        </div>
      </div>
    </div>
  );
}
