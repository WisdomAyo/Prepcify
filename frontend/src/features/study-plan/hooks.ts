"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { studyPlanApi } from "@/lib/api/study-plan";

export const studyPlanKeys = {
  current: ["me", "study-plan"] as const,
};

export function useStudyPlan() {
  return useQuery({
    queryKey: studyPlanKeys.current,
    queryFn: () => studyPlanApi.current(),
    staleTime: 10 * 60_000,
  });
}

export function useRegenerateStudyPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => studyPlanApi.regenerate(),
    onSuccess: (plan) => qc.setQueryData(studyPlanKeys.current, plan),
  });
}
