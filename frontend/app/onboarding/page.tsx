import { redirect } from "next/navigation";

/**
 * Onboarding index — redirects to the first screen.
 *
 * The flow now lives at `/onboarding/{persona,exam,subjects,timeline,celebration}`
 * (plus the `/onboarding/parent/*` branch). This page exists only so old
 * deep links and the legacy `RouteGuard` redirect target keep working.
 */
export default function OnboardingIndex(): never {
  redirect("/onboarding/persona");
}
