"use client";

import { useQuery } from "@tanstack/react-query";

/**
 * Mock community groups adapter.
 * TODO(backend): swap to `api.get("/community/groups")` when shipped.
 */
export interface CommunityGroup {
  id: string;
  name: string;
  members: number;
  online: number;
  topic: string;
  color: string;
}

const MOCK: CommunityGroup[] = [
  { id: "jamb-2025", name: "JAMB 2025 Warriors", members: 1240, online: 38, topic: "JAMB UTME prep", color: "bg-foreground text-background" },
  { id: "math-club", name: "Math Club Lagos", members: 320, online: 12, topic: "Mathematics", color: "bg-accent text-accent-foreground" },
  { id: "physics-help", name: "Physics SOS", members: 540, online: 21, topic: "Physics doubts", color: "bg-sky text-sky-foreground" },
  { id: "english-essays", name: "English Essay Lab", members: 198, online: 7, topic: "Writing & comprehension", color: "bg-secondary text-foreground" },
  { id: "waec-2025", name: "WAEC Class of 2025", members: 2810, online: 76, topic: "WAEC SSCE", color: "bg-success/15 text-success border border-success/30" },
];

export const communityKeys = {
  groups: ["community", "groups"] as const,
  group: (id: string) => ["community", "groups", id] as const,
};

export function useCommunityGroups() {
  return useQuery({
    queryKey: communityKeys.groups,
    // TODO(backend): GET /api/v1/community/groups
    queryFn: async () => MOCK,
    staleTime: Infinity,
  });
}

export function useCommunityGroup(id: string | null) {
  return useQuery({
    queryKey: communityKeys.group(id ?? ""),
    queryFn: async () => MOCK.find((g) => g.id === id) ?? null,
    enabled: Boolean(id),
    staleTime: Infinity,
  });
}
