"use client";

import * as React from "react";
import { AlertTriangle, Inbox, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Spinner } from "./spinner";

/* -------------------------------------------------------------------------- */
/*  EmptyState                                                                */
/* -------------------------------------------------------------------------- */

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/** EmptyState — friendly placeholder for "no data" situations. */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-secondary/30 px-6 py-14 text-center",
        className,
      )}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
        {icon ?? <Inbox className="h-6 w-6" aria-hidden="true" />}
      </div>
      <p className="font-display text-lg font-bold">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  DataState                                                                 */
/* -------------------------------------------------------------------------- */

export interface DataStateProps {
  /** True while data is being fetched. */
  isLoading?: boolean;
  /** True when the fetch failed. */
  isError?: boolean;
  /** True when the fetch succeeded but returned nothing. */
  isEmpty?: boolean;
  /** The error object — its `message` is shown in the default error UI. */
  error?: unknown;
  /** Retry handler. Renders a "Try again" button in the default error UI. */
  onRetry?: () => void;
  /** Override the loading UI. */
  loadingFallback?: React.ReactNode;
  /** Override the error UI. */
  errorFallback?: React.ReactNode;
  /** Override the empty UI. */
  emptyFallback?: React.ReactNode;
  /** Rendered when none of the above states are active. */
  children: React.ReactNode;
  className?: string;
}

/**
 * DataState — the single place async UI states are handled.
 *
 * Most production bugs in data-driven UIs come from forgetting one of the
 * four states: **loading**, **error**, **empty**, and **success**. Scatter
 * that logic across pages and it drifts. `DataState` centralises it:
 *
 * - **Loading** → accessible spinner region (`role="status"`, `aria-busy`).
 * - **Error** → message + optional retry button, `role="alert"`.
 * - **Empty** → friendly `<EmptyState>`.
 * - **Success** → renders `children`.
 *
 * States are checked in priority order (loading → error → empty → success),
 * each fully overridable via the `*Fallback` props.
 *
 * @example
 * const q = useQuery(...);
 * <DataState
 *   isLoading={q.isLoading}
 *   isError={q.isError}
 *   error={q.error}
 *   isEmpty={q.data?.length === 0}
 *   onRetry={q.refetch}
 * >
 *   {q.data?.map((row) => <Row key={row.id} {...row} />)}
 * </DataState>
 */
export function DataState({
  isLoading,
  isError,
  isEmpty,
  error,
  onRetry,
  loadingFallback,
  errorFallback,
  emptyFallback,
  children,
  className,
}: DataStateProps) {
  if (isLoading) {
    return (
      <div
        role="status"
        aria-busy="true"
        className={cn(
          "flex flex-col items-center justify-center gap-3 py-14 text-muted-foreground",
          className,
        )}
      >
        {loadingFallback ?? (
          <>
            <Spinner size="lg" presentational className="text-accent" />
            <p className="text-sm font-medium">Loading…</p>
          </>
        )}
      </div>
    );
  }

  if (isError) {
    if (errorFallback) return <>{errorFallback}</>;
    const message =
      error instanceof Error ? error.message : "Something went wrong.";
    return (
      <div
        role="alert"
        className={cn(
          "flex flex-col items-center justify-center rounded-3xl border border-destructive/20 bg-destructive/5 px-6 py-14 text-center",
          className,
        )}
      >
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertTriangle className="h-6 w-6" aria-hidden="true" />
        </div>
        <p className="font-display text-lg font-bold">
          We couldn&apos;t load this
        </p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{message}</p>
        {onRetry && (
          <Button
            variant="outline"
            className="mt-6"
            onClick={onRetry}
            leftIcon={<RefreshCw />}
          >
            Try again
          </Button>
        )}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <>
        {emptyFallback ?? (
          <EmptyState
            title="Nothing here yet"
            description="When there is data to show, it will appear here."
          />
        )}
      </>
    );
  }

  return <>{children}</>;
}
