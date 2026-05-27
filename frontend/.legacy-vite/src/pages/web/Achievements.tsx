import { Award, Lock, Flame, Trophy, Star, Zap, Brain, Target, Crown } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { cn } from "@/lib/utils";

const badges = [
  { icon: Flame, name: "Inferno", desc: "30-day streak", earned: true, rarity: "Rare" },
  { icon: Brain, name: "Quick Mind", desc: "Answer 100 questions in 10 min", earned: true, rarity: "Common" },
  { icon: Target, name: "Sniper", desc: "20 quizzes in a row above 90%", earned: true, rarity: "Epic" },
  { icon: Trophy, name: "Champion", desc: "Win 10 quiz battles", earned: false, rarity: "Rare" },
  { icon: Star, name: "Subject Master", desc: "100% on a full topic", earned: false, rarity: "Epic" },
  { icon: Zap, name: "Lightning", desc: "Avg <30s per question", earned: true, rarity: "Common" },
  { icon: Crown, name: "Top of Class", desc: "Reach top 10 leaderboard", earned: false, rarity: "Legendary" },
  { icon: Award, name: "Perfect Mock", desc: "100% on a full mock exam", earned: false, rarity: "Legendary" },
];

const rarityColor: Record<string, string> = {
  Common: "text-muted-foreground",
  Rare: "text-sky",
  Epic: "text-accent",
  Legendary: "text-success",
};

export default function Achievements() {
  const earned = badges.filter((b) => b.earned).length;
  return (
    <div className="max-w-6xl">
      <PageHeader
        eyebrow="Trophy room"
        title={`${earned} of ${badges.length} badges unlocked`}
        description="Keep showing up — every milestone unlocks XP boosts and bragging rights on the leaderboard."
      />

      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {badges.map(({ icon: Icon, name, desc, earned, rarity }) => (
          <div
            key={name}
            className={cn(
              "rounded-3xl border p-6 text-center transition-all",
              earned ? "border-border bg-card shadow-soft hover:-translate-y-1" : "border-dashed border-border bg-secondary/30"
            )}
          >
            <div
              className={cn(
                "mx-auto flex h-16 w-16 items-center justify-center rounded-2xl",
                earned ? "bg-foreground text-background" : "bg-secondary text-muted-foreground"
              )}
            >
              {earned ? <Icon className="h-7 w-7 text-accent" /> : <Lock className="h-6 w-6" />}
            </div>
            <p className="mt-4 font-display text-base font-bold">{name}</p>
            <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
            <p className={cn("mt-3 text-[10px] font-semibold uppercase tracking-wider", rarityColor[rarity])}>{rarity}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
