import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { useAuthStore } from '@/core/auth/infrastructure/store/auth.store';

const mockLogin = vi.hoisted(() => vi.fn());

vi.mock('@/core/auth/application/use-cases/login/login.use-case', () => ({
  LoginUseCase: class {
    login(...args: unknown[]) {
      return mockLogin(...args);
    }
  },
}));

vi.mock('@/core/auth/infrastructure/repositories/auth-http.repository', () => ({
  authHttpRepository: {},
}));

import { useLogin } from './useLogin.hook';

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return Wrapper;
}

describe('useLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ accessToken: null, currentUser: null });
  });

  it('stores the access token and current user on successful login', async () => {
    mockLogin.mockResolvedValue({ accessToken: 'tok-1', user: { userId: 'user-1' } });
    const { result } = renderHook(() => useLogin(), { wrapper: makeWrapper() });

    act(() => {
      result.current.mutate({ email: 'a@b.com', password: 'secret' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(useAuthStore.getState().accessToken).toBe('tok-1');
    expect(useAuthStore.getState().currentUser).toEqual({ userId: 'user-1' });
  });

  it('does not update the store when login fails', async () => {
    mockLogin.mockRejectedValue(new Error('bad credentials'));
    const { result } = renderHook(() => useLogin(), { wrapper: makeWrapper() });

    act(() => {
      result.current.mutate({ email: 'a@b.com', password: 'wrong' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(useAuthStore.getState().accessToken).toBeNull();
  });
});
