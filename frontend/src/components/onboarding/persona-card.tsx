"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Check, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { fadeUp, useMotionPreference, opacityFade } from "@/lib/motion";

interface PersonaCardProps {
  label: string;
  caption: string;
  detail: string;
  imageSrc: string;
  selected: boolean;
  onSelect: () => void;
  /** Used to compute the staggered reveal delay. */
  index: number;
}

/**
 * Selectable persona card.
 *
 * - Surface bg, 1px border at rest. Hover: lifts 4px and the border darkens.
 * - Selected: 2px accent border, accent-quiet bg, Check icon top-right.
 * - Cards reveal with fadeUp + 80ms stagger. Reduced-motion just fades.
 */
export function PersonaCard({
  label,
  caption,
  detail,
  imageSrc,
  selected,
  onSelect,
  index,
}: PersonaCardProps) {
  const { reduced } = useMotionPreference();
  const variants = reduced ? opacityFade : fadeUp;

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      variants={variants}
      initial="hidden"
      animate="visible"
      transition={{ delay: reduced ? 0 : index * 0.08 }}
      whileHover={reduced ? undefined : { y: -6, scale: 1.01 }}
      whileTap={reduced ? undefined : { scale: 0.985 }}
      className={cn(
        "group relative flex min-h-[210px] flex-col items-start overflow-visible text-left",
        "rounded-[1.65rem] bg-card p-6 transition-all duration-300 sm:min-h-[228px]",
        "shadow-[0_24px_70px_-52px_hsl(var(--foreground)/0.55)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        selected
          ? "border-2 border-accent bg-accent-quiet shadow-[0_30px_90px_-50px_hsl(var(--glow)/0.75)]"
          : "border border-border hover:border-primary/50 hover:bg-card/95",
      )}
    >
      <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-[1.65rem]" aria-hidden>
        <span className="absolute -right-14 -top-14 h-40 w-40 rounded-full bg-accent/15 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
        <span className="absolute bottom-0 left-0 h-24 w-full bg-[linear-gradient(135deg,hsl(var(--primary)/0.08),transparent_58%)]" />
      </span>

      {/* Selected check */}
      <span
        className={cn(
          "absolute right-5 top-5 z-20 flex h-7 w-7 items-center justify-center rounded-full",
          "transition-all duration-300 shadow-[0_12px_28px_-16px_hsl(var(--foreground)/0.65)]",
          selected
            ? "bg-accent text-accent-foreground opacity-100"
            : "bg-white/80 text-foreground opacity-0 ring-1 ring-border group-hover:opacity-100",
        )}
        aria-hidden
      >
        <Check className="h-4 w-4" strokeWidth={2.5} />
      </span>

      <span
        className={cn(
          "pointer-events-none absolute -right-3 -top-8 z-10 h-36 w-36 transition-transform duration-500 sm:-right-6 sm:-top-10 sm:h-40 sm:w-40",
          "group-hover:-translate-y-2 group-hover:translate-x-1 group-hover:rotate-2",
          selected && "-translate-y-2 translate-x-1 rotate-2",
        )}
        aria-hidden
      >
        <Image
          src={imageSrc}
          alt=""
          fill
          sizes="(min-width: 640px) 168px, 144px"
          className="object-contain drop-shadow-[0_22px_34px_rgba(15,23,42,0.22)]"
          priority={index < 2}
        />
      </span>

      <span
        className={cn(
          "relative z-10 inline-flex h-8 items-center gap-2 rounded-full px-3 text-[11px] font-semibold uppercase tracking-[0.12em]",
          selected ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground",
        )}
      >
        Path {index + 1}
        <ArrowUpRight className="h-3.5 w-3.5" />
      </span>

      <span className="relative z-10 mt-auto max-w-[72%] pt-16 sm:max-w-[68%] sm:pt-20">
        <h3 className="font-display text-xl font-medium leading-tight tracking-tight sm:text-[22px]">
        {label}
        </h3>
        <p className="mt-2 text-sm font-semibold text-muted-foreground">{caption}</p>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">{detail}</p>
      </span>
    </motion.button>
  );
}
