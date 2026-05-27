import Link from "next/link";
import { Trophy, Target, Clock, Flame } from "lucide-react";
import { PageHeader } from "@/components/shells/page-header";
import { RingProgress, BarProgress } from "@/components/ui/progress";

const topics = [
  { name: "Algebra", accuracy: 92 },
  { name: "Geometry", accuracy: 75 },
  { name: "Calculus", accuracy: 58 },
  { name: "Statistics", accuracy: 84 },
];

export default function QuizResultsPage() {
  return (
    <div className="max-w-5xl">
      <PageHeader
        eyebrow="Results"
        title="Nice run, you scored 17/20"
        description="Better than 73% of students who took this quiz today."
      />

      <div className="mb-6 grid gap-5 md:grid-cols-3">
        <div className="rounded-3xl border border-border bg-card p-6 text-center">
          <RingProgress value={85} label="Quiz score">
            <span className="font-display text-2xl font-bold">85%</span>
          </RingProgress>
          <p className="mt-4 text-sm font-semibold">Score</p>
        </div>
        <div className="rounded-3xl bg-foreground p-6 text-background">
          <Trophy className="h-5 w-5 text-accent" />
          <p className="mt-3 font-display text-3xl font-bold">+340 XP</p>
          <p className="mt-1 text-sm text-background/70">Earned this session</p>
          <div className="mt-4 flex items-center gap-2 text-xs text-background/60">
            <Flame className="h-3.5 w-3.5 text-accent" /> 12-day streak extended
          </div>
        </div>
        <div className="space-y-4 rounded-3xl border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <Target className="h-5 w-5 text-accent" />
            <div>
              <p className="text-xs text-muted-foreground">Accuracy</p>
              <p className="font-display text-xl font-bold">85%</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-accent" />
            <div>
              <p className="text-xs text-muted-foreground">Avg. time / Q</p>
              <p className="font-display text-xl font-bold">42s</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6">
        <h3 className="font-display text-lg font-bold">Accuracy by topic</h3>
        <div className="mt-5 space-y-4">
          {topics.map((t) => (
            <div key={t.name}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-medium">{t.name}</span>
                <span className="text-muted-foreground">{t.accuracy}%</span>
              </div>
              <BarProgress value={t.accuracy} label={`${t.name} accuracy`} />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/app/quiz/review"
          className="rounded-full bg-secondary px-5 py-2.5 text-sm font-semibold"
        >
          Review answers
        </Link>
        <Link
          href="/app/quiz/setup"
          className="rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background"
        >
          New quiz
        </Link>
        <Link
          href="/app"
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
