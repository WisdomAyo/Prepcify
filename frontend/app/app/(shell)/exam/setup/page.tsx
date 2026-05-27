"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Clock, ShieldCheck, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/shells/page-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { useStartMockExam } from "@/features/practice/hooks";
import { useExamBodies } from "@/features/exams/hooks";
import { ApiError } from "@/lib/api/types";

const durations = [60, 90, 120, 180];

export default function ExamSetupPage() {
  const router = useRouter();
  const { context } = useAuth();
  const examBodiesQuery = useExamBodies();
  const startMockExam = useStartMockExam();

  // Default selection: the user's first chosen exam body from onboarding,
  // falling back to whatever the catalog returns first.
  const userExamId = context?.exam_body_ids?.[0];
  const [examId, setExamId] = useState<number | null>(userExamId ?? null);
  const [duration, setDuration] = useState(120);

  async function start() {
    const subjectIds = context?.subject_ids ?? [];
    if (!examId) {
      toast.error("Pick an exam body");
      return;
    }
    if (subjectIds.length === 0) {
      toast.error("Add subjects first", {
        description: "Finish onboarding to set your subjects.",
      });
      return;
    }
    try {
      const exam = await startMockExam.mutateAsync({
        exam_body_id: examId,
        subject_ids: subjectIds,
      });
      router.push(`/app/exam?examId=${exam.id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error("Couldn't start mock exam", { description: err.message });
      } else {
        toast.error("Couldn't start mock exam");
      }
    }
  }

  const exams = examBodiesQuery.data ?? [];
  const fallbackExams = exams.length === 0
    ? [{ id: -1, name: "JAMB UTME", code: "jamb" }, { id: -2, name: "WAEC SSCE", code: "waec" }]
    : exams.slice(0, 4);

  return (
    <div className="max-w-4xl">
      <PageHeader
        eyebrow="Mock exam"
        title="Configure your simulation"
        description="Real timing, real navigator, real pressure. Just like the actual CBT."
      />

      <div className="space-y-8 rounded-3xl border border-border bg-card p-6 lg:p-8">
        <div>
          <p className="text-sm font-semibold">Exam body</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {fallbackExams.map((e) => (
              <button
                key={e.id}
                onClick={() => setExamId(e.id)}
                className={cn(
                  "rounded-2xl border-2 p-4 text-left transition-colors",
                  examId === e.id
                    ? "border-foreground bg-secondary/40"
                    : "border-border",
                )}
              >
                <p className="font-semibold">{e.name}</p>
                <p className="text-xs text-muted-foreground">
                  Full subject mix · 60–180 min
                </p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold">Duration</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {durations.map((d) => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className={cn(
                  "flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold transition-colors",
                  duration === d
                    ? "bg-foreground text-background"
                    : "bg-secondary",
                )}
              >
                <Clock className="h-4 w-4" /> {d} min
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-accent/20 bg-accent/10 p-5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-accent" />
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">
              Exam rules
            </p>
          </div>
          <ul className="mt-3 space-y-1.5 text-sm">
            <li>• You cannot pause once started.</li>
            <li>• Auto-submit at time-up. Make sure your network is stable.</li>
            <li>• Use the navigator to flag and revisit questions.</li>
          </ul>
        </div>

        <div className="flex justify-end border-t border-border pt-6">
          <Button
            size="lg"
            onClick={start}
            isLoading={startMockExam.isPending}
            loadingText="Starting"
            disabled={!examId || examId < 0}
            rightIcon={<ArrowRight />}
          >
            I&apos;m ready · Start
          </Button>
        </div>
      </div>
    </div>
  );
}
