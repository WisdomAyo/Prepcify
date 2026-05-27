import { ApiError, type ApiErrorBody } from "./types";

/**
 * Consume a Server-Sent Events stream from the BFF.
 *
 * Used for `/questions/{id}/explanation` and
 * `/me/tutor/sessions/{id}/messages` — both return an SSE stream of `data:`
 * frames where the payload is `{"text": "chunk"}` until a terminal
 * `data: [DONE]` line.
 *
 * Calls `onChunk` for every text fragment as it arrives, so callers can
 * render a typewriter effect. Resolves when the stream ends; rejects with
 * `ApiError` on a non-2xx response or with the underlying network error.
 *
 * @example
 * await streamChunks("/questions/42/explanation", null, (text) => {
 *   setExplanation((prev) => prev + text);
 * }, { signal: controller.signal });
 */
const BFF_BASE = "/api/bff/v1";

interface StreamOptions {
  signal?: AbortSignal;
  method?: "GET" | "POST";
  /** Called once with the upstream status before chunks start. */
  onStatus?: (status: number) => void;
}

export async function streamChunks(
  path: string,
  body: unknown | null,
  onChunk: (text: string) => void,
  { signal, method, onStatus }: StreamOptions = {},
): Promise<void> {
  const httpMethod = method ?? (body !== null ? "POST" : "GET");

  const res = await fetch(`${BFF_BASE}${path}`, {
    method: httpMethod,
    credentials: "same-origin",
    signal,
    headers: {
      Accept: "text/event-stream",
      ...(body !== null ? { "Content-Type": "application/json" } : {}),
    },
    body: body !== null ? JSON.stringify(body) : undefined,
  });

  onStatus?.(res.status);

  if (!res.ok) {
    const payload = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, payload as ApiErrorBody);
  }

  if (!res.body) {
    throw new Error("SSE response had no body");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // SSE frames are separated by a blank line.
    let frameBreak = buffer.indexOf("\n\n");
    while (frameBreak !== -1) {
      const frame = buffer.slice(0, frameBreak);
      buffer = buffer.slice(frameBreak + 2);
      handleFrame(frame, onChunk);
      frameBreak = buffer.indexOf("\n\n");
    }
  }

  if (buffer.length > 0) handleFrame(buffer, onChunk);
}

function handleFrame(frame: string, onChunk: (text: string) => void): void {
  for (const line of frame.split(/\r?\n/)) {
    if (!line.startsWith("data:")) continue;
    const data = line.slice(5).trim();
    if (data === "[DONE]" || data === "") continue;
    try {
      const parsed = JSON.parse(data) as { text?: string };
      if (typeof parsed.text === "string") onChunk(parsed.text);
    } catch {
      // Non-JSON line — yield as raw text.
      onChunk(data);
    }
  }
}
