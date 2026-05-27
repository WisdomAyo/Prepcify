import { Link } from "react-router-dom";
import { Flame, Bell, Play, Calculator, FlaskConical, Globe2, BookText, ChevronRight, Sparkles, Trophy } from "lucide-react";
import { RingProgress, BarProgress } from "@/components/Progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const subjects = [
  { name: "Mathematics", icon: Calculator, progress: 68, color: "bg-accent/15 text-accent" },
  { name: "Physics", icon: FlaskConical, progress: 42, color: "bg-sky/20 text-sky" },
  { name: "English Lang.", icon: BookText, progress: 81, color: "bg-foreground/10 text-foreground" },
  { name: "Geography", icon: Globe2, progress: 24, color: "bg-success/15 text-success" },
];

export default function Dashboard() {
  return (
    <div className="pb-6">
      {/* Top */}
      <div className="px-5 pt-6 flex items-center justify-between">
        <div>
          <p className="text-[13px] text-muted-foreground">Good morning,</p>
          <h1 className="font-display text-[26px] font-extrabold leading-tight">Adaeze 👋</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="chip bg-secondary text-foreground">
            <Flame className="h-3.5 w-3.5 text-accent" />
            <span>12 day streak</span>
          </div>
          <button aria-label="Notifications" className="relative flex h-10 w-10 items-center justify-center rounded-full bg-secondary tap">
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-accent" />
          </button>
        </div>
      </div>

      {/* Hero readiness card */}
      <section className="mx-5 mt-5 rounded-3xl bg-foreground p-5 text-background shadow-card animate-slide-up">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-background/60">JAMB · 2025</p>
            <p className="mt-1 font-display text-[22px] font-bold leading-tight">Exam readiness</p>
            <p className="mt-1 text-sm text-background/70">42 days to go</p>
          </div>
          <RingProgress value={68} size={84} stroke={9} trackClassName="stroke-background/15" indicatorClassName="stroke-accent">
            <span className="font-display text-xl font-extrabold">68%</span>
          </RingProgress>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2">
          {[{ k: "1,240", v: "XP" }, { k: "Lvl 14", v: "Scholar" }, { k: "92%", v: "Accuracy" }].map((s) => (
            <div key={s.v} className="rounded-2xl bg-background/5 p-3 text-center">
              <p className="font-display text-base font-bold">{s.k}</p>
              <p className="text-[11px] text-background/60">{s.v}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Daily plan */}
      <section className="mx-5 mt-5 rounded-3xl bg-card p-5 shadow-soft border border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Today's plan</p>
            <p className="mt-1 font-display text-lg font-bold">Algebra · Word Problems</p>
            <p className="text-sm text-muted-foreground">3 of 5 tasks · 18 min left</p>
          </div>
          <Button asChild size="icon" variant="accent" className="h-12 w-12">
            <Link to="/app/quiz" aria-label="Continue plan">
              <Play className="h-5 w-5" />
            </Link>
          </Button>
        </div>
        <BarProgress value={60} className="mt-4" />
      </section>

      {/* Subjects */}
      <section className="mt-7 px-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Continue learning</h2>
          <Link to="/app/subjects" className="text-sm font-medium text-muted-foreground tap">See all</Link>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {subjects.map((s) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.name}
                to="/app/subjects/math"
                className="group rounded-3xl border border-border bg-card p-4 tap hover:shadow-soft transition-shadow"
              >
                <div className={cn("flex h-11 w-11 items-center justify-center rounded-2xl", s.color)}>
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <p className="mt-3 font-semibold text-[15px]">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.progress}% complete</p>
                <BarProgress value={s.progress} className="mt-2" height={4} />
              </Link>
            );
          })}
        </div>
      </section>

      {/* Motivational rail */}
      <section className="mt-7">
        <div className="flex items-center justify-between px-5">
          <h2 className="font-display text-lg font-bold">For you</h2>
        </div>
        <div className="mt-3 flex gap-3 overflow-x-auto px-5 pb-2 scroll-hide">
          <Link to="/app/tutor" className="min-w-[260px] rounded-3xl bg-sky p-5 text-sky-foreground tap">
            <Sparkles className="h-5 w-5" />
            <p className="mt-6 font-display text-lg font-bold leading-tight">Stuck on a question? Ask prepcify AI.</p>
            <p className="mt-1 text-sm opacity-80">Step-by-step, in your words.</p>
            <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold">Try it <ChevronRight className="h-4 w-4" /></div>
          </Link>
          <Link to="/app/exam" className="min-w-[260px] rounded-3xl bg-accent p-5 text-accent-foreground tap">
            <Trophy className="h-5 w-5" />
            <p className="mt-6 font-display text-lg font-bold leading-tight">Mock JAMB · 50 questions</p>
            <p className="mt-1 text-sm opacity-90">Real exam timing. Honest score.</p>
            <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold">Start mock <ChevronRight className="h-4 w-4" /></div>
          </Link>
          <Link to="/app/leaderboard" className="min-w-[220px] rounded-3xl border border-border bg-card p-5 tap">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">This week</p>
            <p className="mt-6 font-display text-lg font-bold leading-tight">You're #14 in Lagos.</p>
            <p className="mt-1 text-sm text-muted-foreground">3 ranks from top 10.</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
