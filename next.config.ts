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
    // Photos added in one save total at most 4 MB (see lib/attachments.ts); web hosts cap requests at about 4.5 MB.
    serverActions: { bodySizeLimit: "5mb" },
    proxyClientMaxBodySize: "5mb",
  },
};

export default nextConfig;
