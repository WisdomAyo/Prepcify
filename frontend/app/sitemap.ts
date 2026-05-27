import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

/**
 * XML sitemap, served at /sitemap.xml.
 * Only public, indexable routes are listed — the authenticated `/app` and
 * `/admin` areas are intentionally excluded.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "/", priority: 1, freq: "weekly" },
    { path: "/login", priority: 0.5, freq: "yearly" },
    { path: "/signup", priority: 0.8, freq: "monthly" },
    { path: "/forgot-password", priority: 0.3, freq: "yearly" },
  ];

  return routes.map(({ path, priority, freq }) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency: freq,
    priority,
  }));
}
