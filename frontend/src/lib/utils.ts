import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind class names, resolving conflicts intelligently.
 * `cn("p-2", condition && "p-4")` -> "p-4" when condition is true.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Derive up-to-two uppercase initials from a name (falling back to the local
 * part of an email, then "U"). `getInitials("Tomi Adeyemi")` -> "TA".
 */
export function getInitials(
  name?: string | null,
  fallbackEmail?: string | null,
): string {
  const src = name?.trim() || fallbackEmail?.split("@")[0] || "U";
  return src
    .split(/\s+/)
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
