import { api } from "./client";

/** GET/POST /api/v1/me/sessions. */
export type StudyContext = "quiz" | "practice" | "mock_exam";

export interface StudySession {
  id: number;
  context: StudyContext;
  started_at: string;
  ended_at: string | null;
  questions_attempted: number;
  questions_correct: number;
  xp_earned: number;
}

export const sessionsApi = {
  list(): Promise<StudySession[]> {
    return api.get<StudySession[]>("/me/sessions");
  },
  start(context: StudyContext): Promise<StudySession> {
    return api.post<StudySession>("/me/sessions", { context });
  },
  end(id: number): Promise<StudySession> {
    return api.post<StudySession>(`/me/sessions/${id}/end`);
  },
};
