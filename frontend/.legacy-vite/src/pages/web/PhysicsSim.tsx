import { useEffect, useRef, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Play, Pause } from "lucide-react";

export default function PhysicsSim() {
  const [running, setRunning] = useState(true);
  const yRef = useRef(20);
  const vRef = useRef(0);
  const [, force] = useState(0);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      vRef.current += 0.4; // gravity
      yRef.current += vRef.current;
      if (yRef.current > 280) {
        yRef.current = 280;
        vRef.current = -vRef.current * 0.7; // bounce dampening
      }
      force((n) => n + 1);
    }, 30);
    return () => clearInterval(id);
  }, [running]);

  return (
    <div className="max-w-5xl">
      <PageHeader crumbs={[{ label: "Playground", to: "/app/playground" }, { label: "Physics" }]} eyebrow="Tool" title="Physics Simulator" description="Watch a ball bounce under gravity. More scenes coming." />

      <div className="rounded-3xl bg-card border border-border p-4">
        <svg viewBox="0 0 600 320" className="w-full h-auto">
          <rect x={0} y={0} width={600} height={320} className="fill-secondary" />
          <line x1={0} y1={300} x2={600} y2={300} className="stroke-foreground" strokeWidth="2" />
          <circle cx={300} cy={yRef.current} r={20} className="fill-accent" />
        </svg>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button onClick={() => setRunning((r) => !r)} className="flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background">
          {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {running ? "Pause" : "Play"}
        </button>
        <button onClick={() => { yRef.current = 20; vRef.current = 0; }} className="rounded-full bg-secondary px-5 py-2.5 text-sm font-semibold">Reset</button>
      </div>
    </div>
  );
}
