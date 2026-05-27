"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

export const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay: delay * 0.08,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      variants={fadeUp}
      custom={delay}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function Counter({
  to,
  suffix = "",
  duration = 1.8,
}: {
  to: number;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;

    const start = performance.now();
    let raf = 0;

    const tick = (time: number) => {
      const progress = Math.min(1, (time - start) / (duration * 1000));
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(to * eased));

      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [duration, inView, to]);

  return (
    <span ref={ref}>
      {value.toLocaleString()}
      {suffix}
    </span>
  );
}
