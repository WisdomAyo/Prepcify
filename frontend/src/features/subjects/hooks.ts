"use client";

import { useQuery } from "@tanstack/react-query";
import { masteryApi } from "@/lib/api/mastery";

export const subjectsKeys = {
  topicMastery: (topicId: number) => ["me", "mastery", "topic", topicId] as const,
};

export function useTopicMastery(topicId: number | null) {
  return useQuery({
    queryKey: subjectsKeys.topicMastery(topicId ?? 0),
    queryFn: () => masteryApi.topic(topicId as number),
    enabled: Boolean(topicId),
    staleTime: 60_000,
  });
}
