import { Link } from "react-router-dom";
import { CheckCircle2, Sparkles } from "lucide-react";

export default function CheckoutSuccess() {
  return (
    <div className="min-h-dvh flex items-center justify-center px-6 py-12 bg-background">
      <div className="max-w-lg text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success text-success-foreground">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-success">Payment received</p>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight">Welcome to prepcify Pro</h1>
        <p className="mt-3 text-muted-foreground">Receipt sent to your email. Pro perks are unlocked across the app right now.</p>
        <div className="mt-8 rounded-2xl bg-foreground text-background p-5 text-left flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-accent" />
          <p className="text-sm">Try the unlocked features — full past papers archive and unlimited AI tutor.</p>
        </div>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/app/past-questions" className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-accent-foreground">Browse past questions</Link>
          <Link to="/app" className="rounded-full bg-secondary px-6 py-2.5 text-sm font-semibold">Back to dashboard</Link>
        </div>
      </div>
    </div>
  );
}
