"use client";

import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle2, Trophy, Sparkles, Swords, BookOpen, Flame,
  type LucideIcon,
} from "lucide-react";

/**
 * Mock activity feed adapter.
 *
 * TODO(backend): swap `queryFn` to `api.get("/me/activity/feed")` once the
 * activity service ships. Hook signature stays identical.
 */
export interface ActivityItem {
  icon: LucideIcon;
  color: string;
  text: string;
  meta: string;
  time: string;
}

export interface ActivityGroup {
  label: string;
  items: ActivityItem[];
}

const MOCK: ActivityGroup[] = [
  {
    label: "Today",
    items: [
      { icon: CheckCircle2, color: "text-success", text: "Completed quiz: Algebra basics", meta: "85% · +120 XP", time: "10:42" },
      { icon: Sparkles, color: "text-accent", text: "Asked prepcify AI about Newton's laws", meta: "3 messages", time: "09:18" },
    ],
  },
  {
    label: "Yesterday",
    items: [
      { icon: Swords, color: "text-foreground", text: "Won battle vs Tomi A.", meta: "8–6 · +85 XP", time: "20:14" },
      { icon: BookOpen, color: "text-sky", text: "Started topic: Quadratic equations", meta: "Mathematics", time: "16:30" },
      { icon: Flame, color: "text-accent", text: "Extended streak to 12 days", meta: "+50 XP bonus", time: "12:00" },
    ],
  },
  {
    label: "This week",
    items: [
      { icon: Trophy, color: "text-accent", text: "Earned 'Sniper' badge", meta: "20 quizzes above 90%", time: "Mon" },
      { icon: BookOpen, color: "text-success", text: "Finished chapter: Trigonometry", meta: "Mathematics", time: "Sun" },
    ],
  },
];

export const activityKeys = { feed: ["me", "activity"] as const };

export function useActivityFeed() {
  return useQuery({
    queryKey: activityKeys.feed,
    // TODO(backend): GET /api/v1/me/activity/feed
    queryFn: async () => MOCK,
    staleTime: Infinity,
  });
}
