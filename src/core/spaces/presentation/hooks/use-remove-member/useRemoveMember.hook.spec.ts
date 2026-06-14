import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { useRemoveMember } from './useRemoveMember.hook';

const { mockExecute } = vi.hoisted(() => ({ mockExecute: vi.fn() }));

vi.mock(
  '@/core/spaces/application/use-cases/remove-space-member/remove-space-member.use-case',
  () => ({
    RemoveSpaceMemberUseCase: class {
      execute = mockExecute;
    },
  }),
);

describe('useRemoveMember', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    mockExecute.mockResolvedValue(undefined);
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  });

  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);

  it('succeeds and invalidates space-detail cache', async () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useRemoveMember(), { wrapper });

    result.current.mutate({ spaceId: 'space-1', targetUserId: 'user-2' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['space-detail', 'space-1'] });
  });
});
