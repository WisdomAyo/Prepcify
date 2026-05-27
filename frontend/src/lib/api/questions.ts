import { api } from "./client";

/** GET /api/v1/questions and /api/v1/questions/{id}. */
export type QuestionFormat = "mcq" | "short-answer" | "essay" | "true-false";

export interface QuestionOption {
  id: number;
  label: string;
  body: string;
  sort_order: number;
}

export interface SubQuestion {
  id: number;
  label: string;
  stem: string;
  marks: number;
  sort_order: number;
  options: QuestionOption[];
  correct_option_id: number | null;
}

export interface DiagramLabel {
  id: number;
  label: string;
  x_pct: number;
  y_pct: number;
}

export interface Diagram {
  id: number;
  storage_path: string;
  alt_text: string | null;
  sort_order: number;
  labels: DiagramLabel[];
}

export interface QuestionListItem {
  id: number;
  format: QuestionFormat;
  stem: string;
  marks: number;
  year: number | null;
  options: QuestionOption[];
  diagrams: Diagram[];
  topics: { id: number; name: string }[];
  tags: string[];
}

export interface Question extends QuestionListItem {
  status: string;
  explanation: string | null;
  correct_option_id: number | null;
  sub_questions: SubQuestion[];
  created_at: string;
}

export interface CursorPage<T> {
  data: T[];
  meta: {
    path: string;
    per_page: number;
    next_cursor: string | null;
    prev_cursor: string | null;
  };
}

export interface QuestionFilters {
  topic_id?: number;
  format?: QuestionFormat;
  year?: number;
  cursor?: string;
}

export const questionsApi = {
  list(filters: QuestionFilters = {}): Promise<CursorPage<QuestionListItem>> {
    const params = new URLSearchParams();
    if (filters.topic_id) params.set("topic_id", String(filters.topic_id));
    if (filters.format) params.set("format", filters.format);
    if (filters.year) params.set("year", String(filters.year));
    if (filters.cursor) params.set("cursor", filters.cursor);
    const q = params.toString();
    return api.get<CursorPage<QuestionListItem>>(
      `/questions${q ? `?${q}` : ""}`,
      { unwrap: false },
    );
  },
  show(id: number): Promise<Question> {
    return api.get<Question>(`/questions/${id}`);
  },
  similar(id: number): Promise<CursorPage<QuestionListItem>> {
    return api.get<CursorPage<QuestionListItem>>(
      `/questions/${id}/similar`,
      { unwrap: false },
    );
  },
  report(
    id: number,
    body: { reason: "unclear" | "incorrect" | "offensive" | "duplicate" | "other"; detail?: string },
  ): Promise<{ message: string }> {
    return api.post<{ message: string }>(`/questions/${id}/report`, body);
  },
};
