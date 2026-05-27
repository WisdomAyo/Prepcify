import { Link } from "react-router-dom";
import { Check, Calendar } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { cn } from "@/lib/utils";

const days = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  done: i < 12,
  today: i === 12,
  topic: ["Algebra", "Mechanics", "Cells", "Reading", "Atoms"][i % 5],
}));

export default function StudyPlan() {
  return (
    <div className="max-w-6xl">
      <PageHeader
        eyebrow="30-day plan"
        title="JAMB sprint · Day 13 of 30"
        description="A balanced mix across your 4 subjects. Tap any day to see what's planned."
        actions={
          <Link to="/app/study-plan/today" className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground">
            Today's tasks →
          </Link>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs text-muted-foreground">Completed</p>
          <p className="font-display text-3xl font-extrabold">12 days</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs text-muted-foreground">Avg session</p>
          <p className="font-display text-3xl font-extrabold">38 min</p>
        </div>
        <div className="rounded-2xl bg-foreground text-background p-5">
          <p className="text-xs text-background/60">Adherence</p>
          <p className="font-display text-3xl font-extrabold text-accent">92%</p>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-5">
          <Calendar className="h-4 w-4 text-accent" />
          <p className="text-sm font-semibold">Calendar view</p>
        </div>
        <div className="grid grid-cols-5 sm:grid-cols-7 lg:grid-cols-10 gap-2">
          {days.map((d) => (
            <div
              key={d.day}
              className={cn(
                "aspect-square rounded-xl border-2 p-2 flex flex-col items-center justify-center text-center",
                d.today && "border-accent bg-accent/10",
                d.done && !d.today && "border-success/30 bg-success/5",
                !d.done && !d.today && "border-border bg-secondary/30"
              )}
            >
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Day</p>
              <p className="font-display text-base font-extrabold leading-none">{d.day}</p>
              {d.done && <Check className="mt-1 h-3 w-3 text-success" />}
              {d.today && <p className="mt-1 text-[9px] font-semibold text-accent uppercase">Today</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
