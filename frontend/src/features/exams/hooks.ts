"use client";

import { useQuery } from "@tanstack/react-query";
import { examsApi, flattenExamBodies, type ExamBody } from "@/lib/api/exams";

/**
 * TanStack Query hooks for the public exam catalog. Cached aggressively —
 * the catalog rarely changes, so a long stale time keeps the wire quiet.
 */

export const examKeys = {
  bodies: (category?: string) => ["exams", "bodies", category ?? "all"] as const,
  subjects: (code: string) => ["exams", "subjects", code] as const,
  topics: (code: string, subjectId: number) =>
    ["exams", "topics", code, subjectId] as const,
};

export function useExamBodies(category?: string) {
  return useQuery({
    queryKey: examKeys.bodies(category),
    queryFn: () => examsApi.listBodies(category),
    staleTime: 60 * 60_000,        // 1 hour
    select: (grouped): ExamBody[] => flattenExamBodies(grouped),
  });
}

export function useExamSubjects(code: string | null) {
  return useQuery({
    queryKey: examKeys.subjects(code ?? ""),
    queryFn: () => examsApi.listSubjects(code as string),
    enabled: Boolean(code),
    staleTime: 60 * 60_000,
  });
}

export function useExamTopics(code: string | null, subjectId: number | null) {
  return useQuery({
    queryKey: examKeys.topics(code ?? "", subjectId ?? 0),
    queryFn: () => examsApi.listTopics(code as string, subjectId as number),
    enabled: Boolean(code && subjectId),
    staleTime: 60 * 60_000,
  });
}
