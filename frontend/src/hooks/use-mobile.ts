"use client";

import { useEffect, useState } from "react";

const MOBILE_BREAKPOINT = 768;

/**
 * Returns `true` when the viewport is below the mobile breakpoint.
 * SSR-safe: returns `false` on the server and during first paint, then
 * corrects after mount to avoid hydration mismatches.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => setIsMobile(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}
