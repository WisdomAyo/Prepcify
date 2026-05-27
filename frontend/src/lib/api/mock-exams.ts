import { api } from "./client";
import type { Question } from "./questions";

/** POST/GET /api/v1/me/mock-exams. */
export type MockExamStatus = "in_progress" | "submitted" | "graded";

export interface MockExam {
  id: number;
  exam_body_id: number;
  subject_ids: number[];
  status: MockExamStatus;
  started_at: string;
  submitted_at: string | null;
  total_score: number | null;
  max_score: number;
  percentile: number | null;
  breakdown: Record<string, unknown> | null;
}

export const mockExamsApi = {
  start(input: { exam_body_id: number; subject_ids: number[] }): Promise<MockExam> {
    return api.post<MockExam>("/me/mock-exams", input);
  },
  /** Returns the next question or `null` when exam is complete. */
  next(id: number): Promise<Question | null> {
    return api.get<Question | null>(`/me/mock-exams/${id}/next`);
  },
  submit(id: number): Promise<MockExam> {
    return api.post<MockExam>(`/me/mock-exams/${id}/submit`);
  },
};
