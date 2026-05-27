import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BattleLive() {
  const [time, setTime] = useState(15);
  const [picked, setPicked] = useState<string | null>(null);
  useEffect(() => {
    const id = setInterval(() => setTime((t) => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-dvh bg-foreground text-background flex flex-col">
      {/* Top scoreboard */}
      <header className="grid grid-cols-3 items-center gap-4 px-6 lg:px-12 py-5 border-b border-background/10">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-accent-foreground font-bold">YO</div>
          <div>
            <p className="text-sm font-semibold">You</p>
            <p className="text-xs text-background/60">Gold III</p>
          </div>
          <p className="ml-3 font-display text-2xl font-extrabold text-accent">5</p>
        </div>
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-background/10 px-4 py-1.5 text-xs">
            <Clock className="h-3.5 w-3.5 text-accent" />
            Question 6 of 10
          </div>
          <p className="mt-2 font-display text-5xl font-extrabold">{time}s</p>
        </div>
        <div className="flex items-center gap-3 justify-end">
          <p className="mr-3 font-display text-2xl font-extrabold">3</p>
          <div className="text-right">
            <p className="text-sm font-semibold">Tomi A.</p>
            <p className="text-xs text-background/60">Gold II</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky text-sky-foreground font-bold">TA</div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 lg:px-12 py-10">
        <div className="w-full max-w-2xl">
          <p className="text-center text-xs uppercase tracking-[0.2em] text-background/50 mb-4">Mathematics · Algebra</p>
          <h1 className="font-display text-3xl lg:text-4xl font-extrabold text-center leading-tight">
            What is the value of x in <span className="rounded-md bg-background/10 px-3 py-1 font-mono">3x − 7 = 14</span>?
          </h1>

          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {[
              { k: "A", v: "x = 5" },
              { k: "B", v: "x = 7" },
              { k: "C", v: "x = 9" },
              { k: "D", v: "x = 21" },
            ].map((o) => (
              <button
                key={o.k}
                onClick={() => setPicked(o.k)}
                className={cn(
                  "rounded-2xl border-2 p-5 text-left transition-all",
                  picked === o.k ? "border-accent bg-accent/10" : "border-background/10 hover:border-background/30"
                )}
              >
                <span className="font-display text-xl font-extrabold text-accent">{o.k}</span>
                <p className="mt-2 text-sm">{o.v}</p>
              </button>
            ))}
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-background/60">
            <Zap className="h-3.5 w-3.5 text-accent" />
            Lock in fast — speed bonus applies.
          </div>
        </div>
      </main>

      <footer className="border-t border-background/10 px-6 lg:px-12 py-4 flex justify-end">
        <Link to="/app/battles/result" className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-accent-foreground">
          End match
        </Link>
      </footer>
    </div>
  );
}
