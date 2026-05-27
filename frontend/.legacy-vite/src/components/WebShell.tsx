import { Outlet, NavLink } from "react-router-dom";
import { Home, BookOpen, Library, Sparkles, Beaker, ClipboardCheck, Swords, Trophy, CalendarDays, MessagesSquare, Bell, Crown, User, Settings, Search, GraduationCap, Command } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserMenu } from "./UserMenu";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

const primary = [
  { to: "/app", icon: Home, label: "Home", end: true },
  { to: "/app/subjects", icon: BookOpen, label: "Subjects" },
  { to: "/app/past-questions", icon: Library, label: "Papers" },
  { to: "/app/tutor", icon: Sparkles, label: "Tutor" },
  { to: "/app/playground", icon: Beaker, label: "Lab" },
];

const secondary = [
  { to: "/app/exam/setup", icon: ClipboardCheck, label: "Mock Exams" },
  { to: "/app/battles", icon: Swords, label: "Battles" },
  { to: "/app/leaderboard", icon: Trophy, label: "Leaderboard" },
  { to: "/app/study-plan", icon: CalendarDays, label: "Study Plan" },
  { to: "/app/community", icon: MessagesSquare, label: "Community" },
  { to: "/app/notifications", icon: Bell, label: "Inbox" },
  { to: "/app/pricing", icon: Crown, label: "Upgrade" },
  { to: "/app/profile", icon: User, label: "Profile" },
  { to: "/app/settings", icon: Settings, label: "Settings" },
];

function TopBar() {
  const { profile } = useAuth();
  const streak = profile?.streak_days ?? 0;
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={cn(
      "sticky top-0 z-40 transition-all",
      scrolled ? "py-2" : "py-4"
    )}>
      <div className={cn(
        "mx-auto max-w-7xl px-4 transition-all",
      )}>
        <div className={cn(
          "flex items-center gap-3 rounded-full px-3 py-2 transition-all",
          scrolled ? "glass-strong shadow-pop" : "glass shadow-soft"
        )}>
          {/* Logo */}
          <NavLink to="/app" className="flex items-center gap-2 pl-2 pr-3 shrink-0">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-2xl bg-foreground text-background">
              <GraduationCap className="h-5 w-5" strokeWidth={2} />
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-background animate-pulse-glow" />
            </div>
            <span className="font-display text-lg font-extrabold tracking-tight hidden sm:inline">prepcify<span className="text-accent">.</span></span>
          </NavLink>

          {/* Primary nav pills */}
          <nav className="hidden md:flex items-center gap-1 px-1">
            {primary.map(({ to, icon: Icon, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => cn(
                  "group relative flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-all tap",
                  isActive
                    ? "bg-foreground text-background shadow-glow-soft"
                    : "text-foreground/70 hover:text-foreground hover:bg-secondary"
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={1.75} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Search */}
          <label className="hidden lg:flex items-center gap-2 rounded-full bg-secondary/70 px-3.5 py-2 max-w-xs flex-1 ring-1 ring-transparent focus-within:ring-accent/40 focus-within:bg-background transition">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input placeholder="Search topics, papers, years…" className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground min-w-0" />
            <kbd className="hidden xl:inline rounded-md border border-border bg-background px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">⌘K</kbd>
          </label>

          {/* Streak */}
          {streak > 0 && (
            <div className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-accent/10 text-accent px-3 py-1.5 text-xs font-semibold ring-1 ring-accent/20">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              {streak}d streak
            </div>
          )}

          {/* More menu (secondary) on overflow */}
          <MoreMenu />

          <UserMenu />
        </div>
      </div>
    </header>
  );
}

function MoreMenu() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/70 hover:bg-secondary text-foreground tap"
        aria-label="More"
      >
        <Command className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-12 w-64 rounded-3xl glass-strong shadow-pop p-2 animate-scale-in origin-top-right z-50">
          <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Quick jump</p>
          <ul className="grid grid-cols-1 gap-0.5">
            {secondary.map(({ to, icon: Icon, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive ? "bg-foreground text-background" : "hover:bg-secondary text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function MobileDock() {
  return (
    <nav className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-40 dock px-2 py-2 flex items-center gap-1">
      {primary.map(({ to, icon: Icon, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => cn(
            "flex flex-col items-center justify-center gap-0.5 rounded-full px-3 py-1.5 text-[10px] font-medium transition-all tap",
            isActive ? "bg-foreground text-background" : "text-foreground/70"
          )}
        >
          <Icon className="h-4 w-4" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export function WebShell() {
  return (
    <div className="min-h-dvh w-full bg-cloud relative overflow-x-hidden">
      {/* Decorative grid layer */}
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" aria-hidden />
      <TopBar />
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-28 md:pb-12">
        <Outlet />
      </main>
      <MobileDock />
    </div>
  );
}
