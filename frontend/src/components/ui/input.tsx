import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

/**
 * Input — styled text field.
 *
 * Wire validation state through `aria-invalid` (the `<Field>` component does
 * this automatically): invalid inputs get a destructive ring without any
 * extra class wrangling at the call site.
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      suppressHydrationWarning
      className={cn(
        "flex h-11 w-full rounded-2xl border border-input bg-card px-4 py-2 text-sm",
        "ring-offset-background transition-colors",
        "placeholder:text-muted-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export { Input };
