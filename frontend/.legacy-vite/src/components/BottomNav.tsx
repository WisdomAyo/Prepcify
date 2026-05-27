import { NavLink } from "react-router-dom";
import { Home, BookOpen, Trophy, Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/app", icon: Home, label: "Home", end: true },
  { to: "/app/subjects", icon: BookOpen, label: "Learn" },
  { to: "/app/tutor", icon: Sparkles, label: "Tutor" },
  { to: "/app/leaderboard", icon: Trophy, label: "Compete" },
  { to: "/app/profile", icon: User, label: "Profile" },
];

export function BottomNav() {
  return (
    <nav className="sticky bottom-0 z-30 mt-auto border-t border-border bg-card/90 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
      <ul className="grid grid-cols-5">
        {items.map(({ to, icon: Icon, label, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium tap",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      "flex h-9 w-12 items-center justify-center rounded-full transition-colors",
                      isActive && "bg-secondary"
                    )}
                  >
                    <Icon className={cn("h-[18px] w-[18px]", isActive && "stroke-[2.4]")} />
                  </span>
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
