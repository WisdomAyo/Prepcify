"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PersonaCard } from "@/components/onboarding/persona-card";
import { useOnboardingStore, type Persona } from "@/stores/onboarding";
import { fadeUp, opacityFade, useMotionPreference, staggerContainer } from "@/lib/motion";

const PERSONAS: Array<{
  key: Persona;
  label: string;
  caption: string;
  detail: string;
  imageSrc: string;
}> = [
  {
    key: "secondary",
    label: "Secondary school student",
    caption: "WAEC, NECO, JAMB, NABTEB",
    detail: "Build a guided rhythm around school subjects, past questions, and mock exams.",
    imageSrc: "/assets/courses_overlay.png",
  },
  {
    key: "professional",
    label: "Professional candidate",
    caption: "ICAN, ACCA, CFA",
    detail: "Stay consistent with focused milestones for certification and career exams.",
    imageSrc: "/assets/professional.png",
  },
  {
    key: "international",
    label: "International student",
    caption: "IELTS, Cambridge, SAT, A-Levels",
    detail: "Plan prep for global tests, destination goals, and admission timelines.",
    imageSrc: "/assets/international.png",
  },
  {
    key: "parent",
    label: "Parent or guardian",
    caption: "Set up for your child",
    detail: "Create a child profile, follow progress, and keep learning accountable.",
    imageSrc: "/assets/parent.png",
  },
];

export default function PersonaPage() {
  const router = useRouter();
  const persona = useOnboardingStore((s) => s.persona);
  const setPersona = useOnboardingStore((s) => s.setPersona);
  const { reduced } = useMotionPreference();
  const headVariants = reduced ? opacityFade : fadeUp;

  function handleContinue() {
    if (!persona) return;
    if (persona === "parent") {
      router.push("/onboarding/parent/setup");
    } else {
      router.push("/onboarding/basics");
    }
  }

  return (
    <div className="space-y-12">
      <motion.header
        variants={headVariants}
        initial="hidden"
        animate="visible"
        className="text-center"
      >
        <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-2 text-[13px] font-semibold uppercase tracking-[0.16em] text-muted-foreground shadow-[0_18px_50px_-42px_hsl(var(--foreground)/0.55)] backdrop-blur">
          <Sparkles className="h-4 w-4 text-accent" />
          Step 1 of 5
        </p>
        <h1 className="mx-auto mt-5 max-w-3xl text-balance font-display text-5xl font-medium leading-[1.06] tracking-tight sm:text-6xl">
          Choose the learning path that fits you.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed text-muted-foreground">
          Pick your starting point and prepcify will shape exams, subjects,
          reminders, and progress tracking around that goal.
        </p>
      </motion.header>

      <motion.div
        variants={staggerContainer(0.08)}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-x-5 gap-y-8 pt-2 sm:grid-cols-2 sm:gap-y-10"
      >
        {PERSONAS.map((p, i) => (
          <PersonaCard
            key={p.key}
            label={p.label}
            caption={p.caption}
            detail={p.detail}
            imageSrc={p.imageSrc}
            selected={persona === p.key}
            onSelect={() => setPersona(p.key)}
            index={i}
          />
        ))}
      </motion.div>

      <motion.div
        variants={headVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-stretch justify-between gap-4 rounded-[1.5rem] border border-border bg-card/80 p-3 shadow-[0_24px_70px_-56px_hsl(var(--foreground)/0.65)] backdrop-blur sm:flex-row sm:items-center"
      >
        <p className="px-3 text-sm font-semibold text-muted-foreground">
          {persona
            ? `Selected: ${PERSONAS.find((item) => item.key === persona)?.label}`
            : "Select one path to continue your setup."}
        </p>
        <Button
          variant="accent"
          size="lg"
          disabled={!persona}
          onClick={handleContinue}
          rightIcon={<ArrowRight />}
          className="w-full rounded-2xl sm:w-auto"
        >
          Continue
        </Button>
      </motion.div>
    </div>
  );
}
