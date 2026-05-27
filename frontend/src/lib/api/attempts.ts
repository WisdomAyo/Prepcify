import { api } from "./client";

/** POST /api/v1/attempts. */
export type AttemptType = "multiple_choice" | "short_answer" | "essay" | "true_false";
export type AttemptContext = "quiz" | "practice" | "mock_exam" | "tutor";

export interface AttemptInput {
  question_id?: number;
  sub_question_id?: number;
  attempt_type: AttemptType;
  selected_option_id?: number | null;
  response_text?: string | null;
  response_media_url?: string | null;
  time_spent_ms: number;
  context: AttemptContext;
  /** Idempotency key — generate once per attempt and retry safely. */
  client_uuid: string;
  attempted_at?: string;
}

export interface AttemptResult {
  id: number;
  question_id: number;
  sub_question_id: number | null;
  attempt_type: AttemptType;
  selected_option_id: number | null;
  is_correct: boolean;
  marks_awarded: number;
  marks_available: number;
  graded_by: "automatic" | "manual" | null;
  context: AttemptContext;
  client_uuid: string;
  attempted_at: string;
}

export const attemptsApi = {
  record(input: AttemptInput): Promise<AttemptResult> {
    return api.post<AttemptResult>("/attempts", input);
  },
  /** Batch up to 100 attempts in one round-trip — useful for mock exam submit. */
  recordBatch(attempts: AttemptInput[]): Promise<AttemptResult[]> {
    return api.post<AttemptResult[]>("/attempts/batch", { attempts });
  },
};
