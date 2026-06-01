import ky from 'ky';

// Bare instance — no hooks, used for refresh + post-refresh retry
export const bareHttp = ky.create({
  prefixUrl: process.env.NEXT_PUBLIC_API_URL,
  credentials: 'include',
  retry: { limit: 0 },
});

// Main client — hooks wired in PR3
export const http = ky.create({
  prefixUrl: process.env.NEXT_PUBLIC_API_URL,
  credentials: 'include',
  retry: { limit: 0 },
});
