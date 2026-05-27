"use client";

import { useEffect, useRef, useState } from "react";
import {
  Sparkles, ArrowUp, BookOpen, Lightbulb, Calculator, Plus, MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { tutorApi } from "@/lib/api/tutor";
import { useStartTutorSession, useTutorSessions } from "@/features/tutor/hooks";
import { ApiError } from "@/lib/api/types";

interface Msg {
  id: string;
  role: "user" | "ai";
  text: string;
  /** True while the assistant chunks are still arriving. */
  streaming?: boolean;
}

const prompts = [
  { icon: Lightbulb, label: "Explain this question" },
  { icon: Calculator, label: "Solve step by step" },
  { icon: BookOpen, label: "Summarize this topic" },
];

export default function WebTutorPage() {
  const { user } = useAuth();
  const firstName = user?.first_name || user?.display_name?.split(" ")[0] || "there";

  const seed: Msg[] = [
    {
      id: "seed",
      role: "ai",
      text: `Hi ${firstName} 👋  I'm prepcify, your AI tutor. Ask me anything — a tricky question, a confusing concept, a past exam paper. I'll explain it the way a patient senior would.`,
    },
  ];

  const sessionsQuery = useTutorSessions();
  const startSession = useStartTutorSession();
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>(seed);
  const [text, setText] = useState("");
  const [streaming, setStreaming] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, streaming]);

  // Abandon any in-flight stream when the page unmounts.
  useEffect(() => () => abortRef.current?.abort(), []);

  async function send(override?: string) {
    const prompt = (override ?? text).trim();
    if (!prompt || streaming) return;
    setText("");

    // Ensure we have a session (lazy create on first message).
    let activeSession = sessionId;
    if (!activeSession) {
      try {
        const created = await startSession.mutateAsync();
        activeSession = created.id;
        setSessionId(activeSession);
      } catch (err) {
        surfaceError(err, "Could not start tutor session");
        return;
      }
    }

    const userMsg: Msg = {
      id: `u-${Date.now()}`,
      role: "user",
      text: prompt,
    };
    const aiMsg: Msg = {
      id: `a-${Date.now()}`,
      role: "ai",
      text: "",
      streaming: true,
    };
    setMsgs((m) => [...m, userMsg, aiMsg]);
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await tutorApi.sendMessage(
        activeSession,
        prompt,
        (chunk) => {
          setMsgs((m) =>
            m.map((msg) =>
              msg.id === aiMsg.id ? { ...msg, text: msg.text + chunk } : msg,
            ),
          );
        },
        controller.signal,
      );
    } catch (err) {
      // Drop the placeholder bubble and surface the error.
      setMsgs((m) => m.filter((msg) => msg.id !== aiMsg.id));
      surfaceError(err, "Tutor message failed");
    } finally {
      setMsgs((m) =>
        m.map((msg) =>
          msg.id === aiMsg.id ? { ...msg, streaming: false } : msg,
        ),
      );
      setStreaming(false);
      abortRef.current = null;
    }
  }

  function surfaceError(err: unknown, fallback: string) {
    if (err instanceof ApiError) {
      if (err.status === 503) {
        toast.error("AI is taking a breather", {
          description: "The tutor service is briefly unavailable — try again in a minute.",
        });
      } else if (err.status === 429) {
        toast.error("Slow down", {
          description: "You've hit the per-minute message limit — try again shortly.",
        });
      } else {
        toast.error(fallback, { description: err.message });
      }
    } else if (err instanceof Error && err.name !== "AbortError") {
      toast.error(fallback, { description: err.message });
    }
  }

  function newConversation() {
    abortRef.current?.abort();
    setSessionId(null);
    setMsgs(seed);
    setText("");
  }

  return (
    <div className="grid h-[calc(100dvh-9rem)] max-w-7xl grid-cols-1 gap-6 xl:grid-cols-[280px_1fr]">
      <aside className="hidden flex-col rounded-3xl border border-border bg-card p-4 xl:flex">
        <button
          onClick={newConversation}
          className="tap flex items-center justify-center gap-2 rounded-2xl bg-foreground py-3 text-sm font-semibold text-background"
        >
          <Plus className="h-4 w-4" /> New conversation
        </button>
        <p className="mt-5 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Recent
        </p>
        <ul className="mt-2 space-y-1 overflow-y-auto scroll-hide">
          {sessionsQuery.data?.slice(0, 10).map((s) => (
            <li key={s.id}>
              <button
                onClick={() => setSessionId(s.id)}
                className={cn(
                  "tap w-full rounded-2xl px-3 py-2.5 text-left hover:bg-secondary",
                  sessionId === s.id && "bg-secondary",
                )}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <p className="truncate text-sm font-medium">
                    Session #{s.id}
                  </p>
                </div>
                <p className="ml-5 mt-0.5 text-[11px] text-muted-foreground">
                  {s.message_count} messages
                </p>
              </button>
            </li>
          ))}
          {(!sessionsQuery.data || sessionsQuery.data.length === 0) && (
            <li className="px-3 py-2 text-xs text-muted-foreground">
              No prior conversations.
            </li>
          )}
        </ul>
      </aside>

      <section className="flex flex-col overflow-hidden rounded-3xl border border-border bg-card">
        <header className="flex items-center gap-3 border-b border-border px-6 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-foreground text-background">
            <Sparkles className="h-4 w-4 text-accent" />
          </div>
          <div className="flex-1">
            <p className="font-display font-bold leading-tight">prepcify AI</p>
            <p className="text-xs text-muted-foreground">
              Your patient, always-on tutor
            </p>
          </div>
          <span className="chip bg-success/10 text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success" /> Online
          </span>
        </header>

        <div
          className="flex-1 space-y-4 overflow-y-auto px-6 py-6 scroll-hide"
          aria-live="polite"
        >
          {msgs.map((m) => (
            <div
              key={m.id}
              className={cn(
                "flex animate-fade-in",
                m.role === "user" ? "justify-end" : "justify-start",
              )}
            >
              {m.role === "ai" && (
                <div className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
                  <Sparkles className="h-3.5 w-3.5 text-accent" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[70%] whitespace-pre-wrap rounded-3xl px-5 py-3.5 text-[14px] leading-relaxed",
                  m.role === "user"
                    ? "rounded-br-md bg-foreground text-background"
                    : "rounded-bl-md bg-secondary text-foreground",
                )}
              >
                {m.text}
                {m.streaming && m.text === "" && (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:120ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:240ms]" />
                  </span>
                )}
                {m.streaming && m.text !== "" && (
                  <span className="ml-0.5 inline-block h-4 w-px animate-pulse bg-current align-middle" />
                )}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <div className="border-t border-border px-6 py-4">
          <div className="mb-3 flex gap-2 overflow-x-auto scroll-hide">
            {prompts.map((p) => {
              const Icon = p.icon;
              return (
                <button
                  key={p.label}
                  onClick={() => send(p.label)}
                  disabled={streaming}
                  className="tap flex shrink-0 items-center gap-2 rounded-full border border-border bg-background px-3.5 py-2 text-xs font-semibold hover:border-foreground/30 disabled:opacity-60"
                >
                  <Icon className="h-3.5 w-3.5 text-accent" /> {p.label}
                </button>
              );
            })}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
            className="flex items-end gap-2 rounded-3xl bg-secondary px-5 py-3"
          >
            <textarea
              rows={1}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={streaming ? "Streaming…" : "Ask anything…"}
              aria-label="Message prepcify AI"
              disabled={streaming}
              className="max-h-32 flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:opacity-60"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
            />
            <button
              type="submit"
              disabled={!text.trim() || streaming}
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors tap",
                text.trim() && !streaming
                  ? "bg-accent text-accent-foreground"
                  : "bg-card text-muted-foreground",
              )}
              aria-label="Send message"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
