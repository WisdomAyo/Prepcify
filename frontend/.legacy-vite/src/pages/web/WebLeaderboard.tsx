import { useState } from "react";
import { Crown, Flame, Medal, Award, Trophy, Star, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { BarProgress } from "@/components/Progress";

const ranks = [
  { name: "Chiamaka O.", xp: 4820, school: "King's College", country: "Lagos" },
  { name: "Tunde A.", xp: 4610, school: "Loyola Jesuit", country: "Abuja" },
  { name: "Fatima M.", xp: 4380, school: "Queen's College", country: "Lagos" },
  { name: "Adaeze (you)", xp: 4205, school: "FGGC Lagos", country: "Lagos", you: true },
  { name: "Kelechi N.", xp: 3980, school: "Greenspring", country: "Lagos" },
  { name: "Sade O.", xp: 3760, school: "Atlantic Hall", country: "Lagos" },
  { name: "Ibrahim K.", xp: 3540, school: "Federal College", country: "Kaduna" },
  { name: "Aisha B.", xp: 3490, school: "Capital Science", country: "Abuja" },
];

const podium = ranks.slice(0, 3);
const rest = ranks.slice(3);

const badges = [
  { name: "First Quiz", icon: Star, owned: true, desc: "Completed your first quiz" },
  { name: "Week Warrior", icon: Flame, owned: true, desc: "7 day streak" },
  { name: "Quiz Master", icon: Medal, owned: true, desc: "Score 100% in 5 quizzes" },
  { name: "Top 10", icon: Trophy, owned: false, desc: "Reach top 10 weekly" },
  { name: "Streak 30", icon: Award, owned: false, desc: "30 day streak" },
  { name: "Perfectionist", icon: Crown, owned: false, desc: "Mock exam ≥ 95%" },
];

export default function WebLeaderboard() {
  const [tab, setTab] = useState<"board" | "badges">("board");
  return (
    <div className="space-y-8 max-w-7xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight">Compete</h1>
          <p className="mt-1 text-muted-foreground">Earn XP. Climb the ranks. Friendly fire only.</p>
        </div>
        <div className="grid grid-cols-2 gap-1 rounded-2xl bg-secondary p-1">
          {(["board", "badges"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "rounded-xl px-5 py-2 text-sm font-semibold tap transition-colors",
                tab === t ? "bg-card text-foreground shadow-soft" : "text-muted-foreground"
              )}
            >
              {t === "board" ? "Leaderboard" : "Achievements"}
            </button>
          ))}
        </div>
      </div>

      {tab === "board" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Podium */}
          <section className="lg:col-span-2 rounded-3xl bg-foreground p-8 text-background">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-background/60">This week · Lagos</p>
                <p className="mt-1 font-display text-2xl font-bold">Top scholars</p>
              </div>
              <p className="text-xs text-background/60">Resets in 2d 14h</p>
            </div>
            <div className="mt-10 flex items-end justify-around">
              {[1, 0, 2].map((idx, pos) => {
                const p = podium[idx];
                const heights = ["h-28", "h-40", "h-20"];
                const colors = ["bg-background/15", "bg-accent text-accent-foreground", "bg-background/10"];
                return (
                  <div key={p.name} className="flex flex-col items-center">
                    <div className="relative">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background text-foreground font-display text-lg font-bold">
                        {p.name.charAt(0)}
                      </div>
                      {idx === 0 && <Crown className="absolute -top-5 left-1/2 -translate-x-1/2 h-6 w-6 text-accent" />}
                    </div>
                    <p className="mt-3 text-sm font-medium text-background/90">{p.name.split(" ")[0]}</p>
                    <p className="text-[11px] text-background/60">{p.xp.toLocaleString()} XP</p>
                    <div className={cn("mt-3 w-20 rounded-t-2xl flex items-start justify-center pt-3 font-display text-lg font-bold", heights[pos], colors[pos])}>
                      {idx + 1}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Stats */}
          <section className="rounded-3xl border border-border bg-card p-6 shadow-soft space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Your week</p>
              <p className="mt-1 font-display text-3xl font-extrabold">+1,205 XP</p>
              <p className="text-sm text-success">↑ 18% vs. last week</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[{ k: "#14", v: "Lagos rank" }, { k: "#412", v: "Nigeria rank" }, { k: "37", v: "Quizzes" }, { k: "92%", v: "Accuracy" }].map((s) => (
                <div key={s.v} className="rounded-2xl bg-secondary p-3">
                  <p className="font-display text-lg font-bold">{s.k}</p>
                  <p className="text-[11px] text-muted-foreground">{s.v}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Full board */}
          <section className="lg:col-span-3 rounded-3xl border border-border bg-card p-2 shadow-soft overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3 text-left font-semibold">Rank</th>
                  <th className="px-5 py-3 text-left font-semibold">Student</th>
                  <th className="px-5 py-3 text-left font-semibold hidden md:table-cell">School</th>
                  <th className="px-5 py-3 text-left font-semibold hidden md:table-cell">Region</th>
                  <th className="px-5 py-3 text-right font-semibold">XP</th>
                </tr>
              </thead>
              <tbody>
                {rest.map((r, i) => (
                  <tr key={r.name} className={cn("border-t border-border animate-fade-in", r.you && "bg-secondary/40")} style={{ animationDelay: `${i * 30}ms` }}>
                    <td className="px-5 py-3.5 font-display font-bold text-muted-foreground">{i + 4}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-sm font-bold">{r.name.charAt(0)}</div>
                        <span className="text-sm font-semibold">{r.name}</span>
                        {r.you && <span className="chip bg-accent text-accent-foreground">You</span>}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground hidden md:table-cell">{r.school}</td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground hidden md:table-cell">{r.country}</td>
                    <td className="px-5 py-3.5 text-right font-bold tabular-nums">{r.xp.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <section className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Level 14</p>
            <p className="font-display text-2xl font-bold">Scholar</p>
            <BarProgress value={82} className="mt-4" />
            <p className="mt-2 text-xs text-muted-foreground">1,240 / 1,500 XP — 260 to <span className="font-semibold text-foreground">Sage</span></p>
          </section>

          <section className="lg:col-span-2 rounded-3xl border border-border bg-card p-6 shadow-soft">
            <h2 className="font-display text-lg font-bold">Recently earned</h2>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {badges.filter(b => b.owned).map((b) => {
                const Icon = b.icon;
                return (
                  <div key={b.name} className="flex flex-col items-center text-center rounded-2xl bg-secondary/60 p-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground">
                      <Icon className="h-6 w-6" strokeWidth={1.75} />
                    </div>
                    <p className="mt-2 text-sm font-semibold">{b.name}</p>
                    <p className="text-[11px] text-muted-foreground">{b.desc}</p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="lg:col-span-3">
            <h2 className="font-display text-2xl font-bold">All achievements</h2>
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {badges.map((b, i) => {
                const Icon = b.icon;
                return (
                  <div
                    key={b.name}
                    className={cn(
                      "flex flex-col items-center justify-center rounded-3xl border p-5 text-center animate-scale-in",
                      b.owned ? "border-border bg-card" : "border-dashed border-border bg-secondary/40"
                    )}
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className={cn(
                      "flex h-16 w-16 items-center justify-center rounded-full",
                      b.owned ? "bg-accent text-accent-foreground" : "bg-card text-muted-foreground border border-border"
                    )}>
                      {b.owned ? <Icon className="h-7 w-7" strokeWidth={1.75} /> : <Lock className="h-5 w-5" />}
                    </div>
                    <p className={cn("mt-3 text-sm font-semibold", !b.owned && "text-muted-foreground")}>{b.name}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{b.desc}</p>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
