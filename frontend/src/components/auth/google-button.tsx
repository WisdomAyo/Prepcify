"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/**
 * GoogleButton — social sign-in entry point.
 *
 * The original Vite app used Lovable Cloud OAuth. The Laravel backend does
 * not (yet) expose a Google OAuth endpoint, so this surfaces a clear
 * "coming soon" message instead of failing silently. Wire it to
 * `GET /api/v1/auth/google/redirect` once that route exists.
 */
export function GoogleButton({
  label = "Continue with Google",
}: {
  label?: string;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      className="w-full justify-center gap-3 rounded-2xl bg-card hover:bg-secondary"
      onClick={() =>
        toast.info("Google sign-in is coming soon", {
          description: "Please continue with your email for now.",
        })
      }
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#EA4335"
          d="M12 10.2v3.96h5.52c-.24 1.32-1.68 3.84-5.52 3.84-3.32 0-6.04-2.76-6.04-6.16S8.68 5.68 12 5.68c1.88 0 3.16.8 3.88 1.48l2.64-2.56C16.84 3.04 14.64 2 12 2 6.92 2 2.8 6.12 2.8 11.2S6.92 20.4 12 20.4c6.92 0 9.52-4.84 9.52-7.36 0-.5-.04-.88-.12-1.24H12z"
        />
      </svg>
      <span className="font-semibold">{label}</span>
    </Button>
  );
}
