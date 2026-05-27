"use client";

import { useState } from "react";
import { LandingNavbar } from "./landing-navbar";
import { LandingFooter } from "./landing-footer";
import { HeroSection } from "./landing/hero-section";
import {
  FaqSection,
  FeedbackSection,
  InteractionStrip,
  MarketplaceSection,
  PricingSection,
  StatsSection,
  TrustedStudentsStrip,
  WorkflowSection,
} from "./landing/sections";

/** Marketing landing page. Each major section lives in a named component so
 * the page stays easy to scan, review, and extend. */
export function Landing() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-dvh overflow-x-clip text-slate-50">
      <LandingNavbar />
      <main id="main-content">
        <HeroSection />
        <InteractionStrip />
        <MarketplaceSection />
        <WorkflowSection />
        <StatsSection />
        <FeedbackSection />
        <TrustedStudentsStrip />
        <PricingSection />
        <FaqSection openFaq={openFaq} setOpenFaq={setOpenFaq} />
      </main>
      <LandingFooter showNewsletter />
    </div>
  );
}
