import { cn } from "@/lib/utils";

/**
 * Skeleton — placeholder block shown while content loads.
 *
 * Marked `aria-hidden` so screen readers skip the shimmer; pair it with an
 * `aria-busy`/`role="status"` region (see `<DataState>`) so the loading
 * state is still announced.
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-2xl bg-secondary", className)}
      {...props}
    />
  );
}

export { Skeleton };
