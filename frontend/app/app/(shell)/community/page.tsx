"use client";

import Link from "next/link";
import { Users, MessagesSquare, Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/shells/page-header";
import { DataState } from "@/components/ui/data-state";
import { useCommunityGroups } from "@/features/community/data";
import { getInitials } from "@/lib/utils";

export default function CommunityPage() {
  const query = useCommunityGroups();
  const groups = query.data ?? [];

  return (
    <div className="max-w-6xl">
      <PageHeader
        eyebrow="Community"
        title="Find your study tribe"
        description="Join active groups, ask questions, and learn out loud."
        actions={
          <button className="flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground">
            <Plus className="h-4 w-4" /> Create group
          </button>
        }
      />

      <label className="mb-6 flex max-w-md items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Search groups by topic, exam, school…"
          aria-label="Search groups"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </label>

      <DataState
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        isEmpty={groups.length === 0 && !query.isLoading}
        onRetry={() => void query.refetch()}
      >
        <div className="grid gap-4 md:grid-cols-2">
          {groups.map((g) => (
            <Link
              key={g.id}
              href={`/app/community/${g.id}`}
              className="group rounded-3xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-card"
            >
              <div className="flex items-start justify-between gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-bold ${g.color}`}
                >
                  {getInitials(g.name)}
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  <span className="font-semibold text-success">
                    {g.online} online
                  </span>
                </div>
              </div>
              <h3 className="mt-4 font-display text-lg font-bold">{g.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{g.topic}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" /> {g.members.toLocaleString()}{" "}
                  members
                </span>
                <MessagesSquare className="h-4 w-4 text-accent" />
              </div>
            </Link>
          ))}
        </div>
      </DataState>
    </div>
  );
}
