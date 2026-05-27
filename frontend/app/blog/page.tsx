import { BookOpen, CalendarDays } from "lucide-react";
import { MarketingPageShell } from "@/components/marketing/marketing-page-shell";

const posts = [
  {
    title: "How to turn past questions into a daily study plan",
    description: "A practical routine for WAEC, JAMB, and NECO candidates who want consistent revision without overload.",
    tag: "Study planning",
  },
  {
    title: "What to review after every mock exam",
    description: "Use mistakes, skipped questions, and timing data to decide what deserves your next study session.",
    tag: "Mock exams",
  },
  {
    title: "How AI explanations should support exam preparation",
    description: "AI helps most when it clarifies reasoning, not when it replaces the student's own practice.",
    tag: "AI tutor",
  },
];

export default function BlogPage() {
  return (
    <MarketingPageShell>
      <div className="mx-auto max-w-5xl px-5 py-20 text-slate-950 sm:px-6">
        <section className="mt-14">
          <p className="text-xs uppercase tracking-[0.25em] text-emerald-800/70">prepcify blog</p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
            Practical exam prep notes for students and schools.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Short, focused guides on study planning, mock exams, past questions, and using AI responsibly while preparing.
          </p>
        </section>

        <section className="mt-12 grid gap-5 md:grid-cols-3" aria-label="Blog posts">
          {posts.map((post) => (
            <article key={post.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_-42px_rgba(15,23,42,0.55)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-950 text-white">
                <BookOpen className="h-5 w-5" />
              </div>
              <p className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">
                <CalendarDays className="h-3.5 w-3.5" />
                {post.tag}
              </p>
              <h2 className="mt-3 font-display text-xl font-bold leading-tight">{post.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{post.description}</p>
            </article>
          ))}
        </section>
      </div>
    </MarketingPageShell>
  );
}
