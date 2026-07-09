import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { useAuthStore } from '@/core/auth/infrastructure/store/auth.store';

const mockLogin = vi.hoisted(() => vi.fn());

vi.mock('@/core/auth/application/use-cases/login/login.use-case', () => ({
  LoginUseCase: class {
    login = mockLogin;
  },
}));

vi.mock('@/core/auth/infrastructure/repositories/auth-http.repository', () => ({
  authHttpRepository: {},
}));

import { useLogin } from './useLogin.hook';

const credentials = { email: 'user@example.com', password: 'secret123' };
const loginResult = {
  accessToken: 'token-1',
  user: { id: 'u1', userId: 'u1', email: 'user@example.com' },
};

function makeWrapper(queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return { Wrapper, queryClient };
}

describe('useLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ accessToken: null, currentUser: null });
  });

  it('stores the access token and current user on success', async () => {
    mockLogin.mockResolvedValue(loginResult);
    const { Wrapper } = makeWrapper();

    const { result } = renderHook(() => useLogin(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate(credentials);
    });

    await waitFor(() => expect(useAuthStore.getState().accessToken).toBe('token-1'));
    expect(useAuthStore.getState().currentUser).toEqual(loginResult.user);
  });

  it('invalidates the spaces query on success so the space list refetches for the new session', async () => {
    mockLogin.mockResolvedValue(loginResult);
    const { Wrapper, queryClient } = makeWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useLogin(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate(credentials);
    });

    await waitFor(() => expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['spaces'] }));
  });
});
