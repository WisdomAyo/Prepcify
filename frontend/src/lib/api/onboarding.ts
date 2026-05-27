import { api } from "./client";

/**
 * Onboarding API — wraps the Laravel `/api/v1/onboarding/*` endpoints.
 * All three are idempotent on the backend, so steps can be safely retried.
 */
export const onboardingApi = {
  /** Replace the user's exam targets. `target_date` must be after today. */
  setExamTargets(input: {
    exam_body_ids: number[];
    target_date: string;
  }): Promise<{ message: string }> {
    return api.post<{ message: string }>("/onboarding/exam-targets", input);
  },

  /** Upsert subject selections. */
  setSubjects(
    selections: { exam_body_id: number; subject_id: number }[],
  ): Promise<{ message: string }> {
    return api.post<{ message: string }>("/onboarding/subjects", { selections });
  },

  /** Mark onboarding complete (sets `student_profile.onboarding_completed_at`). */
  complete(): Promise<{ message: string }> {
    return api.post<{ message: string }>("/onboarding/complete");
  },
};
