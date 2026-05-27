import { Link } from "react-router-dom";
import { Flame, Play, Calculator, FlaskConical, Globe2, BookText, ChevronRight, Sparkles, Trophy, ClipboardCheck, Atom, ArrowUpRight, Zap, Target, TrendingUp, Clock } from "lucide-react";
import { RingProgress, BarProgress } from "@/components/Progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const subjects = [
  { name: "Mathematics", icon: Calculator, progress: 68, to: "/app/subjects/math" },
  { name: "Physics", icon: FlaskConical, progress: 42, to: "/app/subjects/phy" },
  { name: "English", icon: BookText, progress: 81, to: "/app/subjects/eng" },
  { name: "Geography", icon: Globe2, progress: 24, to: "/app/subjects/geo" },
  { name: "Chemistry", icon: Atom, progress: 51, to: "/app/subjects/chem" },
];

const activity = [
  { day: "M", v: 60 }, { day: "T", v: 80 }, { day: "W", v: 30 },
  { day: "T", v: 90 }, { day: "F", v: 45 }, { day: "S", v: 100 }, { day: "S", v: 65 },
];

export default function WebDashboard() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ============ HERO BENTO ============ */}
      <section className="grid grid-cols-12 gap-4 lg:gap-5">
        {/* Greeting + Readiness — big hero */}
        <div className="col-span-12 lg:col-span-8 relative overflow-hidden rounded-[2rem] bg-foreground text-background p-7 lg:p-10 shadow-pop">
          {/* Glow blobs */}
          <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-accent/40 blur-3xl" aria-hidden />
          <div className="absolute -bottom-20 -left-10 h-72 w-72 rounded-full bg-sky/30 blur-3xl" aria-hidden />
          <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)", backgroundSize: "24px 24px" }} aria-hidden />

          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-medium text-background/70">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              JAMB · 2025 · {now.toLocaleDateString(undefined, { weekday: "long" })}
            </div>
            <h1 className="mt-3 font-display text-4xl lg:text-6xl font-extrabold tracking-tight leading-[1.05]">
              Good morning, <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-accent via-sky to-background bg-clip-text text-transparent">Adaeze.</span>
            </h1>
            <p className="mt-4 max-w-md text-background/70 text-base lg:text-lg">
              42 days until JAMB. You're <span className="text-accent font-semibold">on track</span> — keep the rhythm.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" variant="accent" className="shadow-glow rounded-full">
                <Link to="/app/quiz"><Play className="h-4 w-4" /> Resume study</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-background/5 border-background/20 text-background hover:bg-background/10 rounded-full">
                <Link to="/app/exam"><ClipboardCheck className="h-4 w-4" /> Take mock exam</Link>
              </Button>
            </div>

            {/* Stats strip */}
            <div className="mt-10 grid grid-cols-3 gap-3 max-w-lg">
              {[
                { k: "1,240", v: "XP earned", icon: Zap },
                { k: "Lvl 14", v: "Scholar", icon: TrendingUp },
                { k: "92%", v: "Accuracy", icon: Target },
              ].map((s) => (
                <div key={s.v} className="rounded-2xl bg-background/5 backdrop-blur p-4 ring-1 ring-background/10">
                  <s.icon className="h-4 w-4 text-accent" />
                  <p className="mt-2 font-display text-xl font-extrabold">{s.k}</p>
                  <p className="text-[11px] text-background/60">{s.v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Readiness ring — floating glass */}
          <div className="absolute right-6 lg:right-10 bottom-6 lg:top-1/2 lg:-translate-y-1/2 lg:bottom-auto">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-accent/40 blur-2xl animate-pulse" aria-hidden />
              <div className="relative rounded-full bg-background/10 backdrop-blur p-3 ring-1 ring-background/20">
                <RingProgress value={68} size={148} stroke={10} trackClassName="stroke-background/15" indicatorClassName="stroke-accent">
                  <div className="text-center">
                    <p className="font-display text-4xl font-extrabold">68%</p>
                    <p className="text-[10px] uppercase tracking-wider text-background/60">Ready</p>
                  </div>
                </RingProgress>
              </div>
            </div>
          </div>
        </div>

        {/* Streak — glowing card */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-4 glow-card p-6 group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">This week</p>
              <p className="mt-1 font-display text-2xl font-extrabold">12 day streak</p>
              <p className="text-xs text-muted-foreground mt-0.5">Personal best: 18 days</p>
            </div>
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground shadow-glow">
              <Flame className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-6 flex h-28 items-end justify-between gap-2">
            {activity.map((d, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className={cn(
                    "w-full rounded-xl transition-all duration-500",
                    i === activity.length - 2
                      ? "bg-accent shadow-glow-soft"
                      : "bg-secondary group-hover:bg-secondary/80"
                  )}
                  style={{ height: `${d.v}%`, minHeight: 8 }}
                />
                <span className="text-[10px] font-medium text-muted-foreground">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Today's plan */}
        <div className="col-span-12 lg:col-span-7 glow-card p-6 lg:p-7">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-3 w-3" /> Today's plan
              </p>
              <p className="mt-1 font-display text-2xl font-extrabold">Algebra · Word Problems</p>
              <p className="text-sm text-muted-foreground">3 of 5 tasks · 18 min left</p>
            </div>
            <Button asChild className="rounded-full shadow-glow-soft" variant="accent">
              <Link to="/app/quiz"><Play className="h-4 w-4" /> Continue</Link>
            </Button>
          </div>
          <BarProgress value={60} className="mt-5" />
          <ul className="mt-6 space-y-2">
            {[
              { name: "Warm-up · 5 quick questions", done: true },
              { name: "Concept · Translating problems into equations", done: true },
              { name: "Practice · 8 questions", done: true },
              { name: "Challenge · 4 hard questions", done: false },
              { name: "Recap · review wrong answers", done: false },
            ].map((t) => (
              <li
                key={t.name}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all",
                  t.done ? "bg-secondary/40 border-border" : "bg-background border-accent/20 hover:border-accent/50 hover:shadow-glow-soft"
                )}
              >
                <div className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold transition-all",
                  t.done ? "bg-success text-success-foreground" : "bg-accent/10 text-accent ring-1 ring-accent/30"
                )}>
                  {t.done ? "✓" : ""}
                </div>
                <span className={cn("text-sm font-medium flex-1", t.done && "text-muted-foreground line-through")}>{t.name}</span>
                {!t.done && <ArrowUpRight className="h-4 w-4 text-accent opacity-0 group-hover:opacity-100" />}
              </li>
            ))}
          </ul>
        </div>

        {/* AI Tutor — signature glow piece */}
        <Link to="/app/tutor" className="col-span-12 sm:col-span-6 lg:col-span-5 relative group rounded-[2rem] overflow-hidden bg-background tap">
          <div className="absolute inset-0 bg-gradient-to-br from-accent via-sky to-accent/60 opacity-90" aria-hidden />
          <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-white/30 blur-3xl group-hover:scale-125 transition-transform duration-700" aria-hidden />
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(white 1px, transparent 1px)", backgroundSize: "20px 20px" }} aria-hidden />

          <div className="relative p-7 text-white h-full flex flex-col min-h-[260px]">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur ring-1 ring-white/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <p className="mt-auto pt-8 font-display text-3xl font-extrabold leading-tight">
              Stuck on something?
            </p>
            <p className="mt-2 text-sm text-white/85 max-w-xs">
              Ask prepcify AI for a step-by-step explanation — in plain English.
            </p>
            <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold w-fit rounded-full bg-white text-foreground px-4 py-2 group-hover:gap-2.5 transition-all">
              Open AI tutor <ChevronRight className="h-4 w-4" />
            </div>
          </div>
        </Link>
      </section>

      {/* ============ SUBJECTS ============ */}
      <section>
        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Continue learning</p>
            <h2 className="mt-1 font-display text-2xl font-extrabold">Your subjects</h2>
          </div>
          <Link to="/app/subjects" className="text-sm font-semibold text-accent hover:underline">All subjects →</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {subjects.map((s, i) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.name}
                to={s.to}
                className="group relative glow-card p-5 overflow-hidden"
                style={{ animation: `fade-in 0.5s ease-out ${i * 60}ms both` }}
              >
                <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-accent/0 group-hover:bg-accent/15 blur-2xl transition-all duration-500" aria-hidden />
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent ring-1 ring-accent/20 group-hover:bg-accent group-hover:text-accent-foreground group-hover:shadow-glow transition-all">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <p className="mt-4 font-semibold">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.progress}% complete</p>
                <BarProgress value={s.progress} className="mt-3" height={4} />
              </Link>
            );
          })}
        </div>
      </section>

      {/* ============ LEADERBOARD + MOCK ============ */}
      <section className="grid grid-cols-12 gap-4 lg:gap-5">
        <div className="col-span-12 lg:col-span-7 glow-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Lagos · This week</p>
              <p className="mt-1 font-display text-xl font-extrabold">You're <span className="text-accent">#14</span></p>
            </div>
            <Link to="/app/leaderboard" className="text-sm font-semibold text-accent hover:underline">Full board →</Link>
          </div>
          <ul className="mt-5 space-y-2">
            {[
              { rank: 12, name: "Sade O.", xp: 4310 },
              { rank: 13, name: "Kelechi N.", xp: 4280 },
              { rank: 14, name: "Adaeze (you)", xp: 4205, you: true },
              { rank: 15, name: "Ibrahim K.", xp: 4180 },
              { rank: 16, name: "Aisha B.", xp: 4090 },
            ].map((r) => (
              <li
                key={r.rank}
                className={cn(
                  "flex items-center gap-4 rounded-2xl border p-3 transition-all",
                  r.you ? "border-accent/40 bg-accent/5 shadow-glow-soft" : "border-border bg-background hover:border-border"
                )}
              >
                <span className="w-6 text-center font-display text-sm font-bold text-muted-foreground">{r.rank}</span>
                <div className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold",
                  r.you ? "bg-accent text-accent-foreground" : "bg-secondary text-foreground"
                )}>{r.name.charAt(0)}</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{r.name}</p>
                </div>
                <p className="text-sm font-bold tabular-nums">{r.xp.toLocaleString()} XP</p>
                {r.you && <span className="chip bg-accent text-accent-foreground">You</span>}
              </li>
            ))}
          </ul>
        </div>

        <Link to="/app/exam" className="col-span-12 lg:col-span-5 relative group rounded-[2rem] overflow-hidden bg-foreground text-background tap p-7 min-h-[260px] flex flex-col">
          <div className="absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-accent/30 blur-3xl group-hover:scale-125 transition-transform duration-700" aria-hidden />
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground shadow-glow">
            <Trophy className="h-5 w-5" />
          </div>
          <p className="relative mt-auto pt-8 font-display text-3xl font-extrabold leading-tight">
            Mock JAMB · <span className="text-accent">50 questions</span>
          </p>
          <p className="relative mt-2 text-sm text-background/70 max-w-xs">
            Real exam timing. Honest score. Detailed review.
          </p>
          <div className="relative mt-6 inline-flex items-center gap-1.5 text-sm font-bold w-fit rounded-full bg-background text-foreground px-4 py-2 group-hover:gap-2.5 transition-all">
            Start mock exam <ChevronRight className="h-4 w-4" />
          </div>
        </Link>
      </section>
    </div>
  );
}
