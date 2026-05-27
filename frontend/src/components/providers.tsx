"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FeedbackProviders } from "@/components/feedback-providers";
import { ApiError } from "@/lib/api/types";

export { AuthSessionProvider } from "@/components/auth-session-provider";

/**
 * Root client providers shared by every route.
 *
 * Some public callback/result pages use React Query hooks before app chrome is
 * mounted, and onboarding uses shared tooltips outside app chrome. Keep both
 * providers at the root so route groups cannot accidentally miss them.
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <FeedbackProviders>{children}</FeedbackProviders>
    </QueryClientProvider>
  );
}

/**
 * Compatibility wrapper for app/admin layouts.
 *
 * Root layout already mounts Query, Tooltip, and Toaster providers once.
 */
export function UiProviders({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,                 // 1 min — most lists are eventually-consistent
        gcTime: 5 * 60_000,                // 5 min in-memory cache
        refetchOnWindowFocus: false,       // distracting in dev tools
        retry: (failureCount, error) => {
          if (error instanceof ApiError) {
            // Don't retry auth/permission/validation errors — they're terminal.
            if ([400, 401, 403, 404, 422].includes(error.status)) return false;
          }
          return failureCount < 1;         // one quiet retry on transient failures
        },
      },
      mutations: {
        retry: false,
      },
    },
  });
}
