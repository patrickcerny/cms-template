import type { NextConfig } from "next";

// Keep this in sync with `defaultLocale` (the first entry in src/i18n/config.ts).
const DEFAULT_LOCALE = "en";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    // Send the bare root to the default locale.
    return [{ source: "/", destination: `/${DEFAULT_LOCALE}`, permanent: false }];
  },
  async headers() {
    return [
      {
        // Admin routes should never be indexed.
        source: "/admin(.*)",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
