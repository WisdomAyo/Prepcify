"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shells/page-header";

export default function GraphingPage() {
  const [fn, setFn] = useState("y = x^2 - 4");

  // Parametric SVG render of y = x^2 - 4 between -4 and 4.
  const points = Array.from({ length: 81 }, (_, i) => {
    const x = -4 + i * 0.1;
    const y = x * x - 4;
    return `${(x + 5) * 30},${(10 - y) * 12}`;
  }).join(" ");

  return (
    <div className="max-w-5xl">
      <PageHeader
        crumbs={[
          { label: "Playground", href: "/app/playground" },
          { label: "Graphing" },
        ]}
        eyebrow="Tool"
        title="Graphing Tool"
        description="Plot functions and see them transform live."
      />

      <div className="rounded-3xl border border-border bg-card p-6">
        <label
          htmlFor="gr-fn"
          className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
        >
          Function
        </label>
        <input
          id="gr-fn"
          value={fn}
          onChange={(e) => setFn(e.target.value)}
          className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 font-mono text-sm outline-none"
        />
      </div>

      <div className="mt-5 rounded-3xl border border-border bg-card p-4">
        <svg viewBox="0 0 300 240" className="h-auto w-full" role="img" aria-label="Function graph">
          {Array.from({ length: 11 }).map((_, i) => (
            <g key={i}>
              <line x1={i * 30} y1={0} x2={i * 30} y2={240} className="stroke-border" strokeWidth="0.5" />
              <line x1={0} y1={i * 24} x2={300} y2={i * 24} className="stroke-border" strokeWidth="0.5" />
            </g>
          ))}
          <line x1={150} y1={0} x2={150} y2={240} className="stroke-foreground" strokeWidth="1" />
          <line x1={0} y1={120} x2={300} y2={120} className="stroke-foreground" strokeWidth="1" />
          <polyline
            points={points}
            fill="none"
            className="stroke-accent"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Demo: rendering y = x² − 4. Live equation parsing coming soon.
      </p>
    </div>
  );
}
