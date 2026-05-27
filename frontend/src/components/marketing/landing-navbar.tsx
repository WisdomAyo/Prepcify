"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Layers3, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/features" },
  { label: "Exams", href: "/exams" },
  { label: "Pricing", href: "/pricing" },
  { label: "FAQs", href: "/faqs" },
  { label: "Contact", href: "/contact" },
];

function LogoMark() {
  return (
    <Link href="/" className="flex items-center gap-3" aria-label="prepcify home">
      <span
        className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_14px_36px_hsl(var(--primary)/0.28)] transition-transform duration-200 hover:-rotate-6 hover:scale-[1.04]"
      >
        <Layers3 className="h-6 w-6 fill-primary-foreground/10" strokeWidth={2.4} />
      </span>
      <span className="hidden font-display text-lg font-bold tracking-tight text-foreground sm:inline">
        prepcify<span className="text-primary">.</span>
      </span>
    </Link>
  );
}

function DesktopNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center rounded-full border border-slate-200/80 bg-slate-100/80 p-2 text-sm font-medium text-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] lg:flex">
      {navItems.map((item) => {
        const active = item.href === pathname;

        return (
          <Link
            key={item.label}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-full px-5 py-2.5 transition-colors hover:text-slate-950",
              active && "bg-white text-slate-950 shadow-[0_10px_24px_rgba(15,23,42,0.08)]",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="relative lg:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-950 shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div
          className="absolute right-0 top-14 z-50 w-[min(20rem,calc(100vw-2rem))] animate-in fade-in slide-in-from-top-2 zoom-in-95 rounded-3xl border border-slate-200 bg-white p-3 text-slate-950 shadow-pop duration-150"
        >
          <div className="grid gap-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={item.href === pathname ? "page" : undefined}
                className={cn(
                  "rounded-2xl px-4 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950",
                  item.href === pathname && "bg-slate-100 text-slate-950",
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="my-3 h-px bg-slate-200" />
          <Button
            asChild
            variant="outline"
            className="h-11 w-full rounded-full"
          >
            <Link href="/login" onClick={() => setOpen(false)}>
              Log in
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}

export function LandingNavbar() {
  const router = useRouter();

  useEffect(() => {
    navItems.forEach((item) => router.prefetch(item.href));
    router.prefetch("/login");
    router.prefetch("/signup");
  }, [router]);

  return (
    <header className="sticky top-0 z-40  px-2 pb-1 pt-2 sm:px-6">
      <div
        className="mx-auto flex h-[74px] max-w-[1474px] items-center justify-between gap-3 rounded-[28px] border border-white/55 px-4 text-slate-950 shadow-[0_24px_80px_hsl(var(--foreground)/0.10),inset_0_1px_0_rgba(255,255,255,0.72)] ring-1 ring-white/35 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/35 sm:h-[86px] sm:px-2 lg:px-3"
      >
        <LogoMark />
        <DesktopNav />

        <div className="hidden items-center gap-2 lg:flex">
          <Button
            asChild
            variant="outline"
            className="h-11 rounded-full px-6"
          >
            <Link href="/login">Log in</Link>
          </Button>
          <Button
            asChild
            className="h-12 rounded-full border border-primary/20 bg-primary px-7 text-primary-foreground shadow-[0_0_0_1px_hsl(var(--primary)/0.14),0_18px_46px_-16px_hsl(var(--primary)/0.75),0_0_42px_-14px_hsl(var(--glow)/0.75)] hover:bg-primary/95 hover:shadow-[0_0_0_1px_hsl(var(--primary)/0.20),0_22px_54px_-16px_hsl(var(--primary)/0.85),0_0_52px_-12px_hsl(var(--glow)/0.80)]"
          >
            <Link href="/signup">Get Started Free</Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <Button
            asChild
            className="h-11 rounded-full border border-primary/20 bg-primary px-4 text-xs text-primary-foreground shadow-[0_16px_36px_-16px_hsl(var(--primary)/0.75),0_0_36px_-16px_hsl(var(--glow)/0.7)] hover:bg-primary/95 sm:px-5 sm:text-sm"
          >
            <Link href="/signup">Get Started Free</Link>
          </Button>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
