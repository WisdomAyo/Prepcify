"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Bell, Trophy, Sparkles, Users, Crown, Flame,
  type LucideIcon,
} from "lucide-react";

/**
 * Mock notifications adapter.
 *
 * TODO(backend): swap `queryFn` to `api.get("/me/notifications")` once the
 * notification service ships. The hook signature stays identical, so the
 * page that consumes it does not change.
 */
export interface Notification {
  id: number;
  icon: LucideIcon;
  color: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
}

const MOCK: Notification[] = [
  { id: 1, icon: Trophy, color: "bg-accent text-accent-foreground", title: "You climbed to #14 globally", body: "Up 6 spots from yesterday. Keep grinding.", time: "2m ago", unread: true },
  { id: 2, icon: Sparkles, color: "bg-foreground text-background", title: "prepcify AI built you a custom drill", body: "5 quadratic equations based on your weak spots.", time: "1h ago", unread: true },
  { id: 3, icon: Flame, color: "bg-destructive text-destructive-foreground", title: "Streak at risk", body: "Study today to keep your 12-day streak alive.", time: "3h ago", unread: false },
  { id: 4, icon: Users, color: "bg-sky text-sky-foreground", title: "Tomi A. challenged you to a battle", body: "Mathematics · 1v1 · Best of 10.", time: "Yesterday", unread: false },
  { id: 5, icon: Crown, color: "bg-secondary text-foreground", title: "Pro trial ends in 3 days", body: "Lock in 50% off your first year now.", time: "2d ago", unread: false },
];

export const notificationKeys = {
  list: ["me", "notifications"] as const,
};

export function useNotifications() {
  return useQuery({
    queryKey: notificationKeys.list,
    // TODO(backend): GET /api/v1/me/notifications
    queryFn: async () => MOCK,
    staleTime: Infinity,
  });
}

// Re-export the icon component for the legacy `Bell` reference still used
// in the navbar so nothing breaks during the swap.
export { Bell };
