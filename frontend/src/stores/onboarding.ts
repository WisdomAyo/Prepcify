"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Persona = "secondary" | "professional" | "international" | "parent";

export type Course =
  | "medicine"
  | "engineering"
  | "law"
  | "sciences"
  | "commercial"
  | "arts"
  | "not_sure";

export type Destination = "uk" | "usa" | "canada" | "australia" | "other" | "not_sure";

export interface OnboardingState {
  persona: Persona | null;

  /** Selected exam-body IDs (1-3 for secondary, exactly 1 for professional/international). */
  exams: number[];

  /** Secondary persona only — desired field of study. Seeds default subjects. */
  course: Course | null;

  /** Professional persona only — exam level (Foundation/Skills/Strategic/etc.). */
  level: string | null;

  /** International persona only — target country. */
  destination: Destination | null;

  /** Subject selection per exam body: `{ [exam_body_id]: subject_id[] }`. */
  subjects: Record<number, number[]>;

  /** ISO date string `YYYY-MM-DD`. */
  examDate: string | null;

  /** Minutes per day (15 | 30 | 45 | 60). Defaults to 45 in the timeline screen. */
  dailyMinutes: number | null;

  setPersona: (p: Persona) => void;
  setExams: (ids: number[]) => void;
  setCourse: (c: Course | null) => void;
  setLevel: (l: string | null) => void;
  setDestination: (d: Destination | null) => void;
  setSubjects: (examBodyId: number, subjectIds: number[]) => void;
  setExamDate: (d: string | null) => void;
  setDailyMinutes: (m: number | null) => void;

  /** Wipe everything — called after a successful onboarding completion. */
  reset: () => void;
}

const initial: Omit<
  OnboardingState,
  | "setPersona"
  | "setExams"
  | "setCourse"
  | "setLevel"
  | "setDestination"
  | "setSubjects"
  | "setExamDate"
  | "setDailyMinutes"
  | "reset"
> = {
  persona: null,
  exams: [],
  course: null,
  level: null,
  destination: null,
  subjects: {},
  examDate: null,
  dailyMinutes: null,
};

/**
 * Student/professional/international onboarding store.
 *
 * Persisted to localStorage so a refresh mid-flow doesn't lose the user's
 * selections. Cleared via `reset()` after the final POST succeeds so a
 * future user on the same browser starts clean.
 */
export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      ...initial,
      setPersona: (persona) => set({ persona }),
      setExams: (exams) => set({ exams }),
      setCourse: (course) => set({ course }),
      setLevel: (level) => set({ level }),
      setDestination: (destination) => set({ destination }),
      setSubjects: (examBodyId, subjectIds) =>
        set((s) => ({ subjects: { ...s.subjects, [examBodyId]: subjectIds } })),
      setExamDate: (examDate) => set({ examDate }),
      setDailyMinutes: (dailyMinutes) => set({ dailyMinutes }),
      reset: () => set({ ...initial }),
    }),
    {
      name: "prepcify-onboarding",
      storage: createJSONStorage(() => localStorage),
      // Only persist the data fields, not the setters.
      partialize: (s) => ({
        persona: s.persona,
        exams: s.exams,
        course: s.course,
        level: s.level,
        destination: s.destination,
        subjects: s.subjects,
        examDate: s.examDate,
        dailyMinutes: s.dailyMinutes,
      }),
    },
  ),
);
