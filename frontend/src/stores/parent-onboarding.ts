"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type ParentMode = "new_account" | "connect_existing";
export type ContactMethod = "phone" | "email";

export type ChildClassLevel =
  | "JSS1"
  | "JSS2"
  | "JSS3"
  | "SS1"
  | "SS2"
  | "SS3"
  | "Graduate";

export interface ParentOnboardingState {
  mode: ParentMode | null;
  childName: string | null;
  childContact: string | null;
  contactMethod: ContactMethod | null;
  childClassLevel: ChildClassLevel | null;

  setMode: (m: ParentMode) => void;
  setChildName: (n: string | null) => void;
  setChildContact: (c: string | null) => void;
  setContactMethod: (m: ContactMethod | null) => void;
  setChildClassLevel: (l: ChildClassLevel | null) => void;

  reset: () => void;
}

const initial: Omit<
  ParentOnboardingState,
  | "setMode"
  | "setChildName"
  | "setChildContact"
  | "setContactMethod"
  | "setChildClassLevel"
  | "reset"
> = {
  mode: null,
  childName: null,
  childContact: null,
  contactMethod: null,
  childClassLevel: null,
};

/**
 * Parent-flow onboarding store.
 *
 * Independent from the student store because the parent path collects
 * different fields and skips exam/subjects/timeline entirely. Persisted to
 * localStorage like the student store; cleared on successful invite or
 * link request.
 */
export const useParentOnboardingStore = create<ParentOnboardingState>()(
  persist(
    (set) => ({
      ...initial,
      setMode: (mode) => set({ mode }),
      setChildName: (childName) => set({ childName }),
      setChildContact: (childContact) => set({ childContact }),
      setContactMethod: (contactMethod) => set({ contactMethod }),
      setChildClassLevel: (childClassLevel) => set({ childClassLevel }),
      reset: () => set({ ...initial }),
    }),
    {
      name: "prepcify-parent-onboarding",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        mode: s.mode,
        childName: s.childName,
        childContact: s.childContact,
        contactMethod: s.contactMethod,
        childClassLevel: s.childClassLevel,
      }),
    },
  ),
);
