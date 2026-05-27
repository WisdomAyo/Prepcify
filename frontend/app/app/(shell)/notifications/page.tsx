"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shells/page-header";
import { DataState } from "@/components/ui/data-state";
import { useNotifications } from "@/features/notifications/data";
import { cn } from "@/lib/utils";

const tabs = ["All", "Unread", "Streaks", "Battles", "AI"];

export default function NotificationsPage() {
  const [tab, setTab] = useState("All");
  const query = useNotifications();
  const all = query.data ?? [];
  const list = tab === "Unread" ? all.filter((n) => n.unread) : all;

  return (
    <div className="max-w-3xl">
      <PageHeader
        eyebrow="Inbox"
        title="Notifications"
        description="Catch up on what's been happening while you were studying."
      />
      <div className="mb-5 flex gap-2 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold",
              tab === t ? "bg-foreground text-background" : "bg-secondary",
            )}
          >
            {t}
          </button>
        ))}
      </div>
      <DataState
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        isEmpty={list.length === 0 && !query.isLoading}
        onRetry={() => void query.refetch()}
      >
        <div className="space-y-2">
          {list.map(({ id, icon: Icon, color, title, body, time, unread }) => (
            <div
              key={id}
              className={cn(
                "flex items-start gap-4 rounded-2xl border p-4",
                unread
                  ? "border-accent/30 bg-accent/5"
                  : "border-border bg-card",
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                  color,
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{title}</p>
                <p className="text-sm text-muted-foreground">{body}</p>
                <p className="mt-1 text-xs text-muted-foreground">{time}</p>
              </div>
              {unread && (
                <span className="mt-2 h-2 w-2 rounded-full bg-accent" />
              )}
            </div>
          ))}
        </div>
      </DataState>
    </div>
  );
}
