import { NavLink } from "react-router-dom";
import { Home, BookOpen, Sparkles, Trophy, ClipboardCheck, User, GraduationCap, Search, Library, Swords, CalendarDays, MessagesSquare, Bell, Beaker, Crown, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserMenu } from "./UserMenu";
import { useAuth } from "@/contexts/AuthContext";

const learn = [
  { to: "/app", icon: Home, label: "Dashboard", end: true },
  { to: "/app/subjects", icon: BookOpen, label: "Subjects" },
  { to: "/app/past-questions", icon: Library, label: "Past Questions" },
  { to: "/app/tutor", icon: Sparkles, label: "AI Tutor" },
  { to: "/app/playground", icon: Beaker, label: "Playground" },
];

const compete = [
  { to: "/app/exam/setup", icon: ClipboardCheck, label: "Mock Exams" },
  { to: "/app/battles", icon: Swords, label: "Quiz Battles" },
  { to: "/app/leaderboard", icon: Trophy, label: "Leaderboard" },
  { to: "/app/study-plan", icon: CalendarDays, label: "Study Plan" },
  { to: "/app/community", icon: MessagesSquare, label: "Community" },
];

const account = [
  { to: "/app/notifications", icon: Bell, label: "Notifications" },
  { to: "/app/pricing", icon: Crown, label: "Upgrade" },
  { to: "/app/profile", icon: User, label: "Profile" },
  { to: "/app/settings", icon: Settings, label: "Settings" },
];

function NavGroup({ label, items }: { label: string; items: { to: string; icon: any; label: string; end?: boolean }[] }) {
  return (
    <div className="mb-5">
      <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <ul className="space-y-1">
        {items.map(({ to, icon: Icon, label, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition-colors tap",
                  isActive ? "bg-foreground text-background" : "text-foreground hover:bg-secondary"
                )
              }
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AppSidebar() {
  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border bg-card sticky top-0 h-dvh overflow-y-auto">
      <div className="px-6 pt-7 pb-6 flex items-center gap-2 sticky top-0 bg-card z-10">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-foreground text-background">
          <GraduationCap className="h-5 w-5 text-accent" strokeWidth={2} />
        </div>
        <span className="font-display text-lg font-extrabold tracking-tight">prepcify<span className="text-accent">.</span></span>
      </div>

      <nav className="px-3 flex-1">
        <NavGroup label="Learn" items={learn} />
        <NavGroup label="Compete" items={compete} />
        <NavGroup label="Account" items={account} />
      </nav>

      <div className="m-3 rounded-3xl bg-foreground p-5 text-background">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
          <Sparkles className="h-4 w-4" />
        </div>
        <p className="mt-3 font-display text-base font-bold leading-tight">prepcify Pro</p>
        <p className="mt-1 text-xs text-background/70">Unlimited mock exams, full AI tutor, past papers archive.</p>
        <NavLink to="/app/pricing" className="mt-4 block w-full rounded-full bg-background py-2 text-center text-xs font-semibold text-foreground tap">Upgrade</NavLink>
      </div>
    </aside>
  );
}

export function AppTopbar() {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/85 px-6 lg:px-10 py-4 backdrop-blur-xl">
      <label className="flex flex-1 max-w-md items-center gap-2 rounded-2xl bg-secondary px-4 py-2.5">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input placeholder="Search topics, papers, years…" className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
        <kbd className="hidden md:inline rounded-md border border-border bg-card px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">⌘K</kbd>
      </label>
      <TopbarRight />
    </header>
  );
}

function TopbarRight() {
  const { profile } = useAuth();
  const streak = profile?.streak_days ?? 0;
  return (
    <div className="ml-auto flex items-center gap-3">
      {streak > 0 && (
        <div className="hidden md:flex chip bg-secondary text-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          {streak} day streak
        </div>
      )}
      <UserMenu />
    </div>
  );
}
