"use client";

import { useMemo, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { pickTransition, useMotionPreference } from "@/lib/motion";

/**
 * Per-route configuration for the onboarding shell.
 *
 * `progress` is rendered as a 1px accent bar at the top, animating
 * between steps. `hideBack` removes the back arrow (persona, setup,
 * celebration, confirm).
 */
type StepConfig = { progress: number; hideBack: boolean };

const STEPS: Record<string, StepConfig> = {
  // Student/professional/international path
  "/onboarding/persona": { progress: 20, hideBack: true },
  "/onboarding/basics": { progress: 40, hideBack: false },
  "/onboarding/exam": { progress: 60, hideBack: false },
  "/onboarding/subjects": { progress: 80, hideBack: false },
  "/onboarding/timeline": { progress: 100, hideBack: false },
  "/onboarding/celebration": { progress: 100, hideBack: true },

  // Parent path
  "/onboarding/parent/setup": { progress: 33, hideBack: true },
  "/onboarding/parent/new-child": { progress: 66, hideBack: false },
  "/onboarding/parent/connect": { progress: 66, hideBack: false },
  "/onboarding/parent/confirm": { progress: 100, hideBack: true },
};

interface OnboardingLayoutProps {
  children: ReactNode;
  /**
   * Optional explicit back destination. Falls back to `router.back()` —
   * which works because each onboarding screen is its own route and the
   * browser keeps the history stack honest.
   */
  backTo?: string;
}

export function OnboardingLayout({ children, backTo }: OnboardingLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { reduced } = useMotionPreference();

  const step = useMemo<StepConfig>(() => {
    return STEPS[pathname ?? ""] ?? { progress: 0, hideBack: true };
  }, [pathname]);

  // The AnimatePresence key needs to flip every time the route changes so
  // the outgoing screen exit-animates while the new one enters.
  const transitionVariants = pickTransition("forward", reduced);

  return (
    <div className="relative min-h-dvh overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute left-1/2 top-[-22rem] h-[44rem] w-[72rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,hsl(var(--accent)/0.22),transparent_64%)] blur-3xl" />
        <div className="absolute right-[-18rem] top-32 h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(circle,hsl(var(--primary)/0.13),transparent_64%)] blur-3xl" />
        <div className="absolute bottom-[-22rem] left-[-16rem] h-[40rem] w-[40rem] rounded-full bg-[radial-gradient(circle,hsl(var(--glow-soft)/0.22),transparent_66%)] blur-3xl" />
        <motion.div
          className="absolute inset-x-0 top-16 h-px bg-gradient-to-r from-transparent via-accent/35 to-transparent"
          animate={reduced ? undefined : { opacity: [0.35, 0.8, 0.35] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      {/* Progress bar — 1px line, accent fill, smooth between routes. */}
      <div
        className="fixed inset-x-0 top-0 z-50 h-px bg-border"
        aria-hidden={step.progress === 0 || undefined}
      >
        <motion.div
          className="h-full bg-accent"
          initial={false}
          animate={{ width: `${step.progress}%` }}
          transition={{ duration: reduced ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }}
          role="progressbar"
          aria-valuenow={step.progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Onboarding progress"
        />
      </div>

      {/* Back arrow — hidden on first-of-flow + terminal screens. */}
      {!step.hideBack && (
        <button
          type="button"
          onClick={() => (backTo ? router.push(backTo) : router.back())}
          aria-label="Go back"
          className={cn(
            "fixed left-6 top-6 z-40 flex h-10 w-10 items-center justify-center rounded-full",
            "border border-border bg-card text-foreground transition-colors",
            "hover:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          )}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      )}

      {/* Slide-in content. AnimatePresence keys on pathname so each route
          transition runs the exit + enter pair. */}
      <main
        id="main-content"
        className="relative mx-auto w-full max-w-[1040px] px-6 pb-16 pt-12 md:pt-20"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pathname}
            variants={transitionVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
