import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { useAuthStore } from '@/core/auth/infrastructure/store/auth.store';

const mockLogout = vi.hoisted(() => vi.fn());

vi.mock('@/core/auth/application/use-cases/logout/logout.use-case', () => ({
  LogoutUseCase: class {
    logout(...args: unknown[]) {
      return mockLogout(...args);
    }
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
  return Wrapper;
}

describe('useLogout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ redirectToLogin: vi.fn() });
  });

  it('redirects to login on successful logout', async () => {
    mockLogout.mockResolvedValue(undefined);
    const { result } = renderHook(() => useLogout(), { wrapper: makeWrapper() });

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(useAuthStore.getState().redirectToLogin).toHaveBeenCalledOnce();
  });

  it('does not redirect when logout fails', async () => {
    mockLogout.mockRejectedValue(new Error('network error'));
    const { result } = renderHook(() => useLogout(), { wrapper: makeWrapper() });

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(useAuthStore.getState().redirectToLogin).not.toHaveBeenCalled();
  });
});
