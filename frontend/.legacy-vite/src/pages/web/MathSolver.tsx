import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Calculator } from "lucide-react";

export default function MathSolver() {
  const [eq, setEq] = useState("2x^2 + 3x - 20 = 0");
  return (
    <div className="max-w-4xl">
      <PageHeader crumbs={[{ label: "Playground", to: "/app/playground" }, { label: "Math Solver" }]} eyebrow="Tool" title="Math Solver" description="Type any equation. We'll factor, expand, integrate, differentiate." />

      <div className="rounded-3xl border border-border bg-card p-6">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Enter an equation</label>
        <div className="mt-3 flex gap-2">
          <div className="flex-1 flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3">
            <Calculator className="h-4 w-4 text-muted-foreground" />
            <input value={eq} onChange={(e) => setEq(e.target.value)} className="flex-1 bg-transparent font-mono text-sm outline-none" />
          </div>
          <button className="rounded-2xl bg-accent px-6 text-sm font-semibold text-accent-foreground">Solve</button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {["x^2 + 5x = 6", "d/dx (3x^2 + 2x)", "∫(2x + 1)dx", "sin(x) = 0.5"].map((s) => (
            <button key={s} onClick={() => setEq(s)} className="rounded-full bg-secondary px-3 py-1 font-mono">{s}</button>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-3xl bg-foreground text-background p-6">
        <p className="text-xs uppercase tracking-wider text-background/60">Solution</p>
        <p className="mt-3 font-display text-3xl font-extrabold">x = 5/2 or x = −4</p>
        <pre className="mt-5 rounded-xl bg-background/10 p-4 font-mono text-xs leading-relaxed text-background/90">
{`Step 1: a = 2, b = 3, c = −20
Step 2: discriminant = 3² − 4(2)(−20) = 169
Step 3: x = (−3 ± √169) / (2·2) = (−3 ± 13) / 4
Step 4: x = 10/4 = 5/2  or  x = −16/4 = −4`}
        </pre>
      </div>
    </div>
  );
}
