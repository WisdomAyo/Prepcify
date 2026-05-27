"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Flame, Trophy, Clock, Bell, Moon, HelpCircle, LogOut, Mail, MapPin,
  Pencil, ChevronRight,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

const stats = [
  { icon: Flame, k: "12", v: "Day streak" },
  { icon: Trophy, k: "Lvl 14", v: "Scholar" },
  { icon: Clock, k: "26h", v: "Studied" },
  { icon: Trophy, k: "#14", v: "Lagos rank" },
];

export default function WebProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const name = user?.display_name || "Student";
  const email = user?.email || "";

  async function handleSignOut() {
    await logout();
    toast.success("Signed out");
    router.replace("/");
  }

  const settingsItems = [
    { icon: Bell, label: "Notifications", desc: "Daily reminders, streak alerts", href: "/app/settings/notifications" },
    { icon: Moon, label: "Appearance", desc: "Light, dark, or system", href: "/app/settings" },
    { icon: HelpCircle, label: "Help center", desc: "FAQs and contact support", href: "/app/settings" },
  ];

  return (
    <div className="max-w-6xl space-y-8">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <section className="rounded-3xl bg-foreground p-8 text-background lg:col-span-2">
          <div className="flex items-start gap-6">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-accent font-display text-3xl font-bold text-accent-foreground">
              {name.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="font-display text-3xl font-bold leading-tight">
                {name}
              </p>
              <p className="text-sm text-background/70">
                JAMB · WAEC · 2025 cohort
              </p>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-background/70">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> {email}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> Lagos, Nigeria
                </span>
              </div>
            </div>
            <Link
              href="/app/settings/account"
              className="tap flex items-center gap-1.5 rounded-full bg-background/10 px-3 py-1.5 text-xs font-semibold"
            >
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Link>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
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

        <Link
          href="/app/exam/setup"
          className="rounded-3xl bg-accent p-6 text-accent-foreground tap shadow-soft"
        >
          <Trophy className="h-6 w-6" />
          <p className="mt-5 font-display text-xl font-bold leading-tight">
            Take a mock exam
          </p>
          <p className="mt-1.5 text-sm opacity-90">
            Find your weak spots before exam day.
          </p>
          <div className="mt-5 inline-flex items-center gap-1 text-sm font-semibold">
            Start mock <ChevronRight className="h-4 w-4" />
          </div>
        </Link>
      </div>

      <section>
        <h2 className="font-display text-2xl font-bold">Settings</h2>
        <ul className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          {settingsItems.map((s) => {
            const Icon = s.icon;
            return (
              <li key={s.label}>
                <Link
                  href={s.href}
                  className="tap flex w-full items-center gap-4 rounded-3xl border border-border bg-card p-5 text-left transition-shadow hover:shadow-soft"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary">
                    <Icon className="h-[18px] w-[18px]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[15px] font-semibold">{s.label}</p>
                    <p className="text-xs text-muted-foreground">{s.desc}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </li>
            );
          })}
          <li>
            <button
              onClick={handleSignOut}
              className="tap flex w-full items-center gap-4 rounded-3xl border border-border bg-card p-5 text-left transition-shadow hover:shadow-soft"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                <LogOut className="h-[18px] w-[18px]" />
              </div>
              <div className="flex-1">
                <p className="text-[15px] font-semibold">Sign out</p>
                <p className="text-xs text-muted-foreground">End your session</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          </li>
        </ul>
      </section>
    </div>
  );
}
