"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Award, Flame, Trophy, Star, Zap, Brain, Target, Crown,
  type LucideIcon,
} from "lucide-react";

/**
 * Mock achievements adapter.
 * TODO(backend): swap to `api.get("/me/achievements")` when shipped.
 */
export type BadgeRarity = "Common" | "Rare" | "Epic" | "Legendary";

export interface Badge {
  icon: LucideIcon;
  name: string;
  desc: string;
  earned: boolean;
  rarity: BadgeRarity;
}

const MOCK: Badge[] = [
  { icon: Flame, name: "Inferno", desc: "30-day streak", earned: true, rarity: "Rare" },
  { icon: Brain, name: "Quick Mind", desc: "Answer 100 questions in 10 min", earned: true, rarity: "Common" },
  { icon: Target, name: "Sniper", desc: "20 quizzes in a row above 90%", earned: true, rarity: "Epic" },
  { icon: Trophy, name: "Champion", desc: "Win 10 quiz battles", earned: false, rarity: "Rare" },
  { icon: Star, name: "Subject Master", desc: "100% on a full topic", earned: false, rarity: "Epic" },
  { icon: Zap, name: "Lightning", desc: "Avg <30s per question", earned: true, rarity: "Common" },
  { icon: Crown, name: "Top of Class", desc: "Reach top 10 leaderboard", earned: false, rarity: "Legendary" },
  { icon: Award, name: "Perfect Mock", desc: "100% on a full mock exam", earned: false, rarity: "Legendary" },
];

export const achievementsKeys = { list: ["me", "achievements"] as const };

export function useAchievements() {
  return useQuery({
    queryKey: achievementsKeys.list,
    // TODO(backend): GET /api/v1/me/achievements
    queryFn: async () => MOCK,
    staleTime: Infinity,
  });
}
