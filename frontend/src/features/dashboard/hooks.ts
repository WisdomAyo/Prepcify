"use client";

import { useQuery } from "@tanstack/react-query";
import { masteryApi } from "@/lib/api/mastery";
import { sessionsApi } from "@/lib/api/sessions";
import { studyPlanApi } from "@/lib/api/study-plan";

/**
 * Hooks powering the student dashboard. Composed from mastery, recent
 * sessions, and the current AI-generated study plan.
 */

export const dashboardKeys = {
  mastery: ["me", "mastery"] as const,
  sessions: ["me", "sessions"] as const,
  studyPlan: ["me", "study-plan"] as const,
};

export function useMasterySummary() {
  return useQuery({
    queryKey: dashboardKeys.mastery,
    queryFn: () => masteryApi.summary(),
    staleTime: 60_000,
  });
}

export function useRecentSessions() {
  return useQuery({
    queryKey: dashboardKeys.sessions,
    queryFn: () => sessionsApi.list(),
    staleTime: 30_000,
  });
}

export function useCurrentStudyPlan() {
  return useQuery({
    queryKey: dashboardKeys.studyPlan,
    queryFn: () => studyPlanApi.current(),
    staleTime: 10 * 60_000,
  });
}
