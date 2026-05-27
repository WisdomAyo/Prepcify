"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import {
  Award,
  Bell,
  BookOpen,
  CalendarDays,
  ChevronDown,
  ClipboardCheck,
  Crown,
  Home,
  Layers3,
  Library,
  MessageCircle,
  Search,
  Settings,
  Sparkles,
  Trophy,
  User,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { useActivePath } from "@/hooks/use-active-path";
import { useAuth } from "@/contexts/auth-context";
import { UserMenu } from "./user-menu";

const mainNav = [
  { to: "/app", icon: Home, label: "Dashboard", end: true },
  { to: "/app/study-plan", icon: CalendarDays, label: "Study Calendar" },
] as const;

const educationNav = [
  { to: "/app/subjects", icon: BookOpen, label: "Subjects" },
  { to: "/app/past-questions", icon: Library, label: "Past Questions" },
  { to: "/app/exam/setup", icon: ClipboardCheck, label: "Mock Exams" },
  { to: "/app/tutor", icon: Sparkles, label: "AI Tutor" },
  { to: "/app/achievements", icon: Award, label: "Achievements" },
] as const;

const communityNav = [
  { to: "/app/battles", icon: Trophy, label: "Battles" },
  { to: "/app/community", icon: MessageCircle, label: "Community" },
  { to: "/app/notifications", icon: Bell, label: "Notifications" },
] as const;

const accountNav = [
  { to: "/app/pricing", icon: Crown, label: "Upgrade" },
  { to: "/app/profile", icon: User, label: "Profile" },
  { to: "/app/settings", icon: Settings, label: "Settings" },
] as const;

const prefetchTargets = [...mainNav, ...educationNav, ...communityNav, ...accountNav];
const mobileNav = [
  ...mainNav,
  ...educationNav.slice(0, 3),
] as {
  end?: boolean;
  icon: typeof Home;
  label: string;
  to: string;
}[];

function SidebarLink({
  end,
  icon: Icon,
  label,
  to,
}: {
  end?: boolean;
  icon: typeof Home;
  label: string;
  to: string;
}) {
  const active = useActivePath(to, end);

  return (
    <Link
      href={to}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[13px] font-semibold transition-colors",
        active
          ? "bg-emerald-50 text-emerald-700"
          : "text-slate-500 hover:bg-slate-50 hover:text-emerald-700",
      )}
    >
      <Icon className={cn("h-4 w-4", active ? "text-emerald-600" : "text-slate-400 group-hover:text-emerald-600")} />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {!end && <ChevronDown className="h-3.5 w-3.5 text-slate-300" />}
    </Link>
  );
}

function SidebarGroup({
  items,
  title,
}: {
  items: readonly {
    end?: boolean;
    icon: typeof Home;
    label: string;
    to: string;
  }[];
  title: string;
}) {
  return (
    <div className="space-y-1.5">
      <p className="px-3 text-[10px] font-bold uppercase tracking-wide text-slate-300">
        {title}
      </p>
      {items.map((item) => (
        <SidebarLink key={item.to} {...item} />
      ))}
    </div>
  );
}

