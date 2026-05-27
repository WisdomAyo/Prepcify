import { api } from "./client";

/** GET/POST /api/v1/me/study-plan. */
export interface StudyPlan {
  id: number;
  content: string;        // markdown
  generated_at: string;
  expires_at: string;
}

export const studyPlanApi = {
  current(): Promise<StudyPlan | null> {
    return api.get<StudyPlan | null>("/me/study-plan");
  },
  regenerate(): Promise<StudyPlan> {
    return api.post<StudyPlan>("/me/study-plan/regenerate");
  },
};
