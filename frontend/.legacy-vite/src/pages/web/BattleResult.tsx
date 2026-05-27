import { Link } from "react-router-dom";
import { Trophy, Flame, Zap } from "lucide-react";

export default function BattleResult() {
  return (
    <div className="min-h-dvh bg-background flex items-center justify-center px-6 py-12">
      <div className="max-w-2xl w-full text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <Trophy className="h-12 w-12" />
        </div>
        <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">Victory</p>
        <h1 className="mt-2 font-display text-5xl font-extrabold tracking-tight">You won 8–6</h1>
        <p className="mt-3 text-muted-foreground">Beautiful close-out on the calculus question. Tomi A. didn't see it coming.</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-card border border-border p-5">
            <Zap className="mx-auto h-5 w-5 text-accent" />
            <p className="mt-2 font-display text-2xl font-extrabold">+85 XP</p>
            <p className="text-xs text-muted-foreground">Match reward</p>
          </div>
          <div className="rounded-2xl bg-card border border-border p-5">
            <Trophy className="mx-auto h-5 w-5 text-accent" />
            <p className="mt-2 font-display text-2xl font-extrabold">+12 RR</p>
            <p className="text-xs text-muted-foreground">Rank rating</p>
          </div>
          <div className="rounded-2xl bg-foreground text-background p-5">
            <Flame className="mx-auto h-5 w-5 text-accent" />
            <p className="mt-2 font-display text-2xl font-extrabold">3 streak</p>
            <p className="text-xs text-background/60">Battle streak</p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/app/battles" className="rounded-full bg-secondary px-6 py-2.5 text-sm font-semibold">
            Back to lobby
          </Link>
          <Link to="/app/battles/live" className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-accent-foreground">
            Rematch
          </Link>
        </div>
      </div>
    </div>
  );
}
