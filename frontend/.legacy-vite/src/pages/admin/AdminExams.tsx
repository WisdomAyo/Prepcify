import { Plus } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

const exams = [
  { name: "JAMB UTME 2025 Mock", subjects: 4, questions: 240, attempts: 8420, status: "Live" },
  { name: "WAEC SSCE Maths 2025", subjects: 1, questions: 60, attempts: 3120, status: "Live" },
  { name: "NECO Physics Trial", subjects: 1, questions: 50, attempts: 980, status: "Draft" },
  { name: "Cambridge IGCSE Maths", subjects: 1, questions: 80, attempts: 1240, status: "Live" },
];

export default function AdminExams() {
  return (
    <div className="max-w-6xl">
      <PageHeader
        eyebrow="Admin"
        title="Exam simulations"
        description="Create and manage timed mock exams."
        actions={
          <button className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground flex items-center gap-2">
            <Plus className="h-4 w-4" /> New exam
          </button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        {exams.map((e) => (
          <div key={e.name} className="rounded-3xl border border-border bg-card p-6">
            <div className="flex items-start justify-between">
              <h3 className="font-display text-lg font-bold">{e.name}</h3>
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${e.status === "Live" ? "bg-success/15 text-success" : "bg-secondary text-muted-foreground"}`}>
                {e.status}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-secondary/40 p-3">
                <p className="font-display text-xl font-extrabold">{e.subjects}</p>
                <p className="text-[10px] uppercase text-muted-foreground">Subjects</p>
              </div>
              <div className="rounded-xl bg-secondary/40 p-3">
                <p className="font-display text-xl font-extrabold">{e.questions}</p>
                <p className="text-[10px] uppercase text-muted-foreground">Questions</p>
              </div>
              <div className="rounded-xl bg-secondary/40 p-3">
                <p className="font-display text-xl font-extrabold">{e.attempts.toLocaleString()}</p>
                <p className="text-[10px] uppercase text-muted-foreground">Attempts</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="flex-1 rounded-full bg-secondary px-4 py-2 text-xs font-semibold">Edit</button>
              <button className="flex-1 rounded-full bg-foreground text-background px-4 py-2 text-xs font-semibold">Analytics</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
