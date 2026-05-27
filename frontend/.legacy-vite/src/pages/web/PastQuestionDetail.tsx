import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import { Bookmark, Flag, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { cn } from "@/lib/utils";

const options = [
  { key: "A", text: "x = 2 or x = −5" },
  { key: "B", text: "x = 1 or x = −6" },
  { key: "C", text: "x = 3 or x = −4" },
  { key: "D", text: "x = −2 or x = 5" },
];

export default function PastQuestionDetail() {
  const { exam = "waec", year = "2024", qid = "1" } = useParams();
  const [picked, setPicked] = useState<string | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const id = Number(qid);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_280px] max-w-6xl">
      <div>
        <PageHeader
          crumbs={[
            { label: "Past Questions", to: "/app/past-questions" },
            { label: exam.toUpperCase(), to: `/app/past-questions/${exam}` },
            { label: year, to: `/app/past-questions/${exam}/${year}` },
            { label: `Q${qid}` },
          ]}
          eyebrow={`Question ${qid} of 60 · 3 marks`}
          title="Solve the quadratic"
          actions={
            <>
              <button
                onClick={() => setBookmarked((b) => !b)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2",
                  bookmarked ? "bg-accent text-accent-foreground" : "bg-secondary"
                )}
              >
                <Bookmark className="h-4 w-4" /> {bookmarked ? "Saved" : "Bookmark"}
              </button>
              <button className="rounded-full bg-secondary px-4 py-2 text-sm font-medium flex items-center gap-2">
                <Flag className="h-4 w-4" /> Report
              </button>
            </>
          }
        />

        <article className="rounded-3xl border border-border bg-card p-8 shadow-soft">
          <p className="text-base leading-relaxed">
            Find the value of <em className="font-semibold">x</em> in the equation{" "}
            <span className="rounded-md bg-secondary px-2 py-0.5 font-mono text-sm">2x² + 3x − 20 = 0</span>.
            Show your working clearly and select the correct option below.
          </p>

          <div className="mt-8 space-y-3">
            {options.map((o) => (
              <button
                key={o.key}
                onClick={() => setPicked(o.key)}
                className={cn(
                  "flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all",
                  picked === o.key
                    ? "border-accent bg-accent/5"
                    : "border-border bg-card hover:border-foreground/30"
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold",
                    picked === o.key ? "bg-accent text-accent-foreground" : "bg-secondary"
                  )}
                >
                  {o.key}
                </span>
                <span className="text-sm">{o.text}</span>
              </button>
            ))}
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
            <Link
              to={`/app/past-questions/${exam}/${year}/${Math.max(1, id - 1)}`}
              className="flex items-center gap-2 rounded-full bg-secondary px-5 py-2.5 text-sm font-medium"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Link>
            <Link
              to={`/app/past-questions/${exam}/${year}/${qid}/explanation`}
              className="flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background"
            >
              Show explanation <Sparkles className="h-4 w-4 text-accent" />
            </Link>
            <Link
              to={`/app/past-questions/${exam}/${year}/${id + 1}`}
              className="flex items-center gap-2 rounded-full bg-secondary px-5 py-2.5 text-sm font-medium"
            >
              Next <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </article>
      </div>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Navigator</p>
          <div className="mt-3 grid grid-cols-6 gap-1.5">
            {Array.from({ length: 30 }, (_, i) => (
              <Link
                key={i}
                to={`/app/past-questions/${exam}/${year}/${i + 1}`}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition-colors",
                  i + 1 === id
                    ? "bg-foreground text-background"
                    : "bg-secondary hover:bg-secondary/70"
                )}
              >
                {i + 1}
              </Link>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-foreground p-5 text-background">
          <Sparkles className="h-5 w-5 text-accent" />
          <p className="mt-3 font-display text-base font-bold leading-tight">Stuck on this one?</p>
          <p className="mt-1 text-xs text-background/70">prepcify AI can walk you through the solution step-by-step.</p>
          <Link to="/app/tutor" className="mt-3 block w-full rounded-full bg-accent py-2 text-center text-xs font-semibold text-accent-foreground">
            Ask prepcify AI
          </Link>
        </div>
      </aside>
    </div>
  );
}
