import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { useAuthStore } from '@/core/auth/infrastructure/store/auth.store';

const mockLogout = vi.hoisted(() => vi.fn());

vi.mock('@/core/auth/application/use-cases/logout/logout.use-case', () => ({
  LogoutUseCase: class {
    logout = mockLogout;
  },
}));

vi.mock('@/core/auth/infrastructure/repositories/auth-http.repository', () => ({
  authHttpRepository: {},
}));

import { useLogout } from './useLogout.hook';

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return { Wrapper, queryClient };
}

describe('useLogout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ redirectToLogin: vi.fn() });
  });

  it('clears the entire query cache on success so no data leaks into the next session', async () => {
    mockLogout.mockResolvedValue(undefined);
    const { Wrapper, queryClient } = makeWrapper();
    const clearSpy = vi.spyOn(queryClient, 'clear');

    const { result } = renderHook(() => useLogout(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate();
    });

    await waitFor(() => expect(clearSpy).toHaveBeenCalledOnce());
  });

  it('redirects to login on success', async () => {
    mockLogout.mockResolvedValue(undefined);
    const { Wrapper } = makeWrapper();

    const { result } = renderHook(() => useLogout(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate();
    });

    await waitFor(() => expect(useAuthStore.getState().redirectToLogin).toHaveBeenCalledOnce());
  });
});
