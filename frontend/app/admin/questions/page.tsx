import Link from "next/link";
import { Plus, Upload, Search, Edit, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shells/page-header";
import { difficultyBadgeClass } from "@/lib/ui-constants";

const questions = Array.from({ length: 12 }, (_, i) => ({
  id: 4800 + i,
  exam: ["WAEC", "JAMB", "NECO"][i % 3],
  year: [2020, 2021, 2022, 2023, 2024][i % 5],
  subject: ["Mathematics", "Physics", "English", "Chemistry"][i % 4],
  difficulty: ["Easy", "Medium", "Hard"][i % 3],
  status: i % 4 === 0 ? "Draft" : "Published",
}));

export default function AdminQuestionsPage() {
  return (
    <div className="max-w-7xl">
      <PageHeader
        eyebrow="Admin"
        title="Question bank"
        description="11,240 questions live. Add, edit, or bulk-upload."
        actions={
          <>
            <Link
              href="/admin/questions/upload"
              className="flex items-center gap-2 rounded-full bg-secondary px-5 py-2.5 text-sm font-semibold"
            >
              <Upload className="h-4 w-4" /> Bulk upload
            </Link>
            <button className="flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground">
              <Plus className="h-4 w-4" /> New question
            </button>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <label className="flex max-w-md flex-1 items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2.5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search by ID, keyword, topic…"
            aria-label="Search questions"
            className="flex-1 bg-transparent text-sm outline-none"
          />
        </label>
        {["All exams", "All subjects", "All years"].map((f) => (
          <button
            key={f}
            className="rounded-2xl bg-secondary px-4 py-2.5 text-xs font-semibold"
          >
            {f} ▾
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-3xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/40">
            <tr className="text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-3 text-left font-semibold">ID</th>
              <th className="px-5 py-3 text-left font-semibold">Exam · Year</th>
              <th className="px-5 py-3 text-left font-semibold">Subject</th>
              <th className="px-5 py-3 text-left font-semibold">Difficulty</th>
              <th className="px-5 py-3 text-left font-semibold">Status</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q) => (
              <tr
                key={q.id}
                className="border-b border-border last:border-0 hover:bg-secondary/30"
              >
                <td className="px-5 py-3 font-mono text-xs">#{q.id}</td>
                <td className="px-5 py-3">
                  {q.exam} · {q.year}
                </td>
                <td className="px-5 py-3">{q.subject}</td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${difficultyBadgeClass[q.difficulty]}`}
                  >
                    {q.difficulty}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`text-xs ${q.status === "Published" ? "text-success" : "text-muted-foreground"}`}
                  >
                    {q.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      aria-label="Edit question"
                      className="rounded-md p-1.5 hover:bg-secondary"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button
                      aria-label="Delete question"
                      className="rounded-md p-1.5 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
