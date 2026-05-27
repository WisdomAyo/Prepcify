"use client";

import {
  Users, FileQuestion, ClipboardList, TrendingUp, ArrowUpRight,
} from "lucide-react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const stats = [
  { label: "Active students", value: "42,108", delta: "+6.2%", icon: Users },
  { label: "Questions in bank", value: "1.2M", delta: "+1.1%", icon: FileQuestion },
  { label: "Mock exams today", value: "3,840", delta: "+12%", icon: ClipboardList },
  { label: "Avg. score lift", value: "47%", delta: "+0.4%", icon: TrendingUp },
];

const recent = [
  { who: "Reviewer · Ada", what: "Approved 24 questions", when: "2m ago", tag: "Content" },
  { who: "System", what: "Nightly mastery recompute finished", when: "1h ago", tag: "Job" },
  { who: "Admin · Bola", what: "Updated WAEC 2024 exam paper", when: "3h ago", tag: "Exams" },
  { who: "Reviewer · Chidi", what: "Flagged 2 question reports", when: "5h ago", tag: "Reports" },
];

/** Admin overview — the `/admin` home route. */
export default function AdminDashboardPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Control room
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A live snapshot of the prepcify platform.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                  <s.icon className="h-5 w-5" />
                </div>
                <Badge variant="success">{s.delta}</Badge>
              </div>
              <p className="mt-4 font-display text-2xl font-bold">
                {s.value}
              </p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
          <CardDescription>Latest admin and system events.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border">
            {recent.map((r) => (
              <li
                key={r.what}
                className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-xs font-bold">
                  {r.who.split("·")[0].trim().charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{r.what}</p>
                  <p className="text-xs text-muted-foreground">{r.who}</p>
                </div>
                <Badge variant="outline">{r.tag}</Badge>
                <span className="hidden text-xs text-muted-foreground sm:inline">
                  {r.when}
                </span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
