import { ScreenHeader } from "@/components/ScreenHeader";
import { Settings, ChevronRight, Flame, Trophy, Clock, Bell, Moon, HelpCircle, LogOut } from "lucide-react";
import { Link } from "react-router-dom";

const stats = [
  { icon: Flame, k: "12", v: "Day streak" },
  { icon: Trophy, k: "Lvl 14", v: "Scholar" },
  { icon: Clock, k: "26h", v: "Studied" },
];

const groups = [
  { label: "Account", items: [
    { icon: Bell, label: "Notifications" },
    { icon: Moon, label: "Appearance" },
  ]},
  { label: "Support", items: [
    { icon: HelpCircle, label: "Help center" },
    { icon: LogOut, label: "Sign out" },
  ]},
];

export default function Profile() {
  return (
    <div className="pb-6">
      <ScreenHeader
        title="Profile"
        right={
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary tap" aria-label="Settings">
            <Settings className="h-[18px] w-[18px]" />
          </button>
        }
      />

      <section className="mx-5 flex flex-col items-center rounded-3xl bg-foreground p-6 text-background">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent font-display text-2xl font-extrabold text-accent-foreground">A</div>
        <p className="mt-4 font-display text-xl font-bold">Adaeze Okafor</p>
        <p className="text-sm text-background/70">JAMB · WAEC · 2025 cohort</p>

        <div className="mt-5 grid w-full grid-cols-3 gap-2">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.v} className="rounded-2xl bg-background/5 p-3 text-center">
                <Icon className="mx-auto h-4 w-4 text-accent" />
                <p className="mt-1.5 font-display text-base font-bold">{s.k}</p>
                <p className="text-[11px] text-background/60">{s.v}</p>
              </div>
            );
          })}
        </div>
      </section>

      <Link to="/app/exam" className="mx-5 mt-5 flex items-center gap-4 rounded-3xl border border-border bg-card p-4 tap">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
          <Trophy className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-[15px]">Take a mock exam</p>
          <p className="text-xs text-muted-foreground">See exactly where you stand.</p>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </Link>

      <div className="mt-6 px-5 space-y-5">
        {groups.map((g) => (
          <div key={g.label}>
            <p className="px-2 text-xs uppercase tracking-wider text-muted-foreground">{g.label}</p>
            <ul className="mt-2 overflow-hidden rounded-3xl border border-border bg-card">
              {g.items.map((it, i) => {
                const Icon = it.icon;
                return (
                  <li key={it.label} className={i > 0 ? "border-t border-border" : ""}>
                    <button className="tap flex w-full items-center gap-4 px-4 py-3.5 text-left">
                      <Icon className="h-[18px] w-[18px] text-muted-foreground" />
                      <span className="flex-1 text-sm font-medium">{it.label}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
