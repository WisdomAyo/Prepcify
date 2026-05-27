"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataState } from "@/components/ui/data-state";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SubjectAccordion } from "@/components/onboarding/subject-accordion";
import { ExamPill } from "@/components/onboarding/exam-pill";
import { Lock } from "lucide-react";
import { useOnboardingStore, type Course } from "@/stores/onboarding";
import { useExamBodies, useExamSubjects } from "@/features/exams/hooks";
import { fadeUp, opacityFade, useMotionPreference } from "@/lib/motion";
import type { ExamSubject } from "@/lib/api/exams";

/* -------------------------------------------------------------------------- */
/*  Defaults                                                                  */
/* -------------------------------------------------------------------------- */

const COURSE_DEFAULTS: Record<Course, string[]> = {
  medicine: ["English", "Math", "Physics", "Chemistry", "Biology"],
  engineering: ["English", "Math", "Physics", "Chemistry", "Further Math"],
  law: ["English", "Literature", "Government", "CRS", "History"],
  sciences: ["English", "Math", "Physics", "Chemistry", "Biology"],
  commercial: ["English", "Math", "Economics", "Accounting", "Commerce"],
  arts: ["English", "Literature", "Government", "History", "CRS"],
  not_sure: ["English", "Math", "Physics", "Biology", "Economics"],
};

const EXAM_HINTS: Record<string, string> = {
  waec: "WAEC students usually take 8-9 subjects.",
  neco: "NECO students usually take 8-9 subjects.",
  jamb: "JAMB requires exactly 4 subjects including English.",
  nabteb: "NABTEB students usually take 5-9 subjects.",
  gce: "GCE candidates typically take 4-7 subjects.",
};

const IELTS_SKILL_CODES = new Set(["ielts", "toefl", "duolingo", "duolingo-english", "celpip", "pte"]);

/** Match a subject's name against a short default token (case-insensitive). */
function nameMatches(subjectName: string, token: string): boolean {
  const a = subjectName.trim().toLowerCase();
  const b = token.trim().toLowerCase();
  if (a === b) return true;
  if (a.startsWith(b + " ")) return true;
  if (a.startsWith(b)) return true; // "Mathematics" startsWith "math"
  return false;
}

