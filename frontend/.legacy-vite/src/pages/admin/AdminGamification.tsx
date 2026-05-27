import { Plus, Trophy } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

const xpRules = [
  { event: "Question answered correctly", xp: 5 },
  { event: "Quiz completed (perfect score)", xp: 100 },
  { event: "Mock exam completed", xp: 250 },
  { event: "Battle won", xp: 85 },
  { event: "Daily streak day", xp: 25 },
  { event: "Topic mastered", xp: 200 },
];

const badges = [
  { name: "Inferno", trigger: "30-day streak" },
  { name: "Sniper", trigger: "20 quizzes >90%" },
  { name: "Champion", trigger: "10 battle wins" },
  { name: "Perfect Mock", trigger: "100% mock exam" },
];

export default function AdminGamification() {
  return (
    <div className="max-w-5xl">
      <PageHeader eyebrow="Admin" title="Gamification" description="Tune XP rules and design new badges." />

      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-bold">XP rules</h3>
            <button className="text-xs font-semibold text-accent">Edit all</button>
          </div>
          <div className="space-y-2">
            {xpRules.map((r) => (
              <div key={r.event} className="flex items-center justify-between rounded-xl bg-secondary/40 p-3">
                <p className="text-sm">{r.event}</p>
                <span className="font-display font-extrabold text-accent">+{r.xp} XP</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-bold">Badges</h3>
            <button className="rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-accent-foreground flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5" /> New badge
            </button>
          </div>
          <div className="space-y-2">
            {badges.map((b) => (
              <div key={b.name} className="flex items-center gap-3 rounded-xl bg-secondary/40 p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground text-background">
                  <Trophy className="h-4 w-4 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{b.name}</p>
                  <p className="text-xs text-muted-foreground">{b.trigger}</p>
                </div>
                <button className="text-xs font-semibold text-accent">Edit</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
