import type { Metadata, Viewport } from "next";
import { RouteGuard } from "@/components/auth/route-guard";
import { AuthSessionProvider } from "@/components/providers";
import { OnboardingLayout } from "@/components/onboarding/onboarding-layout";

export const metadata: Metadata = {
  title: { template: "%s · Prepcify", default: "Set up your account · Prepcify" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#FAF7EA",
};

/**
 * Shared layout for every `/onboarding/*` screen.
 *
 * Mounts the auth session provider + RouteGuard once at the route segment
 * so individual pages don't have to. `requireOnboarded={false}` lets users
 * who haven't finished onboarding actually reach these screens.
 */
export default function OnboardingRoutesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthSessionProvider>
      <RouteGuard requireOnboarded={false}>
        <OnboardingLayout>{children}</OnboardingLayout>
      </RouteGuard>
    </AuthSessionProvider>
  );
}
