import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import { Bookmark, Flag, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { cn } from "@/lib/utils";

const difficulties = ["All", "Easy", "Medium", "Hard"];

const questions = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  topic: ["Algebra", "Geometry", "Calculus", "Statistics", "Trigonometry"][i % 5],
  difficulty: ["Easy", "Medium", "Hard"][i % 3] as "Easy" | "Medium" | "Hard",
  preview: `Find the value of x in the equation 2x² + ${i + 3}x − ${i + 5} = 0. Show your working clearly.`,
  marks: [1, 2, 3, 5][i % 4],
}));

const diffColor = {
  Easy: "bg-success/15 text-success",
  Medium: "bg-accent/15 text-accent",
  Hard: "bg-destructive/15 text-destructive",
};

export default function PastQuestionsList() {
  const { exam = "waec", year = "2024" } = useParams();
  const [filter, setFilter] = useState("All");

  const filtered = filter === "All" ? questions : questions.filter((q) => q.difficulty === filter);

  return (
    <div className="max-w-5xl">
      <PageHeader
        crumbs={[
          { label: "Past Questions", to: "/app/past-questions" },
          { label: exam.toUpperCase(), to: `/app/past-questions/${exam}` },
          { label: year },
        ]}
        eyebrow={`${exam.toUpperCase()} · Mathematics · ${year}`}
        title="60 questions · 2h 30m"
        description="Tap any question to view it in detail. Bookmark or flag what you want to revisit."
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {difficulties.map((d) => (
            <button
              key={d}
              onClick={() => setFilter(d)}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-semibold transition-colors",
                filter === d ? "bg-foreground text-background" : "bg-secondary text-foreground"
              )}
            >
              {d}
            </button>
          ))}
        </div>
        <Link
          to={`/app/past-questions/${exam}/${year}/1`}
          className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground"
        >
          Start full paper →
        </Link>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border bg-card">
        <div className="grid grid-cols-[60px_1fr_120px_80px_60px] gap-4 border-b border-border bg-secondary/40 px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          <span>#</span>
          <span>Question</span>
          <span>Topic</span>
          <span>Marks</span>
          <span></span>
        </div>
        {filtered.map((q) => (
          <Link
            key={q.id}
            to={`/app/past-questions/${exam}/${year}/${q.id}`}
            className="grid grid-cols-[60px_1fr_120px_80px_60px] items-center gap-4 border-b border-border px-6 py-4 last:border-0 transition-colors hover:bg-secondary/30"
          >
            <span className="font-display text-lg font-bold">{q.id}</span>
            <div className="min-w-0">
              <p className="truncate text-sm">{q.preview}</p>
              <span className={cn("mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold", diffColor[q.difficulty])}>
                {q.difficulty}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">{q.topic}</span>
            <span className="text-sm font-semibold">{q.marks} mk</span>
            <div className="flex items-center justify-end gap-1 text-muted-foreground">
              <Bookmark className="h-4 w-4" />
              <ArrowRight className="h-4 w-4" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
