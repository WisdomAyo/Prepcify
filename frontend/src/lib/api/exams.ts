import { api } from "./client";

/** GET /api/v1/exams — public exam catalog. */
export interface ExamBody {
  id: number;
  code: string;
  name: string;
  category: string;
  description: string | null;
  logo_url: string | null;
  sort_order: number;
}

/** GET /api/v1/exams/{code}/subjects */
export interface ExamSubject {
  id: number;
  subject_id: number;
  name: string;
  slug: string;
  is_compulsory: boolean;
  syllabus_version: string;
  syllabus_effective_from: string;
  syllabus_effective_to: string | null;
}

/** GET /api/v1/exams/{code}/subjects/{subjectId} */
export interface TopicNode {
  id: number;
  name: string;
  slug: string;
  path: string;
  depth: number;
  children: TopicNode[];
}

/**
 * Exam catalog API — all endpoints are public; no auth required.
 * The BFF still proxies them so the browser only ever talks same-origin.
 */
export const examsApi = {
  /** List exam bodies, optionally filtered by category (ugme, jamb, …). */
  listBodies(category?: string): Promise<Record<string, ExamBody[]>> {
    const q = category ? `?category=${encodeURIComponent(category)}` : "";
    return api.get<Record<string, ExamBody[]>>(`/exams${q}`);
  },

  /** Subjects available under an exam body. */
  listSubjects(code: string): Promise<ExamSubject[]> {
    return api.get<ExamSubject[]>(`/exams/${encodeURIComponent(code)}/subjects`);
  },

  /** Topic tree for a subject under an exam body. */
  listTopics(code: string, subjectId: number): Promise<TopicNode[]> {
    return api.get<TopicNode[]>(
      `/exams/${encodeURIComponent(code)}/subjects/${subjectId}`,
    );
  },
};

/** Flatten a category-grouped exam-body response into a single array. */
export function flattenExamBodies(
  grouped: Record<string, ExamBody[]>,
): ExamBody[] {
  return Object.values(grouped)
    .flat()
    .sort((a, b) => a.sort_order - b.sort_order);
}
