import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { Send, Paperclip, Hash, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const messages = [
  { id: 1, who: "Tomi A.", initials: "TA", text: "Anyone solved JAMB 2022 Maths Q14? I keep getting D but the answer says B.", time: "10:42", me: false },
  { id: 2, who: "Bisi K.", initials: "BK", text: "Try factoring the LHS first then divide both sides by 3.", time: "10:44", me: false },
  { id: 3, who: "You", initials: "YO", text: "Same problem here. Let me try Bisi's tip and report back.", time: "10:46", me: true },
  { id: 4, who: "Femi O.", initials: "FO", text: "I made a video walkthrough — sharing now.", time: "10:48", me: false },
];

const channels = ["general", "maths-help", "physics", "past-questions", "off-topic"];

export default function CommunityChat() {
  const { groupId = "jamb-2025" } = useParams();
  const [active, setActive] = useState("maths-help");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_280px] gap-6 -mx-6 -my-8 lg:-mx-10 h-[calc(100dvh-80px)]">
      {/* Channels */}
      <aside className="hidden lg:block bg-card border-r border-border px-4 py-6">
        <Link to="/app/community" className="text-xs text-muted-foreground hover:text-foreground">← All groups</Link>
        <p className="mt-4 font-display text-base font-bold capitalize">{groupId.replace(/-/g, " ")}</p>
        <p className="mt-4 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-2">Channels</p>
        <ul className="mt-2 space-y-0.5">
          {channels.map((c) => (
            <li key={c}>
              <button
                onClick={() => setActive(c)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm",
                  active === c ? "bg-foreground text-background" : "hover:bg-secondary"
                )}
              >
                <Hash className="h-3.5 w-3.5" /> {c}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Chat */}
      <section className="flex flex-col bg-background min-w-0">
        <div className="px-6 py-4 border-b border-border flex items-center gap-2">
          <Hash className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-display text-lg font-bold">{active}</h2>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          {messages.map((m) => (
            <div key={m.id} className={cn("flex items-start gap-3", m.me && "flex-row-reverse")}>
              <div className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold",
                m.me ? "bg-accent text-accent-foreground" : "bg-secondary"
              )}>
                {m.initials}
              </div>
              <div className={cn("max-w-md", m.me && "text-right")}>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{m.who}</span>
                  <span>{m.time}</span>
                </div>
                <p className={cn(
                  "mt-1 inline-block rounded-2xl px-4 py-2.5 text-sm",
                  m.me ? "bg-foreground text-background" : "bg-card border border-border"
                )}>
                  {m.text}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="px-6 py-4 border-t border-border">
          <label className="flex items-center gap-2 rounded-full bg-card border border-border px-4 py-2.5">
            <Paperclip className="h-4 w-4 text-muted-foreground" />
            <input placeholder={`Message #${active}`} className="flex-1 bg-transparent text-sm outline-none" />
            <button className="rounded-full bg-accent p-2 text-accent-foreground"><Send className="h-4 w-4" /></button>
          </label>
        </div>
      </section>

      {/* Members */}
      <aside className="hidden lg:block bg-card border-l border-border px-4 py-6">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-2 flex items-center gap-1.5">
          <Users className="h-3 w-3" /> Online · 38
        </p>
        <ul className="mt-3 space-y-1">
          {["Tomi A.", "Bisi K.", "Femi O.", "Sade M.", "Ola R.", "Chika I."].map((n) => (
            <li key={n} className="flex items-center gap-2 px-2 py-1.5 text-sm">
              <div className="relative">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary text-[10px] font-bold">
                  {n.split(" ").map((p) => p[0]).join("")}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-success ring-2 ring-card" />
              </div>
              <span>{n}</span>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
