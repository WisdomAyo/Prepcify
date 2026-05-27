import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, FileQuestion, ClipboardList, Users, BookOpen, Trophy, Shield, Search, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserMenu } from "./UserMenu";

const nav = [
  { to: "/admin", icon: LayoutDashboard, label: "Overview", end: true },
  { to: "/admin/questions", icon: FileQuestion, label: "Questions" },
  { to: "/admin/exams", icon: ClipboardList, label: "Exams" },
  { to: "/admin/users", icon: Users, label: "Users" },
  { to: "/admin/content", icon: BookOpen, label: "Content" },
  { to: "/admin/gamification", icon: Trophy, label: "Gamification" },
];

export function AdminShell() {
  return (
    <div className="min-h-dvh w-full bg-foreground text-background flex">
      <aside className="hidden lg:flex w-60 shrink-0 flex-col border-r border-background/10 sticky top-0 h-dvh">
        <div className="px-5 pt-7 pb-6 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
            <Shield className="h-5 w-5" strokeWidth={2} />
          </div>
          <div>
            <p className="font-display text-base font-extrabold leading-none">prepcify<span className="text-accent">.</span>admin</p>
            <p className="mt-1 text-[10px] uppercase tracking-wider text-background/50">Control room</p>
          </div>
        </div>

        <nav className="px-3 flex-1">
          <ul className="space-y-1">
            {nav.map(({ to, icon: Icon, label, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-background/80 hover:bg-background/10"
                    )
                  }
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                  <span>{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="m-3 rounded-2xl border border-background/10 p-4 text-xs text-background/60">
          <p className="font-semibold text-background">Admin mode</p>
          <p className="mt-1">All actions are logged. Be careful with bulk operations.</p>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-background/10 bg-foreground/85 px-6 lg:px-10 py-4 backdrop-blur-xl">
          <label className="flex flex-1 max-w-md items-center gap-2 rounded-2xl bg-background/10 px-4 py-2.5">
            <Search className="h-4 w-4 text-background/50" />
            <input
              placeholder="Search questions, users, exams…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-background/40 text-background"
            />
          </label>
          <div className="ml-auto flex items-center gap-3">
            <button className="relative rounded-full bg-background/10 p-2.5 hover:bg-background/15 transition-colors">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
            </button>
            <UserMenu />
          </div>
        </header>
        <main className="flex-1 px-6 lg:px-10 py-8 bg-background text-foreground rounded-tl-3xl">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
