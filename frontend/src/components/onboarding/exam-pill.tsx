"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { selectionPop, useMotionPreference } from "@/lib/motion";

interface ExamPillProps {
  label: string;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

/**
 * Generic selectable pill — used across exam, course, level, destination,
 * and study-duration selections.
 *
 * Sizing: 56px tall, 24px horizontal padding, 14px radius. Surface bg at
 * rest, 2px accent border + accent-quiet bg when selected, with a small
 * scale pop on selection (250ms ease-out).
 */
export function ExamPill({
  label,
  selected,
  onSelect,
  disabled,
}: ExamPillProps) {
  const { reduced } = useMotionPreference();

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      disabled={disabled}
      variants={reduced ? undefined : selectionPop}
      animate={selected ? "animate" : "initial"}
      initial={false}
      className={cn(
        "inline-flex h-14 items-center justify-center rounded-[14px] px-6",
        "text-[15px] font-medium transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        selected
          ? "border-2 border-accent bg-accent-quiet text-foreground"
          : "border border-border bg-card text-foreground hover:border-foreground/60",
      )}
    >
      {label}
    </motion.button>
  );
}
