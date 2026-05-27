import { ScreenHeader } from "@/components/ScreenHeader";
import { Crown, Flame, Medal, Award, Trophy, Star, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { BarProgress } from "@/components/Progress";

const ranks = [
  { name: "Chiamaka O.", xp: 4820, you: false },
  { name: "Tunde A.", xp: 4610, you: false },
  { name: "Fatima M.", xp: 4380, you: false },
  { name: "Adaeze (you)", xp: 4205, you: true },
  { name: "Kelechi N.", xp: 3980, you: false },
  { name: "Sade O.", xp: 3760, you: false },
  { name: "Ibrahim K.", xp: 3540, you: false },
];

const podium = ranks.slice(0, 3);
const rest = ranks.slice(3);

const badges = [
  { name: "First Quiz", icon: Star, owned: true },
  { name: "Week Warrior", icon: Flame, owned: true },
  { name: "Quiz Master", icon: Medal, owned: true },
  { name: "Top 10", icon: Trophy, owned: false },
  { name: "Streak 30", icon: Award, owned: false },
  { name: "Perfectionist", icon: Crown, owned: false },
];

export default function Leaderboard() {
  const [tab, setTab] = useState<"board" | "badges">("board");
  return (
    <div className="pb-6">
      <ScreenHeader title="Compete" subtitle="Earn XP. Climb the ranks." />

      <div className="mx-5 grid grid-cols-2 gap-1 rounded-2xl bg-secondary p-1">
        {(["board", "badges"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "rounded-xl py-2 text-sm font-semibold tap transition-colors",
              tab === t ? "bg-card text-foreground shadow-soft" : "text-muted-foreground"
            )}
          >
            {t === "board" ? "Leaderboard" : "Achievements"}
          </button>
        ))}
      </div>

      {tab === "board" ? (
        <>
          {/* Podium */}
          <section className="mx-5 mt-5 rounded-3xl bg-foreground p-5 text-background">
            <p className="text-xs uppercase tracking-wider text-background/60">This week · Lagos</p>
            <div className="mt-5 flex items-end justify-around">
              {[1, 0, 2].map((idx, pos) => {
                const p = podium[idx];
                const heights = ["h-20", "h-28", "h-16"];
                const colors = ["bg-background/15", "bg-accent text-accent-foreground", "bg-background/10"];
                return (
                  <div key={p.name} className="flex flex-col items-center">
                    <div className="relative">
                      <div className={cn("flex h-14 w-14 items-center justify-center rounded-full bg-background text-foreground font-display text-base font-bold")}>
                        {p.name.charAt(0)}
                      </div>
                      {idx === 0 && <Crown className="absolute -top-4 left-1/2 -translate-x-1/2 h-5 w-5 text-accent" />}
                    </div>
                    <p className="mt-2 text-xs font-medium text-background/90 truncate max-w-[80px]">{p.name.split(" ")[0]}</p>
                    <p className="text-[11px] text-background/60">{p.xp.toLocaleString()} XP</p>
                    <div className={cn("mt-2 w-16 rounded-t-2xl flex items-start justify-center pt-2 font-display text-sm font-bold", heights[pos], colors[pos])}>
                      {idx + 1}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="mt-5 px-5">
            <ul className="space-y-2">
              {rest.map((r, i) => (
                <li
                  key={r.name}
                  className={cn(
                    "flex items-center gap-4 rounded-2xl border bg-card p-3.5 animate-fade-in",
                    r.you ? "border-foreground" : "border-border"
                  )}
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <span className="w-6 text-center font-display text-sm font-bold text-muted-foreground">{i + 4}</span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-bold">{r.name.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.xp.toLocaleString()} XP</p>
                  </div>
                  {r.you && <span className="chip bg-accent text-accent-foreground">You</span>}
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : (
        <>
          {/* Level card */}
          <section className="mx-5 mt-5 rounded-3xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Level 14</p>
                <p className="font-display text-lg font-bold">Scholar</p>
              </div>
              <p className="font-display text-sm font-bold text-muted-foreground">1,240 / 1,500 XP</p>
            </div>
            <BarProgress value={82} className="mt-4" />
            <p className="mt-2 text-xs text-muted-foreground">260 XP to <span className="font-semibold text-foreground">Sage</span></p>
          </section>

          <section className="mt-6 px-5">
            <h2 className="font-display text-lg font-bold">Badges</h2>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {badges.map((b, i) => {
                const Icon = b.icon;
                return (
                  <div
                    key={b.name}
                    className={cn(
                      "flex flex-col items-center justify-center rounded-3xl border p-4 text-center animate-scale-in",
                      b.owned ? "border-border bg-card" : "border-dashed border-border bg-secondary/40"
                    )}
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className={cn(
                      "flex h-14 w-14 items-center justify-center rounded-full",
                      b.owned ? "bg-accent text-accent-foreground" : "bg-card text-muted-foreground border border-border"
                    )}>
                      {b.owned ? <Icon className="h-6 w-6" strokeWidth={1.75} /> : <Lock className="h-5 w-5" />}
                    </div>
                    <p className={cn("mt-2 text-[11px] font-semibold leading-tight", !b.owned && "text-muted-foreground")}>{b.name}</p>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
