"use client";

import { useQuery } from "@tanstack/react-query";
import {
  leaderboardRanks,
  achievementBadges,
  type LeaderboardRank,
  type AchievementBadge,
} from "./leaderboard-data";

/**
 * Mock leaderboard adapter.
 * TODO(backend): swap to `api.get("/leaderboard/weekly?location=Lagos")`
 * when the leaderboard service ships. Hook signature stays identical.
 */
export const leaderboardKeys = {
  weekly: (scope: string) => ["leaderboard", "weekly", scope] as const,
  badges: ["leaderboard", "badges"] as const,
};

export function useWeeklyLeaderboard(scope: string = "lagos") {
  return useQuery({
    queryKey: leaderboardKeys.weekly(scope),
    // TODO(backend): GET /api/v1/leaderboard/weekly?location=…
    queryFn: async (): Promise<LeaderboardRank[]> => leaderboardRanks,
    staleTime: Infinity,
  });
}

export function useLeaderboardBadges() {
  return useQuery({
    queryKey: leaderboardKeys.badges,
    queryFn: async (): Promise<AchievementBadge[]> => achievementBadges,
    staleTime: Infinity,
  });
}
