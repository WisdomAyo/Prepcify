import { MarketingPageShell } from "@/components/marketing/marketing-page-shell";
import { ContactPageSection } from "@/components/marketing/contact/contact-page-section";

export default function ContactPage() {
  return (
    <MarketingPageShell className="bg-white">
      <ContactPageSection />
    </MarketingPageShell>
  );
}
