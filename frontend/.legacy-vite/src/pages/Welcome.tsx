import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useSpring,
  animate,
} from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Brain,
  Trophy,
  Zap,
  Target,
  BookOpen,
  Flame,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import slide1 from "@/assets/onboard-1.jpg";
import slide2 from "@/assets/onboard-2.jpg";
import slide3 from "@/assets/onboard-3.jpg";

type Slide = {
  eyebrow: string;
  title: [string, string];
  body: string;
  image: string;
  icon: typeof Brain;
  accent: string;
  features: { icon: typeof Brain; label: string; meta: string }[];
  stat: { value: number; suffix: string; label: string };
};

const slides: Slide[] = [
  {
    eyebrow: "Welcome to prepcify",
    title: ["A calmer way to", "pass your exams"],
    body: "WAEC, JAMB, NECO, ICAN, Cambridge — one beautifully focused place to prepare for them all.",
    image: slide1,
    icon: Brain,
    accent: "from-sky-400 via-blue-500 to-violet-500",
    features: [
      { icon: BookOpen, label: "Past Questions", meta: "12,400+" },
      { icon: Target, label: "Mock Exams", meta: "Real timing" },
      { icon: Flame, label: "Daily Streaks", meta: "Stay sharp" },
    ],
    stat: { value: 42000, suffix: "+", label: "Students learning" },
  },
  {
    eyebrow: "Built for your pace",
    title: ["A daily plan that", "fits your life"],
    body: "Bite-sized lessons, smart quizzes and a personal pace that respects your time.",
    image: slide2,
    icon: Sparkles,
    accent: "from-cyan-400 via-blue-500 to-emerald-400",
    features: [
      { icon: Zap, label: "15 min sessions", meta: "Quick wins" },
      { icon: Target, label: "Adaptive recap", meta: "Smart" },
      { icon: Flame, label: "Weekly goals", meta: "Personal" },
    ],
    stat: { value: 38, suffix: "%", label: "Avg. score lift" },
  },
  {
    eyebrow: "Your AI study partner",
    title: ["A brilliant tutor,", "in your pocket"],
    body: "Ask anything. Get kind, clear explanations — and walk into the exam hall confident.",
    image: slide3,
    icon: Trophy,
    accent: "from-violet-500 via-fuchsia-500 to-sky-400",
    features: [
      { icon: Brain, label: "AI Tutor", meta: "24/7" },
      { icon: BookOpen, label: "Step solutions", meta: "Worked" },
      { icon: Trophy, label: "Exam predictor", meta: "Likely topics" },
    ],
    stat: { value: 94, suffix: "%", label: "Said it felt like magic" },
  },
];

