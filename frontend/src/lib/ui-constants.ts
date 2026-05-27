/**
 * Shared UI lookup tables — kept here so styling stays consistent across
 * pages instead of being re-declared per file.
 */

/** Badge classes for question difficulty levels. */
export const difficultyBadgeClass: Record<string, string> = {
  Easy: "bg-success/15 text-success",
  Medium: "bg-accent/15 text-accent",
  Hard: "bg-destructive/15 text-destructive",
};