function Sidebar() {
  const { user } = useAuth();
  const displayName = user?.display_name || "Prepcify Student";

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[224px] flex-col border-r border-slate-100 bg-white px-5 py-8 xl:flex">
      <Link href="/app" className="mb-8 flex items-center gap-3" aria-label="prepcify dashboard">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-[0_14px_34px_-18px_rgba(4,120,87,0.8)]">
          <Layers3 className="h-5 w-5" />
        </span>
        <span className="text-lg font-bold tracking-tight text-slate-950">
          prepcify<span className="text-emerald-600">.</span>
        </span>
      </Link>

      <div className="flex flex-col items-center text-center">
        <div className="flex h-[58px] w-[58px] items-center justify-center rounded-full bg-emerald-50 text-lg font-bold text-emerald-800 ring-8 ring-slate-50">
          {getInitials(displayName, user?.email)}
        </div>
        <p className="mt-4 max-w-[140px] truncate text-sm font-bold text-slate-950">
          {displayName}
        </p>
        <div className="mt-3 grid w-full grid-cols-2 rounded-2xl bg-slate-50 py-2 text-center">
          <div>
            <p className="text-xs font-bold text-emerald-700">11</p>
            <p className="text-[10px] text-slate-400">Paths</p>
          </div>
          <div>
            <p className="text-xs font-bold text-emerald-700">5</p>
            <p className="text-[10px] text-slate-400">Streak</p>
          </div>
        </div>
      </div>

      <nav className="mt-7 flex-1 space-y-7 overflow-y-auto scroll-hide" aria-label="Application navigation">
        <SidebarGroup title="Main menu" items={mainNav} />
        <SidebarGroup title="Education" items={educationNav} />
        <SidebarGroup title="Evaluation" items={communityNav} />
        <SidebarGroup title="Account" items={accountNav} />
      </nav>

      <Link href="/app/pricing" className="mt-6 block overflow-hidden rounded-[1.35rem]">
        <Image
          src="/assets/sidebar_banner.png"
          alt="Start free learning"
          width={315}
          height={315}
          className="h-auto w-full object-contain"
        />
      </Link>
    </aside>
  );
}

function TopBar() {
  const pathname = usePathname();
  const title = pathname === "/app" ? "Dashboard" : pathname.split("/").filter(Boolean).pop()?.replaceAll("-", " ") ?? "Dashboard";

  return (
    <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/90 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 xl:px-7">
        <Link href="/app" className="flex items-center gap-2 xl:hidden" aria-label="prepcify dashboard">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-700 text-white">
            <Layers3 className="h-5 w-5" />
          </span>
        </Link>
        <h1 className="min-w-0 flex-1 text-base font-bold capitalize text-slate-950">
          {title}
        </h1>
        <label className="hidden h-11 w-full max-w-sm items-center gap-2 rounded-2xl bg-slate-50 px-3.5 ring-1 ring-slate-100 focus-within:ring-emerald-200 lg:flex">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            aria-label="Search"
            placeholder="Search topics, papers..."
            className="min-w-0 flex-1 bg-transparent text-xs font-medium text-slate-700 outline-none placeholder:text-slate-400"
          />
        </label>
        <Link
          href="/app/notifications"
          aria-label="Notifications"
          className="relative flex h-11 w-11 items-center justify-center rounded-full bg-slate-50 text-slate-500 ring-1 ring-slate-100 transition-colors hover:text-emerald-700"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-amber-400 ring-2 ring-white" />
        </Link>
        <UserMenu />
      </div>
    </header>
  );
}

function MobileDock() {
  return (
    <nav
      aria-label="Primary mobile"
      className="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/70 bg-white/90 px-2 py-2 shadow-[0_22px_54px_-30px_rgba(15,23,42,0.45)] backdrop-blur-xl xl:hidden"
    >
      {mobileNav.map(({ to, icon: Icon, label, end }) => (
        <MobileDockItem key={to} to={to} Icon={Icon} label={label} end={end} />
      ))}
    </nav>
  );
}

function MobileDockItem({
  end,
  Icon,
  label,
  to,
}: {
  end?: boolean;
  Icon: typeof Home;
  label: string;
  to: string;
}) {
  const active = useActivePath(to, end);

  return (
    <Link
      href={to}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
        active ? "bg-emerald-700 text-white" : "text-slate-500 hover:bg-slate-100",
      )}
    >
      <Icon className="h-4 w-4" />
      <span className="sr-only">{label}</span>
    </Link>
  );
}

/** Desktop/tablet application shell. Wraps every `/app/*` route. */
export function WebShell({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    prefetchTargets.forEach((item) => router.prefetch(item.to));
  }, [router]);

  return (
    <div className="min-h-dvh bg-[#f4f8f6] text-slate-950">
      <Sidebar />
      <div className="min-h-dvh xl:pl-[224px]">
        <TopBar />
        <main id="main-content" className="px-4 py-5 pb-28 sm:px-6 xl:px-6 xl:pb-8">
          {children}
        </main>
      </div>
      <MobileDock />
    </div>
  );
}
