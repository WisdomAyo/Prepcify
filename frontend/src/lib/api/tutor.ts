import { api } from "./client";
import { streamChunks } from "./sse";

/** /api/v1/me/tutor/sessions/* */
export interface TutorSession {
  id: number;
  started_at: string;
  message_count: number;
}

export interface TutorMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export const tutorApi = {
  startSession(): Promise<TutorSession> {
    return api.post<TutorSession>("/me/tutor/sessions");
  },
  listSessions(): Promise<TutorSession[]> {
    return api.get<TutorSession[]>("/me/tutor/sessions");
  },
  messages(sessionId: number): Promise<TutorMessage[]> {
    return api.get<TutorMessage[]>(`/me/tutor/sessions/${sessionId}/messages`);
  },
  /**
   * Send a message; receives an SSE stream of assistant chunks. Caller
   * accumulates the chunks into the displayed message.
   */
  sendMessage(
    sessionId: number,
    message: string,
    onChunk: (text: string) => void,
    signal?: AbortSignal,
  ): Promise<void> {
    return streamChunks(
      `/me/tutor/sessions/${sessionId}/messages`,
      { message },
      onChunk,
      { signal, method: "POST" },
    );
  },
  /** SSE explanation stream for a single question. */
  explainQuestion(
    questionId: number,
    onChunk: (text: string) => void,
    signal?: AbortSignal,
  ): Promise<void> {
    return streamChunks(
      `/questions/${questionId}/explanation`,
      null,
      onChunk,
      { signal, method: "GET" },
    );
  },
};
