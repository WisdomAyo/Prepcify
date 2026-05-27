"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Bookmark, Flag, ChevronLeft, ChevronRight, Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/shells/page-header";
import { DataState } from "@/components/ui/data-state";
import { cn } from "@/lib/utils";
import {
  useQuestion,
  useRecordAttempt,
  useReportQuestion,
} from "@/features/practice/hooks";
import { ApiError } from "@/lib/api/types";

export default function PastQuestionDetailPage() {
  const params = useParams<{ exam: string; year: string; qid: string }>();
  const exam = params?.exam ?? "waec";
  const year = params?.year ?? "2024";
  const qid = params?.qid ?? "1";
  const id = Number(qid);

  const query = useQuestion(id);
  const recordAttempt = useRecordAttempt();
  const reportQuestion = useReportQuestion();

  const [picked, setPicked] = useState<number | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const startedAtRef = useRef<number>(Date.now());

  // Reset state when navigating to a different question.
  useEffect(() => {
    setPicked(null);
    setBookmarked(false);
    startedAtRef.current = Date.now();
  }, [id]);

  async function handlePick(optionId: number) {
    if (picked !== null) return; // one shot per question view
    setPicked(optionId);
    try {
      await recordAttempt.mutateAsync({
        question_id: id,
        attempt_type: "multiple_choice",
        selected_option_id: optionId,
        time_spent_ms: Date.now() - startedAtRef.current,
        context: "practice",
        client_uuid:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${id}-${Date.now()}`,
      });
    } catch (err) {
      // Backend not reachable or question doesn't exist — keep the visual
      // selection but don't pretend we persisted it.
      if (err instanceof ApiError && err.status !== 404) {
        toast.error("Couldn't record attempt", { description: err.message });
      }
    }
  }

  async function handleReport() {
    try {
      await reportQuestion.mutateAsync({ id, reason: "other" });
      toast.success("Report submitted", {
        description: "Thanks — our reviewers will take a look.",
      });
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error("Couldn't submit report", { description: err.message });
      }
    }
  }

  return (
    <div className="grid max-w-6xl gap-8 lg:grid-cols-[1fr_280px]">
      <div>
        <PageHeader
          crumbs={[
            { label: "Past Questions", href: "/app/past-questions" },
            { label: exam.toUpperCase(), href: `/app/past-questions/${exam}` },
            { label: year, href: `/app/past-questions/${exam}/${year}` },
            { label: `Q${qid}` },
          ]}
          eyebrow={
            query.data
              ? `${query.data.marks} mark${query.data.marks === 1 ? "" : "s"} · ${query.data.format}`
              : `Question ${qid}`
          }
          title={query.data?.topics[0]?.name ?? "Question"}
          actions={
            <>
              <button
                onClick={() => setBookmarked((b) => !b)}
                aria-pressed={bookmarked}
                className={cn(
                  "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  bookmarked
                    ? "bg-accent text-accent-foreground"
                    : "bg-secondary",
                )}
              >
                <Bookmark className="h-4 w-4" /> {bookmarked ? "Saved" : "Bookmark"}
              </button>
              <button
                onClick={handleReport}
                disabled={reportQuestion.isPending}
                className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-medium disabled:opacity-60"
              >
                <Flag className="h-4 w-4" />
                {reportQuestion.isPending ? "Sending…" : "Report"}
              </button>
            </>
          }
        />

        <DataState
          isLoading={query.isLoading}
          isError={query.isError}
          error={query.error}
          onRetry={() => void query.refetch()}
        >
          {query.data && (
            <article className="rounded-3xl border border-border bg-card p-8 shadow-soft">
              <div className="whitespace-pre-wrap text-base leading-relaxed">
                {query.data.stem}
              </div>

              {query.data.options.length > 0 && (
                <div className="mt-8 space-y-3">
                  {query.data.options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handlePick(option.id)}
                      disabled={picked !== null}
                      className={cn(
                        "flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all",
                        picked === option.id
                          ? "border-accent bg-accent/5"
                          : "border-border bg-card hover:border-foreground/30",
                        picked !== null && picked !== option.id && "opacity-60",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold",
                          picked === option.id
                            ? "bg-accent text-accent-foreground"
                            : "bg-secondary",
                        )}
                      >
                        {option.label}
                      </span>
                      <span className="text-sm">{option.body}</span>
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
                <Link
                  href={`/app/past-questions/${exam}/${year}/${Math.max(1, id - 1)}`}
                  className="flex items-center gap-2 rounded-full bg-secondary px-5 py-2.5 text-sm font-medium"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Link>
                <Link
                  href={`/app/past-questions/${exam}/${year}/${qid}/explanation`}
                  className="flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background"
                >
                  Show explanation <Sparkles className="h-4 w-4 text-accent" />
                </Link>
                <Link
                  href={`/app/past-questions/${exam}/${year}/${id + 1}`}
                  className="flex items-center gap-2 rounded-full bg-secondary px-5 py-2.5 text-sm font-medium"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          )}
        </DataState>
      </div>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Navigator
          </p>
          <div className="mt-3 grid grid-cols-6 gap-1.5">
            {Array.from({ length: 30 }, (_, i) => (
              <Link
                key={i}
                href={`/app/past-questions/${exam}/${year}/${i + 1}`}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition-colors",
                  i + 1 === id
                    ? "bg-foreground text-background"
                    : "bg-secondary hover:bg-secondary/70",
                )}
              >
                {i + 1}
              </Link>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-foreground p-5 text-background">
          <Sparkles className="h-5 w-5 text-accent" />
          <p className="mt-3 font-display text-base font-bold leading-tight">
            Stuck on this one?
          </p>
          <p className="mt-1 text-xs text-background/70">
            prepcify AI can walk you through the solution step-by-step.
          </p>
          <Link
            href={`/app/past-questions/${exam}/${year}/${qid}/explanation`}
            className="mt-3 block w-full rounded-full bg-accent py-2 text-center text-xs font-semibold text-accent-foreground"
          >
            Stream explanation
          </Link>
        </div>
      </aside>
    </div>
  );
}
