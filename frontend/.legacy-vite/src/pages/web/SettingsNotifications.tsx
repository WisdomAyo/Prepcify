import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { cn } from "@/lib/utils";

const items = [
  { id: "study", label: "Daily study reminders", desc: "Nudge me at my preferred time." },
  { id: "streak", label: "Streak alerts", desc: "Don't let me lose my streak." },
  { id: "battles", label: "Battle invites", desc: "When friends challenge me." },
  { id: "leaderboard", label: "Leaderboard movements", desc: "When I move up or down 5+ ranks." },
  { id: "ai", label: "AI insights", desc: "Weekly summary of strengths and weak spots." },
  { id: "marketing", label: "Product updates", desc: "New features, tips, occasional offers." },
];

export default function SettingsNotifications() {
  const [on, setOn] = useState<Record<string, boolean>>({ study: true, streak: true, battles: true, leaderboard: false, ai: true, marketing: false });
  return (
    <div className="max-w-2xl">
      <PageHeader crumbs={[{ label: "Settings", to: "/app/settings" }, { label: "Notifications" }]} eyebrow="Settings" title="Notifications" />
      <div className="rounded-3xl border border-border bg-card divide-y divide-border">
        {items.map((it) => (
          <div key={it.id} className="flex items-center justify-between p-5 gap-4">
            <div className="min-w-0">
              <p className="font-semibold">{it.label}</p>
              <p className="text-xs text-muted-foreground">{it.desc}</p>
            </div>
            <button
              onClick={() => setOn((o) => ({ ...o, [it.id]: !o[it.id] }))}
              className={cn(
                "relative h-6 w-11 rounded-full transition-colors shrink-0",
                on[it.id] ? "bg-accent" : "bg-secondary"
              )}
            >
              <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-background shadow-sm transition-all", on[it.id] ? "left-5" : "left-0.5")} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
