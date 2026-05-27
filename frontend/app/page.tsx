import type { Metadata } from "next";
import { Landing } from "@/components/marketing/landing";
import { faqs } from "@/components/marketing/faqs";
import { JsonLd } from "@/components/json-ld";
import { createMetadata, homeJsonLd, faqJsonLd } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Pass your exams, the smarter way",
  path: "/",
});

/**
 * Marketing home page (Server Component).
 *
 * Exports `metadata` for SEO and emits Organization / WebSite / SoftwareApp /
 * FAQ structured data. The interactive UI lives in the `<Landing>` Client
 * Component, but its markup is still server-rendered, so all copy is indexed.
 */
export default function HomePage() {
  return (
    <main id="main-content">
      <JsonLd data={[...homeJsonLd(), faqJsonLd(faqs)]} />
      <Landing />
    </main>
  );
}
