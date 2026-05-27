"use client";

import { PageHeader } from "@/components/shells/page-header";
import { DataState } from "@/components/ui/data-state";
import { useActivityFeed } from "@/features/activity/data";

export default function ActivityPage() {
  const query = useActivityFeed();
  const groups = query.data ?? [];
  return (
    <div className="max-w-3xl">
      <PageHeader
        eyebrow="Activity feed"
        title="Everything you've done"
        description="A timeline of your study, wins, and milestones."
      />
      <DataState
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        isEmpty={groups.length === 0 && !query.isLoading}
        onRetry={() => void query.refetch()}
      >
        {groups.map((g) => (
          <div key={g.label} className="mb-8">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {g.label}
            </p>
            <div className="space-y-3">
              {g.items.map(({ icon: Icon, color, text, meta, time }, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 rounded-2xl border border-border bg-card p-4"
                >
                  <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${color}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{text}</p>
                    <p className="text-xs text-muted-foreground">{meta}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </DataState>
    </div>
  );
}
