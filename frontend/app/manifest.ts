import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

/**
 * PWA manifest, served at /manifest.webmanifest.
 * Makes the app installable on mobile home screens.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.title,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: "/app",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#3D8BFF",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
