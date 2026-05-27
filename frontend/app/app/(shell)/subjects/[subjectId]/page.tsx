"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BarProgress, RingProgress } from "@/components/ui/progress";
import {
  ArrowLeft, Check, Lock, Play, Sparkles, Clock, FileText, Calculator,
} from "lucide-react";
import { cn } from "@/lib/utils";

const topics = [
  { id: 1, name: "Number bases", lessons: 4, status: "done", time: "32 min" },
  { id: 2, name: "Indices & Logarithms", lessons: 6, status: "done", time: "48 min" },
  { id: 3, name: "Linear equations", lessons: 5, status: "active", progress: 60, time: "40 min" },
  { id: 4, name: "Quadratic equations", lessons: 7, status: "todo", time: "56 min" },
  { id: 5, name: "Sets & Venn diagrams", lessons: 5, status: "todo", time: "40 min" },
  { id: 6, name: "Coordinate geometry", lessons: 8, status: "locked", time: "1h 4m" },
  { id: 7, name: "Trigonometry", lessons: 9, status: "locked", time: "1h 12m" },
  { id: 8, name: "Differentiation", lessons: 6, status: "locked", time: "48 min" },
];

export default function WebTopicPage() {
  const params = useParams<{ subjectId: string }>();
  const subjectId = params?.subjectId ?? "math";

  return (
    <div className="max-w-6xl space-y-8">
      <Link
        href="/app/subjects"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> All subjects
      </Link>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <section className="rounded-3xl bg-foreground p-8 text-background lg:col-span-2">
          <p className="text-xs uppercase tracking-wider text-background/60">
            {subjectId.toUpperCase()} · JAMB · Senior Secondary
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight">
            Mathematics
          </h1>
          <p className="mt-2 max-w-lg text-background/70">
            Algebra, geometry, calculus and statistics — structured the way
            examiners ask.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="accent">
              <Link href="/app/quiz">
                <Play /> Continue learning
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-background/25 bg-transparent text-background hover:bg-background/10 hover:text-background"
            >
              <Link href="/app/past-questions">
                <FileText /> Past papers
              </Link>
            </Button>
          </div>
        </section>

        <section className="flex items-center gap-5 rounded-3xl border border-border bg-card p-6 shadow-soft">
          <RingProgress
            value={68}
            size={108}
            stroke={11}
            indicatorClassName="stroke-foreground"
            label="Subject mastery"
          >
            <div className="text-center">
              <p className="font-display text-2xl font-bold">68%</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Mastery
              </p>
            </div>
          </RingProgress>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Progress
            </p>
            <p className="font-display text-lg font-bold leading-tight">
              7 of 12 topics
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              ~3 hours to next milestone
            </p>
            <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calculator className="h-3.5 w-3.5" /> 24 topics
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> 18h total
              </span>
            </div>
          </div>
        </section>
      </div>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">Curriculum</h2>
          <p className="text-sm text-muted-foreground">8 of 24 topics</p>
        </div>

        <ol className="mt-5 space-y-3">
          {topics.map((t, i) => {
            const done = t.status === "done";
            const active = t.status === "active";
            const locked = t.status === "locked";
            return (
              <li key={t.id}>
                <Link
                  href="/app/quiz"
                  aria-disabled={locked}
                  onClick={(e) => locked && e.preventDefault()}
                  className={cn(
                    "flex items-center gap-5 rounded-3xl border bg-card p-5 tap transition-shadow",
                    active
                      ? "border-foreground shadow-card"
                      : "border-border hover:shadow-soft",
                    locked && "pointer-events-none opacity-55",
                  )}
                  style={{ animationDelay: `${i * 25}ms` }}
                >
                  <div
                    className={cn(
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-bold",
                      done && "bg-success text-success-foreground",
                      active && "bg-accent text-accent-foreground",
                      !done && !active && !locked && "bg-secondary text-foreground",
                      locked && "bg-secondary text-muted-foreground",
                    )}
                  >
                    {done ? (
                      <Check className="h-5 w-5" />
                    ) : locked ? (
                      <Lock className="h-4 w-4" />
                    ) : (
                      t.id
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.lessons} lessons · {t.time}
                    </p>
                    {active && (
                      <BarProgress
                        value={t.progress!}
                        className="mt-2 max-w-sm"
                        height={4}
                        label={`${t.name} progress`}
                      />
                    )}
                  </div>
                  {active && (
                    <div className="hidden items-center gap-2 rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-background sm:flex">
                      <Play className="h-3.5 w-3.5" /> Continue
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="flex items-center gap-4 rounded-3xl bg-foreground p-6 text-background">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-background/10">
          <Sparkles className="h-5 w-5 text-accent" />
        </div>
        <div className="flex-1">
          <p className="font-display text-lg font-bold leading-tight">
            Need a different angle?
          </p>
          <p className="text-sm text-background/70">
            prepcify AI can re-explain anything in plain English.
          </p>
        </div>
        <Button asChild variant="accent">
          <Link href="/app/tutor">Open AI tutor</Link>
        </Button>
      </section>
    </div>
  );
}
