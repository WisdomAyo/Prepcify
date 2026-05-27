import { cn } from "@/lib/utils";

interface RingProgressProps {
  value: number; // 0-100
  size?: number;
  stroke?: number;
  className?: string;
  trackClassName?: string;
  indicatorClassName?: string;
  children?: React.ReactNode;
}

export function RingProgress({
  value,
  size = 96,
  stroke = 10,
  className,
  trackClassName = "stroke-secondary",
  indicatorClassName = "stroke-accent",
  children,
}: RingProgressProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, value)) / 100) * c;
  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} className={trackClassName} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          className={cn(indicatorClassName, "transition-[stroke-dashoffset] duration-700 ease-out")}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}

interface BarProgressProps {
  value: number;
  className?: string;
  indicatorClassName?: string;
  height?: number;
}

export function BarProgress({ value, className, indicatorClassName = "bg-accent", height = 6 }: BarProgressProps) {
  return (
    <div className={cn("w-full overflow-hidden rounded-full bg-secondary", className)} style={{ height }}>
      <div
        className={cn("h-full rounded-full transition-[width] duration-700 ease-out", indicatorClassName)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
