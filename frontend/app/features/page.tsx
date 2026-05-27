import { MarketingPageShell } from "@/components/marketing/marketing-page-shell";
import { FeaturesHeroSection } from "@/components/marketing/features/features-hero-section";
import {
  LazyFeaturesSection,
  LazyHabitSection,
  LazyStatsSection,
} from "@/components/marketing/lazy-landing-sections";

export default function FeaturesPage() {
  return (
    <MarketingPageShell className="bg-[#dff8dc]">
      <FeaturesHeroSection />
      <LazyFeaturesSection />
      <LazyHabitSection />
      <LazyStatsSection />
    </MarketingPageShell>
  );
}
