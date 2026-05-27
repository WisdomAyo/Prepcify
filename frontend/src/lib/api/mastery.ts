import { api } from "./client";

/**
 * GET /api/v1/me/mastery — composite mastery score per exam-body and per
 * subject. Drives dashboard progress, "your weak spots" suggestions, and
 * the subjects page.
 */
export interface MasteryBucket {
  mastery_score: number;   // 0..1
  confidence: number;      // 0..1
  attempts_count: number;
  correct_count: number;
}

export interface MasterySummary {
  by_exam: Record<string, MasteryBucket>;
  by_subject: Record<string, MasteryBucket>;
}

export interface TopicMastery extends MasteryBucket {
  topic_id: number;
  topic_name: string;
  last_attempted_at: string | null;
}

export const masteryApi = {
  summary(): Promise<MasterySummary> {
    return api.get<MasterySummary>("/me/mastery");
  },
  topic(topicId: number): Promise<TopicMastery> {
    return api.get<TopicMastery>(`/me/mastery/topics/${topicId}`);
  },
};
