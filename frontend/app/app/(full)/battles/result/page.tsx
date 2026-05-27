import Link from "next/link";
import { Trophy, Flame, Zap } from "lucide-react";

export default function BattleResultPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-2xl text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <Trophy className="h-12 w-12" />
        </div>
        <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
          Victory
        </p>
        <h1 className="mt-2 font-display text-5xl font-bold tracking-tight">
          You won 8–6
        </h1>
        <p className="mt-3 text-muted-foreground">
          Beautiful close-out on the calculus question. Tomi A. didn&apos;t see
          it coming.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-5">
            <Zap className="mx-auto h-5 w-5 text-accent" />
            <p className="mt-2 font-display text-2xl font-bold">+85 XP</p>
            <p className="text-xs text-muted-foreground">Match reward</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <Trophy className="mx-auto h-5 w-5 text-accent" />
            <p className="mt-2 font-display text-2xl font-bold">+12 RR</p>
            <p className="text-xs text-muted-foreground">Rank rating</p>
          </div>
          <div className="rounded-2xl bg-foreground p-5 text-background">
            <Flame className="mx-auto h-5 w-5 text-accent" />
            <p className="mt-2 font-display text-2xl font-bold">3 streak</p>
            <p className="text-xs text-background/60">Battle streak</p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/app/battles"
            className="rounded-full bg-secondary px-6 py-2.5 text-sm font-semibold"
          >
            Back to lobby
          </Link>
          <Link
            href="/app/battles/live"
            className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-accent-foreground"
          >
            Rematch
          </Link>
        </div>
      </div>
    </div>
  );
}
