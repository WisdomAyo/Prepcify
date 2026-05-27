import {
  Atom,
  BookText,
  Calculator,
  FlaskConical,
  Globe2,
  Target,
  TrendingUp,
  Zap,
  type LucideIcon,
} from "lucide-react";

export interface SubjectProgress {
  name: string;
  icon: LucideIcon;
  progress: number;
  to: string;
}

export interface ActivityBar {
  day: string;
  value: number;
}

export interface DashboardMetric {
  label: string;
  value: string;
  icon: LucideIcon;
}

export interface StudyTask {
  name: string;
  done: boolean;
}

export const dashboardSubjects: SubjectProgress[] = [
  { name: "Mathematics", icon: Calculator, progress: 68, to: "/app/subjects/math" },
  { name: "Physics", icon: FlaskConical, progress: 42, to: "/app/subjects/phy" },
  { name: "English", icon: BookText, progress: 81, to: "/app/subjects/eng" },
  { name: "Geography", icon: Globe2, progress: 24, to: "/app/subjects/geo" },
  { name: "Chemistry", icon: Atom, progress: 51, to: "/app/subjects/chem" },
];

export const weeklyActivity: ActivityBar[] = [
  { day: "M", value: 60 },
  { day: "T", value: 80 },
  { day: "W", value: 30 },
  { day: "T", value: 90 },
  { day: "F", value: 45 },
  { day: "S", value: 100 },
  { day: "S", value: 65 },
];

export const dashboardMetrics: DashboardMetric[] = [
  { value: "1,240", label: "XP earned", icon: Zap },
  { value: "Lvl 14", label: "Scholar", icon: TrendingUp },
  { value: "92%", label: "Accuracy", icon: Target },
];

export const todaysStudyTasks: StudyTask[] = [
  { name: "Warm-up · 5 quick questions", done: true },
  { name: "Concept · Translating problems into equations", done: true },
  { name: "Practice · 8 questions", done: true },
  { name: "Challenge · 4 hard questions", done: false },
  { name: "Recap · review wrong answers", done: false },
];
