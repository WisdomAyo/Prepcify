import { Link } from "react-router-dom";
import { Lock, CreditCard, Check } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

export default function Checkout() {
  return (
    <div className="max-w-5xl">
      <PageHeader eyebrow="Checkout" title="Complete your purchase" description="Secure payment via Paystack. Cancel any time." />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <form className="rounded-3xl border border-border bg-card p-6 space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</label>
            <input className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-foreground" defaultValue="adaeze@email.com" />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Card number</label>
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-3">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <input className="flex-1 bg-transparent text-sm outline-none" placeholder="4242 4242 4242 4242" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Expiry</label>
              <input className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none" placeholder="MM / YY" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">CVC</label>
              <input className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none" placeholder="123" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name on card</label>
            <input className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none" placeholder="Adaeze N." />
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5" /> Encrypted end-to-end. We never store your card.
          </div>
          <div className="flex gap-3 pt-2">
            <Link to="/app/checkout/success" className="flex-1 rounded-full bg-accent px-5 py-3 text-center text-sm font-semibold text-accent-foreground">
              Pay ₦2,400
            </Link>
            <Link to="/app/checkout/failed" className="rounded-full bg-secondary px-5 py-3 text-sm font-semibold">
              Simulate fail
            </Link>
          </div>
        </form>

        <aside className="rounded-3xl bg-foreground text-background p-6 h-fit">
          <p className="text-xs uppercase tracking-wider text-background/60">Order summary</p>
          <p className="mt-3 font-display text-2xl font-extrabold">prepcify Pro · Monthly</p>
          <ul className="mt-5 space-y-2 text-sm text-background/80">
            <li className="flex items-start gap-2"><Check className="h-4 w-4 mt-0.5 text-accent" /> Unlimited questions</li>
            <li className="flex items-start gap-2"><Check className="h-4 w-4 mt-0.5 text-accent" /> Unlimited AI tutor</li>
            <li className="flex items-start gap-2"><Check className="h-4 w-4 mt-0.5 text-accent" /> Full past papers archive</li>
          </ul>
          <div className="mt-6 border-t border-background/10 pt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-background/60">Subtotal</span><span>₦2,400</span></div>
            <div className="flex justify-between"><span className="text-background/60">VAT</span><span>₦0</span></div>
            <div className="flex justify-between font-bold pt-2 border-t border-background/10"><span>Total</span><span>₦2,400</span></div>
          </div>
        </aside>
      </div>
    </div>
  );
}
