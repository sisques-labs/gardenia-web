import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApolloLink, Observable } from '@apollo/client';
import type { FetchResult } from '@apollo/client';
import { gql } from '@apollo/client';

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

vi.mock('@/shared/infrastructure/http/axios.client', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/shared/infrastructure/http/axios.client')>();
  return {
    ...original,
    doRefresh: vi.fn().mockResolvedValue('refreshed-token'),
    bareHttp: {
      post: vi.fn().mockResolvedValue({ data: { accessToken: 'refreshed-token' } }),
    },
  };
});

// ──────────────────────────────────────────────
// Imports after mocks
// ──────────────────────────────────────────────
import { useAuthStore } from '@/core/auth/infrastructure/store/auth.store';
import { useSpacesStore } from '@/core/spaces/infrastructure/store/spaces.store';
import { refreshTokenOnce } from '@/core/auth/infrastructure/http/refresh-mutex';
import { doRefresh } from '@/shared/infrastructure/http/axios.client';

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

const TEST_QUERY = gql`
  query Test {
    test
  }
`;

// Apollo v4 requires a { client } context in ApolloLink.execute.
// The ErrorLink accesses client.queryManager.incrementalHandler for graphQL error detection.
const FAKE_INCREMENTAL_HANDLER = {
  isIncrementalResult: () => false,
  extractErrors: () => [],
};
const FAKE_CLIENT_CTX = {
  client: {
    queryManager: {
      incrementalHandler: FAKE_INCREMENTAL_HANDLER,
    },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any,
};

/** Creates a terminating ApolloLink that captures context and returns success */
function captureContextLink(): { link: ApolloLink; captured: { headers: Record<string, string> } } {
  const captured = { headers: {} as Record<string, string> };
  const link = new ApolloLink((operation) => {
    const ctx = operation.getContext();
    captured.headers = ctx.headers ?? {};
    return new Observable<FetchResult>((observer) => {
      observer.next({ data: { test: true } });
      observer.complete();
    });
  });
  return { link, captured };
}

function executeLink(link: ApolloLink): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    ApolloLink.execute(link, { query: TEST_QUERY }, FAKE_CLIENT_CTX).subscribe({
      next: () => {},
      error: reject,
      complete: resolve,
    });
  });
}

function executeLinkCollect(link: ApolloLink): Promise<FetchResult[]> {
  return new Promise<FetchResult[]>((resolve, reject) => {
    const results: FetchResult[] = [];
    ApolloLink.execute(link, { query: TEST_QUERY }, FAKE_CLIENT_CTX).subscribe({
      next: (v) => results.push(v),
      error: reject,
      complete: () => resolve(results),
    });
  });
}

// ──────────────────────────────────────────────
// Auth store mock state helpers
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

/** Returns the redirectToLogin spy from the last mockAuthStore call */
function getRedirectToLoginSpy() {
  return vi.mocked(useAuthStore.getState).mock.results.at(-1)?.value?.redirectToLogin as ReturnType<typeof vi.fn> | undefined;
}

function mockSpacesStore(currentSpaceId: string | null) {
  vi.mocked(useSpacesStore.getState).mockReturnValue({
    currentSpaceId,
    availableSpaces: [],
    isResolved: true,
    setSpaces: vi.fn(),
    setActiveSpace: vi.fn(),
    resolveActiveSpace: vi.fn(),
    clear: vi.fn(),
  });
}

// ──────────────────────────────────────────────
// 1.1 — doRefresh is exported from axios.client
// ──────────────────────────────────────────────
describe('axios.client — doRefresh export', () => {
  it('exports doRefresh as a function', () => {
    expect(typeof doRefresh).toBe('function');
  });
});

