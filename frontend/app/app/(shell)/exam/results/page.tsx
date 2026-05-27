import Link from "next/link";
import { TrendingUp, Award } from "lucide-react";
import { PageHeader } from "@/components/shells/page-header";
import { RingProgress, BarProgress } from "@/components/ui/progress";

const subjects = [
  { name: "Mathematics", score: 78, total: 100 },
  { name: "English", score: 82, total: 100 },
  { name: "Physics", score: 65, total: 100 },
  { name: "Chemistry", score: 71, total: 100 },
];

export default function ExamResultsPage() {
  const total = subjects.reduce((a, b) => a + b.score, 0);
  const overall = Math.round(total / subjects.length);

  return (
    <div className="max-w-5xl">
      <PageHeader
        eyebrow="JAMB UTME · Mock result"
        title={`${total}/400 — top 18% nationwide`}
        description="Aggregate ranks you in the top quintile of prepcify users. Strong overall, but Physics needs attention."
      />

      <div className="mb-6 grid gap-5 md:grid-cols-[280px_1fr]">
        <div className="rounded-3xl bg-foreground p-6 text-center text-background">
          <RingProgress
            value={overall}
            trackClassName="stroke-background/15"
            label="Overall score"
          >
            <span className="font-display text-3xl font-bold">
              {overall}%
            </span>
          </RingProgress>
          <p className="mt-4 text-sm font-semibold">Overall</p>
          <p className="text-xs text-background/60">Avg across 4 subjects</p>
        </div>
        <div className="rounded-3xl border border-border bg-card p-6">
          <h3 className="font-display text-lg font-bold">Subject breakdown</h3>
          <div className="mt-5 space-y-4">
            {subjects.map((s) => (
              <div key={s.name}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium">{s.name}</span>
                  <span className="font-semibold">
                    {s.score}/{s.total}
                  </span>
                </div>
                <BarProgress value={s.score} label={`${s.name} score`} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-6 grid gap-5 md:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-6">
          <TrendingUp className="h-5 w-5 text-accent" />
          <p className="mt-3 font-display text-2xl font-bold">+12 pts</p>
          <p className="text-sm text-muted-foreground">
            vs your last mock 8 days ago. Steady upward trend.
          </p>
        </div>
        <div className="rounded-3xl border border-border bg-card p-6">
          <Award className="h-5 w-5 text-accent" />
          <p className="mt-3 font-display text-2xl font-bold">
            82nd percentile
          </p>
          <p className="text-sm text-muted-foreground">
            Better than 18,400 candidates this week.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/app/quiz/setup"
          className="rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background"
        >
          Practice physics weak spots
        </Link>
        <Link
          href="/app/exam/setup"
          className="rounded-full bg-secondary px-5 py-2.5 text-sm font-semibold"
        >
          Take another mock
        </Link>
      </div>
    </div>
  );
}
