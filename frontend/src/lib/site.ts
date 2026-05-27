/**
 * Central site configuration — the single source of truth for SEO metadata,
 * sitemap generation, and structured data.
 */
export const siteConfig = {
  name: "Pasa",
  title: "Pasa — Pass your exams, the smarter way",
  description:
    "The calm, beautiful study app for WAEC, JAMB, NECO, ICAN, Cambridge and beyond. A daily study plan, an AI tutor, and mock exams that feel real.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ogImage: "/og/pasa-og.png",
  locale: "en_NG",
  twitter: "@pasa",
  keywords: [
    "WAEC",
    "JAMB",
    "NECO",
    "ICAN",
    "Cambridge IGCSE",
    "exam preparation",
    "past questions",
    "AI tutor",
    "mock exams",
    "Nigerian students",
  ],
  links: {
    twitter: "https://twitter.com/pasa",
  },
} as const;

export type SiteConfig = typeof siteConfig;

/** Build an absolute URL from a path, respecting the configured site origin. */
export function absoluteUrl(path: string): string {
  const base = siteConfig.url.replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
