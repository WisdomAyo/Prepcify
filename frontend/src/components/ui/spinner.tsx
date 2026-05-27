import { cn } from "@/lib/utils";

const sizeMap = {
  xs: "h-3 w-3 border-[1.5px]",
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-10 w-10 border-[3px]",
} as const;

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Visual size of the spinner. @default "md" */
  size?: keyof typeof sizeMap;
  /**
   * Accessible label announced to screen readers.
   * @default "Loading"
   */
  label?: string;
  /**
   * Render as decoration only — no `role="status"`, no announced label.
   * Use when the spinner sits *inside* an element that is already a live
   * region (e.g. `<DataState>`), to avoid a duplicate status role.
   */
  presentational?: boolean;
}

/**
 * Spinner — an accessible, CSS-only loading indicator.
 *
 * By default it renders with `role="status"` and a visually-hidden label so
 * assistive technology announces the loading state. Pass `presentational`
 * when it is nested inside an existing status region. Honors
 * `prefers-reduced-motion` via the global stylesheet.
 *
 * @example
 * <Spinner />
 * <Spinner size="lg" label="Loading your dashboard" />
 * <Spinner presentational />  // inside an existing role="status" region
 */
export function Spinner({
  size = "md",
  label = "Loading",
  presentational = false,
  className,
  ...props
}: SpinnerProps) {
  return (
    <span
      role={presentational ? undefined : "status"}
      aria-live={presentational ? undefined : "polite"}
      aria-hidden={presentational || undefined}
      className={cn("inline-flex items-center justify-center", className)}
      {...props}
    >
      <span
        className={cn(
          "animate-spin rounded-full border-current border-t-transparent text-current",
          sizeMap[size],
        )}
      />
      {!presentational && <span className="sr-only">{label}</span>}
    </span>
  );
}
