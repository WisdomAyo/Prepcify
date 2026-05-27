import { Users, DollarSign, TrendingUp, Activity, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

const stats = [
  { label: "Active users", value: "12,480", change: "+8.2%", up: true, icon: Users },
  { label: "MRR", value: "₦4.8M", change: "+12.4%", up: true, icon: DollarSign },
  { label: "Sessions today", value: "3,210", change: "−2.1%", up: false, icon: Activity },
  { label: "Conversion", value: "4.6%", change: "+0.3pp", up: true, icon: TrendingUp },
];

const recent = [
  { name: "Adaeze N.", action: "Upgraded to Pro", time: "2m" },
  { name: "Tomi A.", action: "Completed mock exam · 78%", time: "5m" },
  { name: "Bisi K.", action: "Reported question #4821", time: "12m" },
  { name: "Femi O.", action: "Joined community: JAMB 2025", time: "18m" },
  { name: "Chika I.", action: "Won battle vs Sade M.", time: "27m" },
];

export default function AdminDashboard() {
  return (
    <div className="max-w-7xl">
      <PageHeader eyebrow="Admin" title="Control room" description="Live snapshot of users, revenue, and engagement across prepcify." />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="rounded-3xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary">
                <s.icon className="h-4 w-4" />
              </div>
              <span className={`flex items-center gap-1 text-xs font-semibold ${s.up ? "text-success" : "text-destructive"}`}>
                {s.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {s.change}
              </span>
            </div>
            <p className="mt-4 font-display text-3xl font-extrabold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="rounded-3xl border border-border bg-card p-6">
          <h3 className="font-display text-lg font-bold">Sessions · last 7 days</h3>
          <div className="mt-6 flex items-end gap-3 h-48">
            {[60, 80, 45, 90, 75, 110, 95].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full rounded-t-lg bg-accent" style={{ height: `${h}%` }} />
                <span className="text-[10px] text-muted-foreground">{["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="font-display text-lg font-bold">Live activity</h3>
          </div>
          {recent.map((r, i) => (
            <div key={i} className="px-5 py-3 border-b border-border last:border-0 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-[10px] font-bold">
                {r.name.split(" ").map((p) => p[0]).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{r.name}</p>
                <p className="text-xs text-muted-foreground truncate">{r.action}</p>
              </div>
              <span className="text-xs text-muted-foreground">{r.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
