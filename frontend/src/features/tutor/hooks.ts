"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { tutorApi } from "@/lib/api/tutor";

export const tutorKeys = {
  sessions: ["me", "tutor", "sessions"] as const,
  messages: (sessionId: number) =>
    ["me", "tutor", "sessions", sessionId, "messages"] as const,
};

export function useTutorSessions() {
  return useQuery({
    queryKey: tutorKeys.sessions,
    queryFn: () => tutorApi.listSessions(),
    staleTime: 30_000,
  });
}

export function useTutorMessages(sessionId: number | null) {
  return useQuery({
    queryKey: tutorKeys.messages(sessionId ?? 0),
    queryFn: () => tutorApi.messages(sessionId as number),
    enabled: Boolean(sessionId),
    staleTime: 10_000,
  });
}

export function useStartTutorSession() {
  return useMutation({
    mutationFn: () => tutorApi.startSession(),
  });
}
