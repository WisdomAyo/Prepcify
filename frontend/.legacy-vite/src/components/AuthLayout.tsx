import { Link } from "react-router-dom";
import { GraduationCap, ArrowUpRight, Star, Sparkles, Quote } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import studentPortrait from "@/assets/auth-student-1.jpg";
import studyingDetail from "@/assets/auth-detail-1.jpg";
import studentsGroup from "@/assets/auth-students-group.jpg";

const TESTIMONIALS = [
  { quote: "Went from 198 to 312 on JAMB. Mock exams felt exactly like the real paper.", name: "Tunde A.", role: "JAMB · 312", img: studentsGroup },
  { quote: "The AI tutor re-explains until I actually get it. No judgement, just patience.", name: "Chiamaka O.", role: "WAEC · 7 A1s", img: studentPortrait },
  { quote: "Clean, calm, addictive in the best way. I open it before school every morning.", name: "Fatima M.", role: "Cambridge IGCSE", img: studyingDetail },
];

const MARQUEE = ["WAEC", "JAMB", "NECO", "ICAN", "Cambridge", "A-Levels", "O-Levels", "GCE", "SSCE"];

/**
 * AuthLayout — bold editorial split with image canvas, rotating proof,
 * marquee, and interactive parallax-style chrome on the right side.
 */
