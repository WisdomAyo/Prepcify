import { Bell, Trophy, Sparkles, Users, Crown, Flame } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { useState } from "react";
import { cn } from "@/lib/utils";

const all = [
  { id: 1, icon: Trophy, color: "bg-accent text-accent-foreground", title: "You climbed to #14 globally", body: "Up 6 spots from yesterday. Keep grinding.", time: "2m ago", unread: true },
  { id: 2, icon: Sparkles, color: "bg-foreground text-background", title: "prepcify AI built you a custom drill", body: "5 quadratic equations based on your weak spots.", time: "1h ago", unread: true },
  { id: 3, icon: Flame, color: "bg-destructive text-destructive-foreground", title: "Streak at risk", body: "Study today to keep your 12-day streak alive.", time: "3h ago", unread: false },
  { id: 4, icon: Users, color: "bg-sky text-sky-foreground", title: "Tomi A. challenged you to a battle", body: "Mathematics · 1v1 · Best of 10.", time: "Yesterday", unread: false },
  { id: 5, icon: Crown, color: "bg-secondary text-foreground", title: "Pro trial ends in 3 days", body: "Lock in 50% off your first year now.", time: "2d ago", unread: false },
];

const tabs = ["All", "Unread", "Streaks", "Battles", "AI"];

export default function Notifications() {
  const [tab, setTab] = useState("All");
  const list = tab === "Unread" ? all.filter((n) => n.unread) : all;
  return (
    <div className="max-w-3xl">
      <PageHeader eyebrow="Inbox" title="Notifications" description="Catch up on what's been happening while you were studying." />
      <div className="mb-5 flex gap-2 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-semibold whitespace-nowrap",
              tab === t ? "bg-foreground text-background" : "bg-secondary"
            )}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {list.map(({ id, icon: Icon, color, title, body, time, unread }) => (
          <div key={id} className={cn("flex items-start gap-4 rounded-2xl border p-4", unread ? "border-accent/30 bg-accent/5" : "border-border bg-card")}>
            <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", color)}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{title}</p>
              <p className="text-sm text-muted-foreground">{body}</p>
              <p className="mt-1 text-xs text-muted-foreground">{time}</p>
            </div>
            {unread && <span className="h-2 w-2 rounded-full bg-accent mt-2" />}
          </div>
        ))}
      </div>
    </div>
  );
}
