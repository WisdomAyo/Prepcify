"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/contexts/auth-context";
import type { ApiUser, UserContext } from "@/lib/api/types";

/** Provides the authenticated session only where `useAuth()` is required. */
export function AuthSessionProvider({
  children,
  initialContext,
  initialUser,
}: {
  children: ReactNode;
  initialContext?: UserContext | null;
  initialUser?: ApiUser | null;
}) {
  return (
    <AuthProvider initialContext={initialContext} initialUser={initialUser}>
      {children}
    </AuthProvider>
  );
}
