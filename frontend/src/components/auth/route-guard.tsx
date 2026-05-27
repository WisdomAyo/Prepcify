"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Spinner } from "@/components/ui/spinner";

interface RouteGuardProps {
  children: ReactNode;
  /** Require completed onboarding (redirects students to /onboarding). */
  requireOnboarded?: boolean;
  /** Restrict to a single user type (e.g. "admin" for the admin panel). */
  requireUserType?: "student" | "parent" | "admin";
}

/**
 * Client-side auth gate.
 *
 * `middleware.ts` already blocks unauthenticated users at the edge — this
 * guard layers on the checks middleware *cannot* do without an API call:
 * onboarding completion and user-type/role enforcement. It also renders the
 * loading state while the session hydrates.
 */
export function RouteGuard({
  children,
  requireOnboarded = true,
  requireUserType,
}: RouteGuardProps) {
  const { status, user, isOnboarded } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
      return;
    }
    if (requireUserType && user?.user_type !== requireUserType) {
      router.replace("/app");
      return;
    }
    if (requireOnboarded && user?.user_type === "student" && !isOnboarded) {
      router.replace("/onboarding/persona");
    }
  }, [status, user, isOnboarded, requireOnboarded, requireUserType, router, pathname]);

  const ready =
    status === "authenticated" &&
    (!requireUserType || user?.user_type === requireUserType) &&
    (!requireOnboarded || user?.user_type !== "student" || isOnboarded);

  if (!ready) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex min-h-dvh items-center justify-center bg-background"
      >
        <Spinner size="lg" className="text-accent" label="Checking your session" />
      </div>
    );
  }

  return <>{children}</>;
}
