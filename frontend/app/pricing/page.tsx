import type { Metadata } from "next";
import { MarketingPageShell } from "@/components/marketing/marketing-page-shell";
import { PricingPageSection } from "@/components/marketing/pricing/pricing-page-section";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Pricing — prepcify",
  description:
    "Plans for every prepcify learner — free forever, Pro for serious prep, and School for class-wide enrolment. Live pricing from the prepcify API.",
  path: "/pricing",
});

/** Public pricing page. Static shell with an interactive pricing client section. */
export const revalidate = 3600;

export default function PricingPage() {
  return (
    <MarketingPageShell className="bg-white">
      <PricingPageSection />
    </MarketingPageShell>
  );
}
