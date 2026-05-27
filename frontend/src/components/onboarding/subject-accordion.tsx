"use client";

import { useEffect } from "react";
import { Lock } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DataState } from "@/components/ui/data-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useExamSubjects } from "@/features/exams/hooks";
import type { ExamSubject } from "@/lib/api/exams";

interface SubjectAccordionProps {
  /** Exam bodies to render — each gets its own accordion item. */
  exams: Array<{ id: number; name: string; code: string; hint?: string }>;
  /** Currently selected subject IDs, per exam body. */
  selected: Record<number, number[]>;
  /** Default subject IDs to seed the user with — applied per exam body. */
  defaultsFor: (examBodyId: number, subjects: ExamSubject[]) => number[];
  /** Persist a selection change for the given exam body. */
  onChange: (examBodyId: number, subjectIds: number[]) => void;
}

/**
 * Multi-accordion subject picker — one accordion item per selected exam.
 *
 * Compulsory subjects are pre-checked and locked. The remaining defaults
 * (driven by the course chip from screen 2) are pre-checked but can be
 * unchecked. The header shows a live count of selected subjects so the
 * user can keep an eye on it without expanding each section.
 */
export function SubjectAccordion({
  exams,
  selected,
  defaultsFor,
  onChange,
}: SubjectAccordionProps) {
  if (exams.length === 0) return null;
  const defaultOpen = `exam-${exams[0]!.id}`;

  return (
    <Accordion type="multiple" defaultValue={[defaultOpen]} className="space-y-4">
      {exams.map((exam) => (
        <ExamItem
          key={exam.id}
          exam={exam}
          selected={selected[exam.id] ?? []}
          defaultsFor={defaultsFor}
          onChange={(ids) => onChange(exam.id, ids)}
        />
      ))}
    </Accordion>
  );
}

function ExamItem({
  exam,
  selected,
  defaultsFor,
  onChange,
}: {
  exam: { id: number; name: string; code: string; hint?: string };
  selected: number[];
  defaultsFor: (examBodyId: number, subjects: ExamSubject[]) => number[];
  onChange: (ids: number[]) => void;
}) {
  const subjectsQuery = useExamSubjects(exam.code);

  // Seed defaults the first time we successfully load subjects for this exam,
  // but only if the user hasn't picked anything yet for it. Subsequent edits
  // by the user are preserved — we never overwrite their picks.
  useEffect(() => {
    if (!subjectsQuery.data || selected.length > 0) return;
    const defaults = defaultsFor(exam.id, subjectsQuery.data);
    if (defaults.length > 0) onChange(defaults);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectsQuery.data]);

  function toggle(subjectId: number) {
    if (selected.includes(subjectId)) {
      onChange(selected.filter((id) => id !== subjectId));
    } else {
      onChange([...selected, subjectId]);
    }
  }

  return (
    <AccordionItem
      value={`exam-${exam.id}`}
      className="rounded-2xl border border-border bg-card px-6 py-1 [&:not(:last-child)]:mb-3"
    >
      <AccordionTrigger className="py-5 font-display text-[17px] font-semibold hover:no-underline">
        <span className="flex w-full items-center justify-between pr-3">
          <span>{exam.name}</span>
          <span className="font-mono text-[13px] font-normal text-muted-foreground">
            {selected.length} subject{selected.length === 1 ? "" : "s"}
          </span>
        </span>
      </AccordionTrigger>
      <AccordionContent>
        <DataState
          isLoading={subjectsQuery.isLoading}
          isError={subjectsQuery.isError}
          error={subjectsQuery.error}
          isEmpty={!subjectsQuery.isLoading && (subjectsQuery.data?.length ?? 0) === 0}
          onRetry={() => void subjectsQuery.refetch()}
          loadingFallback={<SubjectSkeleton />}
        >
          <ul className="divide-y divide-border">
            {(subjectsQuery.data ?? []).map((s) => {
              const checked = selected.includes(s.subject_id);
              const locked = s.is_compulsory;
              return (
                <li key={s.id} className="flex items-center gap-3 py-3">
                  <Checkbox
                    id={`sub-${exam.id}-${s.subject_id}`}
                    checked={checked || locked}
                    disabled={locked}
                    onCheckedChange={() => toggle(s.subject_id)}
                  />
                  <label
                    htmlFor={`sub-${exam.id}-${s.subject_id}`}
                    className="flex-1 cursor-pointer text-[15px] font-medium"
                  >
                    {s.name}
                  </label>
                  {locked && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span
                          aria-label="Compulsory"
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground"
                        >
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
          {exam.hint && (
            <p className="mt-4 text-[13px] text-muted-foreground">{exam.hint}</p>
          )}
        </DataState>
      </AccordionContent>
    </AccordionItem>
  );
}

function SubjectSkeleton() {
  return (
    <div className="space-y-3 py-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 flex-1" />
        </div>
      ))}
    </div>
  );
}
