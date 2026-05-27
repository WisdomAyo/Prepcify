import { cn } from "@/lib/utils";

export function PerspectiveGrid({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-x-0 top-0 h-[34rem] overflow-hidden", className)} aria-hidden>
      <div className="absolute left-1/2 top-[-10.5rem] h-[42rem] w-[128rem] -translate-x-1/2 bg-[linear-gradient(90deg,rgba(15,23,42,0.08)_1px,transparent_1px),linear-gradient(rgba(15,23,42,0.08)_1px,transparent_1px)] bg-[size:48px_48px] opacity-70 [mask-image:linear-gradient(to_bottom,black_0%,black_58%,transparent_100%)] [transform:perspective(620px)_rotateX(62deg)]" />
      <div className="absolute left-[22%] top-[19.5rem] h-px w-20 -rotate-[15deg] bg-emerald-500/70" />
      <div className="absolute left-[42%] top-[24rem] h-12 w-px rotate-[20deg] bg-emerald-500/65" />
      <div className="absolute right-[24%] top-[20.5rem] h-px w-20 rotate-[16deg] bg-emerald-500/70" />
    </div>
  );
}

export function MarketingPill({
  label,
  text,
}: {
  label: string;
  text: string;
}) {
  return (
    <div className="inline-flex items-center rounded-full border border-slate-200 bg-white p-1 text-xs shadow-[0_14px_36px_-30px_rgba(15,23,42,0.55)]">
      <span className="rounded-full bg-slate-950 px-4 py-2 font-bold text-white">
        {label}
      </span>
      <span className="flex items-center gap-2 px-3 font-semibold text-slate-950">
        {text}
        <span aria-hidden>→</span>
      </span>
    </div>
  );
}
