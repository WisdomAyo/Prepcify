import type { Metadata } from "next";
import { siteConfig, absoluteUrl } from "./site";

interface PageSeoInput {
  title: string;
  description?: string;
  /** Path beginning with "/", used for the canonical URL. */
  path: string;
  /** Override the social share image (absolute or root-relative path). */
  image?: string;
  /** Set true for auth/app pages that must not be indexed. */
  noIndex?: boolean;
  keywords?: string[];
}

/**
 * Build a complete `Metadata` object for a route — canonical URL, Open Graph,
 * and Twitter cards included. Keeps per-page `generateMetadata` calls to a
 * couple of lines and guarantees every page ships consistent SEO tags.
 */
export function createMetadata({
  title,
  description = siteConfig.description,
  path,
  image = siteConfig.ogImage,
  noIndex = false,
  keywords,
}: PageSeoInput): Metadata {
  const url = absoluteUrl(path);
  const ogImage = image.startsWith("http") ? image : absoluteUrl(image);

  return {
    title,
    description,
    keywords: keywords ?? [...siteConfig.keywords],
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      title,
      description,
      url,
      locale: siteConfig.locale,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

/**
 * JSON-LD structured data for the marketing home page.
 * Helps search engines understand the brand and the product offering.
 */
export function homeJsonLd() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
      logo: absoluteUrl("/icon.png"),
      sameAs: [siteConfig.links.twitter],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: siteConfig.name,
      url: siteConfig.url,
      potentialAction: {
        "@type": "SearchAction",
        target: `${siteConfig.url}/app/past-questions?q={query}`,
        "query-input": "required name=query",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: siteConfig.name,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web, iOS, Android",
      description: siteConfig.description,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "NGN",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        ratingCount: "8200",
      },
    },
  ];
}

/** Build a FAQPage JSON-LD block from question/answer pairs. */
export function faqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