export function AuthLayout({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
  step,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Optional step indicator e.g. "01 / 03" rendered above the title. */
  step?: string;
}) {
  const [active, setActive] = useState(0);
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const t = setInterval(() => setActive((i) => (i + 1) % TESTIMONIALS.length), 5500);
    return () => clearInterval(t);
  }, []);

  const t = TESTIMONIALS[active];

  return (
    <div className="min-h-dvh bg-background grid lg:grid-cols-[1.05fr_1fr]">
      {/* ─────────── LEFT — form column ─────────── */}
      <div className="relative flex flex-col px-6 sm:px-10 lg:px-14 py-7 lg:py-9">
        {/* top bar */}
        <div className="flex items-center justify-between">
          <Link to="/" className="group flex items-center gap-2 w-fit tap">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-foreground text-background transition-transform group-hover:rotate-[-6deg]">
              <GraduationCap className="h-5 w-5 text-accent" strokeWidth={2} />
            </div>
            <span className="font-display text-lg font-extrabold tracking-tight">
              prepcify<span className="text-accent">.</span>
            </span>
          </Link>

          <Link
            to="/"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
          >
            Back to home
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        {/* form body */}
        <div className="flex-1 flex items-center">
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
                  <p className="font-mono text-[11px] font-semibold tracking-wider text-foreground">{step}</p>
                </>
              )}
            </div>

            <h1 className="font-display text-[clamp(2rem,4vw,3.25rem)] font-extrabold tracking-tight leading-[0.98] text-balance">
              {title}
            </h1>

            {subtitle && (
              <p className="mt-4 text-base text-muted-foreground max-w-md leading-relaxed">{subtitle}</p>
            )}

            <div className="mt-9">{children}</div>

            {footer && <div className="mt-7 text-sm text-muted-foreground">{footer}</div>}
          </div>
        </div>

        {/* bottom strip */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} prepcify</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Help</a>
          </div>
        </div>
      </div>

      {/* ─────────── RIGHT — editorial image canvas ─────────── */}
      <aside
        className="hidden lg:block relative overflow-hidden bg-foreground text-background"
        onMouseMove={(e) => {
          const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
          setMouse({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height });
        }}
      >
        {/* Hero portrait — fills column, parallax on mouse */}
        <div
          className="absolute inset-0 transition-transform duration-[1200ms] ease-out will-change-transform"
          style={{ transform: `scale(1.08) translate3d(${(mouse.x - 0.5) * -18}px, ${(mouse.y - 0.5) * -14}px, 0)` }}
        >
          <img
            src={studentPortrait}
            alt="Student studying with prepcify"
            className="h-full w-full object-cover object-center"
            loading="eager"
          />
          {/* color wash for legibility + brand */}
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/60 via-foreground/30 to-foreground/85 mix-blend-multiply" />
          <div className="absolute inset-0 bg-foreground/25" />
        </div>

        {/* grain noise overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />

        {/* ── top: badge bar ─────────────────────────────────── */}
        <div className="relative z-10 flex items-center justify-between px-12 pt-10">
          <div className="flex items-center gap-2.5 rounded-full border border-background/20 bg-background/5 px-3.5 py-1.5 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            
          </div>

          <div className="flex items-center gap-1.5 rounded-full border border-background/20 bg-background/5 px-3.5 py-1.5 backdrop-blur-md">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-3 w-3 fill-accent text-accent" />
            ))}
            <span className="ml-1 text-[11px] font-bold tracking-wide text-background">4.9</span>
          </div>
        </div>

        {/* ── middle: oversized editorial number + headline ───── */}
       

        {/* ── floating: detail image card (top right) ────────── */}
        <div
          className="absolute right-10 top-[22%] z-10 hidden xl:block w-44 rotate-[5deg] rounded-3xl bg-card p-2 shadow-pop transition-transform duration-700 hover:rotate-0 hover:scale-105"
          style={{ transform: `rotate(5deg) translate3d(${(mouse.x - 0.5) * 14}px, ${(mouse.y - 0.5) * 10}px, 0)` }}
        >
          <img src={studyingDetail} alt="Studying detail" className="rounded-2xl aspect-[4/5] object-cover w-full" loading="lazy" />
          <div className="px-2 py-2.5">
            <p className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">Daily session</p>
            <p className="text-xs font-bold text-foreground">23 min · today</p>
          </div>
        </div>

        {/* ── floating: live ticker chip ─────────────────────── */}
        <div className="absolute right-12 top-[14%] z-10 hidden xl:flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-3.5 py-1.5 shadow-pop animate-fade-in">
          <Sparkles className="h-3.5 w-3.5" />
          <span className="text-[11px] font-bold uppercase tracking-wider">+240 XP earned · just now</span>
        </div>

        {/* ── bottom: rotating testimonial ───────────────────── */}
        <div className="absolute bottom-0 left-0 right-0 z-10 px-12 pb-12">
          <div className="rounded-3xl border border-background/15 bg-background/5 p-6 backdrop-blur-xl">
            <Quote className="h-5 w-5 text-accent" />
            <div className="mt-3 min-h-[88px]">
              {TESTIMONIALS.map((tt, i) => (
                <blockquote
                  key={tt.name}
                  className={cn(
                    "absolute right-12 left-12 transition-all duration-700",
                    i === active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
                  )}
                  aria-hidden={i !== active}
                >
                  <p className="font-display text-lg font-bold leading-snug text-background text-balance">
                    "{tt.quote}"
                  </p>
                </blockquote>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 overflow-hidden rounded-full border border-background/30">
                  <img src={t.img} alt="" className="h-full w-full object-cover" />
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
                      i === active ? "w-6 bg-accent" : "w-1.5 bg-background/30 hover:bg-background/50"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* exam marquee */}
          <div className="mt-5 overflow-hidden">
            <div className="flex gap-8 animate-[marquee_28s_linear_infinite] whitespace-nowrap">
              {[...MARQUEE, ...MARQUEE].map((m, i) => (
                <span
                  key={i}
                  className="font-display text-base font-bold tracking-tight text-background/60"
                >
                  {m} <span className="text-accent">·</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* corner registration mark */}
        <div className="absolute top-6 right-6 z-10 font-mono text-[10px] uppercase tracking-[0.2em] text-background/50">
          prepcify / 2026 — ED.01
        </div>
      </aside>

      {/* marquee keyframes (scoped) */}
      <style>{`@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
    </div>
  );
}
