"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, ArrowRight, Calendar, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarProgress } from "@/components/ui/progress";
import { DataState } from "@/components/ui/data-state";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { useExamBodies, useExamSubjects } from "@/features/exams/hooks";
import { onboardingApi } from "@/lib/api/onboarding";
import { ApiError } from "@/lib/api/types";
import type { ExamBody, ExamSubject } from "@/lib/api/exams";

/**
 * Real four-step onboarding wizard.
 *
 * 1. Pick an exam body (live `/exams` catalog).
 * 2. Pick a target date (must be after today; required by Laravel).
 * 3. Pick subjects under that exam (live `/exams/{code}/subjects`).
 * 4. Confirm + submit — calls `setExamTargets`, `setSubjects`, `complete`
 *    in sequence, then refreshes the auth context so `RouteGuard` lets the
 *    student into `/app`.
 */
export function OnboardingFlow() {
  const router = useRouter();
  const { refresh } = useAuth();
  const examsQuery = useExamBodies();

  const [step, setStep] = useState(0);
  const [exam, setExam] = useState<ExamBody | null>(null);
  const [targetDate, setTargetDate] = useState<string>("");
  const [subjectIds, setSubjectIds] = useState<Set<number>>(new Set());
  const [submitting, setSubmitting] = useState(false);

  const subjectsQuery = useExamSubjects(exam?.code ?? null);

  const minDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1); // backend rule: after:today
    return d.toISOString().slice(0, 10);
  }, []);

  const steps = ["Your exam", "Target date", "Your subjects", "All set"];
  const canAdvance =
    (step === 0 && !!exam) ||
    (step === 1 && !!targetDate && targetDate >= minDate) ||
    (step === 2 && subjectIds.size > 0) ||
    step === 3;

  function toggleSubject(id: number) {
    setSubjectIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function finish() {
    if (!exam || !targetDate || subjectIds.size === 0) return;
    setSubmitting(true);
    try {
      await onboardingApi.setExamTargets({
        exam_body_ids: [exam.id],
        target_date: targetDate,
      });
      await onboardingApi.setSubjects(
        Array.from(subjectIds).map((subject_id) => ({
          exam_body_id: exam.id,
          subject_id,
        })),
      );
      await onboardingApi.complete();
      await refresh();
      toast.success("You're all set!", { description: "Welcome to prepcify." });
      router.replace("/app");
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Could not finish onboarding. Please try again.";
      toast.error("Onboarding failed", { description: message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col px-6 py-10">
      <header className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-foreground text-background">
          <GraduationCap className="h-5 w-5 text-accent" />
        </div>
        <span className="font-display text-lg font-medium tracking-tight">
          prepcify<span className="text-accent">.</span>
        </span>
      </header>

      <div className="mt-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Step {step + 1} of {steps.length} · {steps[step]}
        </p>
        <BarProgress
          value={((step + 1) / steps.length) * 100}
          className="mt-2"
          label="Onboarding progress"
        />
      </div>

      <main id="main-content" className="mt-10 flex-1">
        {step === 0 && (
          <ExamStep query={examsQuery} selected={exam} onSelect={setExam} />
        )}

        {step === 1 && (
          <DateStep
            targetDate={targetDate}
            minDate={minDate}
            onChange={setTargetDate}
          />
        )}

        {step === 2 && exam && (
          <SubjectsStep
            exam={exam}
            query={subjectsQuery}
            selectedIds={subjectIds}
            onToggle={toggleSubject}
          />
        )}

        {step === 3 && exam && (
          <ConfirmStep
            exam={exam}
            targetDate={targetDate}
            subjectCount={subjectIds.size}
          />
        )}
      </main>

      <footer className="mt-8 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0 || submitting}
        >
          Back
        </Button>
        {step < steps.length - 1 ? (
          <Button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canAdvance}
            rightIcon={<ArrowRight />}
          >
            Continue
          </Button>
        ) : (
          <Button
            onClick={finish}
            isLoading={submitting}
            loadingText="Finishing"
            rightIcon={<ArrowRight />}
          >
            Enter prepcify
          </Button>
        )}
      </footer>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Step components                                                           */
/* -------------------------------------------------------------------------- */

function ExamStep({
  query,
  selected,
  onSelect,
}: {
  query: ReturnType<typeof useExamBodies>;
  selected: ExamBody | null;
  onSelect: (e: ExamBody) => void;
}) {
  return (
    <section className="animate-fade-in">
      <h1 className="text-balance font-display text-3xl font-medium leading-[1.06] tracking-tight">
        Which exam are you preparing for?
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        We&apos;ll tailor your daily plan around it.
      </p>
      <DataState
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        isEmpty={query.data?.length === 0}
        onRetry={() => void query.refetch()}
      >
        <div className="mt-6 grid grid-cols-2 gap-3">
          {query.data?.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => onSelect(e)}
              aria-pressed={selected?.id === e.id}
              className={cn(
                "rounded-2xl border p-4 text-left transition-all tap",
                selected?.id === e.id
                  ? "border-accent bg-accent/5 ring-2 ring-accent/20"
                  : "border-border hover:border-accent/40",
              )}
            >
              <p className="text-sm font-semibold">{e.name}</p>
              {e.description && (
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  {e.description}
                </p>
              )}
            </button>
          ))}
        </div>
      </DataState>
    </section>
  );
}

function DateStep({
  targetDate,
  minDate,
  onChange,
}: {
  targetDate: string;
  minDate: string;
  onChange: (v: string) => void;
}) {
  return (
    <section className="animate-fade-in">
      <h1 className="text-balance font-display text-3xl font-medium leading-[1.06] tracking-tight">
        When&apos;s your exam?
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        We&apos;ll pace your daily study plan to land you ready by then.
      </p>
      <label className="mt-6 flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
        <Calendar className="h-5 w-5 text-accent" />
        <input
          type="date"
          min={minDate}
          value={targetDate}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Target exam date"
          className="flex-1 bg-transparent text-sm outline-none"
        />
      </label>
      <p className="mt-2 text-xs text-muted-foreground">
        Pick any date after today.
      </p>
    </section>
  );
}

function SubjectsStep({
  exam,
  query,
  selectedIds,
  onToggle,
}: {
  exam: ExamBody;
  query: ReturnType<typeof useExamSubjects>;
  selectedIds: Set<number>;
  onToggle: (id: number) => void;
}) {
  return (
    <section className="animate-fade-in">
      <h1 className="text-balance font-display text-3xl font-medium leading-[1.06] tracking-tight">
        Pick your {exam.name} subjects.
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Choose all the subjects you&apos;re sitting. You can change these later.
      </p>
      <DataState
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        isEmpty={query.data?.length === 0}
        onRetry={() => void query.refetch()}
      >
        <div className="mt-6 flex flex-wrap gap-2">
          {query.data?.map((s: ExamSubject) => {
            const active = selectedIds.has(s.subject_id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onToggle(s.subject_id)}
                aria-pressed={active}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all tap",
                  active
                    ? "border-foreground bg-foreground text-background"
                    : "border-border hover:border-foreground/40",
                )}
              >
                {active && <Check className="h-3.5 w-3.5" />}
                {s.name}
                {s.is_compulsory && (
                  <span className="ml-1 rounded-full bg-accent/15 px-1.5 text-[10px] font-semibold text-accent">
                    required
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </DataState>
    </section>
  );
}

function ConfirmStep({
  exam,
  targetDate,
  subjectCount,
}: {
  exam: ExamBody;
  targetDate: string;
  subjectCount: number;
}) {
  return (
    <section className="animate-fade-in text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-success/10 text-success">
        <Check className="h-8 w-8" />
      </div>
      <h1 className="mt-6 text-balance font-display text-3xl font-medium leading-[1.06] tracking-tight">
        You&apos;re ready, {exam.name} candidate.
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {subjectCount} subject{subjectCount === 1 ? "" : "s"} selected, target{" "}
        {targetDate}. Your first study plan is waiting.
      </p>
    </section>
  );
}