function Counter({ to, suffix }: { to: number; suffix: string }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const controls = animate(0, to, {
      duration: 1.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (x) => setV(Math.round(x)),
    });
    return () => controls.stop();
  }, [to]);
  return (
    <span>
      {v.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function Welcome() {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const navigate = useNavigate();
  const S = slides[i];
  const last = i === slides.length - 1;

  // Cursor parallax
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });
  const blobX = useTransform(sx, [-1, 1], [-30, 30]);
  const blobY = useTransform(sy, [-1, 1], [-30, 30]);
  const blob2X = useTransform(sx, [-1, 1], [25, -25]);
  const blob2Y = useTransform(sy, [-1, 1], [20, -20]);

  // 3D tilt on visual card
  const tiltX = useTransform(sy, [-1, 1], [8, -8]);
  const tiltY = useTransform(sx, [-1, 1], [-10, 10]);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width) * 2 - 1);
    my.set(((e.clientY - r.top) / r.height) * 2 - 1);
  };

  const next = () => {
    if (last) return navigate("/signup");
    setDir(1);
    setI((p) => p + 1);
  };
  const back = () => {
    if (i === 0) return;
    setDir(-1);
    setI((p) => p - 1);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") back();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const slideVariants = {
    enter: (d: number) => ({ opacity: 0, x: d * 60, scale: 0.96 }),
    center: { opacity: 1, x: 0, scale: 1 },
    exit: (d: number) => ({ opacity: 0, x: d * -60, scale: 0.96 }),
  };

  return (
    <div
      onMouseMove={onMove}
      className="relative min-h-dvh overflow-hidden bg-[radial-gradient(ellipse_at_top,hsl(210_100%_98%),hsl(0_0%_100%)_60%)]"
    >
      {/* Ambient parallax blobs */}
      <motion.div
        aria-hidden
        style={{ x: blobX, y: blobY }}
        className="pointer-events-none absolute -top-48 -left-32 h-[640px] w-[640px] rounded-full blur-3xl"
      >
        <div
          className="h-full w-full rounded-full opacity-70"
          style={{
            background:
              "radial-gradient(circle, hsl(205 100% 72% / 0.55), transparent 65%)",
          }}
        />
      </motion.div>
      <motion.div
        aria-hidden
        style={{ x: blob2X, y: blob2Y }}
        className="pointer-events-none absolute -bottom-56 -right-40 h-[720px] w-[720px] rounded-full blur-3xl"
      >
        <div
          className="h-full w-full rounded-full opacity-60"
          style={{
            background:
              "radial-gradient(circle, hsl(265 95% 78% / 0.50), transparent 65%)",
          }}
        />
      </motion.div>
      <motion.div
        aria-hidden
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute top-1/3 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, hsl(180 95% 78% / 0.30), transparent 70%)",
        }}
      />

      {/* Fine grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(to right, hsl(220 25% 90% / 0.6) 1px, transparent 1px), linear-gradient(to bottom, hsl(220 25% 90% / 0.6) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 pt-6 md:px-12 md:pt-8">
        <button
          onClick={back}
          className={cn(
            "tap inline-flex h-11 items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 text-sm font-semibold text-foreground backdrop-blur-xl transition-all hover:bg-white",
            i === 0 && "pointer-events-none opacity-0",
          )}
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
        <div className="flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 py-2 backdrop-blur-xl">
          <div className="relative h-2 w-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-accent opacity-60" />
            <span className="absolute inset-0 rounded-full bg-accent" />
          </div>
          <span className="font-display text-sm font-bold tracking-tight">
            prepcify<span className="text-accent">.</span>
          </span>
        </div>
        <button
          onClick={() => navigate("/signup")}
          className="text-sm font-semibold text-muted-foreground transition hover:text-foreground"
        >
          Skip →
        </button>
      </header>

      {/* Main */}
      <main className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-6 py-8 md:grid-cols-[1.05fr_1fr] md:gap-16 md:px-12 md:py-12">
        {/* Text column */}
        <div className="order-2 flex flex-col md:order-1">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={i}
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Eyebrow chip */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/60 bg-white/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground backdrop-blur-xl"
              >
                <S.icon className="h-3.5 w-3.5 text-accent" />
                {S.eyebrow}
              </motion.div>

              {/* Headline */}
              <h1 className="font-display text-[44px] font-extrabold leading-[1.02] tracking-tight text-balance md:text-[64px]">
                <span className="block">{S.title[0]}</span>
                <span className="relative inline-block">
                  <span
                    className={cn(
                      "relative z-10 bg-gradient-to-r bg-clip-text text-transparent",
                      S.accent,
                    )}
                  >
                    {S.title[1]}
                  </span>
                  <motion.svg
                    key={`u-${i}`}
                    className="absolute -bottom-2 left-0 h-3 w-full"
                    viewBox="0 0 300 12"
                    fill="none"
                    preserveAspectRatio="none"
                  >
                    <motion.path
                      d="M2 8 Q 150 -4 298 8"
                      stroke="hsl(var(--accent))"
                      strokeWidth="3"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: 0.45, duration: 0.9 }}
                    />
                  </motion.svg>
                </span>
              </h1>

              <p className="mt-6 max-w-md text-[17px] leading-relaxed text-muted-foreground">
                {S.body}
              </p>

              {/* Feature bento */}
              <div className="mt-7 grid grid-cols-3 gap-2.5 max-w-md">
                {S.features.map((f, idx) => {
                  const Icon = f.icon;
                  return (
                    <motion.div
                      key={f.label + i}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 + idx * 0.08 }}
                      whileHover={{ y: -4 }}
                      className="group relative overflow-hidden rounded-2xl border border-border/60 bg-white/80 p-3 backdrop-blur-xl"
                    >
                      <div
                        className={cn(
                          "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity group-hover:opacity-15",
                          S.accent,
                        )}
                      />
                      <div className="relative flex items-center gap-2">
                        <div
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br text-white",
                            S.accent,
                          )}
                        >
                          <Icon className="h-4 w-4" strokeWidth={2.25} />
                        </div>
                      </div>
                      <div className="relative mt-2.5 text-[13px] font-bold leading-tight">
                        {f.label}
                      </div>
                      <div className="relative text-[11px] text-muted-foreground">
                        {f.meta}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Progress + CTA */}
          <div className="mt-10 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setDir(idx > i ? 1 : -1);
                    setI(idx);
                  }}
                  className="group relative h-1.5 flex-1 overflow-hidden rounded-full bg-secondary/80"
                  aria-label={`Go to slide ${idx + 1}`}
                >
                  <motion.div
                    className={cn(
                      "absolute inset-y-0 left-0 rounded-full bg-gradient-to-r",
                      S.accent,
                    )}
                    initial={false}
                    animate={{
                      width: idx < i ? "100%" : idx === i ? "100%" : "0%",
                    }}
                    transition={{ duration: idx === i ? 0.55 : 0.25 }}
                  />
                </button>
              ))}
              <span className="ml-1 text-xs font-bold tabular-nums text-muted-foreground">
                {String(i + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {/* Magnetic CTA */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <Button
                  size="xl"
                  onClick={next}
                  className={cn(
                    "group relative overflow-hidden rounded-full bg-gradient-to-r px-8 text-white shadow-[0_18px_50px_-15px_hsl(220_90%_55%/0.6)]",
                    S.accent,
                  )}
                >
                  <span className="relative z-10">
                    {last ? "Create your account" : "Continue"}
                  </span>
                  <ArrowRight className="relative z-10 ml-1 transition-transform group-hover:translate-x-1" />
                  <motion.span
                    aria-hidden
                    className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
                  />
                </Button>
              </motion.div>
              {!last && (
                <button
                  onClick={() => navigate("/login")}
                  className="text-sm font-semibold text-muted-foreground transition hover:text-foreground"
                >
                  I already have an account →
                </button>
              )}
            </div>

            <div className="hidden items-center gap-3 text-xs text-muted-foreground md:flex">
              <kbd className="rounded-md border border-border bg-white px-1.5 py-0.5 font-mono text-[10px]">
                ←
              </kbd>
              <kbd className="rounded-md border border-border bg-white px-1.5 py-0.5 font-mono text-[10px]">
                →
              </kbd>
              <span>arrow keys to navigate · drag the card</span>
            </div>
          </div>
        </div>

        {/* Visual column */}
        <div className="relative order-1 md:order-2" style={{ perspective: 1400 }}>
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={i}
              custom={dir}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.25}
              onDragEnd={(_, info) => {
                if (info.offset.x < -80) next();
                else if (info.offset.x > 80) back();
              }}
              variants={{
                enter: (d: number) => ({ opacity: 0, x: d * 80, rotateY: d * 12 }),
                center: { opacity: 1, x: 0, rotateY: 0 },
                exit: (d: number) => ({ opacity: 0, x: d * -80, rotateY: d * -12 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              style={{ rotateX: tiltX, rotateY: tiltY, transformStyle: "preserve-3d" }}
              className="relative mx-auto aspect-[4/5] w-full max-w-md cursor-grab active:cursor-grabbing"
            >
              {/* Glow halo */}
              <div
                className={cn(
                  "absolute -inset-8 rounded-[2.75rem] bg-gradient-to-br opacity-60 blur-3xl",
                  S.accent,
                )}
              />

              {/* Conic glow ring */}
              <motion.div
                aria-hidden
                animate={{ rotate: 360 }}
                transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-1 rounded-[2.25rem] opacity-70"
                style={{
                  background:
                    "conic-gradient(from 0deg, hsl(205 100% 70%), hsl(265 90% 75%), hsl(180 90% 70%), hsl(205 100% 70%))",
                  filter: "blur(14px)",
                }}
              />

              {/* Card */}
              <div
                style={{ transform: "translateZ(40px)" }}
                className="relative h-full w-full overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-[0_40px_80px_-30px_rgba(20,30,80,0.35)]"
              >
                <img
                  src={S.image}
                  alt=""
                  className="h-full w-full object-cover"
                  width={1024}
                  height={1280}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

                {/* Top live badge */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/85 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider backdrop-blur-xl"
                >
                  <Sparkles className="h-3 w-3 text-accent" />
                  {S.eyebrow}
                </motion.div>

                {/* Bottom glass stat card */}
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 rounded-2xl border border-white/40 bg-white/80 p-3.5 backdrop-blur-xl"
                >
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {S.stat.label}
                    </div>
                    <div className="font-display text-2xl font-extrabold leading-none">
                      <Counter to={S.stat.value} suffix={S.stat.suffix} />
                    </div>
                  </div>
                  <div className="flex -space-x-2">
                    {[
                      "from-pink-400 to-rose-500",
                      "from-amber-400 to-orange-500",
                      "from-sky-400 to-blue-500",
                    ].map((g, k) => (
                      <div
                        key={k}
                        className={cn(
                          "h-8 w-8 rounded-full border-2 border-white bg-gradient-to-br",
                          g,
                        )}
                      />
                    ))}
                    <div className="flex h-8 items-center justify-center rounded-full border-2 border-white bg-foreground px-2 text-[10px] font-bold text-background">
                      +12k
                    </div>
                  </div>
                </motion.div>

                {/* Floating icon chip */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.4, rotate: -20 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ delay: 0.45, type: "spring", stiffness: 200, damping: 16 }}
                  style={{ transform: "translateZ(80px)" }}
                  className={cn(
                    "absolute -right-6 top-1/3 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/60 bg-gradient-to-br text-white shadow-2xl",
                    S.accent,
                  )}
                >
                  <S.icon className="h-9 w-9" strokeWidth={1.75} />
                </motion.div>
              </div>

              {/* Decorative floating tag */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                style={{ transform: "translateZ(60px)" }}
                className="absolute -left-4 top-10 flex items-center gap-2 rounded-2xl border border-white/70 bg-white/90 px-3 py-2 text-xs font-semibold shadow-xl backdrop-blur-xl"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500 text-white">
                  <Zap className="h-3 w-3" />
                </div>
                <div>
                  <div className="font-bold leading-none">+12 XP</div>
                  <div className="text-[10px] text-muted-foreground">Streak +1</div>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Slide dots under card */}
          <div className="mt-8 flex items-center justify-center gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setDir(idx > i ? 1 : -1);
                  setI(idx);
                }}
                aria-label={`slide ${idx + 1}`}
                className={cn(
                  "h-2 rounded-full transition-all",
                  idx === i ? "w-8 bg-foreground" : "w-2 bg-border hover:bg-muted-foreground/50",
                )}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Mobile bottom nav arrows */}
      <div className="relative z-10 flex items-center justify-between px-6 pb-8 md:hidden">
        <button
          onClick={back}
          disabled={i === 0}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-white/80 backdrop-blur-xl disabled:opacity-30"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <button
          onClick={next}
          className={cn(
            "flex h-12 items-center gap-2 rounded-full bg-gradient-to-r px-6 text-sm font-bold text-white",
            S.accent,
          )}
        >
          {last ? "Get started" : "Next"} <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
