"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import {
  LayoutDashboard, FileQuestion, ClipboardList, Users, BookOpen,
  Trophy, Shield, Search, Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { isActivePath } from "@/lib/nav";
import { UserMenu } from "./user-menu";

const nav = [
  { to: "/admin", icon: LayoutDashboard, label: "Overview", end: true },
  { to: "/admin/questions", icon: FileQuestion, label: "Questions" },
  { to: "/admin/exams", icon: ClipboardList, label: "Exams" },
  { to: "/admin/users", icon: Users, label: "Users" },
  { to: "/admin/content", icon: BookOpen, label: "Content" },
  { to: "/admin/gamification", icon: Trophy, label: "Gamification" },
];

/** Admin control-room shell. Wraps every `/admin/*` route. */
export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-dvh w-full bg-foreground text-background">
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-background/10 lg:flex">
        <div className="flex items-center gap-2 px-5 pb-6 pt-7">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
            <Shield className="h-5 w-5" strokeWidth={2} />
          </div>
          <div>
            <p className="font-display text-base font-bold leading-none">
              prepcify<span className="text-accent">.</span>admin
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-wider text-background/50">
              Control room
            </p>
          </div>
        </div>

        <nav aria-label="Admin" className="flex-1 px-3">
          <ul className="space-y-1">
            {nav.map(({ to, icon: Icon, label, end }) => {
              const active = isActivePath(pathname, to, end);
              return (
                <li key={to}>
                  <Link
                    href={to}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-accent text-accent-foreground"
                        : "text-background/80 hover:bg-background/10",
                    )}
                  >
                    <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                    <span>{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="m-3 rounded-2xl border border-background/10 p-4 text-xs text-background/60">
          <p className="font-semibold text-background">Admin mode</p>
          <p className="mt-1">
            All actions are logged. Be careful with bulk operations.
          </p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-background/10 bg-foreground/85 px-6 py-4 backdrop-blur-xl lg:px-10">
          <label className="flex max-w-md flex-1 items-center gap-2 rounded-2xl bg-background/10 px-4 py-2.5">
            <Search className="h-4 w-4 text-background/50" />
            <input
              placeholder="Search questions, users, exams…"
              aria-label="Search admin"
              className="flex-1 bg-transparent text-sm text-background outline-none placeholder:text-background/40"
            />
          </label>
          <div className="ml-auto flex items-center gap-3">
            <button
              aria-label="Notifications"
              className="relative rounded-full bg-background/10 p-2.5 transition-colors hover:bg-background/15"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
            </button>
            <UserMenu />
          </div>
        </header>
        <main
          id="main-content"
          className="flex-1 rounded-tl-3xl bg-background px-6 py-8 text-foreground lg:px-10"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
