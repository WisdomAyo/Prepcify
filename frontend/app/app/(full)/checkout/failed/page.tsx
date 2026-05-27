import Link from "next/link";
import { XCircle } from "lucide-react";

export default function CheckoutFailedPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-6 py-12">
      <div className="max-w-lg text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-destructive text-destructive-foreground">
          <XCircle className="h-10 w-10" />
        </div>
        <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-destructive">
          Payment declined
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">
          Something went wrong
        </h1>
        <p className="mt-3 text-muted-foreground">
          Your bank declined the charge. No money was taken. Try a different
          card or contact your bank.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/app/checkout"
            className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-accent-foreground"
          >
            Try again
          </Link>
          <Link
            href="/app/pricing"
            className="rounded-full bg-secondary px-6 py-2.5 text-sm font-semibold"
          >
            Choose another plan
          </Link>
        </div>
      </div>
    </div>
  );
}
