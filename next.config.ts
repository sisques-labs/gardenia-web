import type { NextConfig } from 'next';

function getRemotePatternsFromApiUrl(apiUrl?: string) {
  if (!apiUrl) return [];

  try {
    const u = new URL(apiUrl);
    const protocol = u.protocol.replace(':', '');
    const hostname = u.hostname;

    return [
      {
        protocol,
        hostname,
        pathname: '/api/files/*/content',
      },
      {
        protocol,
        hostname,
        pathname: '/files/*/content',
      },
    ] as const;
  } catch {
    return [];
  }
}

const remotePatterns = [
  // Local dev: file content is often served by the same API origin.
  { protocol: 'http', hostname: 'localhost', pathname: '/api/files/*/content' },
  { protocol: 'http', hostname: 'localhost', pathname: '/files/*/content' },
  { protocol: 'http', hostname: '127.0.0.1', pathname: '/api/files/*/content' },
  { protocol: 'http', hostname: '127.0.0.1', pathname: '/files/*/content' },

  // Also allow HTTPS equivalents (some setups terminate TLS locally).
  {
    protocol: 'https',
    hostname: 'localhost',
    pathname: '/api/files/*/content',
  },
  { protocol: 'https', hostname: 'localhost', pathname: '/files/*/content' },
  {
    protocol: 'https',
    hostname: '127.0.0.1',
    pathname: '/api/files/*/content',
  },
  { protocol: 'https', hostname: '127.0.0.1', pathname: '/files/*/content' },

  ...getRemotePatternsFromApiUrl(process.env.NEXT_PUBLIC_API_URL),
];

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    // `remotePatterns` is supported by Next.js at runtime; we keep typing loose here
    // because the NextConfig type surface varies across versions.
    remotePatterns,
  } as unknown as NextConfig['images'],
};

export default nextConfig;
