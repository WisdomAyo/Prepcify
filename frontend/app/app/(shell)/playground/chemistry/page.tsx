"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shells/page-header";
import { cn } from "@/lib/utils";

const molecules = [
  { id: "h2o", name: "Water (H₂O)", atoms: [{ el: "O", x: 50, y: 50, color: "bg-destructive" }, { el: "H", x: 25, y: 30, color: "bg-foreground" }, { el: "H", x: 75, y: 30, color: "bg-foreground" }] },
  { id: "co2", name: "Carbon Dioxide (CO₂)", atoms: [{ el: "C", x: 50, y: 50, color: "bg-foreground" }, { el: "O", x: 20, y: 50, color: "bg-destructive" }, { el: "O", x: 80, y: 50, color: "bg-destructive" }] },
  { id: "ch4", name: "Methane (CH₄)", atoms: [{ el: "C", x: 50, y: 50, color: "bg-foreground" }, { el: "H", x: 25, y: 30, color: "bg-sky" }, { el: "H", x: 75, y: 30, color: "bg-sky" }, { el: "H", x: 25, y: 70, color: "bg-sky" }, { el: "H", x: 75, y: 70, color: "bg-sky" }] },
];

export default function ChemistryVisPage() {
  const [active, setActive] = useState(molecules[0]);

  return (
    <div className="max-w-5xl">
      <PageHeader
        crumbs={[
          { label: "Playground", href: "/app/playground" },
          { label: "Chemistry" },
        ]}
        eyebrow="Tool"
        title="Chemistry Visualizer"
        description="Pick a molecule and inspect its structure."
      />

      <div className="grid gap-5 md:grid-cols-[200px_1fr]">
        <div className="space-y-2">
          {molecules.map((m) => (
            <button
              key={m.id}
              onClick={() => setActive(m)}
              className={cn(
                "w-full rounded-2xl border p-4 text-left transition-colors",
                active.id === m.id
                  ? "border-foreground bg-card"
                  : "border-border",
              )}
            >
              <p className="text-sm font-semibold">{m.name}</p>
            </button>
          ))}
        </div>
        <div className="flex min-h-[360px] items-center justify-center rounded-3xl border border-border bg-card p-8">
          <div className="relative h-72 w-72">
            {active.atoms.map((a, i) => (
              <div
                key={i}
                className={cn(
                  "absolute flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full font-display text-xl font-bold text-background shadow-card",
                  a.color,
                )}
                style={{ left: `${a.x}%`, top: `${a.y}%` }}
              >
                {a.el}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
