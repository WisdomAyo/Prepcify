"use client";

import * as React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "./label";

export interface FieldProps {
  /** Visible label text. */
  label: string;
  /** The form control. Receives `id`, `aria-invalid`, `aria-describedby`,
   *  and `aria-required` automatically via cloning. */
  children: React.ReactElement;
  /** Validation message. When present the control is marked invalid. */
  error?: string;
  /** Helper text shown below the control when there is no error. */
  hint?: string;
  /** Marks the field required and renders a "*" after the label. */
  required?: boolean;
  /** Optional control rendered on the right of the label row (e.g. a link). */
  labelAction?: React.ReactNode;
  /** Visually hide the label while keeping it for screen readers. */
  hideLabel?: boolean;
  className?: string;
}

/**
 * Field — accessible form-field wrapper.
 *
 * The single hardest part of an accessible form is wiring the ARIA
 * relationships correctly. `Field` does it for you:
 *
 * - Generates a stable `id` (via `useId`) and links it to the `<Label>`.
 * - Sets `aria-invalid` on the control when `error` is present.
 * - Points `aria-describedby` at the hint **or** the error, so screen
 *   readers announce the right message — and only one of them.
 * - Renders the error with `role="alert"` so it is announced on change.
 *
 * It is control-agnostic: pass an `<Input>`, `<textarea>`, `<select>`, or any
 * custom control as the single child.
 *
 * @example
 * <Field label="Email" error={errors.email} required>
 *   <Input type="email" value={email} onChange={...} />
 * </Field>
 */
export function Field({
  label,
  children,
  error,
  hint,
  required,
  labelAction,
  hideLabel,
  className,
}: FieldProps) {
  const id = React.useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  const describedBy = error ? errorId : hint ? hintId : undefined;

  const control = React.cloneElement(children, {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby":
      [children.props["aria-describedby"], describedBy]
        .filter(Boolean)
        .join(" ") || undefined,
    "aria-required": required || undefined,
  } as React.HTMLAttributes<HTMLElement>);

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id} className={cn(hideLabel && "sr-only")}>
          {label}
          {required && (
            <span className="ml-0.5 text-destructive" aria-hidden="true">
              *
            </span>
          )}
        </Label>
        {labelAction}
      </div>

      {control}

      {error ? (
        <p
          id={errorId}
          role="alert"
          className="flex items-center gap-1.5 text-xs font-medium text-destructive animate-fade-in"
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
