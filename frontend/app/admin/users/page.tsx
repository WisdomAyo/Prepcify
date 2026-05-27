import { MoreVertical, Search } from "lucide-react";
import { PageHeader } from "@/components/shells/page-header";
import { getInitials } from "@/lib/utils";

const users = Array.from({ length: 14 }, (_, i) => ({
  id: 1000 + i,
  name: ["Adaeze Nwosu", "Tomi Adeyemi", "Bisi Kareem", "Femi Olu", "Sade Martins", "Chika Iwu", "Ola Raji"][i % 7],
  email: `student${i + 1}@school.edu.ng`,
  plan: ["Free", "Pro", "School"][i % 3],
  xp: 1200 + i * 340,
  joined: "Mar 12, 2026",
  status: i % 8 === 0 ? "Banned" : "Active",
}));

const planColor: Record<string, string> = {
  Free: "bg-secondary text-foreground",
  Pro: "bg-accent text-accent-foreground",
  School: "bg-foreground text-background",
};

export default function AdminUsersPage() {
  return (
    <div className="max-w-7xl">
      <PageHeader
        eyebrow="Admin"
        title="Users"
        description="12,480 active users · 1,840 paying"
      />

      <label className="mb-4 flex max-w-md items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2.5">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Search by name, email, ID…"
          aria-label="Search users"
          className="flex-1 bg-transparent text-sm outline-none"
        />
      </label>

      <div className="overflow-hidden rounded-3xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/40">
            <tr className="text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-3 text-left font-semibold">User</th>
              <th className="px-5 py-3 text-left font-semibold">Plan</th>
              <th className="px-5 py-3 text-left font-semibold">XP</th>
              <th className="px-5 py-3 text-left font-semibold">Joined</th>
              <th className="px-5 py-3 text-left font-semibold">Status</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr
                key={u.id}
                className="border-b border-border last:border-0 hover:bg-secondary/30"
              >
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-xs font-bold">
                      {getInitials(u.name)}
                    </div>
                    <div>
                      <p className="font-medium">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${planColor[u.plan]}`}
                  >
                    {u.plan}
                  </span>
                </td>
                <td className="px-5 py-3 font-mono text-xs">
                  {u.xp.toLocaleString()}
                </td>
                <td className="px-5 py-3 text-xs text-muted-foreground">
                  {u.joined}
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`text-xs ${u.status === "Active" ? "text-success" : "text-destructive"}`}
                  >
                    {u.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    aria-label="User actions"
                    className="rounded-md p-1.5 hover:bg-secondary"
                  >
                    <MoreVertical className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
