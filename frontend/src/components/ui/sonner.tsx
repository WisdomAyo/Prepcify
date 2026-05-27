"use client";

import { Toaster as SonnerToaster } from "sonner";

/**
 * Toaster — global toast host. Mounted once in `<Providers>`.
 * Trigger toasts anywhere with `import { toast } from "sonner"`.
 */
export function Toaster() {
  return (
    <SonnerToaster
      position="top-center"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "rounded-2xl border border-border bg-card text-card-foreground shadow-pop",
          description: "text-muted-foreground",
        },
      }}
    />
  );
}
