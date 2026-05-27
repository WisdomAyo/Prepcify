"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Calendar } from "lucide-react";
import { PageHeader } from "@/components/shells/page-header";
import { cn } from "@/lib/utils";

const subjects = ["All", "Mathematics", "English", "Physics", "Chemistry", "Biology", "Economics"];
const years = Array.from({ length: 17 }, (_, i) => 2024 - i);

export default function PastQuestionsYearsPage() {
  const params = useParams<{ exam: string }>();
  const exam = params?.exam ?? "waec";
  const [subject, setSubject] = useState("All");

  return (
    <div className="max-w-6xl">
      <PageHeader
        crumbs={[
          { label: "Past Questions", href: "/app/past-questions" },
          { label: exam.toUpperCase() },
        ]}
        eyebrow={exam.toUpperCase()}
        title="Choose a year"
        description="Pick a year and subject to start practising. Each paper is timed like the real thing."
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {subjects.map((s) => (
          <button
            key={s}
            onClick={() => setSubject(s)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              subject === s
                ? "bg-foreground text-background"
                : "bg-secondary text-foreground hover:bg-secondary/70",
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {years.map((y) => (
          <Link
            key={y}
            href={`/app/past-questions/${exam}/${y}`}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-card"
          >
            <Calendar className="h-4 w-4 text-accent" />
            <p className="mt-3 font-display text-3xl font-bold tracking-tight">
              {y}
            </p>
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>{subject === "All" ? "9 subjects" : subject}</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
