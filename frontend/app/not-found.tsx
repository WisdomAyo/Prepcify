import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

/** Global 404 — rendered for any unmatched route. */
export default function NotFound() {
  return (
    <main
      id="main-content"
      className="flex min-h-dvh flex-col items-center justify-center bg-cloud px-6 text-center"
    >
      <p className="font-display text-[120px] font-bold leading-none tracking-tight text-foreground/10">
        404
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">
        We couldn&apos;t find that page
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        The link may be broken, or the page may have moved. Let&apos;s get you
        back on track.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild size="lg">
          <Link href="/">Back to home</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/app">Open the app</Link>
        </Button>
      </div>
    </main>
  );
}