// ──────────────────────────────────────────────
// 1.2 — authLink
// ──────────────────────────────────────────────
describe('authLink', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sets Authorization header when accessToken is present', async () => {
    mockAuthStore('tok123');
    mockSpacesStore(null);

    const { authLink } = await import('./apollo.client');
    const { link: terminal, captured } = captureContextLink();
    const chain = ApolloLink.from([authLink, terminal]);

    await executeLink(chain);

    expect(captured.headers['Authorization']).toBe('Bearer tok123');
  });

  it('omits Authorization header when accessToken is null', async () => {
    mockAuthStore(null);
    mockSpacesStore(null);

    const { authLink } = await import('./apollo.client');
    const { link: terminal, captured } = captureContextLink();
    const chain = ApolloLink.from([authLink, terminal]);

    await executeLink(chain);

    expect(captured.headers['Authorization']).toBeUndefined();
  });
});

// ──────────────────────────────────────────────
// 1.3 — spaceLink
// ──────────────────────────────────────────────
describe('spaceLink', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sets X-Space-ID header when currentSpaceId is non-null', async () => {
    mockAuthStore(null);
    mockSpacesStore('space-42');

    const { spaceLink } = await import('./apollo.client');
    const { link: terminal, captured } = captureContextLink();
    const chain = ApolloLink.from([spaceLink, terminal]);

    await executeLink(chain);

    expect(captured.headers['X-Space-ID']).toBe('space-42');
  });

  it('omits X-Space-ID header when currentSpaceId is null', async () => {
    mockAuthStore(null);
    mockSpacesStore(null);

    const { spaceLink } = await import('./apollo.client');
    const { link: terminal, captured } = captureContextLink();
    const chain = ApolloLink.from([spaceLink, terminal]);

    await executeLink(chain);

    expect(captured.headers['X-Space-ID']).toBeUndefined();
  });
});

