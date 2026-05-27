"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Check, Sparkles, ChevronLeft, BookOpen, RefreshCw,
} from "lucide-react";
import { PageHeader } from "@/components/shells/page-header";
import { Button } from "@/components/ui/button";
import { tutorApi } from "@/lib/api/tutor";
import { ApiError } from "@/lib/api/types";

/**
 * Streaming AI explanation page.
 *
 * Calls `GET /api/v1/questions/{id}/explanation` (SSE) the first time the
 * page mounts and renders chunks as they arrive — typewriter feel. The
 * stream can be re-run, and is aborted on unmount or re-trigger.
 */
export default function PastQuestionExplanationPage() {
  const params = useParams<{ exam: string; year: string; qid: string }>();
  const exam = params?.exam ?? "waec";
  const year = params?.year ?? "2024";
  const qid = params?.qid ?? "1";
  const questionId = Number(qid);

  const [content, setContent] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  async function stream() {
    if (streaming) return;
    abortRef.current?.abort();
    setContent("");
    setError(null);
    setStreaming(true);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      await tutorApi.explainQuestion(
        questionId,
        (chunk) => setContent((c) => c + chunk),
        controller.signal,
      );
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      if (err instanceof ApiError) {
        if (err.status === 503) {
          setError("AI is briefly unavailable — try again in a minute.");
        } else if (err.status === 429) {
          setError("You've hit the explanation limit — try again shortly.");
        } else if (err.status === 404) {
          setError("This question doesn't exist on the backend yet.");
        } else {
          setError(err.message);
        }
      } else {
        setError("Could not load the AI explanation.");
        toast.error("Explanation failed");
      }
    } finally {
      setStreaming(false);
    }
  }

  // Trigger once on mount; clean up on unmount / qid change.
  useEffect(() => {
    void stream();
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId]);

  return (
    <div className="max-w-4xl">
      <PageHeader
        crumbs={[
          { label: "Past Questions", href: "/app/past-questions" },
          { label: exam.toUpperCase(), href: `/app/past-questions/${exam}` },
          { label: year, href: `/app/past-questions/${exam}/${year}` },
          { label: `Q${qid}`, href: `/app/past-questions/${exam}/${year}/${qid}` },
          { label: "Explanation" },
        ]}
        eyebrow="AI explanation"
        title="Worked solution"
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={stream}
              isLoading={streaming}
              loadingText="Streaming"
              leftIcon={<RefreshCw />}
            >
              Regenerate
            </Button>
            <Link
              href={`/app/past-questions/${exam}/${year}/${qid}`}
              className="flex items-center gap-2 rounded-full bg-secondary px-5 py-2 text-sm font-medium"
            >
              <ChevronLeft className="h-4 w-4" /> Back to question
            </Link>
          </>
        }
      />

      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-success/20 bg-success/10 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success text-success-foreground">
          <Check className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold text-success">
            prepcify AI — step-by-step
          </p>
          <p className="text-xs text-muted-foreground">
            Streamed live from `/questions/{qid}/explanation`. Backed by Claude
            with a 5-failure / 60-second circuit breaker.
          </p>
        </div>
      </div>

      <article
        className="rounded-3xl border border-border bg-card p-8 shadow-soft"
        aria-live="polite"
      >
        {!content && !error && streaming && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:120ms]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:240ms]" />
            Thinking…
          </div>
        )}
        {content && (
          <div className="prose prose-sm max-w-none whitespace-pre-wrap text-foreground">
            {content}
            {streaming && (
              <span className="ml-0.5 inline-block h-4 w-px animate-pulse bg-current align-middle" />
            )}
          </div>
        )}
        {error && (
          <div
            role="alert"
            className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive"
          >
            {error}
          </div>
        )}
      </article>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <Link
          href="/app/tutor"
          className="flex items-center gap-4 rounded-2xl bg-foreground p-5 text-background transition-colors hover:bg-foreground/90"
        >
          <Sparkles className="h-5 w-5 text-accent" />
          <div className="flex-1">
            <p className="font-semibold">Ask prepcify AI a follow-up</p>
            <p className="text-xs text-background/70">
              &ldquo;Why did we split the middle term?&rdquo;
            </p>
          </div>
        </Link>
        <Link
          href="/app/subjects"
          className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:bg-secondary/30"
        >
          <BookOpen className="h-5 w-5 text-accent" />
          <div className="flex-1">
            <p className="font-semibold">Practice more questions</p>
            <p className="text-xs text-muted-foreground">
              Similar topics across your subjects
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
