import { Link } from "react-router-dom";
import { Crown, CreditCard, Calendar } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

export default function SettingsSubscription() {
  return (
    <div className="max-w-2xl">
      <PageHeader crumbs={[{ label: "Settings", to: "/app/settings" }, { label: "Subscription" }]} eyebrow="Settings" title="Subscription" />

      <div className="rounded-3xl bg-foreground text-background p-6 mb-5">
        <div className="flex items-center gap-3">
          <Crown className="h-5 w-5 text-accent" />
          <p className="text-xs uppercase tracking-wider text-background/60">Current plan</p>
        </div>
        <p className="mt-3 font-display text-3xl font-extrabold">prepcify Pro · Monthly</p>
        <p className="mt-1 text-sm text-background/70">₦2,400 / month · renews May 18, 2026</p>
        <div className="mt-5 flex gap-3">
          <Link to="/app/pricing" className="rounded-full bg-accent px-5 py-2 text-xs font-semibold text-accent-foreground">Change plan</Link>
          <button className="rounded-full bg-background/10 px-5 py-2 text-xs font-semibold">Cancel subscription</button>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="font-semibold flex items-center gap-2"><CreditCard className="h-4 w-4" /> Payment method</p>
          <button className="text-xs font-semibold text-accent">Update</button>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-secondary p-4">
          <div className="flex h-9 w-12 items-center justify-center rounded-md bg-foreground text-background text-[10px] font-bold">VISA</div>
          <div>
            <p className="text-sm">•••• •••• •••• 4242</p>
            <p className="text-xs text-muted-foreground">Expires 09/27</p>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-3xl border border-border bg-card p-6">
        <p className="font-semibold flex items-center gap-2 mb-4"><Calendar className="h-4 w-4" /> Billing history</p>
        <div className="space-y-2 text-sm">
          {["Apr 18, 2026", "Mar 18, 2026", "Feb 18, 2026"].map((d) => (
            <div key={d} className="flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-secondary/40">
              <span>{d}</span>
              <span className="text-muted-foreground">₦2,400</span>
              <button className="text-xs font-semibold text-accent">Receipt</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
