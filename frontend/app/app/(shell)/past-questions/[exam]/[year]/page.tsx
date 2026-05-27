"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Bookmark, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/shells/page-header";
import { DataState } from "@/components/ui/data-state";
import { difficultyBadgeClass } from "@/lib/ui-constants";
import { cn } from "@/lib/utils";
import { useQuestions } from "@/features/practice/hooks";

const difficulties = ["All", "Easy", "Medium", "Hard"];

export default function PastQuestionsListPage() {
  const params = useParams<{ exam: string; year: string }>();
  const exam = params?.exam ?? "waec";
  const year = params?.year ?? "2024";
  const [filter, setFilter] = useState("All");

  const query = useQuestions({ year: Number(year) || undefined });

  const filtered = useMemo(() => {
    const items = query.data?.data ?? [];
    if (filter === "All") return items;
    // The backend doesn't expose difficulty yet — best-effort tag lookup.
    return items.filter((q) =>
      q.tags.some((t) => t.toLowerCase() === filter.toLowerCase()),
    );
  }, [query.data, filter]);

  return (
    <div className="max-w-5xl">
      <PageHeader
        crumbs={[
          { label: "Past Questions", href: "/app/past-questions" },
          { label: exam.toUpperCase(), href: `/app/past-questions/${exam}` },
          { label: year },
        ]}
        eyebrow={`${exam.toUpperCase()} · ${year}`}
        title={
          query.data?.data
            ? `${query.data.data.length} questions`
            : "Past questions"
        }
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
                filter === d
                  ? "bg-foreground text-background"
                  : "bg-secondary text-foreground",
              )}
            >
              {d}
            </button>
          ))}
        </div>
        {(() => {
          const first = query.data?.data?.[0];
          return first ? (
            <Link
              href={`/app/past-questions/${exam}/${year}/${first.id}`}
              className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground"
            >
              Start full paper →
            </Link>
          ) : null;
        })()}
      </div>

      <DataState
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        isEmpty={filtered.length === 0 && !query.isLoading}
        onRetry={() => void query.refetch()}
      >
        <div className="overflow-hidden rounded-3xl border border-border bg-card">
          <div className="grid grid-cols-[60px_1fr_120px_80px_60px] gap-4 border-b border-border bg-secondary/40 px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <span>#</span>
            <span>Question</span>
            <span>Topic</span>
            <span>Marks</span>
            <span></span>
          </div>
          {filtered.map((q, idx) => {
            const topic = q.topics[0]?.name ?? "—";
            const difficulty = q.tags.find((t) =>
              ["Easy", "Medium", "Hard"].includes(t),
            );
            return (
              <Link
                key={q.id}
                href={`/app/past-questions/${exam}/${year}/${q.id}`}
                className="grid grid-cols-[60px_1fr_120px_80px_60px] items-center gap-4 border-b border-border px-6 py-4 transition-colors last:border-0 hover:bg-secondary/30"
              >
                <span className="font-display text-lg font-bold">{idx + 1}</span>
                <div className="min-w-0">
                  <p className="truncate text-sm">{q.stem}</p>
                  {difficulty && (
                    <span
                      className={cn(
                        "mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold",
                        difficultyBadgeClass[difficulty],
                      )}
                    >
                      {difficulty}
                    </span>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">{topic}</span>
                <span className="text-sm font-semibold">{q.marks} mk</span>
                <div className="flex items-center justify-end gap-1 text-muted-foreground">
                  <Bookmark className="h-4 w-4" />
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </DataState>
    </div>
  );
}
