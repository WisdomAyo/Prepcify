"use client";

import { useMemo, useState } from "react";
import { Crown, Lock } from "lucide-react";
import { BarProgress } from "@/components/ui/progress";
import { DataState } from "@/components/ui/data-state";
import { cn, getInitials } from "@/lib/utils";
import { useWeeklyLeaderboard, useLeaderboardBadges } from "./hooks";

type LeaderboardTab = "board" | "badges";

function ViewTabs({
  value,
  onChange,
}: {
  value: LeaderboardTab;
  onChange: (tab: LeaderboardTab) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Leaderboard view"
      className="grid grid-cols-2 gap-1 rounded-2xl bg-secondary p-1"
    >
      {(["board", "badges"] as const).map((tab) => (
        <button
          key={tab}
          role="tab"
          aria-selected={value === tab}
          onClick={() => onChange(tab)}
          className={cn(
            "rounded-xl px-5 py-2 text-sm font-semibold tap transition-colors",
            value === tab
              ? "bg-card text-foreground shadow-soft"
              : "text-muted-foreground",
          )}
        >
          {tab === "board" ? "Leaderboard" : "Achievements"}
        </button>
      ))}
    </div>
  );
}

function LeaderboardBoard() {
  const query = useWeeklyLeaderboard();
  const { podium, rest } = useMemo(() => {
    const ranks = query.data ?? [];
    return { podium: ranks.slice(0, 3), rest: ranks.slice(3) };
  }, [query.data]);
  const ranks = query.data ?? [];

  return (
    <DataState
      isLoading={query.isLoading}
      isError={query.isError}
      error={query.error}
      isEmpty={ranks.length === 0 && !query.isLoading}
      onRetry={() => void query.refetch()}
    >
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <section className="rounded-3xl bg-foreground p-8 text-background lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-background/60">
                This week · Lagos
              </p>
              <p className="mt-1 font-display text-2xl font-bold">
                Top scholars
              </p>
            </div>
            <p className="text-xs text-background/60">Resets in 2d 14h</p>
          </div>
          <div className="mt-10 flex items-end justify-around">
            {[1, 0, 2].map((rankIndex, position) => {
              const rank = podium[rankIndex];
              if (!rank) return null;
              const heights = ["h-28", "h-40", "h-20"];
              const colors = [
                "bg-background/15",
                "bg-accent text-accent-foreground",
                "bg-background/10",
              ];
              return (
                <div key={rank.name} className="flex flex-col items-center">
                  <div className="relative">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background font-display text-lg font-bold text-foreground">
                      {getInitials(rank.name)}
                    </div>
                    {rankIndex === 0 && (
                      <Crown className="absolute -top-5 left-1/2 h-6 w-6 -translate-x-1/2 text-accent" />
                    )}
                  </div>
                  <p className="mt-3 text-sm font-medium text-background/90">
                    {rank.name.split(" ")[0]}
                  </p>
                  <p className="text-[11px] text-background/60">
                    {rank.xp.toLocaleString()} XP
                  </p>
                  <div
                    className={cn(
                      "mt-3 flex w-20 items-start justify-center rounded-t-2xl pt-3 font-display text-lg font-bold",
                      heights[position],
                      colors[position],
                    )}
                  >
                    {rankIndex + 1}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-soft">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Your week
            </p>
            <p className="mt-1 font-display text-3xl font-bold">
              +1,205 XP
            </p>
            <p className="text-sm text-success">↑ 18% vs. last week</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "#14", label: "Lagos rank" },
              { value: "#412", label: "Nigeria rank" },
              { value: "37", label: "Quizzes" },
              { value: "92%", label: "Accuracy" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl bg-secondary p-3">
                <p className="font-display text-lg font-bold">{stat.value}</p>
                <p className="text-[11px] text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-border bg-card p-2 shadow-soft lg:col-span-3">
          <table className="w-full">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3 text-left font-semibold">Rank</th>
                <th className="px-5 py-3 text-left font-semibold">Student</th>
                <th className="hidden px-5 py-3 text-left font-semibold md:table-cell">
                  School
                </th>
                <th className="hidden px-5 py-3 text-left font-semibold md:table-cell">
                  Region
                </th>
                <th className="px-5 py-3 text-right font-semibold">XP</th>
              </tr>
            </thead>
            <tbody>
              {rest.map((rank, index) => (
                <tr
                  key={rank.name}
                  className={cn(
                    "animate-fade-in border-t border-border",
                    rank.you && "bg-secondary/40",
                  )}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <td className="px-5 py-3.5 font-display font-bold text-muted-foreground">
                    {index + 4}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-sm font-bold">
                        {getInitials(rank.name)}
                      </div>
                      <span className="text-sm font-semibold">{rank.name}</span>
                      {rank.you && (
                        <span className="chip bg-accent text-accent-foreground">
                          You
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="hidden px-5 py-3.5 text-sm text-muted-foreground md:table-cell">
                    {rank.school}
                  </td>
                  <td className="hidden px-5 py-3.5 text-sm text-muted-foreground md:table-cell">
                    {rank.country}
                  </td>
                  <td className="px-5 py-3.5 text-right font-bold tabular-nums">
                    {rank.xp.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </DataState>
  );
}

function AchievementsBoard() {
  const query = useLeaderboardBadges();
  const badges = query.data ?? [];
  const earnedBadges = badges.filter((badge) => badge.owned);

  return (
    <DataState
      isLoading={query.isLoading}
      isError={query.isError}
      error={query.error}
      isEmpty={badges.length === 0 && !query.isLoading}
      onRetry={() => void query.refetch()}
    >
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <section className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Level 14
          </p>
          <p className="font-display text-2xl font-bold">Scholar</p>
          <BarProgress value={82} className="mt-4" label="Level progress" />
          <p className="mt-2 text-xs text-muted-foreground">
            1,240 / 1,500 XP — 260 to{" "}
            <span className="font-semibold text-foreground">Sage</span>
          </p>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-soft lg:col-span-2">
          <h2 className="font-display text-lg font-bold">Recently earned</h2>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {earnedBadges.map((badge) => {
              const Icon = badge.icon;
              return (
                <div
                  key={badge.name}
                  className="flex flex-col items-center rounded-2xl bg-secondary/60 p-4 text-center"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground">
                    <Icon className="h-6 w-6" strokeWidth={1.75} />
                  </div>
                  <p className="mt-2 text-sm font-semibold">{badge.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {badge.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="lg:col-span-3">
          <h2 className="font-display text-2xl font-bold">All achievements</h2>
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {badges.map((badge, index) => {
              const Icon = badge.icon;
              return (
                <div
                  key={badge.name}
                  className={cn(
                    "flex animate-scale-in flex-col items-center justify-center rounded-3xl border p-5 text-center",
                    badge.owned
                      ? "border-border bg-card"
                      : "border-dashed border-border bg-secondary/40",
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div
                    className={cn(
                      "flex h-16 w-16 items-center justify-center rounded-full",
                      badge.owned
                        ? "bg-accent text-accent-foreground"
                        : "border border-border bg-card text-muted-foreground",
                    )}
                  >
                    {badge.owned ? (
                      <Icon className="h-7 w-7" strokeWidth={1.75} />
                    ) : (
                      <Lock className="h-5 w-5" />
                    )}
                  </div>
                  <p
                    className={cn(
                      "mt-3 text-sm font-semibold",
                      !badge.owned && "text-muted-foreground",
                    )}
                  >
                    {badge.name}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {badge.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </DataState>
  );
}

export function LeaderboardPage() {
  const [tab, setTab] = useState<LeaderboardTab>("board");

  return (
    <div className="max-w-7xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight">
            Compete
          </h1>
          <p className="mt-1 text-muted-foreground">
            Earn XP. Climb the ranks. Friendly fire only.
          </p>
        </div>
        <ViewTabs value={tab} onChange={setTab} />
      </div>

      {tab === "board" ? <LeaderboardBoard /> : <AchievementsBoard />}
    </div>
  );
}
