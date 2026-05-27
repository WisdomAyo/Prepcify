import { Link } from "react-router-dom";
import { Users, MessagesSquare, Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

const groups = [
  { id: "jamb-2025", name: "JAMB 2025 Warriors", members: 1240, online: 38, topic: "JAMB UTME prep", color: "bg-foreground text-background" },
  { id: "math-club", name: "Math Club Lagos", members: 320, online: 12, topic: "Mathematics", color: "bg-accent text-accent-foreground" },
  { id: "physics-help", name: "Physics SOS", members: 540, online: 21, topic: "Physics doubts", color: "bg-sky text-sky-foreground" },
  { id: "english-essays", name: "English Essay Lab", members: 198, online: 7, topic: "Writing & comprehension", color: "bg-secondary text-foreground" },
  { id: "waec-2025", name: "WAEC Class of 2025", members: 2810, online: 76, topic: "WAEC SSCE", color: "bg-success/15 text-success border border-success/30" },
];

export default function Community() {
  return (
    <div className="max-w-6xl">
      <PageHeader
        eyebrow="Community"
        title="Find your study tribe"
        description="Join active groups, ask questions, and learn out loud."
        actions={
          <button className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground flex items-center gap-2">
            <Plus className="h-4 w-4" /> Create group
          </button>
        }
      />

      <label className="mb-6 flex items-center gap-2 rounded-2xl bg-card border border-border px-4 py-3 max-w-md">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input placeholder="Search groups by topic, exam, school…" className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        {groups.map((g) => (
          <Link
            key={g.id}
            to={`/app/community/${g.id}`}
            className="group rounded-3xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-card"
          >
            <div className="flex items-start justify-between gap-4">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-bold ${g.color}`}>
                {g.name.split(" ").slice(0, 2).map((w) => w[0]).join("")}
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                <span className="text-success font-semibold">{g.online} online</span>
              </div>
            </div>
            <h3 className="mt-4 font-display text-lg font-bold">{g.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{g.topic}</p>
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" /> {g.members.toLocaleString()} members
              </span>
              <MessagesSquare className="h-4 w-4 text-accent" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
