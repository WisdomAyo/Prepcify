"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataState } from "@/components/ui/data-state";
import { ExamPill } from "@/components/onboarding/exam-pill";
import { useOnboardingStore, type Course, type Destination } from "@/stores/onboarding";
import { useExamBodies } from "@/features/exams/hooks";
import { fadeUp, opacityFade, useMotionPreference } from "@/lib/motion";
import type { ExamBody } from "@/lib/api/exams";

/* -------------------------------------------------------------------------- */
/*  Catalogue lookups                                                         */
/* -------------------------------------------------------------------------- */

const SECONDARY_CODES = ["waec", "neco", "jamb", "nabteb", "gce"] as const;
const PROFESSIONAL_CODES = ["ican", "acca", "cfa"] as const;

const PROFESSIONAL_LEVELS: Record<string, readonly string[]> = {
  ican: ["Foundation", "Skills", "Professional"],
  acca: ["Applied Knowledge", "Applied Skills", "Strategic"],
  cfa: ["Level I", "Level II", "Level III"],
};

const COURSES: Array<{ key: Course; label: string }> = [
  { key: "medicine", label: "Medicine" },
  { key: "engineering", label: "Engineering" },
  { key: "law", label: "Law" },
  { key: "sciences", label: "Sciences" },
  { key: "commercial", label: "Commercial" },
  { key: "arts", label: "Arts" },
  { key: "not_sure", label: "Not sure yet" },
];

const DESTINATIONS: Array<{ key: Destination; label: string }> = [
  { key: "uk", label: "UK" },
  { key: "usa", label: "USA" },
  { key: "canada", label: "Canada" },
  { key: "australia", label: "Australia" },
  { key: "other", label: "Other" },
  { key: "not_sure", label: "Not sure yet" },
];

const INTERNATIONAL_EXAMS_BY_DESTINATION: Record<Destination, string[]> = {
  uk: ["ielts", "cambridge", "cambridge-igcse", "a-levels", "alevels"],
  usa: ["sat", "toefl", "duolingo", "duolingo-english"],
  canada: ["ielts", "celpip"],
  australia: ["ielts", "pte"],
  other: ["ielts", "toefl"],
  not_sure: ["ielts", "toefl"],
};

