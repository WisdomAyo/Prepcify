import { BookOpen, Video, Sparkles, Plus } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

const tabs = [
  { icon: BookOpen, label: "Lessons", count: 1240 },
  { icon: Video, label: "Videos", count: 380 },
  { icon: Sparkles, label: "AI Prompts", count: 64 },
];

const items = [
  { title: "Quadratic Equations — Foundations", type: "Lesson", subject: "Mathematics", updated: "2d ago" },
  { title: "Newton's Laws Explained", type: "Video", subject: "Physics", updated: "5d ago" },
  { title: "Reading Comprehension Strategies", type: "Lesson", subject: "English", updated: "1w ago" },
  { title: "AI Tutor Tone — Encouraging", type: "Prompt", subject: "Global", updated: "3w ago" },
];

export default function AdminContent() {
  return (
    <div className="max-w-6xl">
      <PageHeader
        eyebrow="Admin"
        title="Content library"
        actions={
          <button className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground flex items-center gap-2">
            <Plus className="h-4 w-4" /> New content
          </button>
        }
      />

      <div className="mb-6 grid gap-3 grid-cols-3">
        {tabs.map(({ icon: Icon, label, count }) => (
          <div key={label} className="rounded-2xl border border-border bg-card p-5">
            <Icon className="h-5 w-5 text-accent" />
            <p className="mt-3 font-display text-2xl font-extrabold">{count.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-3xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary/40 border-b border-border">
            <tr className="text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="text-left px-5 py-3 font-semibold">Title</th>
              <th className="text-left px-5 py-3 font-semibold">Type</th>
              <th className="text-left px-5 py-3 font-semibold">Subject</th>
              <th className="text-left px-5 py-3 font-semibold">Updated</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={i} className="border-b border-border last:border-0 hover:bg-secondary/30">
                <td className="px-5 py-3 font-medium">{it.title}</td>
                <td className="px-5 py-3 text-xs text-muted-foreground">{it.type}</td>
                <td className="px-5 py-3 text-xs">{it.subject}</td>
                <td className="px-5 py-3 text-xs text-muted-foreground">{it.updated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
