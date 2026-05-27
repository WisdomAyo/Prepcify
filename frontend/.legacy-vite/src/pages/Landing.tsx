import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, ArrowUpRight, Sparkles, Flame, Bell, Play, Calculator, Trophy,
  Check, Star, ChevronDown, GraduationCap, Brain, Zap, Target, Users,
  BookOpen, Award, TrendingUp, Globe, MessageCircle, Pause,
} from "lucide-react";
import { RingProgress, BarProgress } from "@/components/Progress";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, useScroll, useTransform, AnimatePresence, useInView } from "framer-motion";
import heroImg from "@/assets/landing-hero.jpg";
import studentsImg from "@/assets/landing-students.jpg";
import notebookImg from "@/assets/landing-notebook.jpg";

const exams = ["WAEC", "JAMB", "NECO", "ICAN", "Cambridge", "A-Levels", "O-Levels", "GCE", "SAT", "IELTS"];

const features = [
  { n: "01", icon: Target, title: "A plan that adapts to you.", body: "Daily study cards calibrated to your weak spots, your exam date, your pace.", color: "from-violet-500 to-fuchsia-500" },
  { n: "02", icon: Brain, title: "An AI tutor that never tires.", body: "Ask anything — past papers, hard concepts, formulas. prepcify AI explains in plain English.", color: "from-sky-500 to-cyan-400" },
  { n: "03", icon: Zap, title: "Mock exams that feel real.", body: "Live timer, navigator, flag, submit. See exactly where you stand before exam day.", color: "from-amber-500 to-orange-500" },
  { n: "04", icon: Trophy, title: "Progress you can feel.", body: "Streaks, XP, badges, and friendly leaderboards keep you coming back daily.", color: "from-emerald-500 to-teal-500" },
];

const testimonials = [
  { name: "Tunde A.", role: "JAMB 2024 · 312", quote: "I went from 198 to 312. The mock exams felt exactly like the real paper.", grad: "from-indigo-600 via-violet-600 to-fuchsia-600" },
  { name: "Chiamaka O.", role: "WAEC · 7 A1s", quote: "The AI tutor is gentle. It re-explains until I actually get it. No judgement.", grad: "from-amber-500 via-orange-500 to-rose-500" },
  { name: "Fatima M.", role: "Cambridge IGCSE", quote: "Clean. Calm. Addictive in the best way. I open it every morning before school.", grad: "from-emerald-500 via-teal-500 to-cyan-500" },
];

const faqs = [
  { q: "Which exams do you cover?", a: "WAEC, NECO, JAMB, ICAN, Cambridge IGCSE, A-Levels, O-Levels and the Nigerian SSCE. More boards added every term." },
  { q: "Is it really free?", a: "Yes — the core experience is free forever. prepcify Pro adds unlimited mock exams, full AI tutor, and the past papers archive." },
  { q: "Do I need internet to use it?", a: "Most lessons cache for offline use. AI tutor and live leaderboards need a connection." },
  { q: "Can my school use prepcify with a class?", a: "Yes. prepcify for Schools gives teachers dashboards, assignments, and class leaderboards. Get in touch." },
];

// ─── reusable motion ──────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as any },
  }),
};

function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      variants={fadeUp}
      custom={delay}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Animated counter
