import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RouteGuard } from "@/components/auth/route-guard";
import { AuthSessionProvider, UiProviders } from "@/components/providers";
import { serverFetch } from "@/lib/api/server";
import type { ApiUser, UserContext } from "@/lib/api/types";

/**
 * Auth gate for the entire `/app` area. Sub-groups decide their own chrome:
 * `(shell)` renders the WebShell nav, `(full)` renders full-screen flows.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

async function getInitialSession() {
  try {
    // `cache: "no-store"` is critical here: when the user finishes
    // onboarding and lands back on `/app`, we MUST see the fresh
    // `student_profile.onboarding_completed_at` — otherwise the
    // RouteGuard sees a stale snapshot and bounces back to step 1.
    const initialUser = await serverFetch<ApiUser>("/auth/me", {
      cache: "no-store",
    });
    const initialContext = await serverFetch<UserContext>("/me/context", {
      cache: "no-store",
    }).catch(() => null);

    return { initialUser, initialContext };
  } catch {
    redirect("/login");
  }
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { initialUser, initialContext } = await getInitialSession();

  return (
    <UiProviders>
      <AuthSessionProvider
        initialContext={initialContext}
        initialUser={initialUser}
      >
        <RouteGuard>{children}</RouteGuard>
      </AuthSessionProvider>
    </UiProviders>
  );
}
