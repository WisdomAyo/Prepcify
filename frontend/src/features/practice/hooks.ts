"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { questionsApi, type QuestionFilters } from "@/lib/api/questions";
import { attemptsApi, type AttemptInput } from "@/lib/api/attempts";
import { mockExamsApi } from "@/lib/api/mock-exams";
import { sessionsApi, type StudyContext } from "@/lib/api/sessions";

export const practiceKeys = {
  questionList: (filters: QuestionFilters) =>
    ["questions", filters] as const,
  question: (id: number) => ["questions", id] as const,
  similar: (id: number) => ["questions", id, "similar"] as const,
  mockExam: (id: number) => ["me", "mock-exams", id] as const,
  mockExamNext: (id: number) => ["me", "mock-exams", id, "next"] as const,
};

/* --- Questions ------------------------------------------------------------ */

export function useQuestions(filters: QuestionFilters = {}) {
  return useQuery({
    queryKey: practiceKeys.questionList(filters),
    queryFn: () => questionsApi.list(filters),
    staleTime: 60_000,
  });
}

export function useQuestion(id: number | null) {
  return useQuery({
    queryKey: practiceKeys.question(id ?? 0),
    queryFn: () => questionsApi.show(id as number),
    enabled: Boolean(id),
  });
}

export function useReportQuestion() {
  return useMutation({
    mutationFn: ({
      id,
      reason,
      detail,
    }: {
      id: number;
      reason: "unclear" | "incorrect" | "offensive" | "duplicate" | "other";
      detail?: string;
    }) => questionsApi.report(id, { reason, detail }),
  });
}

/* --- Attempts ------------------------------------------------------------- */

/**
 * Record a single attempt. The caller is responsible for providing a stable
 * `client_uuid` so retries are idempotent (Laravel keys off it).
 */
export function useRecordAttempt() {
  return useMutation({
    mutationFn: (input: AttemptInput) => attemptsApi.record(input),
  });
}

export function useRecordAttemptsBatch() {
  return useMutation({
    mutationFn: (attempts: AttemptInput[]) => attemptsApi.recordBatch(attempts),
  });
}

/* --- Sessions ------------------------------------------------------------- */

export function useStartSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (context: StudyContext) => sessionsApi.start(context),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me", "sessions"] }),
  });
}

export function useEndSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => sessionsApi.end(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me", "sessions"] }),
  });
}

/* --- Mock exams ----------------------------------------------------------- */

export function useStartMockExam() {
  return useMutation({
    mutationFn: (input: { exam_body_id: number; subject_ids: number[] }) =>
      mockExamsApi.start(input),
  });
}

export function useNextMockExamQuestion(id: number | null) {
  return useQuery({
    queryKey: practiceKeys.mockExamNext(id ?? 0),
    queryFn: () => mockExamsApi.next(id as number),
    enabled: Boolean(id),
    staleTime: 0, // always fresh per question
  });
}

export function useSubmitMockExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => mockExamsApi.submit(id),
    onSuccess: (exam) => {
      qc.setQueryData(practiceKeys.mockExam(exam.id), exam);
    },
  });
}
