import { CheckCircle2, Trophy, Sparkles, Swords, BookOpen, Flame } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

const groups = [
  {
    label: "Today",
    items: [
      { icon: CheckCircle2, color: "text-success", text: "Completed quiz: Algebra basics", meta: "85% · +120 XP", time: "10:42" },
      { icon: Sparkles, color: "text-accent", text: "Asked prepcify AI about Newton's laws", meta: "3 messages", time: "09:18" },
    ],
  },
  {
    label: "Yesterday",
    items: [
      { icon: Swords, color: "text-foreground", text: "Won battle vs Tomi A.", meta: "8–6 · +85 XP", time: "20:14" },
      { icon: BookOpen, color: "text-sky", text: "Started topic: Quadratic equations", meta: "Mathematics", time: "16:30" },
      { icon: Flame, color: "text-accent", text: "Extended streak to 12 days", meta: "+50 XP bonus", time: "12:00" },
    ],
  },
  {
    label: "This week",
    items: [
      { icon: Trophy, color: "text-accent", text: "Earned 'Sniper' badge", meta: "20 quizzes above 90%", time: "Mon" },
      { icon: BookOpen, color: "text-success", text: "Finished chapter: Trigonometry", meta: "Mathematics", time: "Sun" },
    ],
  },
];

export default function Activity() {
  return (
    <div className="max-w-3xl">
      <PageHeader eyebrow="Activity feed" title="Everything you've done" description="A timeline of your study, wins, and milestones." />
      {groups.map((g) => (
        <div key={g.label} className="mb-8">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{g.label}</p>
          <div className="space-y-3">
            {g.items.map(({ icon: Icon, color, text, meta, time }, i) => (
              <div key={i} className="flex items-start gap-4 rounded-2xl border border-border bg-card p-4">
                <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${color}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{text}</p>
                  <p className="text-xs text-muted-foreground">{meta}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{time}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
