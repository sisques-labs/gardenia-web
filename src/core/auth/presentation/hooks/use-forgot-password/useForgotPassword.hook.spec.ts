import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

const mockExecute = vi.hoisted(() => vi.fn());

vi.mock('@/core/auth/application/use-cases/forgot-password/forgot-password.use-case', () => {
  return {
    ForgotPasswordUseCase: class {
      execute(...args: unknown[]) {
        return mockExecute(...args);
      }
    },
  };
});

vi.mock('@/core/auth/infrastructure/repositories/auth-http.repository', () => ({
  authHttpRepository: {},
}));

import { useForgotPassword } from './useForgotPassword.hook';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
  Wrapper.displayName = 'QueryWrapper';
  return Wrapper;
}

describe('useForgotPassword', () => {
  beforeEach(() => {
    mockExecute.mockReset();
  });

  it('transitions to loading then success on resolve', async () => {
    mockExecute.mockResolvedValue(undefined);

    const { result } = renderHook(() => useForgotPassword(), { wrapper: createWrapper() });

    expect(result.current.isPending).toBe(false);

    act(() => {
      result.current.mutate('user@example.com');
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.isPending).toBe(false);
    expect(mockExecute).toHaveBeenCalledWith('user@example.com');
  });

  it('captures error state on rejection', async () => {
    mockExecute.mockRejectedValue(new Error('Server error'));

    const { result } = renderHook(() => useForgotPassword(), { wrapper: createWrapper() });

    act(() => {
      result.current.mutate('user@example.com');
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.isPending).toBe(false);
    expect(result.current.error).toBeInstanceOf(Error);
  });
});
