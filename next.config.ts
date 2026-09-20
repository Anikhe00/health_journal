import type { NextConfig } from "next";

// A share link is a secret. These headers keep it out of caches, search engines and Referer headers.
const secretLinkHeaders = [
  { key: "Cache-Control", value: "private, no-store, max-age=0" },
  { key: "X-Robots-Tag", value: "noindex, nofollow" },
  { key: "Referrer-Policy", value: "no-referrer" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: "/share/:token", headers: secretLinkHeaders },
      { source: "/api/share/:path*", headers: secretLinkHeaders },
    ];
  },
  experimental: {
    // Entries can carry up to 5 photos of 5 MB each (see lib/attachments.ts).
    // The browser shrinks photos before upload, so real requests are much smaller.
    serverActions: { bodySizeLimit: "30mb" },
    proxyClientMaxBodySize: "30mb",
  },
};

export default nextConfig;
