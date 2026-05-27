"use client";

import { usePathname } from "next/navigation";
import { isActivePath } from "@/lib/nav";

/**
 * Hook form of `isActivePath` — resolves the current pathname automatically.
 * Use in a component; for loops use the pure `isActivePath` instead.
 */
export function useActivePath(href: string, end = false): boolean {
  return isActivePath(usePathname() ?? "", href, end);
}
