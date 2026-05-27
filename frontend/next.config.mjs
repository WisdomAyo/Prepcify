/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV !== "production";

/**
 * Static security headers — Content-Security-Policy is **not** here; it is
 * issued per-request by `middleware.ts` with a fresh nonce. The rest of the
 * headers don't change per request and are cheaper to set at the edge config
 * layer.
 */
const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: [
      "accelerometer=()",
      "camera=()",
      "geolocation=()",
      "gyroscope=()",
      "magnetometer=()",
      "microphone=()",
      "payment=(self)",
      "usb=()",
      "interest-cohort=()",
    ].join(", "),
  },
  // HSTS only matters over HTTPS — emit in prod only.
  ...(isDev
    ? []
    : [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]),
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
];

const IMMUTABLE_HEADERS = [
  { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,

  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@phosphor-icons/react",
      "react-icons",
      "recharts",
      "date-fns",
      "framer-motion",
    ],
  },

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: SECURITY_HEADERS,
      },
      {
        source: "/_next/static/(.*)",
        headers: IMMUTABLE_HEADERS,
      },
      {
        source: "/assets/(.*)",
        headers: IMMUTABLE_HEADERS,
      },
    ];
  },
};

export default nextConfig;