// ──────────────────────────────────────────────
// 1.4 — onErrorLink — token refresh + retry
// ──────────────────────────────────────────────
describe('onErrorLink', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls refreshTokenOnce on 401 networkError and retries once', async () => {
    const clearAuth = vi.fn();
    const redirectToLogin = vi.fn();
    mockAuthStore(null, clearAuth, redirectToLogin);
    mockSpacesStore(null);
    vi.mocked(refreshTokenOnce).mockResolvedValue('new-token');

    const { onErrorLink } = await import('./apollo.client');

    // First call → 401; second call (retry) → capture context and succeed
    let callCount = 0;
    let retryHeaders: Record<string, string> = {};
    const stubLink = new ApolloLink((operation) =>
      new Observable<FetchResult>((observer) => {
        callCount++;
        if (callCount === 1) {
          observer.error(Object.assign(new Error('Unauthorized'), { statusCode: 401 }));
        } else {
          retryHeaders = operation.getContext().headers ?? {};
          observer.next({ data: { test: true } });
          observer.complete();
        }
      }),
    );

    const chain = ApolloLink.from([onErrorLink, stubLink]);
    const results = await executeLinkCollect(chain);

    expect(refreshTokenOnce).toHaveBeenCalledOnce();
    expect(clearAuth).not.toHaveBeenCalled();
    expect(redirectToLogin).not.toHaveBeenCalled();
    expect(results).toHaveLength(1);
    expect(retryHeaders['Authorization']).toBe('Bearer new-token');
  });

  it('calls clearAuth and propagates error when refresh returns null', async () => {
    const clearAuth = vi.fn();
    const redirectToLogin = vi.fn();
    mockAuthStore(null, clearAuth, redirectToLogin);
    mockSpacesStore(null);
    vi.mocked(refreshTokenOnce).mockResolvedValue(null);

    const { onErrorLink } = await import('./apollo.client');

    const stubLink = new ApolloLink(() =>
      new Observable<FetchResult>((observer) => {
        observer.error(Object.assign(new Error('Unauthorized'), { statusCode: 401 }));
      }),
    );

    const chain = ApolloLink.from([onErrorLink, stubLink]);

    await expect(executeLinkCollect(chain)).rejects.toBeDefined();

    expect(clearAuth).toHaveBeenCalledOnce();
    expect(redirectToLogin).toHaveBeenCalledOnce();
  });

  it('does not retry when __retried is already set in context', async () => {
    const clearAuth = vi.fn();
    mockAuthStore(null, clearAuth);
    mockSpacesStore(null);
    vi.mocked(refreshTokenOnce).mockResolvedValue('new-token');

    const { onErrorLink } = await import('./apollo.client');

    // Always returns 401
    const stubLink = new ApolloLink(() =>
      new Observable<FetchResult>((observer) => {
        observer.error(Object.assign(new Error('Unauthorized'), { statusCode: 401 }));
      }),
    );

    // Set __retried via a preceding link
    const setRetriedLink = new ApolloLink((operation, forward) => {
      operation.setContext({ __retried: true });
      return forward!(operation);
    });

    const chain = ApolloLink.from([setRetriedLink, onErrorLink, stubLink]);

    await expect(executeLinkCollect(chain)).rejects.toBeDefined();

    // refreshTokenOnce must NOT be called — guard kicked in
    expect(refreshTokenOnce).not.toHaveBeenCalled();
  });

  it('handles concurrent 401 errors — both chains retry and succeed', async () => {
    // Note: actual dedup (one refresh for N concurrent 401s) is enforced by the
    // refreshTokenOnce mutex and tested in refresh-mutex.spec.ts. Here we verify
    // that the link correctly handles concurrent 401s and retries both operations.
    const clearAuth = vi.fn();
    mockAuthStore(null, clearAuth);
    mockSpacesStore(null);
    vi.mocked(refreshTokenOnce).mockResolvedValue('new-token');

    const { onErrorLink } = await import('./apollo.client');

    const callCounts = [0, 0];
    function make401ThenSuccessLink(idx: number) {
      return new ApolloLink(() =>
        new Observable<FetchResult>((observer) => {
          callCounts[idx]++;
          if (callCounts[idx] === 1) {
            observer.error(Object.assign(new Error('Unauthorized'), { statusCode: 401 }));
          } else {
            observer.next({ data: { test: true } });
            observer.complete();
          }
        }),
      );
    }

    const chain1 = ApolloLink.from([onErrorLink, make401ThenSuccessLink(0)]);
    const chain2 = ApolloLink.from([onErrorLink, make401ThenSuccessLink(1)]);

    const [r1, r2] = await Promise.all([executeLinkCollect(chain1), executeLinkCollect(chain2)]);

    expect(refreshTokenOnce).toHaveBeenCalled();
    expect(clearAuth).not.toHaveBeenCalled();
    expect(r1).toHaveLength(1);
    expect(r2).toHaveLength(1);
  });

  it('handles UNAUTHENTICATED graphQLError and retries with fresh token', async () => {
    const clearAuth = vi.fn();
    mockAuthStore(null, clearAuth);
    mockSpacesStore(null);
    vi.mocked(refreshTokenOnce).mockResolvedValue('new-token');

    const { onErrorLink } = await import('./apollo.client');

    let callCount = 0;
    let retryHeaders: Record<string, string> = {};
    const stubLink = new ApolloLink((operation) =>
      new Observable<FetchResult>((observer) => {
        callCount++;
        if (callCount === 1) {
          observer.next({
            data: null,
            errors: [
              {
                message: 'Unauthorized',
                extensions: { code: 'UNAUTHENTICATED' },
                locations: undefined,
                path: undefined,
                nodes: undefined,
                source: undefined,
                positions: undefined,
                originalError: undefined,
                name: 'GraphQLError',
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              } as any,
            ],
          });
          observer.complete();
        } else {
          retryHeaders = operation.getContext().headers ?? {};
          observer.next({ data: { test: true } });
          observer.complete();
        }
      }),
    );

    const chain = ApolloLink.from([onErrorLink, stubLink]);
    await executeLinkCollect(chain);

    expect(refreshTokenOnce).toHaveBeenCalledOnce();
    expect(retryHeaders['Authorization']).toBe('Bearer new-token');
  });
});
