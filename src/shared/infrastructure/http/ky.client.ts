import ky from 'ky';
import { refreshTokenOnce } from '@/core/auth/infrastructure/http/refresh-mutex';
import { useAuthStore } from '@/core/auth/infrastructure/store/auth.store';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const AUTH_SKIP = ['auth/login', 'auth/register'];
const SPACE_SKIP = 'auth/';

// Bare instance — no hooks. Used for refresh and post-401 retry to avoid recursion.
export const bareHttp = ky.create({
  baseUrl: BASE_URL,
  credentials: 'include',
  retry: { limit: 0 },
});

async function doRefresh(): Promise<string> {
  const res = await bareHttp.post('auth/refresh').json<{ accessToken: string }>();
  useAuthStore.getState().setAccessToken(res.accessToken);
  return res.accessToken;
}

export const http = ky.create({
  baseUrl: BASE_URL,
  credentials: 'include',
  retry: { limit: 0 },
  hooks: {
    beforeRequest: [
      ({ request }) => {
        const path = new URL(request.url).pathname.replace(/^\//, '');
        if (AUTH_SKIP.some((p) => path.endsWith(p))) return;
        const token = useAuthStore.getState().accessToken;
        if (token) request.headers.set('Authorization', `Bearer ${token}`);
      },
      ({ request }) => {
        const path = new URL(request.url).pathname.replace(/^\//, '');
        if (path.startsWith(SPACE_SKIP)) return;
        const spaceId = (globalThis as Record<string, unknown>).__activeSpaceId as string | undefined;
        if (spaceId) request.headers.set('X-Space-ID', spaceId);
      },
    ],
    afterResponse: [
      async ({ request, response }) => {
        if (response.status !== 401) return response;

        const path = new URL(request.url).pathname.replace(/^\//, '');

        if (path.endsWith('auth/refresh')) {
          useAuthStore.getState().clearAuth();
          return response;
        }
        if (AUTH_SKIP.some((p) => path.endsWith(p))) return response;

        const newToken = await refreshTokenOnce(doRefresh);
        if (!newToken) {
          useAuthStore.getState().clearAuth();
          return response;
        }

        const headers = new Headers(request.headers);
        headers.set('Authorization', `Bearer ${newToken}`);
        return bareHttp(request.url, {
          method: request.method,
          headers,
          body: request.body,
          credentials: 'include',
        });
      },
    ],
  },
});
