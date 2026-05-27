import type { Metadata, Viewport } from "next";
import { siteConfig } from "@/lib/site";
import { QueryProvider } from "@/components/providers";
import "./globals.css";

/**
 * Fonts are resolved through a CSS variable in `globals.css` so production
 * builds do not depend on fetching Google Fonts at compile time.
 */

/**
 * Default, site-wide metadata. Per-page metadata (see each `page.tsx`)
 * overrides `title`/`description` and is merged with these defaults.
 */
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [...siteConfig.keywords],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  manifest: "/manifest.webmanifest",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    url: siteConfig.url,
    locale: siteConfig.locale,
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    site: siteConfig.twitter,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        {/* Skip link — keyboard users can jump past the chrome to content. */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-foreground focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-background"
        >
          Skip to content
        </a>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
