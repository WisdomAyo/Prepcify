"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Clock, Flag, ChevronLeft, ChevronRight, Grid3x3 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  examDurationSeconds,
  examQuestionTotal,
  sampleExamQuestions,
} from "@/features/practice/practice-data";
import { formatTimer } from "@/features/practice/practice-utils";

export default function ExamSimulationPage() {
  const router = useRouter();
  const [time, setTime] = useState(examDurationSeconds);
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({ 0: 0, 2: 1, 3: 2, 5: 0, 7: 3 });
  const [flagged, setFlagged] = useState<Set<number>>(new Set([4, 11]));
  const [showNav, setShowNav] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTime((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const q = sampleExamQuestions[i % sampleExamQuestions.length];
  const lowTime = time < 5 * 60;

  const pick = (idx: number) => setAnswers((a) => ({ ...a, [i]: idx }));
  const toggleFlag = () =>
    setFlagged((s) => {
      const n = new Set(s);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-card/90 px-5 py-3 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              JAMB Mock · Section A
            </p>
            <p className="text-sm font-semibold">
              Question {i + 1} of {examQuestionTotal}
            </p>
          </div>
          <div
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold tabular-nums",
              lowTime
                ? "bg-destructive/10 text-destructive"
                : "bg-secondary text-foreground",
            )}
          >
            <Clock className="h-4 w-4" /> {formatTimer(time)}
          </div>
        </div>
        <div className="mt-3 flex h-1 gap-0.5">
          {Array.from({ length: examQuestionTotal }).map((_, idx) => (
            <div
              key={idx}
              className={cn(
                "flex-1 rounded-full",
                idx === i
                  ? "bg-foreground"
                  : answers[idx] != null
                    ? "bg-foreground/35"
                    : "bg-secondary",
              )}
            />
          ))}
        </div>
      </header>

      <div className="flex flex-1 flex-col px-6 pt-7">
        <h2
          key={i}
          className="animate-slide-up font-display text-[22px] font-bold leading-snug text-balance"
        >
          {q.question}
        </h2>

        <div className="mt-6 space-y-2.5">
          {q.options.map((opt, idx) => {
            const picked = answers[i] === idx;
            return (
              <button
                key={idx}
                onClick={() => pick(idx)}
                className={cn(
                  "flex w-full items-center gap-4 rounded-2xl border bg-card p-4 text-left tap transition-colors",
                  picked
                    ? "border-foreground bg-secondary/50"
                    : "border-border hover:border-foreground/30",
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border text-sm font-bold transition-colors",
                    picked
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-muted-foreground",
                  )}
                >
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="text-[15px] font-medium">{opt}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-auto space-y-3 pb-6 pt-6">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={toggleFlag}
            >
              <Flag
                className={cn(
                  "h-4 w-4",
                  flagged.has(i) && "fill-accent text-accent",
                )}
              />
              {flagged.has(i) ? "Flagged" : "Flag"}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={() => setShowNav(true)}
            >
              <Grid3x3 className="h-4 w-4" /> Navigate
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="lg"
              className="flex-1"
              disabled={i === 0}
              onClick={() => setI(i - 1)}
            >
              <ChevronLeft /> Prev
            </Button>
            <Button
              size="lg"
              className="flex-1"
              onClick={() =>
                i + 1 < examQuestionTotal ? setI(i + 1) : router.push("/app/exam/results")
              }
            >
              {i + 1 < examQuestionTotal ? "Next" : "Submit"} <ChevronRight />
            </Button>
          </div>
        </div>
      </div>

      {showNav && (
        <div
          className="fixed inset-0 z-40 flex animate-fade-in items-end justify-center bg-foreground/40"
          onClick={() => setShowNav(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[420px] animate-slide-up rounded-t-[32px] bg-card p-6"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold">
                Question navigator
              </h3>
              <p className="text-xs text-muted-foreground">
                {Object.keys(answers).length}/{examQuestionTotal} answered
              </p>
            </div>
            <div className="mt-4 grid grid-cols-8 gap-2">
              {Array.from({ length: examQuestionTotal }).map((_, idx) => {
                const ans = answers[idx] != null;
                const fl = flagged.has(idx);
                const cur = idx === i;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setI(idx);
                      setShowNav(false);
                    }}
                    className={cn(
                      "relative aspect-square rounded-xl text-xs font-bold tap transition-colors",
                      cur && "ring-2 ring-foreground",
                      ans
                        ? "bg-foreground text-background"
                        : "bg-secondary text-foreground",
                      fl && "bg-accent text-accent-foreground",
                    )}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            <div className="mt-5 flex items-center gap-4 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-foreground" />{" "}
                Answered
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm border border-border bg-secondary" />{" "}
                Unanswered
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-accent" /> Flagged
              </span>
            </div>
            <Button
              size="lg"
              className="mt-5 w-full"
              onClick={() => setShowNav(false)}
            >
              Resume exam
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
