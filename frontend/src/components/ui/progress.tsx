import { cn } from "@/lib/utils";

/** Clamp an arbitrary number into the 0–100 progress range. */
function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, value));
}

interface RingProgressProps {
  /** Completion percentage, 0–100. Values outside the range are clamped. */
  value: number;
  size?: number;
  stroke?: number;
  className?: string;
  trackClassName?: string;
  indicatorClassName?: string;
  /** Centered content (e.g. the percentage label). */
  children?: React.ReactNode;
  /** Accessible name for the progress bar. */
  label?: string;
}

/**
 * RingProgress — circular progress indicator.
 *
 * Exposed to assistive tech as a `role="progressbar"` with `aria-valuenow`,
 * so the percentage is announced even though it is drawn with SVG.
 */
export function RingProgress({
  value,
  size = 96,
  stroke = 10,
  className,
  trackClassName = "stroke-secondary",
  indicatorClassName = "stroke-accent",
  children,
  label = "Progress",
}: RingProgressProps) {
  const pct = clampPercent(value);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn(
        "relative inline-flex items-center justify-center",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          className={trackClassName}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          className={cn(
            indicatorClassName,
            "transition-[stroke-dashoffset] duration-700 ease-out",
          )}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

interface BarProgressProps {
  /** Completion percentage, 0–100. Values outside the range are clamped. */
  value: number;
  className?: string;
  indicatorClassName?: string;
  height?: number;
  label?: string;
}

/** BarProgress — linear progress bar with the same a11y contract as Ring. */
export function BarProgress({
  value,
  className,
  indicatorClassName = "bg-accent",
  height = 6,
  label = "Progress",
}: BarProgressProps) {
  const pct = clampPercent(value);
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn(
        "w-full overflow-hidden rounded-full bg-secondary",
        className,
      )}
      style={{ height }}
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-700 ease-out",
          indicatorClassName,
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
