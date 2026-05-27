"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useOnboardingStore } from "@/stores/onboarding";
import { fadeUp, opacityFade, useMotionPreference } from "@/lib/motion";

const AUTO_REDIRECT_SECONDS = 4;

export default function CelebrationPage() {
  const router = useRouter();
  const { user } = useAuth();
  const resetOnboarding = useOnboardingStore((s) => s.reset);
  const { reduced } = useMotionPreference();
  const variants = reduced ? opacityFade : fadeUp;

  const firstName = user?.first_name || user?.display_name?.split(" ")[0] || "there";
  const email = user?.email ?? null;

  useEffect(() => {
    resetOnboarding();
  }, [resetOnboarding]);

  // Hand off to /app — `router.refresh()` first guarantees the /app layout's
  // server component re-runs against fresh cookies (the user just flipped
  // `onboarding_completed_at`, so a stale RSC payload would bounce them back).
  const goToDashboard = useCallback(() => {
    router.refresh();
    router.replace("/app");
  }, [router]);

  // Confetti — once on mount, accent palette.
  const firedRef = useRef(false);
  useEffect(() => {
    if (firedRef.current || reduced) return;
    firedRef.current = true;
    void confetti({
      particleCount: 90,
      spread: 75,
      startVelocity: 38,
      ticks: 220,
      origin: { y: 0.4 },
      colors: ["#dba432", "#f5d273", "#4a8569", "#8fb59b"],
    });
  }, [reduced]);

  // Auto-redirect countdown — user can click the CTA early to skip.
  const [secondsLeft, setSecondsLeft] = useState(AUTO_REDIRECT_SECONDS);
  useEffect(() => {
    if (secondsLeft <= 0) {
      goToDashboard();
      return;
    }
    const t = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [secondsLeft, goToDashboard]);

  return (
    <motion.section
      variants={variants}
      initial="hidden"
      animate="visible"
      className="flex min-h-[60vh] flex-col items-center justify-center text-center"
    >
      <h1 className="text-balance font-display text-5xl font-medium leading-[1.06] tracking-tight sm:text-6xl">
        You&apos;re all set, {firstName}.
      </h1>
      <p className="mt-6 max-w-[480px] text-lg leading-relaxed text-muted-foreground">
        Your study plan is ready. Day 1 starts now.
      </p>

      <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:items-baseline">
        <Button
          variant="accent"
          size="xl"
          onClick={goToDashboard}
          rightIcon={<ArrowRight />}
          className="w-full sm:w-auto"
        >
          Take me to my dashboard
        </Button>
        <span
          className="font-mono text-[12px] text-muted-foreground"
          aria-live="polite"
        >
          Auto-continuing in {secondsLeft}s…
        </span>
      </div>

      {email && (
        <p className="mt-8 text-sm text-muted-foreground/80">
          We&apos;ve sent a copy of your plan to {email}.
        </p>
      )}
    </motion.section>
  );
}
