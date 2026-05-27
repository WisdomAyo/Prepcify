import { Link } from "react-router-dom";
import { useState } from "react";
import { Shuffle, Target, AlertTriangle, BookOpen, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { cn } from "@/lib/utils";

const modes = [
  { id: "topic", icon: BookOpen, title: "Topic-based", desc: "Pick a subject and topic. Build mastery section by section.", color: "bg-foreground text-background" },
  { id: "random", icon: Shuffle, title: "Random mix", desc: "We shuffle questions across all your subjects. Great for warm-ups.", color: "bg-accent text-accent-foreground" },
  { id: "weak", icon: AlertTriangle, title: "Weak areas", desc: "AI picks topics where your accuracy is below 60%.", color: "bg-sky text-sky-foreground" },
];

export default function QuizSetup() {
  const [mode, setMode] = useState("topic");
  const [count, setCount] = useState(20);
  const [duration, setDuration] = useState(15);

  return (
    <div className="max-w-5xl">
      <PageHeader eyebrow="Quiz" title="Set up your practice" description="Pick a mode, configure how long you want to study, then dive in." />

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        {modes.map(({ id, icon: Icon, title, desc, color }) => (
          <button
            key={id}
            onClick={() => setMode(id)}
            className={cn(
              "rounded-3xl border-2 p-6 text-left transition-all",
              mode === id ? "border-foreground bg-card shadow-card -translate-y-1" : "border-border bg-card hover:border-foreground/30"
            )}
          >
            <div className={cn("flex h-11 w-11 items-center justify-center rounded-2xl", color)}>
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-display text-lg font-bold">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
          </button>
        ))}
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 lg:p-8 space-y-8">
        <div>
          <label className="text-sm font-semibold">Number of questions</label>
          <div className="mt-3 flex flex-wrap gap-2">
            {[10, 20, 30, 50].map((n) => (
              <button
                key={n}
                onClick={() => setCount(n)}
                className={cn(
                  "rounded-2xl px-5 py-2.5 text-sm font-semibold transition-colors",
                  count === n ? "bg-foreground text-background" : "bg-secondary"
                )}
              >
                {n} questions
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold">Duration</label>
          <div className="mt-3 flex flex-wrap gap-2">
            {[10, 15, 20, 30, 45].map((m) => (
              <button
                key={m}
                onClick={() => setDuration(m)}
                className={cn(
                  "rounded-2xl px-5 py-2.5 text-sm font-semibold transition-colors",
                  duration === m ? "bg-foreground text-background" : "bg-secondary"
                )}
              >
                {m} min
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-6">
          <div>
            <p className="text-xs text-muted-foreground">Estimated XP reward</p>
            <p className="font-display text-2xl font-extrabold text-accent">+{count * 5} XP</p>
          </div>
          <Link to="/app/quiz" className="flex items-center gap-2 rounded-full bg-accent px-7 py-3 text-sm font-semibold text-accent-foreground">
            Start quiz <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
