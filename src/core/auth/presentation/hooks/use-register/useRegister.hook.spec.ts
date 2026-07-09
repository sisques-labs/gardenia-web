import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';

const mockRegister = vi.hoisted(() => vi.fn());

vi.mock('@/core/auth/application/use-cases/register/register.use-case', () => ({
  RegisterUseCase: class {
    register = mockRegister;
  },
}));

vi.mock('@/core/auth/infrastructure/repositories/auth-http.repository', () => ({
  authHttpRepository: {},
}));

import { useRegister } from './useRegister.hook';

const data = { email: 'user@example.com', password: 'secret123' };

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return { Wrapper, queryClient };
}

describe('useRegister', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls RegisterUseCase.register on mutate', async () => {
    mockRegister.mockResolvedValue({ spaceId: undefined });
    const { Wrapper } = makeWrapper();

    const { result } = renderHook(() => useRegister(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate(data);
    });

    await waitFor(() => expect(mockRegister).toHaveBeenCalledWith(data));
  });

  it('invalidates the spaces query on success — register auto-creates a session', async () => {
    mockRegister.mockResolvedValue({ spaceId: undefined });
    const { Wrapper, queryClient } = makeWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useRegister(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate(data);
    });

    await waitFor(() => expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['spaces'] }));
  });
});
