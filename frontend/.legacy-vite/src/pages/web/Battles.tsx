import { Link } from "react-router-dom";
import { Swords, Users, Trophy, Zap, Crown } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

const recent = [
  { id: 1, opp: "Tomi A.", subject: "Maths", result: "W", score: "8–6" },
  { id: 2, opp: "Bisi K.", subject: "Physics", result: "L", score: "5–7" },
  { id: 3, opp: "Femi O.", subject: "English", result: "W", score: "9–4" },
  { id: 4, opp: "Sade M.", subject: "Chem", result: "W", score: "7–5" },
];

const modes = [
  { id: "1v1", icon: Swords, title: "1 v 1", desc: "Best of 10. ~5 min.", to: "/app/battles/live" },
  { id: "squad", icon: Users, title: "Squad (4 v 4)", desc: "Team up with friends.", to: "/app/battles/live" },
  { id: "ranked", icon: Crown, title: "Ranked", desc: "Climb the global ladder.", to: "/app/battles/live" },
];

export default function Battles() {
  return (
    <div className="max-w-6xl">
      <PageHeader eyebrow="Quiz Battles" title="Test your speed against real students" description="Pick a mode and we'll match you with someone at your level." />

      <div className="grid gap-5 md:grid-cols-3 mb-8">
        {modes.map(({ id, icon: Icon, title, desc, to }) => (
          <Link key={id} to={to} className="group rounded-3xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-card">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground text-background">
              <Icon className="h-5 w-5 text-accent" />
            </div>
            <h3 className="mt-4 font-display text-xl font-bold">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            <p className="mt-4 text-xs font-semibold text-accent">Find match →</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="rounded-3xl border border-border bg-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-display text-lg font-bold">Recent battles</h3>
            <span className="text-xs text-muted-foreground">Last 7 days</span>
          </div>
          {recent.map((m) => (
            <div key={m.id} className="px-6 py-4 border-b border-border last:border-0 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-sm font-bold">
                {m.opp.split(" ").map((p) => p[0]).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{m.opp}</p>
                <p className="text-xs text-muted-foreground">{m.subject} · {m.score}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${m.result === "W" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
                {m.result === "W" ? "Won" : "Lost"}
              </span>
            </div>
          ))}
        </div>

        <div className="rounded-3xl bg-foreground text-background p-6">
          <Trophy className="h-5 w-5 text-accent" />
          <p className="mt-3 font-display text-3xl font-extrabold">Gold III</p>
          <p className="text-sm text-background/70">Win 3 more to reach Platinum.</p>
          <div className="mt-4 h-2 rounded-full bg-background/10 overflow-hidden">
            <div className="h-full bg-accent rounded-full" style={{ width: "68%" }} />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-background/60">
            <span>17 / 25</span>
            <Zap className="h-3.5 w-3.5 text-accent" />
          </div>
        </div>
      </div>
    </div>
  );
}
