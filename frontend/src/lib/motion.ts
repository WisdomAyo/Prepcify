"use client";

import { useEffect, useState } from "react";
import type { Transition, Variants } from "framer-motion";

/**
 * Shared Framer Motion variants for the onboarding flow.
 *
 * All variants are *aware* of `prefers-reduced-motion` and slow connections
 * via {@link useMotionPreference}. Components should read the preference
 * once at mount and pass the resolved variants into `motion.div` — that way
 * the runtime decision is made in one place instead of inside every
 * animation prop.
 */

const ease = [0.22, 1, 0.36, 1] as const;

/** Standard entrance for content blocks — small lift + fade. Kept short so
 *  the perceived flow stays under 30 s end-to-end. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease } },
};

/** Selection feedback — a small pop on the freshly-picked card/pill. */
export const selectionPop: Variants = {
  initial: { scale: 0.96 },
  animate: { scale: 1, transition: { duration: 0.18, ease: "easeOut" } },
};

/** Forward route transition — slides in from the right. */
export const slideRight: Variants = {
  initial: { x: 40, opacity: 0 },
  animate: { x: 0, opacity: 1, transition: { duration: 0.22, ease } },
  exit: { x: -20, opacity: 0, transition: { duration: 0.15, ease } },
};

/** Back route transition — slides in from the left. */
export const slideLeft: Variants = {
  initial: { x: -40, opacity: 0 },
  animate: { x: 0, opacity: 1, transition: { duration: 0.22, ease } },
  exit: { x: 20, opacity: 0, transition: { duration: 0.15, ease } },
};

/** Reduced-motion fallback used in place of any of the above. */
export const opacityFade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.12 } },
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.12 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

/** Convenience for orchestrating staggered list entrances. */
export function staggerContainer(staggerChildren = 0.04): Variants {
  return {
    hidden: {},
    visible: { transition: { staggerChildren } },
  };
}

/** Shared spring tuning for layout/scale animations. */
export const softSpring: Transition = {
  type: "spring",
  stiffness: 220,
  damping: 26,
  mass: 0.6,
};

/**
 * Returns true when motion should be reduced — honors both
 * `prefers-reduced-motion: reduce` and `navigator.connection.saveData` /
 * effective `2g`/`slow-2g` networks. Resolves to `false` on the server.
 */
export function useMotionPreference(): { reduced: boolean } {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const conn = (navigator as Navigator & {
      connection?: {
        saveData?: boolean;
        effectiveType?: string;
        addEventListener?: (type: string, listener: () => void) => void;
        removeEventListener?: (type: string, listener: () => void) => void;
      };
    }).connection;

    const compute = () => {
      const slow =
        conn?.saveData === true ||
        conn?.effectiveType === "2g" ||
        conn?.effectiveType === "slow-2g";
      setReduced(mq.matches || slow);
    };

    compute();
    mq.addEventListener("change", compute);
    conn?.addEventListener?.("change", compute);
    return () => {
      mq.removeEventListener("change", compute);
      conn?.removeEventListener?.("change", compute);
    };
  }, []);

  return { reduced };
}

/**
 * Pick the right variants for a route transition given the user's motion
 * preference and the navigation direction.
 */
export function pickTransition(
  direction: "forward" | "back",
  reduced: boolean,
): Variants {
  if (reduced) return opacityFade;
  return direction === "back" ? slideLeft : slideRight;
}
