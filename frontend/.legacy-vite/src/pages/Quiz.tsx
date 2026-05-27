import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BarProgress } from "@/components/Progress";
import { X, Clock, Check, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const questions = [
  {
    q: "If 2x + 3 = 11, what is the value of x?",
    options: ["2", "3", "4", "5"],
    correct: 2,
    explain: "Subtract 3 from both sides: 2x = 8. Divide by 2 → x = 4.",
  },
  {
    q: "The sum of two numbers is 24 and their difference is 6. The smaller number is:",
    options: ["6", "9", "12", "15"],
    correct: 1,
    explain: "Let the numbers be a and b with a > b. a + b = 24 and a − b = 6 → b = 9.",
  },
  {
    q: "Solve: x² − 5x + 6 = 0",
    options: ["x = 1, 6", "x = 2, 3", "x = −2, −3", "x = −1, −6"],
    correct: 1,
    explain: "Factor: (x − 2)(x − 3) = 0 → x = 2 or x = 3.",
  },
];

export default function Quiz() {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const navigate = useNavigate();

  const q = questions[i];
  const isLast = i === questions.length - 1;
  const correct = picked === q.correct;

  const handlePick = (idx: number) => {
    if (revealed) return;
    setPicked(idx);
    setRevealed(true);
  };

  const next = () => {
    if (isLast) {
      navigate("/app");
      return;
    }
    setI(i + 1);
    setPicked(null);
    setRevealed(false);
  };

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-6">
        <button onClick={() => navigate(-1)} aria-label="Close" className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary tap">
          <X className="h-[18px] w-[18px]" />
        </button>
        <div className="flex-1">
          <BarProgress value={((i + (revealed ? 1 : 0)) / questions.length) * 100} indicatorClassName="bg-foreground" />
        </div>
        <div className="chip bg-secondary text-foreground">
          <Clock className="h-3.5 w-3.5" /> 00:42
        </div>
      </div>

      {/* Question */}
      <div className="flex flex-1 flex-col px-6 pt-8">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Question {i + 1} of {questions.length}</p>
        <h2 key={i} className="mt-3 font-display text-[26px] font-extrabold leading-[1.15] text-balance animate-slide-up">
          {q.q}
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
                  "tap flex w-full items-center gap-4 rounded-2xl border bg-card p-4 text-left animate-fade-in transition-colors",
                  !revealed && "hover:border-foreground/40",
                  isPicked && !revealed && "border-foreground",
                  showState && isCorrect && "border-success bg-success/5",
                  showState && !isCorrect && isPicked && "border-destructive bg-destructive/5"
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border text-sm font-bold transition-colors",
                    !showState && "border-border text-muted-foreground",
                    showState && isCorrect && "bg-success text-success-foreground border-success",
                    showState && !isCorrect && isPicked && "bg-destructive text-destructive-foreground border-destructive"
                  )}
                >
                  {showState ? (isCorrect ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />) : String.fromCharCode(65 + idx)}
                </span>
                <span className="text-[15px] font-medium">{opt}</span>
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {revealed && (
          <div
            className={cn(
              "mt-6 rounded-2xl p-4 animate-slide-up",
              correct ? "bg-success/10 text-foreground" : "bg-secondary text-foreground"
            )}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" />
              <p className="font-semibold text-sm">{correct ? "Brilliant — that's right." : "Not quite. Here's why:"}</p>
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground">{q.explain}</p>
          </div>
        )}

        <div className="mt-auto pt-6 pb-8">
          <Button
            size="xl"
            className="w-full"
            variant={revealed ? "default" : "outline"}
            disabled={!revealed}
            onClick={next}
          >
            {isLast ? "Finish" : "Next question"} <ArrowRight className="ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
