import { Link, useParams } from "react-router-dom";
import { Check, Sparkles, ChevronLeft, BookOpen } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

export default function PastQuestionExplanation() {
  const { exam = "waec", year = "2024", qid = "1" } = useParams();

  return (
    <div className="max-w-4xl">
      <PageHeader
        crumbs={[
          { label: "Past Questions", to: "/app/past-questions" },
          { label: exam.toUpperCase(), to: `/app/past-questions/${exam}` },
          { label: year, to: `/app/past-questions/${exam}/${year}` },
          { label: `Q${qid}`, to: `/app/past-questions/${exam}/${year}/${qid}` },
          { label: "Explanation" },
        ]}
        eyebrow="Worked solution"
        title="x = 5/2 or x = −4"
        actions={
          <Link to={`/app/past-questions/${exam}/${year}/${qid}`} className="rounded-full bg-secondary px-5 py-2 text-sm font-medium flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" /> Back to question
          </Link>
        }
      />

      <div className="mb-6 flex items-center gap-3 rounded-2xl bg-success/10 border border-success/20 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success text-success-foreground">
          <Check className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold text-success">Correct answer: C</p>
          <p className="text-xs text-muted-foreground">x = 5/2 (i.e. 2.5) or x = −4. 78% of students get this right.</p>
        </div>
      </div>

      <article className="rounded-3xl border border-border bg-card p-8 shadow-soft space-y-6">
        <section>
          <h2 className="font-display text-lg font-bold">Step 1 — Identify the form</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            We have <span className="font-mono">2x² + 3x − 20 = 0</span>. This is a standard quadratic{" "}
            <span className="font-mono">ax² + bx + c = 0</span> with a = 2, b = 3, c = −20.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold">Step 2 — Factorise</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            We need two numbers that multiply to a·c = −40 and add to b = 3. Those are 8 and −5.
          </p>
          <pre className="mt-3 rounded-xl bg-secondary p-4 text-xs font-mono leading-relaxed">
{`2x² + 8x − 5x − 20 = 0
2x(x + 4) − 5(x + 4) = 0
(2x − 5)(x + 4) = 0`}
          </pre>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold">Step 3 — Solve</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Set each bracket to zero: 2x − 5 = 0 → x = 5/2. And x + 4 = 0 → x = −4.
          </p>
        </section>

        <section className="rounded-2xl bg-accent/10 p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-accent">Examiner tip</p>
          <p className="mt-2 text-sm leading-relaxed">
            Always check both roots by substituting back into the original equation. Marks are often awarded for verification.
          </p>
        </section>
      </article>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <Link to="/app/tutor" className="rounded-2xl bg-foreground p-5 text-background flex items-center gap-4 hover:bg-foreground/90 transition-colors">
          <Sparkles className="h-5 w-5 text-accent" />
          <div className="flex-1">
            <p className="font-semibold">Ask prepcify AI a follow-up</p>
            <p className="text-xs text-background/70">"Why did we split the middle term?"</p>
          </div>
        </Link>
        <Link to="/app/subjects" className="rounded-2xl border border-border bg-card p-5 flex items-center gap-4 hover:bg-secondary/30 transition-colors">
          <BookOpen className="h-5 w-5 text-accent" />
          <div className="flex-1">
            <p className="font-semibold">Practice more quadratics</p>
            <p className="text-xs text-muted-foreground">12 questions on this topic</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
