import axios from 'axios';
import { refreshTokenOnce } from '@/core/auth/infrastructure/http/refresh-mutex';
import { useAuthStore } from '@/core/auth/infrastructure/store/auth.store';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const AUTH_SKIP = ['/auth/login', '/auth/register'];
const SPACE_SKIP = '/auth/';

// Bare instance — no interceptors. Used for refresh and post-401 retry.
export const bareHttp = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

async function doRefresh(): Promise<string> {
  const res = await bareHttp.post<{ accessToken: string }>('/auth/refresh');
  useAuthStore.getState().setAccessToken(res.data.accessToken);
  return res.data.accessToken;
}

export const http = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

http.interceptors.request.use((config) => {
  const path = config.url ?? '';
  if (!AUTH_SKIP.some((p) => path.endsWith(p))) {
    const token = useAuthStore.getState().accessToken;
    if (token) config.headers.set('Authorization', `Bearer ${token}`);
  }
  if (!path.startsWith(SPACE_SKIP)) {
    const spaceId = (globalThis as Record<string, unknown>).__activeSpaceId as string | undefined;
    if (spaceId) config.headers.set('X-Space-ID', spaceId);
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    const path = originalRequest.url ?? '';
    if (path.endsWith('/auth/refresh')) {
      useAuthStore.getState().clearAuth();
      return Promise.reject(error);
    }
    if (AUTH_SKIP.some((p) => path.endsWith(p))) {
      return Promise.reject(error);
    }

    const newToken = await refreshTokenOnce(doRefresh);
    if (!newToken) {
      useAuthStore.getState().clearAuth();
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
    return http(originalRequest);
  }
);
