import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/media/:path*',
        destination: '/_next/static/media/:path*',
      },
    ];
  },
};

export default nextConfig;
