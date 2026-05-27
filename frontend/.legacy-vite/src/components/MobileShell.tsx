import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";

/**
 * MobileShell — phone-frame container shown on desktop, full-bleed on mobile.
 * Provides the consistent device chrome and bottom navigation for the app routes.
 */
export function MobileShell() {
  return (
    <div className="min-h-dvh w-full bg-background md:bg-secondary/40">
      <div className="phone-frame flex flex-col">
        <main className="flex-1 overflow-y-auto scroll-hide">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
