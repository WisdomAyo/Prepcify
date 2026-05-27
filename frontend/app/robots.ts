import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

/**
 * robots.txt, served at /robots.txt.
 * Crawlers may index marketing/auth pages but not the private app surfaces.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/app", "/admin", "/api"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
