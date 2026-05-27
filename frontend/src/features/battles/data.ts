"use client";

import { useQuery } from "@tanstack/react-query";

/**
 * Mock battles adapter.
 * TODO(backend): swap to `api.get("/me/battles/recent")` and `findMatch()`
 * when the battle service ships. Live battles need a WebSocket transport.
 */
export interface RecentBattle {
  id: number;
  opp: string;
  subject: string;
  result: "W" | "L";
  score: string;
}

const MOCK: RecentBattle[] = [
  { id: 1, opp: "Tomi A.", subject: "Maths", result: "W", score: "8–6" },
  { id: 2, opp: "Bisi K.", subject: "Physics", result: "L", score: "5–7" },
  { id: 3, opp: "Femi O.", subject: "English", result: "W", score: "9–4" },
  { id: 4, opp: "Sade M.", subject: "Chem", result: "W", score: "7–5" },
];

export const battleKeys = { recent: ["me", "battles", "recent"] as const };

export function useRecentBattles() {
  return useQuery({
    queryKey: battleKeys.recent,
    // TODO(backend): GET /api/v1/me/battles/recent
    queryFn: async () => MOCK,
    staleTime: Infinity,
  });
}
