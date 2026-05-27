"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ArrowRight, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ExamPill } from "@/components/onboarding/exam-pill";
import { StudyDurationPills } from "@/components/onboarding/study-duration-pills";
import { useOnboardingStore } from "@/stores/onboarding";
import { useExamBodies } from "@/features/exams/hooks";
import { onboardingApi } from "@/lib/api/onboarding";
import { ApiError } from "@/lib/api/types";
import { useAuth } from "@/contexts/auth-context";
import { fadeUp, opacityFade, useMotionPreference } from "@/lib/motion";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Suggestion-chip math                                                      */
/* -------------------------------------------------------------------------- */

/** Next occurrence of (month, day) — bumped to next year if it's already passed. */
function nextOccurrence(month: number, day = 1): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const candidate = new Date(today.getFullYear(), month, day);
  if (candidate <= today) candidate.setFullYear(today.getFullYear() + 1);
  return candidate;
}

const EXAM_SUGGESTIONS: Record<string, { label: string; date: () => Date }> = {
  jamb: { label: "Next JAMB", date: () => nextOccurrence(3) }, // April
  waec: { label: "Next WAEC", date: () => nextOccurrence(4) }, // May
  neco: { label: "Next NECO", date: () => nextOccurrence(5) }, // June
  ican: { label: "Next diet", date: () => nextOccurrence(10) }, // November
  acca: { label: "Next sitting", date: () => nextOccurrence(8) }, // September
  // IELTS-style exams: no fixed season, always "Custom date".
};

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function TimelinePage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const { reduced } = useMotionPreference();
  const headVariants = reduced ? opacityFade : fadeUp;

  const persona = useOnboardingStore((s) => s.persona);
  const examIds = useOnboardingStore((s) => s.exams);
  const examDate = useOnboardingStore((s) => s.examDate);
  const dailyMinutes = useOnboardingStore((s) => s.dailyMinutes);
  const subjects = useOnboardingStore((s) => s.subjects);
  const setExamDate = useOnboardingStore((s) => s.setExamDate);
  const setDailyMinutes = useOnboardingStore((s) => s.setDailyMinutes);

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const bodiesQuery = useExamBodies();
  const selectedExamCodes = useMemo(() => {
    if (!bodiesQuery.data) return [];
    return bodiesQuery.data
      .filter((b) => examIds.includes(b.id))
      .map((b) => b.code.toLowerCase());
  }, [bodiesQuery.data, examIds]);

  // Default daily minutes to 45 once on mount if not yet picked.
  useEffect(() => {
    if (dailyMinutes === null) setDailyMinutes(45);
  }, [dailyMinutes, setDailyMinutes]);

  // Defensive bounce.
  useEffect(() => {
    if (!persona) router.replace("/onboarding/persona");
    else if (persona !== "parent" && examIds.length === 0) router.replace("/onboarding/exam");
  }, [persona, examIds.length, router]);

  const minDate = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 1); // backend requires after:today
    return d;
  }, []);

  const suggestionChips = useMemo(() => {
    const chips: Array<{ key: string; label: string; date: Date | null }> = [];
    for (const code of selectedExamCodes) {
      const s = EXAM_SUGGESTIONS[code];
      if (!s) continue;
      const date = s.date();
      chips.push({
        key: code,
        label: `${s.label} (${format(date, "MMMM yyyy")})`,
        date,
      });
    }
    chips.push({ key: "custom", label: "Custom date", date: null });
    return chips;
  }, [selectedExamCodes]);

  const selectedDate = examDate ? new Date(examDate) : undefined;
  const canSubmit = Boolean(examDate) && dailyMinutes !== null;

  async function finalize() {
    if (!canSubmit || !examDate || examIds.length === 0) return;
    setSubmitting(true);
    setSubmitError(null);

    // ─────────────────────────────────────────────────────────────────────
    //  TODO(backend): once `POST /onboarding/complete` accepts the full
    //  payload, replace these calls with a single composite call. For now
    //  we fan exam-targets and subjects out in parallel — they're
    //  independent on the backend — then complete() once both resolve.
    //  That cuts the total wait from 3 × RTT to ~2 × RTT (~33% saving).
    // ─────────────────────────────────────────────────────────────────────
    try {
      const selections = Object.entries(subjects).flatMap(
        ([examBodyIdStr, subjectIds]) =>
          subjectIds.map((subject_id) => ({
            exam_body_id: Number(examBodyIdStr),
            subject_id,
          })),
      );

      await Promise.all([
        onboardingApi.setExamTargets({
          exam_body_ids: examIds,
          target_date: examDate,
        }),
        onboardingApi.setSubjects(selections),
      ]);
      await onboardingApi.complete();
      await refresh();

      router.replace("/onboarding/celebration");
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : "We couldn't finish setting up your plan. Please try again.";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-14">
      <motion.header variants={headVariants} initial="hidden" animate="visible">
        <p className="font-mono text-[13px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Step 5 of 5
        </p>
        <h1 className="mt-3 text-balance font-display text-5xl font-medium leading-[1.06] tracking-tight">
          When&apos;s your exam?
        </h1>
      </motion.header>

      {/* Date picker card */}
      <section>
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                "flex w-full items-center justify-between gap-4 rounded-2xl",
                "border border-border bg-card p-6 text-left transition-colors",
                "hover:border-foreground/60",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              )}
            >
              <span className="flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-quiet">
                  <CalendarIcon className="h-5 w-5 text-accent" />
                </span>
                <span>
                  <span className="block font-mono text-[12px] uppercase tracking-wider text-muted-foreground">
                    Target date
                  </span>
                  <span className="mt-1 block font-display text-xl font-semibold">
                    {selectedDate
                      ? format(selectedDate, "EEEE, d MMMM yyyy")
                      : "Pick a date"}
                  </span>
                </span>
              </span>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(d) => {
                if (!d) return;
                setExamDate(format(d, "yyyy-MM-dd"));
                setCalendarOpen(false);
              }}
              disabled={{ before: minDate }}
              defaultMonth={selectedDate ?? minDate}
            />
          </PopoverContent>
        </Popover>

        {/* Suggestion chips */}
        <div className="mt-6 flex flex-wrap gap-2.5">
          {suggestionChips.map((chip) => {
            const isCustom = chip.key === "custom";
            const chipDateIso = chip.date ? format(chip.date, "yyyy-MM-dd") : null;
            const selected = !isCustom && chipDateIso === examDate;
            return (
              <ExamPill
                key={chip.key}
                label={chip.label}
                selected={selected}
                onSelect={() => {
                  if (isCustom) {
                    setExamDate(null);
                    setCalendarOpen(true);
                  } else if (chipDateIso) {
                    setExamDate(chipDateIso);
                  }
                }}
              />
            );
          })}
        </div>
      </section>

      {/* Daily minutes */}
      <section>
        <p className="font-mono text-[13px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          And how long will you study each day?
        </p>
        <div className="mt-5">
          <StudyDurationPills value={dailyMinutes} onChange={setDailyMinutes} />
        </div>
      </section>

      {/* Submit */}
      <div className="space-y-3">
        {submitError && (
          <div
            role="alert"
            className="flex items-start justify-between gap-4 rounded-2xl border border-destructive/30 bg-accent-quiet/60 px-5 py-4 text-sm"
          >
            <span className="text-foreground">{submitError}</span>
            <button
              type="button"
              onClick={() => void finalize()}
              className="font-semibold text-accent underline-offset-4 hover:underline"
            >
              Retry
            </button>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            variant="accent"
            size="lg"
            disabled={!canSubmit || submitting}
            isLoading={submitting}
            loadingText="Setting up…"
            onClick={() => void finalize()}
            rightIcon={<ArrowRight />}
            className="w-full sm:w-auto"
          >
            Set up my plan
          </Button>
        </div>
      </div>
    </div>
  );
}
