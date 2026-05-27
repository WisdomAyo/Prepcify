"use client";

import { Lock } from "lucide-react";
import { PageHeader } from "@/components/shells/page-header";
import { DataState } from "@/components/ui/data-state";
import { useAchievements } from "@/features/achievements/data";
import { cn } from "@/lib/utils";

const rarityColor: Record<string, string> = {
  Common: "text-muted-foreground",
  Rare: "text-sky",
  Epic: "text-accent",
  Legendary: "text-success",
};

export default function AchievementsPage() {
  const query = useAchievements();
  const badges = query.data ?? [];
  const earned = badges.filter((b) => b.earned).length;

  return (
    <div className="max-w-6xl">
      <PageHeader
        eyebrow="Trophy room"
        title={
          query.isLoading
            ? "Achievements"
            : `${earned} of ${badges.length} badges unlocked`
        }
        description="Keep showing up — every milestone unlocks XP boosts and bragging rights on the leaderboard."
      />

      <DataState
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        isEmpty={badges.length === 0 && !query.isLoading}
        onRetry={() => void query.refetch()}
      >
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {badges.map(({ icon: Icon, name, desc, earned, rarity }) => (
            <div
              key={name}
              className={cn(
                "rounded-3xl border p-6 text-center transition-all",
                earned
                  ? "border-border bg-card shadow-soft hover:-translate-y-1"
                  : "border-dashed border-border bg-secondary/30",
              )}
            >
              <div
                className={cn(
                  "mx-auto flex h-16 w-16 items-center justify-center rounded-2xl",
                  earned
                    ? "bg-foreground text-background"
                    : "bg-secondary text-muted-foreground",
                )}
              >
                {earned ? (
                  <Icon className="h-7 w-7 text-accent" />
                ) : (
                  <Lock className="h-6 w-6" />
                )}
              </div>
              <p className="mt-4 font-display text-base font-bold">{name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
              <p
                className={cn(
                  "mt-3 text-[10px] font-semibold uppercase tracking-wider",
                  rarityColor[rarity],
                )}
              >
                {rarity}
              </p>
            </div>
          ))}
        </div>
      </DataState>
    </div>
  );
}
