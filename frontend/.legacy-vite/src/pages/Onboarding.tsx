import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BarProgress } from "@/components/Progress";
import { GraduationCap, Target, Sparkles, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const slides = [
  {
    icon: GraduationCap,
    title: "Pass your exams,\nthe smarter way.",
    body: "WAEC, JAMB, NECO, ICAN, Cambridge — one calm place to prepare for them all.",
    accent: "bg-accent",
  },
  {
    icon: Target,
    title: "A plan that fits\nyour life.",
    body: "Daily study cards, bite-sized quizzes and a personal pace that respects your time.",
    accent: "bg-sky",
  },
  {
    icon: Sparkles,
    title: "An AI tutor\nin your pocket.",
    body: "Ask anything, anytime. Get clear, kind explanations — like a brilliant senior who never tires.",
    accent: "bg-foreground",
  },
];

const exams = ["WAEC", "JAMB", "NECO", "Cambridge", "A-Levels", "O-Levels", "ICAN"];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [picked, setPicked] = useState<string[]>(["WAEC", "JAMB"]);
  const navigate = useNavigate();

  const togglePick = (e: string) =>
    setPicked((p) => (p.includes(e) ? p.filter((x) => x !== e) : [...p, e]));

  if (step < slides.length) {
    const S = slides[step];
    const Icon = S.icon;
    return (
      <div className="flex min-h-dvh flex-col bg-background">
        <div className="flex items-center justify-between px-5 pt-6">
          <span className="font-display text-base font-bold tracking-tight">prepcify<span className="text-accent">.</span></span>
          <button onClick={() => navigate("/app")} className="text-sm text-muted-foreground tap">Skip</button>
        </div>

        <div className="flex flex-1 flex-col px-6 pt-6">
          <div className="flex gap-1.5">
            {slides.map((_, i) => (
              <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-secondary">
                <div
                  className={cn(
                    "h-full rounded-full bg-foreground transition-all duration-500",
                    i < step ? "w-full" : i === step ? "w-full" : "w-0"
                  )}
                />
              </div>
            ))}
          </div>

          <div key={step} className="mt-10 flex flex-1 flex-col items-center justify-center text-center animate-slide-up">
            {/* Editorial illustration block */}
            <div className="relative mb-10 h-56 w-56">
              <div className={cn("absolute inset-0 rounded-[44%_56%_60%_40%/50%_40%_60%_50%]", S.accent)} />
              <div className="absolute inset-6 rounded-full bg-card shadow-card flex items-center justify-center">
                <Icon className="h-16 w-16 text-foreground" strokeWidth={1.5} />
              </div>
              <div className="absolute -right-2 top-6 h-6 w-6 rounded-full bg-foreground" />
              <div className="absolute -left-1 bottom-10 h-4 w-4 rounded-full bg-accent" />
              <div className="absolute right-10 -bottom-2 h-3 w-3 rounded-full bg-sky" />
            </div>

            <h1 className="font-display text-[34px] font-extrabold leading-[1.05] tracking-tight whitespace-pre-line text-balance">
              {S.title}
            </h1>
            <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-muted-foreground">{S.body}</p>
          </div>

          <div className="pb-8 pt-6">
            <Button size="xl" className="w-full" onClick={() => setStep(step + 1)}>
              Continue <ArrowRight className="ml-1" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Personalize step
  if (step === slides.length) {
    return (
      <div className="flex min-h-dvh flex-col bg-background">
        <div className="px-6 pt-8">
          <BarProgress value={50} indicatorClassName="bg-foreground" />
          <h1 className="mt-8 font-display text-3xl font-extrabold leading-tight">What should we call you?</h1>
          <p className="mt-2 text-muted-foreground">We'll greet you and personalize your plan.</p>

          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Adaeze"
            className="mt-8 w-full rounded-2xl border border-border bg-card px-5 py-4 text-lg outline-none focus:border-foreground transition-colors"
          />
        </div>
        <div className="mt-auto px-6 pb-8">
          <Button size="xl" className="w-full" disabled={!name.trim()} onClick={() => setStep(step + 1)}>
            Continue <ArrowRight className="ml-1" />
          </Button>
        </div>
      </div>
    );
  }

  // Pick exams
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <div className="px-6 pt-8">
        <BarProgress value={100} indicatorClassName="bg-foreground" />
        <h1 className="mt-8 font-display text-3xl font-extrabold leading-tight">Which exams are you preparing for?</h1>
        <p className="mt-2 text-muted-foreground">Pick all that apply. You can change this later.</p>

        <div className="mt-6 flex flex-wrap gap-2.5">
          {exams.map((e) => {
            const on = picked.includes(e);
            return (
              <button
                key={e}
                onClick={() => togglePick(e)}
                className={cn(
                  "tap rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors",
                  on
                    ? "bg-foreground text-background border-foreground"
                    : "bg-card text-foreground border-border hover:bg-secondary"
                )}
              >
                {on && <Check className="mr-1 inline h-4 w-4" />}
                {e}
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-auto px-6 pb-8">
        <Button size="xl" className="w-full" disabled={picked.length === 0} onClick={() => navigate("/app")}>
          Start learning <ArrowRight className="ml-1" />
        </Button>
      </div>
    </div>
  );
}