function Counter({ to, suffix = "", duration = 1.8 }: { to: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / (duration * 1000));
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(to * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

// Real HTML5 video player — autoplays muted loop, click to pause
const HERO_VIDEO_SRC = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4";

function HeroVideoCard() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else { v.pause(); setPlaying(false); }
  };
  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  return (
    <div className="relative overflow-hidden rounded-[32px] border border-black/5 shadow-pop group bg-black">
      <video
        ref={videoRef}
        src={HERO_VIDEO_SRC}
        poster={heroImg}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="h-full w-full object-cover aspect-[4/5]"
      />
      {/* gentle gradient for legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 pointer-events-none" />

      {/* central play/pause */}
      <button
        onClick={toggle}
        className="absolute inset-0 flex items-center justify-center"
        aria-label={playing ? "Pause demo" : "Play demo"}
      >
        <span className={cn("relative flex items-center justify-center transition-opacity", playing ? "opacity-0 group-hover:opacity-100" : "opacity-100")}>
          <span className="absolute h-24 w-24 rounded-full bg-white/30 animate-ping" />
          <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white text-foreground shadow-pop">
            {playing ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7 ml-1" />}
          </span>
        </span>
      </button>

      {/* mute toggle */}
      <button
        onClick={toggleMute}
        className="absolute top-4 right-4 rounded-full bg-black/50 backdrop-blur text-white text-[11px] font-semibold px-3 py-1.5 border border-white/20 hover:bg-black/70"
      >
        {muted ? "Unmute" : "Mute"}
      </button>

      <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between pointer-events-none">
        <div className="text-white">
          <p className="text-[10px] uppercase tracking-[0.2em] opacity-70">Watch the 60-sec story</p>
          <p className="font-display text-lg font-bold">How prepcify actually feels.</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur px-3 py-1.5 text-white text-xs font-medium border border-white/25">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const { scrollYProgress } = useScroll();
  const heroParallax = useTransform(scrollYProgress, [0, 0.3], [0, -80]);
  const blobY = useTransform(scrollYProgress, [0, 1], [0, 250]);

  return (
    <div className="min-h-dvh bg-[#0b0d1a] text-white overflow-x-clip">
      {/* ─── NAV ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/80 backdrop-blur-xl text-foreground">
        <div className="container max-w-7xl flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <motion.div
              whileHover={{ rotate: 12, scale: 1.08 }}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500 via-violet-500 to-sky-500 shadow-glow"
            >
              <GraduationCap className="h-4 w-4 text-white" />
            </motion.div>
            <span className="font-display text-lg font-extrabold tracking-tight">prepcify<span className="text-fuchsia-500">.</span></span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            {["features", "exams", "pricing", "faq"].map((s) => (
              <a key={s} href={`#${s}`} className="text-foreground/60 hover:text-foreground transition-colors capitalize relative group">
                {s}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-gradient-to-r from-fuchsia-500 to-sky-400 group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex"><Link to="/login">Sign in</Link></Button>
            <Button asChild size="sm"><Link to="/signup">Get started <ArrowRight className="h-4 w-4" /></Link></Button>
          </div>
        </div>
      </header>

      {/* ─── HERO ────────────────────────────────────────────────────── */}
      <section className="relative pt-12 md:pt-20 pb-24 md:pb-32 overflow-hidden bg-cloud text-foreground">
        {/* soft animated mesh blobs (light) */}
        <motion.div style={{ y: blobY }} className="pointer-events-none absolute inset-0 -z-0">
          <div className="absolute -top-20 -left-32 h-[520px] w-[520px] rounded-full blur-[120px] opacity-60 bg-sky-300" />
          <div className="absolute top-40 right-[-160px] h-[600px] w-[600px] rounded-full blur-[140px] opacity-50 bg-violet-200" />
          <div className="absolute bottom-0 left-1/3 h-[420px] w-[420px] rounded-full blur-[120px] opacity-40 bg-fuchsia-200" />
        </motion.div>
        {/* grid overlay */}
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" />

        <div className="container max-w-7xl relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <motion.div
              initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }}
              className="lg:col-span-7"
              style={{ y: heroParallax }}
            >
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 backdrop-blur px-4 py-1.5 text-xs font-medium shadow-soft">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span className="text-foreground/80">Now live · Built for African students</span>
              </motion.div>

              <motion.h1 variants={fadeUp} className="mt-6 font-display text-[44px] sm:text-6xl lg:text-[92px] font-extrabold leading-[0.95] tracking-tight text-balance">
                Pass your exams,<br />
                the{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-fuchsia-600 via-violet-600 to-sky-500 bg-clip-text text-transparent italic font-semibold">
                    smarter
                  </span>
                  <motion.svg
                    viewBox="0 0 300 20" className="absolute -bottom-3 left-0 w-full"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.6, delay: 0.8 }}
                  >
                    <motion.path
                      d="M5 12 Q 80 2, 150 10 T 295 8"
                      fill="none" stroke="url(#g1)" strokeWidth="3" strokeLinecap="round"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4, delay: 0.6 }}
                    />
                    <defs>
                      <linearGradient id="g1" x1="0" x2="1">
                        <stop offset="0" stopColor="#d946ef" />
                        <stop offset="1" stopColor="#0ea5e9" />
                      </linearGradient>
                    </defs>
                  </motion.svg>
                </span>{" "}
                way.
              </motion.h1>

              <motion.p variants={fadeUp} className="mt-7 max-w-xl text-lg text-foreground/70">
                The calm, beautiful study app for WAEC, JAMB, NECO, ICAN, Cambridge and beyond. A daily plan, an AI tutor, and mock exams that feel real.
              </motion.p>

              <motion.div variants={fadeUp} className="mt-9 flex flex-wrap gap-3">
                <Button asChild size="xl" className="bg-gradient-to-r from-fuchsia-500 to-violet-600 hover:opacity-95 text-white shadow-glow border-0">
                  <Link to="/onboarding">Start learning free <ArrowRight /></Link>
                </Button>
                <Button asChild size="xl" variant="outline">
                  <Link to="/app">See the dashboard</Link>
                </Button>
              </motion.div>

              <motion.div variants={fadeUp} className="mt-12 grid grid-cols-3 gap-6 max-w-md">
                {[
                  { k: 42000, s: "+", l: "Students" },
                  { k: 1200000, s: "+", l: "Questions" },
                  { k: 47, s: "%", l: "Score lift" },
                ].map((s) => (
                  <div key={s.l}>
                    <p className="font-display text-3xl font-extrabold bg-gradient-to-br from-foreground to-foreground/50 bg-clip-text text-transparent">
                      <Counter to={s.k} suffix={s.s} />
                    </p>
                    <p className="mt-1 text-xs text-foreground/50 uppercase tracking-wider">{s.l}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Hero right — layered card cluster */}
            <div className="lg:col-span-5 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="relative"
              >
                <HeroVideoCard />

                {/* floating stat cards */}
                <motion.div
                  initial={{ opacity: 0, x: -40, y: -10 }} animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.7 }}
                  className="absolute -left-6 md:-left-12 top-16 rounded-2xl bg-white/90 backdrop-blur-xl text-foreground p-4 shadow-pop border border-white/40 min-w-[180px]"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white">
                      <Flame className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Streak</p>
                      <p className="font-display text-xl font-extrabold">12 days</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 40, y: 10 }} animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ delay: 0.9, duration: 0.7 }}
                  className="absolute -right-4 md:-right-10 top-1/2 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white p-4 shadow-glow min-w-[180px]"
                >
                  <div className="flex items-center gap-3">
                    <RingProgress value={68} size={44} stroke={5} trackClassName="stroke-white/20" indicatorClassName="stroke-white">
                      <span className="font-display text-[10px] font-extrabold">68%</span>
                    </RingProgress>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider opacity-70">Readiness</p>
                      <p className="font-display text-sm font-bold">JAMB · 42d</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1, duration: 0.7 }}
                  className="absolute -bottom-5 left-8 rounded-2xl bg-emerald-500 text-white p-3 px-4 shadow-pop flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  <p className="text-xs font-bold">+240 XP today</p>
                </motion.div>

                {/* decorative orbiting dots SVG */}
                <svg className="absolute -inset-10 -z-10 opacity-40 pointer-events-none" viewBox="0 0 400 500">
                  <motion.circle cx="50" cy="50" r="3" fill="#e879f9"
                    animate={{ cx: [50, 350, 50], cy: [50, 450, 50] }}
                    transition={{ duration: 14, repeat: Infinity, ease: "linear" }} />
                  <motion.circle cx="380" cy="100" r="4" fill="#38bdf8"
                    animate={{ cx: [380, 30, 380], cy: [100, 400, 100] }}
                    transition={{ duration: 18, repeat: Infinity, ease: "linear" }} />
                </svg>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── EXAM MARQUEE ────────────────────────────────────────────── */}
      <section id="exams" className="relative bg-[#f5f1e8] text-[#1a1530] py-10 overflow-hidden border-y border-black/5">
        <div className="container max-w-7xl mb-4">
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#1a1530]/50">Built for every major board</p>
        </div>
        <div className="relative">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
            className="flex gap-16 whitespace-nowrap w-max"
          >
            {[...exams, ...exams, ...exams].map((e, i) => (
              <span key={i} className="font-display text-5xl md:text-7xl font-extrabold tracking-tight flex items-center gap-16">
                {e}
                <span className="text-fuchsia-500">★</span>
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── FEATURES — branch tree of nodes ────────────────────────── */}
      <section id="features" className="relative py-24 md:py-32 bg-gradient-to-b from-[#0b0d1a] via-[#10132a] to-[#0b0d1a] overflow-hidden">
        {/* ambient glow */}
        <div className="pointer-events-none absolute inset-0 -z-0">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full blur-[160px] opacity-25 bg-gradient-to-r from-fuchsia-600 via-violet-600 to-sky-500" />
        </div>
        {/* faint dot grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, #000 40%, transparent 85%)",
          }}
        />

        <div className="container max-w-7xl relative">
          <Reveal>
            <div className="max-w-2xl mx-auto text-center">
              <p className="text-xs uppercase tracking-[0.25em] text-fuchsia-400">What makes prepcify different</p>
              <h2 className="mt-4 font-display text-4xl md:text-6xl font-extrabold leading-[1.02] tracking-tight text-balance">
                One root.{" "}
                <span className="bg-gradient-to-r from-fuchsia-400 to-sky-300 bg-clip-text text-transparent italic">Four branches of progress.</span>
              </h2>
              <p className="mt-5 text-white/60 text-lg">Everything in prepcify grows from one idea — calm, daily practice. Here's how it branches out.</p>
            </div>
          </Reveal>

          {/* TREE */}
          <div className="relative mt-20">
            {/* SVG connector layer */}
            <svg
              viewBox="0 0 1000 720"
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full pointer-events-none"
              aria-hidden
            >
              <defs>
                <linearGradient id="branch-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#e879f9" stopOpacity="0.9" />
                  <stop offset="1" stopColor="#38bdf8" stopOpacity="0.7" />
                </linearGradient>
                <filter id="branch-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="6" result="b" />
                  <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
              {/* 4 curved branches from root (500,80) to leaf anchors */}
              {[
                { d: "M500,90 C 500,260 180,260 180,420" },
                { d: "M500,90 C 500,260 390,260 390,420" },
                { d: "M500,90 C 500,260 610,260 610,420" },
                { d: "M500,90 C 500,260 820,260 820,420" },
              ].map((p, i) => (
                <motion.path
                  key={i}
                  d={p.d}
                  fill="none"
                  stroke="url(#branch-grad)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  filter="url(#branch-glow)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 1.4, delay: 0.2 + i * 0.15, ease: "easeInOut" }}
                />
              ))}
              {/* leaf dots */}
              {[180, 390, 610, 820].map((cx, i) => (
                <motion.circle
                  key={cx}
                  cx={cx} cy={420} r="6"
                  fill="#fff"
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.2 + i * 0.15, type: "spring", stiffness: 240 }}
                />
              ))}
            </svg>

            {/* ROOT NODE */}
            <div className="relative z-10 flex justify-center">
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 200, damping: 18 }}
                className="relative"
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-fuchsia-500 to-sky-500 blur-2xl opacity-60 animate-pulse" />
                <div className="relative flex h-28 w-28 md:h-32 md:w-32 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 via-violet-500 to-sky-500 shadow-[0_0_60px_rgba(217,70,239,0.55)]">
                  <div className="flex flex-col items-center">
                    <GraduationCap className="h-8 w-8 text-white" />
                    <span className="mt-1 font-display text-xs font-extrabold tracking-widest text-white/90">prepcify</span>
                  </div>
                </div>
                {/* orbiting dots */}
                <motion.div
                  className="absolute inset-0"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
                >
                  <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-fuchsia-300 shadow-[0_0_12px_#e879f9]" />
                  <span className="absolute top-1/2 -right-1.5 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-sky-300 shadow-[0_0_10px_#38bdf8]" />
                </motion.div>
              </motion.div>
            </div>

            {/* BRANCH NODE CARDS */}
            <div className="relative z-10 mt-[340px] md:mt-[380px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {features.map((f, i) => (
                <Reveal key={f.n} delay={i + 2}>
                  <motion.article
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6 h-full group"
                  >
                    {/* connector cap dot at top */}
                    <div className={cn("absolute -top-2 left-1/2 -translate-x-1/2 h-4 w-4 rounded-full bg-gradient-to-br shadow-[0_0_24px_rgba(255,255,255,0.5)]", f.color)} />
                    {/* gradient glow on hover */}
                    <div className={cn("absolute -top-32 -right-32 h-64 w-64 rounded-full opacity-0 group-hover:opacity-50 blur-3xl transition-opacity duration-500 bg-gradient-to-br", f.color)} />
                    <div className="flex items-start justify-between">
                      <div className={cn("h-12 w-12 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white shadow-lg", f.color)}>
                        <f.icon className="h-5 w-5" />
                      </div>
                      <span className="font-display text-2xl font-bold text-white/20">{f.n}</span>
                    </div>
                    <h3 className="mt-5 font-display text-xl md:text-2xl font-extrabold leading-tight">{f.title}</h3>
                    <p className="mt-2 text-sm text-white/60">{f.body}</p>
                    <div className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-white/80 group-hover:text-white">
                      Learn more <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </motion.article>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* ─── EDITORIAL IMAGE SPLIT ───────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-[#fef3c7] via-[#fde68a] to-[#fbbf24] text-[#1a1530] py-24 md:py-32 overflow-hidden">
        <div className="container max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <Reveal>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[#1a1530]/60">A daily study habit</p>
              <h2 className="mt-4 font-display text-4xl md:text-6xl font-extrabold leading-[1.02] tracking-tight text-balance">
                One quiet ritual.<br />
                <span className="italic font-semibold">Months</span> of compounding.
              </h2>
              <p className="mt-6 text-lg text-[#1a1530]/70 max-w-md">
                Open the app. Get your three cards for the day. Close it.
                It's that boring — and that's exactly why it works.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {[
                  { i: BookOpen, l: "10 min /day" },
                  { i: TrendingUp, l: "Weekly insights" },
                  { i: Award, l: "Earn streaks" },
                ].map((x) => (
                  <div key={x.l} className="flex items-center gap-2 rounded-full bg-[#1a1530] text-white px-4 py-2 text-sm font-medium">
                    <x.i className="h-4 w-4 text-amber-300" /> {x.l}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal delay={1}>
            <div className="relative">
              <motion.img
                src={notebookImg}
                alt="Student writing notes"
                loading="lazy"
                className="rounded-[32px] shadow-pop w-full object-cover aspect-[4/5]"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.5 }}
              />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute -top-8 -right-8 h-28 w-28"
              >
                <svg viewBox="0 0 100 100">
                  <defs>
                    <path id="circ" d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0" />
                  </defs>
                  <text fontSize="9" fontWeight="700" fill="#1a1530" letterSpacing="2">
                    <textPath href="#circ">prepcify · LEARN · GROW · WIN · </textPath>
                  </text>
                </svg>
              </motion.div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-pop border border-black/5 max-w-[220px]">
                <div className="flex items-center gap-2 text-emerald-600">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">+18 pts this week</span>
                </div>
                <p className="mt-1 font-display text-lg font-extrabold text-[#1a1530]">Math · Algebra</p>
                <div className="mt-2 flex gap-1">
                  {[1,1,1,1,0.6,0.3,0].map((h, i) => (
                    <div key={i} className="flex-1 rounded-sm bg-emerald-500" style={{ height: `${24 * h + 4}px` }} />
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── STATS — dark with animated counters ─────────────────────── */}
      <section className="relative bg-[#0b0d1a] py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 -z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[1000px] rounded-full blur-[160px] opacity-30 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-sky-500" />
        </div>
        <div className="container max-w-7xl relative">
          <Reveal>
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.25em] text-sky-400">By the numbers</p>
              <h2 className="mt-4 font-display text-4xl md:text-6xl font-extrabold leading-[1.02] tracking-tight">
                Real results, this term.
              </h2>
            </div>
          </Reveal>
          <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { k: 42000, s: "+", v: "Active students", icon: Users },
              { k: 1200000, s: "", v: "Questions practiced", icon: BookOpen },
              { k: 49, s: "★", v: "Rating (out of 5)", icon: Star, fmt: (n: number) => (n / 10).toFixed(1) },
              { k: 47, s: "%", v: "Avg. score lift", icon: TrendingUp },
            ].map((s, i) => (
              <Reveal key={s.v} delay={i}>
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur p-7 h-full">
                  <s.icon className="h-6 w-6 text-fuchsia-400" />
                  <p className="mt-6 font-display text-4xl md:text-6xl font-extrabold leading-none tracking-tight bg-gradient-to-br from-white to-white/50 bg-clip-text text-transparent">
                    {s.fmt ? <span>{s.fmt(s.k)}</span> : <Counter to={s.k} />}{s.s}
                  </p>
                  <p className="mt-3 text-sm text-white/60">{s.v}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS — gradient cards ───────────────────────────── */}
      <section className="relative bg-gradient-to-b from-[#0b0d1a] to-[#1a0f2e] py-24 md:py-32">
        <div className="container max-w-7xl">
          <Reveal>
            <div className="flex items-end justify-between flex-wrap gap-6">
              <div className="max-w-2xl">
                <p className="text-xs uppercase tracking-[0.25em] text-amber-400">Loved by students</p>
                <h2 className="mt-4 font-display text-4xl md:text-6xl font-extrabold leading-[1.02] tracking-tight">
                  From the front row.
                </h2>
              </div>
              <div className="flex items-center gap-1 text-white">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />)}
                <span className="ml-2 font-semibold">4.9 / 5 · 8,200 reviews</span>
              </div>
            </div>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <Reveal key={t.name} delay={i}>
                <motion.figure
                  whileHover={{ y: -8, rotate: i === 1 ? 0 : i === 0 ? -1 : 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className={cn("relative overflow-hidden rounded-3xl p-7 flex flex-col justify-between min-h-[300px] bg-gradient-to-br text-white shadow-pop", t.grad)}
                >
                  <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
                  <svg className="h-8 w-8 text-white/40" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7.17 6.17C4.32 6.99 2 9.74 2 13v5h6v-6H5.5c0-2.21 1.79-4 4-4l-.33-1.83zM17.17 6.17C14.32 6.99 12 9.74 12 13v5h6v-6h-2.5c0-2.21 1.79-4 4-4l-.33-1.83z" />
                  </svg>
                  <blockquote className="font-display text-xl md:text-2xl font-bold leading-snug text-balance">
                    {t.quote}
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-3">
                    <div className="h-11 w-11 rounded-full bg-white text-[#1a0f2e] flex items-center justify-center font-extrabold">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs opacity-80">{t.role}</p>
                    </div>
                  </figcaption>
                </motion.figure>
              </Reveal>
            ))}
          </div>

          {/* community photo strip */}
          <Reveal delay={3}>
            <div className="mt-16 relative overflow-hidden rounded-[32px]">
              <img src={studentsImg} alt="prepcify students" loading="lazy" className="w-full h-[280px] md:h-[420px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d1a] via-[#0b0d1a]/40 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between flex-wrap gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/60">The prepcify community</p>
                  <p className="font-display text-2xl md:text-4xl font-extrabold">42,000+ students. One mission.</p>
                </div>
                <Button asChild size="lg" className="bg-white text-[#0b0d1a] hover:bg-white/90">
                  <Link to="/signup">Join them <ArrowRight /></Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── PRICING ─────────────────────────────────────────────────── */}
      <section id="pricing" className="relative bg-[#f7f5ef] text-[#1a1530] py-24 md:py-32">
        <div className="container max-w-7xl">
          <Reveal>
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.25em] text-fuchsia-600">Pricing</p>
              <h2 className="mt-4 font-display text-4xl md:text-6xl font-extrabold leading-[1.02] tracking-tight">
                Free to start.{" "}
                <span className="italic font-semibold bg-gradient-to-r from-fuchsia-600 to-violet-600 bg-clip-text text-transparent">
                  Honest from there.
                </span>
              </h2>
            </div>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { name: "Free", price: "₦0", per: "forever", feats: ["All subjects, all boards", "Daily study plan", "Basic AI tutor (20/day)", "1 mock exam per week"], cta: "Get started", featured: false },
              { name: "prepcify Pro", price: "₦2,500", per: "per month", feats: ["Everything in Free", "Unlimited AI tutor", "Unlimited mock exams", "Full past papers archive", "Offline mode"], cta: "Try Pro free for 7 days", featured: true },
              { name: "Schools", price: "Custom", per: "per term", feats: ["Teacher dashboard", "Class assignments", "School-wide leaderboards", "Priority support"], cta: "Talk to us", featured: false },
            ].map((p, i) => (
              <Reveal key={p.name} delay={i}>
                <motion.div
                  whileHover={{ y: -6 }}
                  className={cn(
                    "relative rounded-3xl p-7 flex flex-col h-full overflow-hidden",
                    p.featured
                      ? "bg-gradient-to-br from-[#1a0f2e] via-[#2d1b5e] to-[#1e1b4b] text-white shadow-pop"
                      : "border border-black/10 bg-white"
                  )}
                >
                  {p.featured && (
                    <>
                      <motion.div
                        className="absolute -top-20 -right-20 h-60 w-60 rounded-full blur-3xl bg-fuchsia-500/40"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 4, repeat: Infinity }}
                      />
                      <span className="absolute top-5 right-5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1">
                        Most popular
                      </span>
                    </>
                  )}
                  <p className="font-display text-xl font-bold relative">{p.name}</p>
                  <div className="mt-6 relative">
                    <span className="font-display text-5xl font-extrabold tracking-tight">{p.price}</span>
                    <span className={cn("ml-2 text-sm", p.featured ? "text-white/60" : "text-muted-foreground")}>{p.per}</span>
                  </div>
                  <ul className="mt-7 space-y-3 flex-1 relative">
                    {p.feats.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <Check className={cn("h-4 w-4 mt-0.5 shrink-0", p.featured ? "text-emerald-400" : "text-fuchsia-600")} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button asChild size="lg" className={cn("mt-8 relative",
                    p.featured ? "bg-white text-[#1a0f2e] hover:bg-white/90" : "bg-[#1a1530] text-white hover:bg-[#1a1530]/90"
                  )}>
                    <Link to="/onboarding">{p.cta}</Link>
                  </Button>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─────────────────────────────────────────────────────── */}
      <section id="faq" className="relative bg-[#0b0d1a] py-24 md:py-32">
        <div className="container max-w-4xl">
          <Reveal>
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.25em] text-emerald-400">Frequently asked</p>
              <h2 className="mt-4 font-display text-4xl md:text-6xl font-extrabold tracking-tight">
                Questions, answered.
              </h2>
            </div>
          </Reveal>
          <ul className="mt-14 space-y-3">
            {faqs.map((f, i) => {
              const open = openFaq === i;
              return (
                <motion.li
                  key={f.q}
                  layout
                  className={cn(
                    "rounded-2xl border overflow-hidden transition-colors",
                    open ? "border-fuchsia-500/40 bg-white/[0.04]" : "border-white/10 bg-white/[0.02]"
                  )}
                >
                  <button
                    onClick={() => setOpenFaq(open ? null : i)}
                    className="w-full flex items-center justify-between gap-4 p-6 text-left"
                  >
                    <span className="font-display text-lg md:text-xl font-bold">{f.q}</span>
                    <motion.div animate={{ rotate: open ? 180 : 0 }}>
                      <ChevronDown className="h-5 w-5 shrink-0" />
                    </motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <div className="px-6 pb-6 text-white/70">{f.a}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────────────────────── */}
      <section className="relative py-20 bg-[#0b0d1a]">
        <div className="container max-w-7xl">
          <div className="relative overflow-hidden rounded-[40px] p-10 md:p-16 text-center bg-gradient-to-br from-fuchsia-600 via-violet-600 to-sky-500">
            <motion.div
              className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-white/20 blur-3xl"
              animate={{ x: [0, 100, 0], y: [0, 60, 0] }}
              transition={{ duration: 12, repeat: Infinity }}
            />
            <motion.div
              className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-amber-300/30 blur-3xl"
              animate={{ x: [0, -80, 0], y: [0, -40, 0] }}
              transition={{ duration: 14, repeat: Infinity }}
            />
            <div className="relative">
              <Globe className="h-10 w-10 mx-auto mb-6 text-white/80" />
              <h2 className="font-display text-4xl md:text-6xl font-extrabold leading-[1.02] tracking-tight max-w-3xl mx-auto text-balance text-white">
                Your best result is one daily habit away.
              </h2>
              <p className="mt-5 text-base md:text-lg text-white/85 max-w-xl mx-auto">
                Join 42,000+ students preparing the smart way. Free forever to start.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button asChild size="xl" className="bg-[#0b0d1a] text-white hover:bg-[#0b0d1a]/90 border-0">
                  <Link to="/onboarding">Start learning free <ArrowRight /></Link>
                </Button>
                <Button asChild size="xl" variant="outline" className="bg-white/10 backdrop-blur border-white/40 text-white hover:bg-white/20">
                  <Link to="/app">Open the app</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────────────── */}
      <footer className="border-t border-white/10 bg-[#06070f]">
        <div className="container max-w-7xl py-14">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="col-span-2">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500 via-violet-500 to-sky-500">
                  <GraduationCap className="h-4 w-4 text-white" />
                </div>
                <span className="font-display text-lg font-extrabold tracking-tight">prepcify<span className="text-fuchsia-400">.</span></span>
              </div>
              <p className="mt-4 text-sm text-white/60 max-w-xs">The calm, beautiful study app for African students preparing for any major exam.</p>
              <div className="mt-5 flex gap-2">
                {[MessageCircle, Globe, Users].map((I, i) => (
                  <a key={i} href="#" className="h-9 w-9 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                    <I className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
            {[
              { h: "Product", l: ["Dashboard", "AI Tutor", "Mock exams", "Pricing"] },
              { h: "Exams", l: ["WAEC", "JAMB", "NECO", "Cambridge"] },
              { h: "Company", l: ["About", "Blog", "Contact", "Schools"] },
            ].map((g) => (
              <div key={g.h}>
                <p className="text-xs uppercase tracking-wider text-white/40">{g.h}</p>
                <ul className="mt-4 space-y-2 text-sm">
                  {g.l.map((x) => (
                    <li key={x}><a href="#" className="hover:text-white text-white/60 transition-colors">{x}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-white/50">
            <p>© 2025 prepcify Learning. Made with care for African students.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white">Privacy</a>
              <a href="#" className="hover:text-white">Terms</a>
              <Link to="/m" className="hover:text-white">Mobile prototype</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
