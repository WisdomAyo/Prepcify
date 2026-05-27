import Link from "next/link";
import { Check, X, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/shells/page-header";
import { cn } from "@/lib/utils";

const review = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  topic: ["Algebra", "Geometry", "Calculus"][i % 3],
  question: `Sample question ${i + 1} about a key concept in this topic.`,
  picked: ["A", "B", "C", "D"][i % 4],
  correct: ["A", "B", "C", "D"][(i + (i % 2)) % 4],
}));

export default function QuizReviewPage() {
  return (
    <div className="max-w-4xl">
      <PageHeader
        eyebrow="Answer review"
        title="Here's how each question went"
        description="Tap any question to see the full explanation."
        actions={
          <Link
            href="/app/quiz/results"
            className="rounded-full bg-foreground px-5 py-2 text-sm font-semibold text-background"
          >
            See summary →
          </Link>
        }
      />

      <div className="space-y-3">
        {review.map((q) => {
          const right = q.picked === q.correct;
          return (
            <div
              key={q.id}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                    right
                      ? "bg-success text-success-foreground"
                      : "bg-destructive text-destructive-foreground",
                  )}
                >
                  {right ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <X className="h-5 w-5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-semibold">Q{q.id}</span>
                    <span>·</span>
                    <span>{q.topic}</span>
                  </div>
                  <p className="mt-1 text-sm">{q.question}</p>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs">
                    <span className="rounded-full bg-secondary px-3 py-1">
                      You picked <strong className="ml-1">{q.picked}</strong>
                    </span>
                    <span className="rounded-full bg-success/15 px-3 py-1 text-success">
                      Correct <strong className="ml-1">{q.correct}</strong>
                    </span>
                  </div>
                </div>
                <button className="flex shrink-0 items-center gap-1 text-xs font-semibold text-accent">
                  <Sparkles className="h-3.5 w-3.5" /> Explain
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
