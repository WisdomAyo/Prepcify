import { useEffect, useRef, useState } from "react";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Sparkles, ArrowUp, BookOpen, Lightbulb, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";

interface Msg { role: "user" | "ai"; text: string }

const seed: Msg[] = [
  { role: "ai", text: "Hi Adaeze 👋  I'm prepcify, your AI tutor. Ask me anything — a tricky question, a confusing concept, even a past exam paper." },
];

const prompts = [
  { icon: Lightbulb, label: "Explain this question" },
  { icon: Calculator, label: "Solve step by step" },
  { icon: BookOpen, label: "Summarize this topic" },
];

export default function Tutor() {
  const [msgs, setMsgs] = useState<Msg[]>(seed);
  const [text, setText] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, thinking]);

  const send = (override?: string) => {
    const t = (override ?? text).trim();
    if (!t) return;
    setMsgs((m) => [...m, { role: "user", text: t }]);
    setText("");
    setThinking(true);
    setTimeout(() => {
      setThinking(false);
      setMsgs((m) => [
        ...m,
        {
          role: "ai",
          text:
            "Great question. Let's break it down: first, identify what's being asked, then list what you know. From there, the right formula usually reveals itself. Want me to walk through a worked example?",
        },
      ]);
    }, 900);
  };

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <ScreenHeader
        title="prepcify AI"
        subtitle="Always patient. Always free."
        right={
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background">
            <Sparkles className="h-4 w-4 text-accent" />
          </div>
        }
      />

      <div className="flex-1 space-y-3 overflow-y-auto px-5 pb-3 scroll-hide">
        {msgs.map((m, i) => (
          <div key={i} className={cn("flex animate-fade-in", m.role === "user" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[82%] rounded-3xl px-4 py-3 text-[14px] leading-relaxed",
                m.role === "user"
                  ? "bg-foreground text-background rounded-br-md"
                  : "bg-secondary text-foreground rounded-bl-md"
              )}
            >
              {m.text}
            </div>
          </div>
        ))}
        {thinking && (
          <div className="flex justify-start animate-fade-in">
            <div className="flex items-center gap-1.5 rounded-3xl rounded-bl-md bg-secondary px-4 py-3">
              <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:120ms]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:240ms]" />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Quick prompts */}
      <div className="flex gap-2 overflow-x-auto px-5 pb-3 scroll-hide">
        {prompts.map((p) => {
          const Icon = p.icon;
          return (
            <button
              key={p.label}
              onClick={() => send(p.label)}
              className="tap flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-xs font-semibold"
            >
              <Icon className="h-3.5 w-3.5 text-accent" /> {p.label}
            </button>
          );
        })}
      </div>

      {/* Composer */}
      <div className="border-t border-border bg-card/80 px-4 py-3 backdrop-blur-xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="flex items-end gap-2 rounded-3xl bg-secondary px-4 py-2.5"
        >
          <textarea
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ask anything…"
            className="max-h-32 flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors tap",
              text.trim() ? "bg-accent text-accent-foreground" : "bg-card text-muted-foreground"
            )}
            aria-label="Send"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