function defaultsForCourse(
  subjects: ExamSubject[],
  course: Course | null,
): number[] {
  const courseDefaults = course ? COURSE_DEFAULTS[course] : [];
  const ids = new Set<number>();
  // Always include compulsory.
  for (const s of subjects) if (s.is_compulsory) ids.add(s.subject_id);
  // Then add course-driven defaults.
  for (const token of courseDefaults) {
    const hit = subjects.find((s) => nameMatches(s.name, token));
    if (hit) ids.add(hit.subject_id);
  }
  return Array.from(ids);
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function SubjectsPage() {
  const router = useRouter();
  const persona = useOnboardingStore((s) => s.persona);
  const examIds = useOnboardingStore((s) => s.exams);
  const course = useOnboardingStore((s) => s.course);
  const subjects = useOnboardingStore((s) => s.subjects);
  const setSubjects = useOnboardingStore((s) => s.setSubjects);

  // Defensive: bounce back to persona if entered cold.
  useEffect(() => {
    if (!persona) router.replace("/onboarding/persona");
    else if (persona !== "parent" && examIds.length === 0) router.replace("/onboarding/exam");
  }, [persona, examIds.length, router]);

  const bodiesQuery = useExamBodies();
  const selectedExams = useMemo(() => {
    if (!bodiesQuery.data) return [];
    return bodiesQuery.data
      .filter((b) => examIds.includes(b.id))
      .map((b) => ({
        id: b.id,
        name: b.name,
        code: b.code,
        hint: EXAM_HINTS[b.code.toLowerCase()],
      }));
  }, [bodiesQuery.data, examIds]);

  const canContinue = useMemo(() => {
    if (selectedExams.length === 0) return false;
    return selectedExams.every((e) => (subjects[e.id]?.length ?? 0) > 0);
  }, [selectedExams, subjects]);

  if (!persona || persona === "parent") return null;

  return (
    <div className="space-y-12">
      <Header persona={persona} />

      <DataState
        isLoading={bodiesQuery.isLoading}
        isError={bodiesQuery.isError}
        error={bodiesQuery.error}
        isEmpty={!bodiesQuery.isLoading && selectedExams.length === 0}
        onRetry={() => void bodiesQuery.refetch()}
      >
        {persona === "secondary" && (
          <SubjectAccordion
            exams={selectedExams}
            selected={subjects}
            defaultsFor={(_, list) => defaultsForCourse(list, course)}
            onChange={setSubjects}
          />
        )}

        {persona === "professional" && selectedExams[0] && (
          <ProfessionalPapers
            exam={selectedExams[0]}
            selected={subjects[selectedExams[0].id] ?? []}
            onChange={(ids) => setSubjects(selectedExams[0]!.id, ids)}
          />
        )}

        {persona === "international" && selectedExams[0] && (
          <InternationalSubjects
            exam={selectedExams[0]}
            selected={subjects[selectedExams[0].id] ?? []}
            onChange={(ids) => setSubjects(selectedExams[0]!.id, ids)}
          />
        )}
      </DataState>

      <div className="flex justify-end pt-2">
        <Button
          variant="accent"
          size="lg"
          disabled={!canContinue}
          onClick={() => router.push("/onboarding/timeline")}
          rightIcon={<ArrowRight />}
          className="w-full sm:w-auto"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}

function Header({ persona }: { persona: "secondary" | "professional" | "international" }) {
  const { reduced } = useMotionPreference();
  const variants = reduced ? opacityFade : fadeUp;
  const title =
    persona === "secondary"
      ? "Your subjects."
      : persona === "professional"
        ? "Your papers."
        : "Your focus.";

  return (
    <motion.header variants={variants} initial="hidden" animate="visible">
      <p className="font-mono text-[13px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        Step 4 of 5
      </p>
      <h1 className="mt-3 text-balance font-display text-5xl font-medium leading-[1.06] tracking-tight">
        {title}
      </h1>
      <p className="mt-6 text-[17px] leading-relaxed text-muted-foreground">
        We&apos;ve picked the usual ones. Tap to change.
      </p>
    </motion.header>
  );
}

/* -------------------------------------------------------------------------- */
/*  Professional papers                                                       */
/* -------------------------------------------------------------------------- */

function ProfessionalPapers({
  exam,
  selected,
  onChange,
}: {
  exam: { id: number; code: string; name: string };
  selected: number[];
  onChange: (ids: number[]) => void;
}) {
  const query = useExamSubjects(exam.code);

  // Seed: every paper checked by default. Compulsory ones lock.
  useEffect(() => {
    if (!query.data || selected.length > 0) return;
    onChange(query.data.map((s) => s.subject_id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.data]);

  function toggle(id: number) {
    if (selected.includes(id)) onChange(selected.filter((x) => x !== id));
    else onChange([...selected, id]);
  }

  return (
    <DataState
      isLoading={query.isLoading}
      isError={query.isError}
      error={query.error}
      isEmpty={!query.isLoading && (query.data?.length ?? 0) === 0}
      onRetry={() => void query.refetch()}
    >
      <div className="rounded-2xl border border-border bg-card">
        <ul className="divide-y divide-border">
          {(query.data ?? []).map((s) => {
            const checked = selected.includes(s.subject_id);
            const locked = s.is_compulsory;
            return (
              <li key={s.id} className="flex items-center gap-3 px-6 py-4">
                <Checkbox
                  id={`paper-${s.subject_id}`}
                  checked={checked || locked}
                  disabled={locked}
                  onCheckedChange={() => toggle(s.subject_id)}
                />
                <div className="flex-1">
                  <span className="font-mono text-[13px] text-muted-foreground">
                    {s.slug.toUpperCase()}
                  </span>
                  <label
                    htmlFor={`paper-${s.subject_id}`}
                    className="ml-3 cursor-pointer text-base font-medium"
                  >
                    {s.name}
                  </label>
                </div>
                {locked && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span aria-label="Compulsory" className="text-muted-foreground">
                        <Lock className="h-3.5 w-3.5" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>Compulsory</TooltipContent>
                  </Tooltip>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      <p className="mt-3 text-[13px] text-muted-foreground">
        Most candidates take 2–3 papers per diet.
      </p>
    </DataState>
  );
}

/* -------------------------------------------------------------------------- */
/*  International — IELTS/TOEFL chips OR Cambridge/A-Levels/SAT subject list  */
/* -------------------------------------------------------------------------- */

function InternationalSubjects({
  exam,
  selected,
  onChange,
}: {
  exam: { id: number; code: string; name: string; hint?: string };
  selected: number[];
  onChange: (ids: number[]) => void;
}) {
  const isSkillExam = IELTS_SKILL_CODES.has(exam.code.toLowerCase());
  const query = useExamSubjects(exam.code);

  // Seed: every skill/subject checked by default.
  useEffect(() => {
    if (!query.data || selected.length > 0) return;
    onChange(query.data.map((s) => s.subject_id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.data]);

  function toggle(id: number) {
    if (selected.includes(id)) onChange(selected.filter((x) => x !== id));
    else onChange([...selected, id]);
  }

  return (
    <DataState
      isLoading={query.isLoading}
      isError={query.isError}
      error={query.error}
      isEmpty={!query.isLoading && (query.data?.length ?? 0) === 0}
      onRetry={() => void query.refetch()}
    >
      {isSkillExam ? (
        <div className="flex flex-wrap gap-2.5">
          {(query.data ?? []).map((s) => (
            <ExamPill
              key={s.id}
              label={s.name}
              selected={selected.includes(s.subject_id)}
              onSelect={() => toggle(s.subject_id)}
            />
          ))}
        </div>
      ) : (
        <SubjectAccordion
          exams={[{ id: exam.id, code: exam.code, name: exam.name }]}
          selected={{ [exam.id]: selected }}
          defaultsFor={(_, list) => list.map((s) => s.subject_id)}
          onChange={(_, ids) => onChange(ids)}
        />
      )}
    </DataState>
  );
}
