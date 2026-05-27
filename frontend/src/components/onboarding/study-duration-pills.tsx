"use client";

import { cn } from "@/lib/utils";

interface Option {
  minutes: 15 | 30 | 45 | 60;
  label: string;
  caption: string;
}

const OPTIONS: Option[] = [
  { minutes: 15, label: "15 min", caption: "Quick daily habit" },
  { minutes: 30, label: "30 min", caption: "Steady progress" },
  { minutes: 45, label: "45 min", caption: "Serious prep" },
  { minutes: 60, label: "60 min", caption: "Full commitment" },
];

interface StudyDurationPillsProps {
  value: number | null;
  onChange: (m: number) => void;
}

/**
 * Single-select duration picker. Four equal pills on desktop, stacked on
 * mobile. Larger than `ExamPill` (64px tall, two-line content) because the
 * caption is part of the decision.
 */
export function StudyDurationPills({ value, onChange }: StudyDurationPillsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {OPTIONS.map((o) => {
        const selected = value === o.minutes;
        return (
          <button
            key={o.minutes}
            type="button"
            onClick={() => onChange(o.minutes)}
            aria-pressed={selected}
            className={cn(
              "flex h-16 items-center justify-between rounded-[14px] px-5 text-left",
              "transition-colors duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              selected
                ? "border-2 border-accent bg-accent-quiet"
                : "border border-border bg-card hover:border-foreground/60",
            )}
          >
            <span className="font-display text-base font-semibold">{o.label}</span>
            <span className="text-[13px] text-muted-foreground">{o.caption}</span>
          </button>
        );
      })}
    </div>
  );
}
