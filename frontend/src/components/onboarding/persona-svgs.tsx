import type { SVGProps } from "react";

/**
 * Persona illustrations.
 *
 * Each renders at the size passed via className (default 96×96). Style:
 * single `currentColor` stroke at 1.5px, no fills. Inspired by Lucide —
 * geometric, generous whitespace, reads as an icon at small sizes.
 */

interface PersonaSvgProps extends SVGProps<SVGSVGElement> {
  className?: string;
}

const base = {
  viewBox: "0 0 96 96",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Secondary school student — silhouette with backpack. */
export function SecondaryStudentSvg(props: PersonaSvgProps) {
  return (
    <svg {...base} {...props} aria-hidden>
      {/* head */}
      <circle cx="40" cy="24" r="10" />
      {/* shoulders/torso */}
      <path d="M22 84 V60 a18 18 0 0 1 36 0 V84" />
      {/* backpack */}
      <rect x="60" y="42" width="16" height="26" rx="2.5" />
      <path d="M60 50 H50" />
      <path d="M76 50 H86" />
      {/* book in pack pocket */}
      <path d="M64 56 H72" />
    </svg>
  );
}

/** Professional — briefcase with calculator overlapping. */
export function ProfessionalBriefcaseSvg(props: PersonaSvgProps) {
  return (
    <svg {...base} {...props} aria-hidden>
      {/* briefcase */}
      <rect x="14" y="32" width="50" height="38" rx="3" />
      {/* handle */}
      <path d="M30 32 V26 a4 4 0 0 1 4 -4 H44 a4 4 0 0 1 4 4 V32" />
      {/* clasp */}
      <path d="M36 50 H42" />
      {/* calculator */}
      <rect x="54" y="48" width="28" height="34" rx="2.5" />
      {/* calculator screen */}
      <path d="M58 54 H78" />
      {/* calculator buttons */}
      <circle cx="61" cy="63" r="1.2" />
      <circle cx="68" cy="63" r="1.2" />
      <circle cx="75" cy="63" r="1.2" />
      <circle cx="61" cy="70" r="1.2" />
      <circle cx="68" cy="70" r="1.2" />
      <circle cx="75" cy="70" r="1.2" />
      <circle cx="61" cy="77" r="1.2" />
      <circle cx="68" cy="77" r="1.2" />
      <circle cx="75" cy="77" r="1.2" />
    </svg>
  );
}

/** International student — passport with a globe behind it. */
export function InternationalPassportSvg(props: PersonaSvgProps) {
  return (
    <svg {...base} {...props} aria-hidden>
      {/* globe */}
      <circle cx="60" cy="34" r="22" />
      <ellipse cx="60" cy="34" rx="22" ry="9" />
      <path d="M60 12 V56" />
      {/* passport */}
      <rect x="20" y="34" width="34" height="46" rx="2.5" />
      {/* passport details */}
      <circle cx="37" cy="54" r="6" />
      <path d="M28 70 H46" />
      <path d="M28 76 H42" />
    </svg>
  );
}

/** Parent / guardian — adult figure beside a phone showing a chart. */
export function ParentPhoneSvg(props: PersonaSvgProps) {
  return (
    <svg {...base} {...props} aria-hidden>
      {/* adult head */}
      <circle cx="30" cy="24" r="9" />
      {/* body */}
      <path d="M14 84 V58 a16 16 0 0 1 32 0 V84" />
      {/* phone */}
      <rect x="54" y="36" width="28" height="44" rx="3.5" />
      {/* phone notch / speaker */}
      <path d="M64 41 H72" />
      {/* chart line */}
      <path d="M59 64 L64 58 L69 64 L74 54 L79 60" />
      {/* home pill */}
      <path d="M65 76 H71" />
    </svg>
  );
}
