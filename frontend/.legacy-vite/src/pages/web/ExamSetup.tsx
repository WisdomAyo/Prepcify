import { Link } from "react-router-dom";
import { useState } from "react";
import { Clock, ShieldCheck, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { cn } from "@/lib/utils";

const exams = ["JAMB UTME", "WAEC SSCE", "NECO SSCE", "Cambridge IGCSE"];
const durations = [60, 90, 120, 180];

export default function ExamSetup() {
  const [exam, setExam] = useState("JAMB UTME");
  const [duration, setDuration] = useState(120);

  return (
    <div className="max-w-4xl">
      <PageHeader eyebrow="Mock exam" title="Configure your simulation" description="Real timing, real navigator, real pressure. Just like the actual CBT." />

      <div className="rounded-3xl border border-border bg-card p-6 lg:p-8 space-y-8">
        <div>
          <label className="text-sm font-semibold">Exam body</label>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {exams.map((e) => (
              <button
                key={e}
                onClick={() => setExam(e)}
                className={cn(
                  "rounded-2xl border-2 p-4 text-left transition-colors",
                  exam === e ? "border-foreground bg-secondary/40" : "border-border"
                )}
              >
                <p className="font-semibold">{e}</p>
                <p className="text-xs text-muted-foreground">Full subject mix · 60–180 min</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold">Duration</label>
          <div className="mt-3 flex flex-wrap gap-2">
            {durations.map((d) => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className={cn(
                  "rounded-2xl px-5 py-2.5 text-sm font-semibold transition-colors flex items-center gap-2",
                  duration === d ? "bg-foreground text-background" : "bg-secondary"
                )}
              >
                <Clock className="h-4 w-4" /> {d} min
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-accent/10 border border-accent/20 p-5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-accent" />
            <p className="text-xs font-semibold text-accent uppercase tracking-wider">Exam rules</p>
          </div>
          <ul className="mt-3 space-y-1.5 text-sm">
            <li>• You cannot pause once started.</li>
            <li>• Auto-submit at time-up. Make sure your network is stable.</li>
            <li>• Use the navigator to flag and revisit questions.</li>
          </ul>
        </div>

        <div className="flex justify-end border-t border-border pt-6">
          <Link to="/app/exam" className="flex items-center gap-2 rounded-full bg-accent px-7 py-3 text-sm font-semibold text-accent-foreground">
            I'm ready · Start <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
