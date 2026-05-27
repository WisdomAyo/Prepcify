"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BarProgress } from "@/components/ui/progress";
import { X, Clock, Check, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { quizQuestions } from "@/features/practice/practice-data";

export default function QuizPage() {
  const router = useRouter();
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const q = quizQuestions[i];
  const isLast = i === quizQuestions.length - 1;
  const correct = picked === q.correct;

  const handlePick = (idx: number) => {
    if (revealed) return;
    setPicked(idx);
    setRevealed(true);
  };

  const next = () => {
    if (isLast) {
      router.push("/app/quiz/results");
      return;
    }
    setI(i + 1);
    setPicked(null);
    setRevealed(false);
  };

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <div className="flex items-center gap-3 px-5 pt-6">
        <button
          onClick={() => router.back()}
          aria-label="Close quiz"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary tap"
        >
          <X className="h-[18px] w-[18px]" />
        </button>
        <div className="flex-1">
          <BarProgress
            value={((i + (revealed ? 1 : 0)) / quizQuestions.length) * 100}
            indicatorClassName="bg-foreground"
            label="Quiz progress"
          />
        </div>
        <div className="chip bg-secondary text-foreground">
          <Clock className="h-3.5 w-3.5" /> 00:42
        </div>
      </div>

      <div className="flex flex-1 flex-col px-6 pt-8">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Question {i + 1} of {quizQuestions.length}
        </p>
        <h2
          key={i}
          className="mt-3 animate-slide-up font-display text-[26px] font-bold leading-[1.15] text-balance"
        >
          {q.question}
        </h2>

        <div className="mt-7 space-y-3">
          {q.options.map((opt, idx) => {
            const isPicked = picked === idx;
            const isCorrect = idx === q.correct;
            const showState = revealed && (isPicked || isCorrect);
            return (
              <button
                key={idx}
                onClick={() => handlePick(idx)}
                disabled={revealed}
                style={{ animationDelay: `${idx * 50}ms` }}
                className={cn(
                  "flex w-full animate-fade-in items-center gap-4 rounded-2xl border bg-card p-4 text-left tap transition-colors",
                  !revealed && "hover:border-foreground/40",
                  isPicked && !revealed && "border-foreground",
                  showState && isCorrect && "border-success bg-success/5",
                  showState && !isCorrect && isPicked && "border-destructive bg-destructive/5",
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border text-sm font-bold transition-colors",
                    !showState && "border-border text-muted-foreground",
                    showState && isCorrect && "border-success bg-success text-success-foreground",
                    showState && !isCorrect && isPicked && "border-destructive bg-destructive text-destructive-foreground",
                  )}
                >
                  {showState ? (
                    isCorrect ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <X className="h-4 w-4" />
                    )
                  ) : (
                    String.fromCharCode(65 + idx)
                  )}
                </span>
                <span className="text-[15px] font-medium">{opt}</span>
              </button>
            );
          })}
        </div>

        {revealed && (
          <div
            className={cn(
              "mt-6 animate-slide-up rounded-2xl p-4",
              correct ? "bg-success/10 text-foreground" : "bg-secondary text-foreground",
            )}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" />
              <p className="text-sm font-semibold">
                {correct ? "Brilliant — that's right." : "Not quite. Here's why:"}
              </p>
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground">{q.explanation}</p>
          </div>
        )}

        <div className="mt-auto pb-8 pt-6">
          <Button
            size="xl"
            className="w-full"
            variant={revealed ? "default" : "outline"}
            disabled={!revealed}
            onClick={next}
            rightIcon={<ArrowRight />}
          >
            {isLast ? "Finish" : "Next question"}
          </Button>
        </div>
      </div>
    </div>
  );
}
