import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Entries can carry up to 5 photos of 5 MB each (see lib/attachments.ts).
    // The browser shrinks photos before upload, so real requests are much smaller.
    serverActions: { bodySizeLimit: "30mb" },
    proxyClientMaxBodySize: "30mb",
  },
};

export default nextConfig;
