import { useEffect, useRef, useState } from "react";
import { Sparkles, ArrowUp, BookOpen, Lightbulb, Calculator, Plus, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface Msg { role: "user" | "ai"; text: string }

const seed: Msg[] = [
  { role: "ai", text: "Hi Adaeze 👋  I'm prepcify, your AI tutor. Ask me anything — a tricky question, a confusing concept, a past exam paper. I'll explain it the way a patient senior would." },
];

const prompts = [
  { icon: Lightbulb, label: "Explain this question" },
  { icon: Calculator, label: "Solve step by step" },
  { icon: BookOpen, label: "Summarize this topic" },
];

const conversations = [
  { title: "Quadratic equations · word problems", time: "2h ago" },
  { title: "Photosynthesis explained simply", time: "Yesterday" },
  { title: "JAMB 2019 English Q42", time: "3 days ago" },
  { title: "Mole concept basics", time: "Last week" },
];

export default function WebTutor() {
  const [msgs, setMsgs] = useState<Msg[]>(seed);
  const [text, setText] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, thinking]);

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
    <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-6 max-w-7xl h-[calc(100dvh-9rem)]">
      {/* Conversations */}
      <aside className="hidden xl:flex flex-col rounded-3xl border border-border bg-card p-4">
        <button className="tap flex items-center justify-center gap-2 rounded-2xl bg-foreground py-3 text-sm font-semibold text-background">
          <Plus className="h-4 w-4" /> New conversation
        </button>
        <p className="mt-5 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Recent</p>
        <ul className="mt-2 space-y-1 overflow-y-auto scroll-hide">
          {conversations.map((c) => (
            <li key={c.title}>
              <button className="tap w-full rounded-2xl px-3 py-2.5 text-left hover:bg-secondary">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <p className="text-sm font-medium truncate">{c.title}</p>
                </div>
                <p className="mt-0.5 ml-5 text-[11px] text-muted-foreground">{c.time}</p>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Chat */}
      <section className="flex flex-col rounded-3xl border border-border bg-card overflow-hidden">
        <header className="flex items-center gap-3 border-b border-border px-6 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-foreground text-background">
            <Sparkles className="h-4 w-4 text-accent" />
          </div>
          <div className="flex-1">
            <p className="font-display font-bold leading-tight">prepcify AI</p>
            <p className="text-xs text-muted-foreground">Your patient, always-on tutor</p>
          </div>
          <span className="chip bg-success/10 text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success" /> Online
          </span>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6 scroll-hide">
          {msgs.map((m, i) => (
            <div key={i} className={cn("flex animate-fade-in", m.role === "user" ? "justify-end" : "justify-start")}>
              {m.role === "ai" && (
                <div className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
                  <Sparkles className="h-3.5 w-3.5 text-accent" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[70%] rounded-3xl px-5 py-3.5 text-[14px] leading-relaxed",
                  m.role === "user" ? "bg-foreground text-background rounded-br-md" : "bg-secondary text-foreground rounded-bl-md"
                )}
              >
                {m.text}
              </div>
            </div>
          ))}
          {thinking && (
            <div className="flex items-end gap-3 animate-fade-in">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
              </div>
              <div className="flex items-center gap-1.5 rounded-3xl rounded-bl-md bg-secondary px-5 py-4">
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:120ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:240ms]" />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="border-t border-border px-6 py-4">
          <div className="flex gap-2 mb-3 overflow-x-auto scroll-hide">
            {prompts.map((p) => {
              const Icon = p.icon;
              return (
                <button
                  key={p.label}
                  onClick={() => send(p.label)}
                  className="tap flex shrink-0 items-center gap-2 rounded-full border border-border bg-background px-3.5 py-2 text-xs font-semibold hover:border-foreground/30"
                >
                  <Icon className="h-3.5 w-3.5 text-accent" /> {p.label}
                </button>
              );
            })}
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            className="flex items-end gap-2 rounded-3xl bg-secondary px-5 py-3"
          >
            <textarea
              rows={1}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ask anything…"
              className="max-h-32 flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
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
      </section>
    </div>
  );
}
