"use client";

import Link from "next/link";
import { Swords, Users, Trophy, Zap, Crown } from "lucide-react";
import { PageHeader } from "@/components/shells/page-header";
import { DataState } from "@/components/ui/data-state";
import { useRecentBattles } from "@/features/battles/data";
import { getInitials } from "@/lib/utils";

const modes = [
  { id: "1v1", icon: Swords, title: "1 v 1", desc: "Best of 10. ~5 min.", href: "/app/battles/live" },
  { id: "squad", icon: Users, title: "Squad (4 v 4)", desc: "Team up with friends.", href: "/app/battles/live" },
  { id: "ranked", icon: Crown, title: "Ranked", desc: "Climb the global ladder.", href: "/app/battles/live" },
];

export default function BattlesPage() {
  const recentQuery = useRecentBattles();
  const recent = recentQuery.data ?? [];

  return (
    <div className="max-w-6xl">
      <PageHeader
        eyebrow="Quiz Battles"
        title="Test your speed against real students"
        description="Pick a mode and we'll match you with someone at your level."
      />

      <div className="mb-8 grid gap-5 md:grid-cols-3">
        {modes.map(({ id, icon: Icon, title, desc, href }) => (
          <Link
            key={id}
            href={href}
            className="group rounded-3xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-card"
          >
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
        <div className="overflow-hidden rounded-3xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h3 className="font-display text-lg font-bold">Recent battles</h3>
            <span className="text-xs text-muted-foreground">Last 7 days</span>
          </div>
          <DataState
            isLoading={recentQuery.isLoading}
            isError={recentQuery.isError}
            error={recentQuery.error}
            isEmpty={recent.length === 0 && !recentQuery.isLoading}
            onRetry={() => void recentQuery.refetch()}
          >
            {recent.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-4 border-b border-border px-6 py-4 last:border-0"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-sm font-bold">
                  {getInitials(m.opp)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{m.opp}</p>
                  <p className="text-xs text-muted-foreground">
                    {m.subject} · {m.score}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    m.result === "W"
                      ? "bg-success/15 text-success"
                      : "bg-destructive/15 text-destructive"
                  }`}
                >
                  {m.result === "W" ? "Won" : "Lost"}
                </span>
              </div>
            ))}
          </DataState>
        </div>

        <div className="rounded-3xl bg-foreground p-6 text-background">
          <Trophy className="h-5 w-5 text-accent" />
          <p className="mt-3 font-display text-3xl font-bold">Gold III</p>
          <p className="text-sm text-background/70">
            Win 3 more to reach Platinum.
          </p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-background/10">
            <div
              className="h-full rounded-full bg-accent"
              style={{ width: "68%" }}
            />
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
