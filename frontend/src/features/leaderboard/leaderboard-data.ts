import {
  Award,
  Crown,
  Flame,
  Medal,
  Star,
  Trophy,
  type LucideIcon,
} from "lucide-react";

export interface LeaderboardRank {
  name: string;
  xp: number;
  school: string;
  country: string;
  you?: boolean;
}

export interface AchievementBadge {
  name: string;
  icon: LucideIcon;
  owned: boolean;
  desc: string;
}

export const leaderboardRanks: LeaderboardRank[] = [
  { name: "Chiamaka O.", xp: 4820, school: "King's College", country: "Lagos" },
  { name: "Tunde A.", xp: 4610, school: "Loyola Jesuit", country: "Abuja" },
  { name: "Fatima M.", xp: 4380, school: "Queen's College", country: "Lagos" },
  { name: "Adaeze (you)", xp: 4205, school: "FGGC Lagos", country: "Lagos", you: true },
  { name: "Kelechi N.", xp: 3980, school: "Greenspring", country: "Lagos" },
  { name: "Sade O.", xp: 3760, school: "Atlantic Hall", country: "Lagos" },
  { name: "Ibrahim K.", xp: 3540, school: "Federal College", country: "Kaduna" },
  { name: "Aisha B.", xp: 3490, school: "Capital Science", country: "Abuja" },
];

export const achievementBadges: AchievementBadge[] = [
  { name: "First Quiz", icon: Star, owned: true, desc: "Completed your first quiz" },
  { name: "Week Warrior", icon: Flame, owned: true, desc: "7 day streak" },
  { name: "Quiz Master", icon: Medal, owned: true, desc: "Score 100% in 5 quizzes" },
  { name: "Top 10", icon: Trophy, owned: false, desc: "Reach top 10 weekly" },
  { name: "Streak 30", icon: Award, owned: false, desc: "30 day streak" },
  { name: "Perfectionist", icon: Crown, owned: false, desc: "Mock exam ≥ 95%" },
];
