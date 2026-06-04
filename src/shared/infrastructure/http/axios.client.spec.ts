import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

// ──────────────────────────────────────────────
// Mocks — declared before any module import
// ──────────────────────────────────────────────

vi.mock('@/core/auth/infrastructure/store/auth.store', () => ({
  useAuthStore: {
    getState: vi.fn(),
  },
}));

vi.mock('@/core/spaces/infrastructure/store/spaces.store', () => ({
  useSpacesStore: {
    getState: vi.fn(),
  },
}));

vi.mock('@/core/auth/infrastructure/http/refresh-mutex', () => ({
  refreshTokenOnce: vi.fn(),
}));

// ──────────────────────────────────────────────
// Imports after mocks
// ──────────────────────────────────────────────
import { useAuthStore } from '@/core/auth/infrastructure/store/auth.store';
import { useSpacesStore } from '@/core/spaces/infrastructure/store/spaces.store';
import { refreshTokenOnce } from '@/core/auth/infrastructure/http/refresh-mutex';

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function mockAuthStore(
  accessToken: string | null,
  clearAuth = vi.fn(),
  redirectToLogin = vi.fn(),
) {
  vi.mocked(useAuthStore.getState).mockReturnValue({
    accessToken,
    clearAuth,
    redirectToLogin,
    currentUser: null,
    isBootComplete: true,
    setAccessToken: vi.fn(),
    setCurrentUser: vi.fn(),
    setBootComplete: vi.fn(),
  });
}

function mockSpacesStore() {
  vi.mocked(useSpacesStore.getState).mockReturnValue({
    currentSpaceId: null,
    availableSpaces: [],
    isResolved: true,
    setSpaces: vi.fn(),
    setActiveSpace: vi.fn(),
    resolveActiveSpace: vi.fn(),
    clear: vi.fn(),
  });
}

function make401Error(url: string, retried = false): AxiosError {
  const config = {
    url,
    _retry: retried,
    headers: {},
  } as unknown as InternalAxiosRequestConfig & { _retry: boolean };

  return {
    config,
    response: { status: 401 },
    isAxiosError: true,
    message: 'Unauthorized',
    name: 'AxiosError',
    toJSON: () => ({}),
  } as unknown as AxiosError;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getErrorInterceptorHandler(http: any) {
  // Axios stores interceptors in handlers array
  const handler = http.interceptors.response.handlers.find((h: unknown) => h !== null);
  return handler?.rejected as (error: unknown) => Promise<unknown>;
}

// ──────────────────────────────────────────────
// T7: axios response interceptor tests
// ──────────────────────────────────────────────

describe('axios.client — response interceptor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSpacesStore();
  });

  it('/auth/refresh 401 → clearAuth + redirectToLogin called, promise rejects', async () => {
    const clearAuth = vi.fn();
    const redirectToLogin = vi.fn();
    mockAuthStore('tok', clearAuth, redirectToLogin);

    const { http } = await import('./axios.client');

    const error = make401Error('/auth/refresh');
    const errorHandler = getErrorInterceptorHandler(http);

    await expect(errorHandler(error)).rejects.toBeDefined();

    expect(clearAuth).toHaveBeenCalledOnce();
    expect(redirectToLogin).toHaveBeenCalledOnce();
    expect(refreshTokenOnce).not.toHaveBeenCalled();
  });

  it('non-auth 401, refresh resolves with token → retry, redirectToLogin NOT called', async () => {
    const clearAuth = vi.fn();
    const redirectToLogin = vi.fn();
    mockAuthStore('tok', clearAuth, redirectToLogin);
    vi.mocked(refreshTokenOnce).mockResolvedValue('new-token');

    const { http } = await import('./axios.client');

    const error = make401Error('/plants');
    const errorHandler = getErrorInterceptorHandler(http);

    // Override the adapter so the retry request doesn't hit the network
    const originalAdapter = http.defaults.adapter;
    http.defaults.adapter = vi.fn().mockResolvedValue({
      data: { ok: true },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: error.config!,
      request: {},
    });

    await errorHandler(error);

    expect(refreshTokenOnce).toHaveBeenCalledOnce();
    expect(clearAuth).not.toHaveBeenCalled();
    expect(redirectToLogin).not.toHaveBeenCalled();

    http.defaults.adapter = originalAdapter;
  });

  it('non-auth 401, refresh returns null → clearAuth + redirectToLogin called', async () => {
    const clearAuth = vi.fn();
    const redirectToLogin = vi.fn();
    mockAuthStore('tok', clearAuth, redirectToLogin);
    vi.mocked(refreshTokenOnce).mockResolvedValue(null);

    const { http } = await import('./axios.client');

    const error = make401Error('/plants');
    const errorHandler = getErrorInterceptorHandler(http);

    await expect(errorHandler(error)).rejects.toBeDefined();

    expect(refreshTokenOnce).toHaveBeenCalledOnce();
    expect(clearAuth).toHaveBeenCalledOnce();
    expect(redirectToLogin).toHaveBeenCalledOnce();
  });

  it('_retry already set → pass-through, no refresh, no redirectToLogin', async () => {
    const clearAuth = vi.fn();
    const redirectToLogin = vi.fn();
    mockAuthStore('tok', clearAuth, redirectToLogin);

    const { http } = await import('./axios.client');

    const error = make401Error('/plants', true);
    const errorHandler = getErrorInterceptorHandler(http);

    await expect(errorHandler(error)).rejects.toBeDefined();

    expect(refreshTokenOnce).not.toHaveBeenCalled();
    expect(clearAuth).not.toHaveBeenCalled();
    expect(redirectToLogin).not.toHaveBeenCalled();
  });
});
