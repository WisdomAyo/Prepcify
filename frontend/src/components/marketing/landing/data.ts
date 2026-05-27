import {
  Award,
  BookOpen,
  Brain,
  Cpu,
  MousePointer2,
  PenLine,
  ShieldCheck,
  Target,
  Trophy,
  TrendingUp,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";

export const landingImages = {
  hero: "/assets/landing-hero.jpg",
  notebook: "/assets/landing-notebook.jpg",
  students: "/assets/landing-students.jpg",
  examGoal: "/assets/exam-goal.png",
  pastQuestions: "/assets/past.png",
  cash: "/assets/cash.png",
} as const;

export const exams = [
  "WAEC",
  "JAMB",
  "NECO",
  "ICAN",
  "Cambridge",
  "A-Levels",
  "O-Levels",
  "GCE",
  "SAT",
  "IELTS",
] as const;

export const examBodyLogos = [
  { label: "ACCA", src: "/assets/exam_bodies/ACCA.svg" },
  { label: "ACT", src: "/assets/exam_bodies/ACT.svg" },
  { label: "ANAN", src: "/assets/exam_bodies/ANAN.svg" },
  {
    label: "Cambridge",
    src: "/assets/exam_bodies/Cambridge%20Assessment%20International%20Education.svg",
  },
  { label: "CFA", src: "/assets/exam_bodies/CFA.svg" },
  { label: "COREN", src: "/assets/exam_bodies/COREN.svg" },
  { label: "Edexcel", src: "/assets/exam_bodies/Edexcel.svg" },
  { label: "ICAN", src: "/assets/exam_bodies/ICAN.svg" },
  { label: "IELTS", src: "/assets/exam_bodies/IELTS.svg" },
  { label: "JAMB", src: "/assets/exam_bodies/JAMB.svg" },
  { label: "NABTEB", src: "/assets/exam_bodies/NABTEB.svg" },
  { label: "NECO", src: "/assets/exam_bodies/NECO.svg" },
  { label: "NIM", src: "/assets/exam_bodies/NIM.svg" },
  { label: "PTE Academic", src: "/assets/exam_bodies/PTE%20Academic.svg" },
  { label: "TOEFL", src: "/assets/exam_bodies/TOEFL.svg" },
  { label: "WAEC", src: "/assets/exam_bodies/WAEC.svg" },
] as const;

export interface FeatureCard {
  n: string;
  icon: LucideIcon;
  title: string;
  body: string;
  color: string;
}

export const features: FeatureCard[] = [
  {
    n: "01",
    icon: Target,
    title: "A plan that adapts to you.",
    body: "Daily study cards calibrated to your weak spots, your exam date, and your pace.",
    color: "from-slate-900 to-slate-700",
  },
  {
    n: "02",
    icon: Brain,
    title: "An AI tutor that never tires.",
    body: "Ask about past papers, hard concepts, and formulas. prepcify explains in plain English.",
    color: "from-indigo-700 to-slate-900",
  },
  {
    n: "03",
    icon: Zap,
    title: "Mock exams that feel real.",
    body: "Live timer, navigator, flag, submit. See exactly where you stand before exam day.",
    color: "from-slate-800 to-zinc-600",
  },
  {
    n: "04",
    icon: Trophy,
    title: "Progress you can feel.",
    body: "Streaks, XP, badges, and friendly leaderboards keep students coming back daily.",
    color: "from-primary to-slate-900",
  },
];

export const experienceCards = [
  { icon: MousePointer2, label: "Tap", value: "Pick a weak spot" },
  { icon: PenLine, label: "Solve", value: "Answer in flow" },
  { icon: ShieldCheck, label: "Review", value: "Lock the concept" },
  { icon: Cpu, label: "Coach", value: "Ask AI when stuck" },
] as const;

export const marketplacePoints = [
  "Adaptive study plans",
  "Past questions by exam body",
  "AI explanations for hard topics",
  "Realistic mock exam mode",
  "Progress tracking and streaks",
  "School and parent-ready reporting",
] as const;

export const tutorAvatars = ["AO", "TN", "ME", "FA", "LK"] as const;

export const feedbackColumns = [
  [
    {
      quote: "The mock exams felt close to the real paper, and the review screen showed exactly what to fix before my next attempt.",
      rating: 5,
      name: "Tunde A.",
      role: "JAMB · 312",
      avatar: "/assets/auth-student-1.jpg",
      mark: "A",
      markClass: "bg-indigo-800 text-white",
    },
    {
      quote: "prepcify gives our students structure. They know what to practise each day, and teachers can see the weak topics faster.",
      rating: 5,
      name: "Ronald R.",
      role: "School coordinator",
      avatar: "/assets/auth-detail-1.jpg",
      mark: "S",
      markClass: "bg-sky-500 text-white",
    },
  ],
  [
    {
      quote: "I stopped jumping between random PDFs. Past questions, explanations, and my study plan now live in one place.",
      rating: 5,
      name: "Chiamaka O.",
      role: "WAEC · 7 A1s",
      avatar: "/assets/onboard-1.jpg",
      mark: "",
      markClass: "bg-gradient-to-r from-sky-400 to-sky-600",
    },
    {
      quote: "The AI tutor re-explains until it makes sense. It is patient, direct, and useful when I am stuck at night.",
      rating: 5,
      name: "Courtney H.",
      role: "NECO candidate",
      avatar: "/assets/auth-student-1.jpg",
      mark: "G",
      markClass: "bg-emerald-500 text-white",
    },
  ],
  [
    {
      quote: "The streaks made revision feel manageable. Ten focused minutes daily became easier than waiting for weekends.",
      rating: 4,
      name: "Devon L.",
      role: "A-Level student",
      avatar: "/assets/onboard-2.jpg",
      mark: "",
      markClass: "bg-indigo-500",
    },
    {
      quote: "Parents get a clearer picture of progress without asking students to explain every score manually.",
      rating: 5,
      name: "Darlene R.",
      role: "Academic advisor",
      avatar: "/assets/onboard-1.jpg",
      mark: "",
      markClass: "bg-orange-500",
    },
  ],
] as const;

export const habitBadges = [
  { icon: BookOpen, label: "10 min /day" },
  { icon: TrendingUp, label: "Weekly insights" },
  { icon: Award, label: "Earn streaks" },
] as const;

export interface LandingStat {
  value: number;
  suffix: string;
  label: string;
  icon: LucideIcon;
  format?: (value: number) => string;
}

export const stats: LandingStat[] = [
  { value: 42000, suffix: "+", label: "Active students", icon: Users },
  { value: 1200000, suffix: "", label: "Questions practised", icon: BookOpen },
  { value: 49, suffix: "★", label: "Rating out of 5", icon: Trophy, format: (n: number) => (n / 10).toFixed(1) },
  { value: 47, suffix: "%", label: "Average score lift", icon: TrendingUp },
];

export const pricingPlans = [
  {
    name: "Free",
    price: "₦0",
    per: "forever",
    features: ["All subjects, all boards", "Daily study plan", "Basic AI tutor", "1 mock exam per week"],
    cta: "Get started",
    featured: false,
  },
  {
    name: "prepcify Pro",
    price: "₦2,500",
    per: "per month",
    features: ["Everything in Free", "Unlimited AI tutor", "Unlimited mock exams", "Full past papers archive", "Offline mode"],
    cta: "Try Pro free for 7 days",
    featured: true,
  },
  {
    name: "Schools",
    price: "Custom",
    per: "per term",
    features: ["Teacher dashboard", "Class assignments", "School-wide leaderboards", "Priority support"],
    cta: "Talk to us",
    featured: false,
  },
] as const;
