import { useState } from "react";
import { Check, Clock, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { cn } from "@/lib/utils";

const initialTasks = [
  { id: 1, title: "Review quadratic equations (Algebra)", time: "20 min", type: "Lesson", done: true },
  { id: 2, title: "Practice quiz: 15 quadratic problems", time: "15 min", type: "Quiz", done: true },
  { id: 3, title: "Watch: Newton's 2nd law video", time: "8 min", type: "Video", done: false },
  { id: 4, title: "Past question — JAMB 2022 Maths Q1–10", time: "25 min", type: "Past Q", done: false },
  { id: 5, title: "Reading comprehension drill", time: "12 min", type: "Lesson", done: false },
];

export default function StudyPlanToday() {
  const [tasks, setTasks] = useState(initialTasks);
  const done = tasks.filter((t) => t.done).length;
  const totalMin = tasks.reduce((acc, t) => acc + parseInt(t.time), 0);

  const toggle = (id: number) =>
    setTasks((arr) => arr.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  return (
    <div className="max-w-3xl">
      <PageHeader
        crumbs={[{ label: "Study Plan", to: "/app/study-plan" }, { label: "Today" }]}
        eyebrow={`Day 13 · ${done}/${tasks.length} done`}
        title="Today's tasks"
        description={`About ${totalMin} minutes total. Knock these out and you're ahead of schedule.`}
      />

      <div className="space-y-3">
        {tasks.map((t) => (
          <button
            key={t.id}
            onClick={() => toggle(t.id)}
            className={cn(
              "w-full flex items-center gap-4 rounded-2xl border bg-card p-5 text-left transition-all",
              t.done ? "border-success/30 bg-success/5" : "border-border hover:border-foreground/30"
            )}
          >
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 transition-colors",
                t.done ? "bg-success border-success text-success-foreground" : "border-border"
              )}
            >
              {t.done && <Check className="h-5 w-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn("font-medium", t.done && "line-through text-muted-foreground")}>{t.title}</p>
              <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {t.time}
                </span>
                <span className="rounded-full bg-secondary px-2 py-0.5">{t.type}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-8 rounded-2xl bg-foreground p-5 text-background flex items-center gap-4">
        <Sparkles className="h-5 w-5 text-accent" />
        <p className="flex-1 text-sm">prepcify AI noticed you're stronger on Algebra than Geometry. Want a custom drill?</p>
        <button className="rounded-full bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground">Yes, build it</button>
      </div>
    </div>
  );
}