/** Pick exam bodies whose code matches one of `codes`, preserving the order in `codes`. */
function pickByCode(bodies: ExamBody[], codes: readonly string[]): ExamBody[] {
  const byCode = new Map(bodies.map((b) => [b.code.toLowerCase(), b]));
  const picked: ExamBody[] = [];
  const seen = new Set<number>();
  for (const c of codes) {
    const hit = byCode.get(c.toLowerCase());
    if (hit && !seen.has(hit.id)) {
      picked.push(hit);
      seen.add(hit.id);
    }
  }
  return picked;
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function ExamPage() {
  const router = useRouter();
  const persona = useOnboardingStore((s) => s.persona);
  const exams = useOnboardingStore((s) => s.exams);
  const course = useOnboardingStore((s) => s.course);
  const level = useOnboardingStore((s) => s.level);
  const destination = useOnboardingStore((s) => s.destination);
  const setExams = useOnboardingStore((s) => s.setExams);
  const setCourse = useOnboardingStore((s) => s.setCourse);
  const setLevel = useOnboardingStore((s) => s.setLevel);
  const setDestination = useOnboardingStore((s) => s.setDestination);

  // Defensive: if the user lands here without picking a persona, send them back.
  useEffect(() => {
    if (!persona) router.replace("/onboarding/persona");
  }, [persona, router]);

  if (!persona || persona === "parent") return null;

  return (
    <div className="space-y-12">
      <Header persona={persona} />
      {persona === "secondary" && (
        <SecondaryPath
          exams={exams}
          setExams={setExams}
          course={course}
          setCourse={setCourse}
        />
      )}
      {persona === "professional" && (
        <ProfessionalPath
          exams={exams}
          setExams={setExams}
          level={level}
          setLevel={setLevel}
        />
      )}
      {persona === "international" && (
        <InternationalPath
          exams={exams}
          setExams={setExams}
          destination={destination}
          setDestination={setDestination}
        />
      )}

      <ContinueBar
        canContinue={canContinueFor(persona, { exams, course, level, destination })}
        onContinue={() => router.push("/onboarding/subjects")}
      />
    </div>
  );
}

function canContinueFor(
  persona: "secondary" | "professional" | "international",
  state: {
    exams: number[];
    course: Course | null;
    level: string | null;
    destination: Destination | null;
  },
): boolean {
  if (persona === "secondary") {
    return state.exams.length >= 1 && state.course !== null;
  }
  if (persona === "professional") {
    return state.exams.length === 1 && !!state.level;
  }
  if (persona === "international") {
    return state.destination !== null && state.exams.length === 1;
  }
  return false;
}

function Header({ persona }: { persona: "secondary" | "professional" | "international" }) {
  const { reduced } = useMotionPreference();
  const variants = reduced ? opacityFade : fadeUp;

  const title =
    persona === "secondary"
      ? "Which exams are you preparing for?"
      : persona === "professional"
        ? "Which professional exam?"
        : "Where are you planning to study?";

  const subtitle =
    persona === "secondary"
      ? "Pick up to 3."
      : persona === "professional"
        ? "Pick one."
        : "We'll match you with the right exam.";

  return (
    <motion.header variants={variants} initial="hidden" animate="visible">
      <p className="font-mono text-[13px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        Step 3 of 5
      </p>
      <h1 className="mt-3 text-balance font-display text-5xl font-medium leading-[1.06] tracking-tight">
        {title}
      </h1>
      <p className="mt-6 text-[17px] leading-relaxed text-muted-foreground">{subtitle}</p>
    </motion.header>
  );
}

/* -------------------------------------------------------------------------- */
/*  Secondary path                                                            */
/* -------------------------------------------------------------------------- */

function SecondaryPath({
  exams,
  setExams,
  course,
  setCourse,
}: {
  exams: number[];
  setExams: (ids: number[]) => void;
  course: Course | null;
  setCourse: (c: Course | null) => void;
}) {
  const bodiesQuery = useExamBodies();
  const options = useMemo(
    () => pickByCode(bodiesQuery.data ?? [], SECONDARY_CODES),
    [bodiesQuery.data],
  );

  function toggleExam(id: number) {
    if (exams.includes(id)) {
      setExams(exams.filter((x) => x !== id));
    } else if (exams.length < 3) {
      setExams([...exams, id]);
    }
  }

  return (
    <div className="space-y-10">
      <section>
        <div className="mb-3 flex items-center justify-between">
          <span className="sr-only">Choose exams</span>
          <span className="font-mono text-[13px] text-muted-foreground">
            {exams.length} of 3 selected
          </span>
        </div>
        <DataState
          isLoading={bodiesQuery.isLoading}
          isError={bodiesQuery.isError}
          error={bodiesQuery.error}
          isEmpty={!bodiesQuery.isLoading && options.length === 0}
          onRetry={() => void bodiesQuery.refetch()}
        >
          <div className="flex flex-wrap gap-3">
            {options.map((e) => (
              <ExamPill
                key={e.id}
                label={e.name}
                selected={exams.includes(e.id)}
                onSelect={() => toggleExam(e.id)}
                disabled={!exams.includes(e.id) && exams.length >= 3}
              />
            ))}
          </div>
        </DataState>
      </section>

      <AnimatePresence>
        {exams.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.3 } }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
          >
            <p className="font-mono text-[13px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              What course are you hoping to study?
            </p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              {COURSES.map((c) => (
                <ExamPill
                  key={c.key}
                  label={c.label}
                  selected={course === c.key}
                  onSelect={() => setCourse(c.key)}
                />
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Professional path                                                         */
/* -------------------------------------------------------------------------- */

function ProfessionalPath({
  exams,
  setExams,
  level,
  setLevel,
}: {
  exams: number[];
  setExams: (ids: number[]) => void;
  level: string | null;
  setLevel: (l: string | null) => void;
}) {
  const bodiesQuery = useExamBodies();
  const options = useMemo(
    () => pickByCode(bodiesQuery.data ?? [], PROFESSIONAL_CODES),
    [bodiesQuery.data],
  );

  const selectedBody = useMemo(
    () => options.find((b) => b.id === exams[0]) ?? null,
    [options, exams],
  );
  const levels = selectedBody ? PROFESSIONAL_LEVELS[selectedBody.code.toLowerCase()] ?? [] : [];

  function selectExam(id: number) {
    setExams([id]);
    setLevel(null); // reset level when exam body changes
  }

  return (
    <div className="space-y-10">
      <DataState
        isLoading={bodiesQuery.isLoading}
        isError={bodiesQuery.isError}
        error={bodiesQuery.error}
        isEmpty={!bodiesQuery.isLoading && options.length === 0}
        onRetry={() => void bodiesQuery.refetch()}
      >
        <div className="grid grid-cols-2 gap-3">
          {options.map((e) => {
            const isSelected = exams[0] === e.id;
            return (
              <button
                key={e.id}
                type="button"
                onClick={() => selectExam(e.id)}
                aria-pressed={isSelected}
                className={
                  "rounded-2xl p-6 text-center font-display text-xl font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 " +
                  (isSelected
                    ? "border-2 border-accent bg-accent-quiet"
                    : "border border-border bg-card hover:border-foreground")
                }
              >
                {e.name}
              </button>
            );
          })}
        </div>
      </DataState>

      <AnimatePresence>
        {selectedBody && levels.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.3 } }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
          >
            <p className="font-mono text-[13px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Which level?
            </p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              {levels.map((l) => (
                <ExamPill
                  key={l}
                  label={l}
                  selected={level === l}
                  onSelect={() => setLevel(l)}
                />
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  International path                                                        */
/* -------------------------------------------------------------------------- */

function InternationalPath({
  exams,
  setExams,
  destination,
  setDestination,
}: {
  exams: number[];
  setExams: (ids: number[]) => void;
  destination: Destination | null;
  setDestination: (d: Destination | null) => void;
}) {
  const bodiesQuery = useExamBodies();
  const examOptions = useMemo(() => {
    if (!destination) return [];
    return pickByCode(
      bodiesQuery.data ?? [],
      INTERNATIONAL_EXAMS_BY_DESTINATION[destination] ?? [],
    );
  }, [bodiesQuery.data, destination]);

  function selectDestination(d: Destination) {
    setDestination(d);
    setExams([]);
  }

  return (
    <div className="space-y-10">
      <section>
        <div className="flex flex-wrap gap-2.5">
          {DESTINATIONS.map((d) => (
            <ExamPill
              key={d.key}
              label={d.label}
              selected={destination === d.key}
              onSelect={() => selectDestination(d.key)}
            />
          ))}
        </div>
      </section>

      <AnimatePresence>
        {destination && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.3 } }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
          >
            <p className="font-mono text-[13px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Which exam?
            </p>
            <DataState
              isLoading={bodiesQuery.isLoading}
              isError={bodiesQuery.isError}
              error={bodiesQuery.error}
              isEmpty={!bodiesQuery.isLoading && examOptions.length === 0}
              onRetry={() => void bodiesQuery.refetch()}
            >
              <div className="mt-4 flex flex-wrap gap-2.5">
                {examOptions.map((e) => (
                  <ExamPill
                    key={e.id}
                    label={e.name}
                    selected={exams[0] === e.id}
                    onSelect={() => setExams([e.id])}
                  />
                ))}
              </div>
            </DataState>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Continue                                                                  */
/* -------------------------------------------------------------------------- */

function ContinueBar({
  canContinue,
  onContinue,
}: {
  canContinue: boolean;
  onContinue: () => void;
}) {
  return (
    <div className="flex justify-end pt-2">
      <Button
        variant="accent"
        size="lg"
        disabled={!canContinue}
        onClick={onContinue}
        rightIcon={<ArrowRight />}
        className="w-full sm:w-auto"
      >
        Continue
      </Button>
    </div>
  );
}
