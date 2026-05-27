"use client";

import Link from "next/link";
import Image from "next/image";
import { GraduationCap, ArrowUpRight, Quote } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const TESTIMONIALS = [
  { quote: "Went from 198 to 312 on JAMB. Mock exams felt exactly like the real paper.", name: "Tunde A.", role: "JAMB · 312", img: "/assets/auth-students-group.jpg" },
  { quote: "The AI tutor re-explains until I actually get it. No judgement, just patience.", name: "Chiamaka O.", role: "WAEC · 7 A1s", img: "/assets/auth-student-1.jpg" },
  { quote: "Clean, calm, addictive in the best way. I open it before school every morning.", name: "Fatima M.", role: "Cambridge IGCSE", img: "/assets/auth-detail-1.jpg" },
];

const MARQUEE = ["WAEC", "JAMB", "NECO", "ICAN", "Cambridge", "A-Levels", "O-Levels", "GCE", "SSCE"];

export interface AuthLayoutProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Optional step indicator e.g. "01 / 03" rendered above the title. */
  step?: string;
}

/**
 * AuthLayout — editorial split-screen shell for all auth pages.
 * Left: the form. Right: a rotating proof panel (hidden below `lg`).
 */
export function AuthLayout({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
  step,
}: AuthLayoutProps) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(
      () => setActive((i) => (i + 1) % TESTIMONIALS.length),
      5500,
    );
    return () => clearInterval(t);
  }, []);

  const t = TESTIMONIALS[active];

  return (
    <div className="min-h-dvh bg-background grid lg:grid-cols-[1.05fr_1fr]">
      {/* LEFT — form column */}
      <div className="relative flex flex-col px-6 sm:px-10 lg:px-14 py-7 lg:py-9">
        <div className="flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-2 w-fit tap">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-foreground text-background transition-transform group-hover:rotate-[-6deg]">
              <GraduationCap className="h-5 w-5 text-accent" strokeWidth={2} />
            </div>
            <span className="font-display text-lg font-bold tracking-tight">
              prepcify<span className="text-accent">.</span>
            </span>
          </Link>
          <Link
            href="/"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
          >
            Back to home
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <main id="main-content" className="flex-1 flex items-center">
          <div className="w-full max-w-[440px] mx-auto py-10 animate-fade-in">
            <div className="flex items-center gap-3 mb-5">
              {eyebrow && (
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {eyebrow}
                </p>
              )}
              {step && (
                <>
                  <span className="h-px w-6 bg-border" />
                  <p className="font-mono text-[11px] font-semibold tracking-wider text-foreground">
                    {step}
                  </p>
                </>
              )}
            </div>

            <h1 className="font-display text-[clamp(2rem,4vw,3.25rem)] font-bold tracking-tight leading-[0.98] text-balance">
              {title}
            </h1>

            {subtitle && (
              <p className="mt-4 text-base text-muted-foreground max-w-md leading-relaxed">
                {subtitle}
              </p>
            )}

            <div className="mt-9">{children}</div>

            {footer && (
              <div className="mt-7 text-sm text-muted-foreground">{footer}</div>
            )}
          </div>
        </main>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} prepcify</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Help</a>
          </div>
        </div>
      </div>

      {/* RIGHT — editorial proof panel */}
      <aside className="hidden lg:block relative overflow-hidden bg-foreground text-background">
        <div className="absolute inset-0">
          <Image
            src="/assets/auth-student-1.jpg"
            alt=""
            aria-hidden="true"
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover object-center scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/60 via-foreground/30 to-foreground/85 mix-blend-multiply" />
          <div className="absolute inset-0 bg-foreground/25" />
        </div>



     

      

        <div className="absolute bottom-0 left-0 right-0 z-10 px-12 pb-12">
          <div className="rounded-3xl border border-background/15 bg-background/5 p-6 backdrop-blur-xl">
            <Quote className="h-5 w-5 text-accent" />
            <blockquote className="mt-3 min-h-[72px]">
              <p className="font-display text-lg font-bold leading-snug text-background text-balance">
                &ldquo;{t.quote}&rdquo;
              </p>
            </blockquote>
            <div className="mt-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 overflow-hidden rounded-full border border-background/30">
                  <Image
                    src={t.img}
                    alt=""
                    width={36}
                    height={36}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-bold leading-tight">{t.name}</p>
                  <p className="text-[11px] text-background/70">{t.role}</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                {TESTIMONIALS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    aria-label={`Show testimonial ${i + 1}`}
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      i === active ? "w-6 bg-accent" : "w-1.5 bg-background/30 hover:bg-background/50",
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 overflow-hidden">
            <div className="flex gap-8 animate-[marquee_28s_linear_infinite] whitespace-nowrap">
              {[...MARQUEE, ...MARQUEE].map((m, i) => (
                <span key={i} className="font-display text-base font-bold tracking-tight text-background/60">
                  {m} <span className="text-accent">·</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
