import { Link } from "react-router-dom";
import { Settings, Flame, Trophy, Clock, Bell, Moon, HelpCircle, LogOut, Mail, MapPin, Pencil, ChevronRight } from "lucide-react";

const stats = [
  { icon: Flame, k: "12", v: "Day streak" },
  { icon: Trophy, k: "Lvl 14", v: "Scholar" },
  { icon: Clock, k: "26h", v: "Studied" },
  { icon: Trophy, k: "#14", v: "Lagos rank" },
];

const settings = [
  { icon: Bell, label: "Notifications", desc: "Daily reminders, streak alerts" },
  { icon: Moon, label: "Appearance", desc: "Light, dark, or system" },
  { icon: HelpCircle, label: "Help center", desc: "FAQs and contact support" },
  { icon: LogOut, label: "Sign out", desc: "End your session" },
];

export default function WebProfile() {
  return (
    <div className="space-y-8 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <section className="lg:col-span-2 rounded-3xl bg-foreground p-8 text-background">
          <div className="flex items-start gap-6">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-accent font-display text-3xl font-extrabold text-accent-foreground">A</div>
            <div className="flex-1">
              <p className="font-display text-3xl font-extrabold leading-tight">Adaeze Okafor</p>
              <p className="text-sm text-background/70">JAMB · WAEC · 2025 cohort</p>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-background/70">
                <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> adaeze@example.com</span>
                <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Lagos, Nigeria</span>
              </div>
            </div>
            <button className="tap flex items-center gap-1.5 rounded-full bg-background/10 px-3 py-1.5 text-xs font-semibold">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>
          </div>

          <div className="mt-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.v} className="rounded-2xl bg-background/5 p-4">
                  <Icon className="h-4 w-4 text-accent" />
                  <p className="mt-2 font-display text-xl font-bold">{s.k}</p>
                  <p className="text-[11px] text-background/60">{s.v}</p>
                </div>
              );
            })}
          </div>
        </section>

        <Link to="/app/exam" className="rounded-3xl bg-accent p-6 text-accent-foreground tap shadow-soft">
          <Trophy className="h-6 w-6" />
          <p className="mt-5 font-display text-xl font-extrabold leading-tight">Take a mock exam</p>
          <p className="mt-1.5 text-sm opacity-90">Find your weak spots before exam day.</p>
          <div className="mt-5 inline-flex items-center gap-1 text-sm font-semibold">Start mock <ChevronRight className="h-4 w-4" /></div>
        </Link>
      </div>

      <section>
        <h2 className="font-display text-2xl font-bold">Settings</h2>
        <ul className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {settings.map((s) => {
            const Icon = s.icon;
            return (
              <li key={s.label}>
                <button className="tap w-full flex items-center gap-4 rounded-3xl border border-border bg-card p-5 text-left hover:shadow-soft transition-shadow">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary">
                    <Icon className="h-[18px] w-[18px]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[15px]">{s.label}</p>
                    <p className="text-xs text-muted-foreground">{s.desc}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
