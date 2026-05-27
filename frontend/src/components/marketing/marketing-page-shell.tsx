import { LandingNavbar } from "./landing-navbar";
import { LandingFooter } from "./landing-footer";
import { cn } from "@/lib/utils";

export function MarketingPageShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-h-dvh overflow-x-clip text-slate-50", className)}>
      <LandingNavbar />
      <main id="main-content">{children}</main>
      <LandingFooter />
    </div>
  );
}
