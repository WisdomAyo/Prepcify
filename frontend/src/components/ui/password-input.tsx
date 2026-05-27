"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input, type InputProps } from "./input";

/**
 * PasswordInput — a password field with a built-in show/hide toggle.
 *
 * Encapsulates the reveal state and the accessible toggle button so auth
 * forms don't re-implement the same markup. Forwards all `<input>` props
 * and the ref to the underlying `<Input>`.
 *
 * @example
 * <PasswordInput autoComplete="current-password" value={pw} onChange={...} />
 */
const PasswordInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    const [visible, setVisible] = React.useState(false);

    return (
      <div className="relative">
        <Input
          ref={ref}
          type={visible ? "text" : "password"}
          className={cn("pr-11", className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {visible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
    );
  },
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
