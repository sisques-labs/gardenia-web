import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    const internalApiUrl = process.env.INTERNAL_API_URL ?? 'http://localhost:3000';
    return [
      { source: '/api/:path*', destination: `${internalApiUrl}/api/:path*` },
      { source: '/graphql', destination: `${internalApiUrl}/graphql` },
    ];
  },
};

export default nextConfig;
