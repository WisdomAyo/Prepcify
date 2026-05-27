import { Link, useParams } from "react-router-dom";
import { ScreenHeader } from "@/components/ScreenHeader";
import { BarProgress, RingProgress } from "@/components/Progress";
import { Check, Lock, Play, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const topics = [
  { id: 1, name: "Number bases", lessons: 4, status: "done" },
  { id: 2, name: "Indices & Logarithms", lessons: 6, status: "done" },
  { id: 3, name: "Linear equations", lessons: 5, status: "active", progress: 60 },
  { id: 4, name: "Quadratic equations", lessons: 7, status: "todo" },
  { id: 5, name: "Sets & Venn diagrams", lessons: 5, status: "todo" },
  { id: 6, name: "Coordinate geometry", lessons: 8, status: "locked" },
  { id: 7, name: "Trigonometry", lessons: 9, status: "locked" },
];

export default function Topic() {
  const { subjectId } = useParams();
  return (
    <div className="pb-8">
      <ScreenHeader back title="Mathematics" subtitle="JAMB · Senior Secondary" />

      <section className="mx-5 mt-2 flex items-center gap-5 rounded-3xl bg-secondary p-5">
        <RingProgress value={68} size={86} stroke={9} indicatorClassName="stroke-foreground">
          <span className="font-display text-xl font-extrabold">68%</span>
        </RingProgress>
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Mastery</p>
          <p className="font-display text-lg font-bold leading-tight">7 of 12 topics</p>
          <p className="mt-1 text-sm text-muted-foreground">~3 hours to next milestone</p>
        </div>
      </section>

      <div className="mt-6 px-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Topics</h2>
          <span className="text-xs text-muted-foreground">{subjectId?.toUpperCase()}</span>
        </div>

        <ol className="mt-4 space-y-3">
          {topics.map((t, i) => {
            const done = t.status === "done";
            const active = t.status === "active";
            const locked = t.status === "locked";
            return (
              <li key={t.id}>
                <Link
                  to="/app/quiz"
                  aria-disabled={locked}
                  onClick={(e) => locked && e.preventDefault()}
                  className={cn(
                    "flex items-center gap-4 rounded-3xl border bg-card p-4 tap transition-shadow",
                    active ? "border-foreground shadow-card" : "border-border",
                    locked && "opacity-55 pointer-events-none"
                  )}
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <div
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-bold",
                      done && "bg-success text-success-foreground",
                      active && "bg-accent text-accent-foreground",
                      !done && !active && !locked && "bg-secondary text-foreground",
                      locked && "bg-secondary text-muted-foreground"
                    )}
                  >
                    {done ? <Check className="h-5 w-5" /> : locked ? <Lock className="h-4 w-4" /> : t.id}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[15px] truncate">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.lessons} lessons</p>
                    {active && <BarProgress value={t.progress!} className="mt-2" height={4} />}
                  </div>
                  {active && (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background">
                      <Play className="h-4 w-4" />
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="mt-6 px-5">
        <div className="flex items-center gap-3 rounded-3xl bg-foreground p-4 text-background">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-background/10">
            <Sparkles className="h-5 w-5 text-accent" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">Need a hand?</p>
            <p className="text-xs text-background/70">prepcify AI can re-explain anything in plain English.</p>
          </div>
          <Link to="/app/tutor" className="rounded-full bg-background/10 px-3 py-1.5 text-xs font-semibold tap">Open</Link>
        </div>
      </div>
    </div>
  );
}
