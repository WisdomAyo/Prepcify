import { MarketingPageShell } from "@/components/marketing/marketing-page-shell";
import { FaqPageSection } from "@/components/marketing/faqs/faq-page-section";

export default function FaqsPage() {
  return (
    <MarketingPageShell className="bg-white">
      <FaqPageSection />
    </MarketingPageShell>
  );
}
