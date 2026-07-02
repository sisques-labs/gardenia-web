import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { useAcceptInvitation } from './use-accept-invitation.hook';

const { mockSpaceId, mockExecute } = vi.hoisted(() => ({
  mockSpaceId: 'space-joined',
  mockExecute: vi.fn(),
}));

vi.mock(
  '@/core/spaces/application/use-cases/accept-space-invitation/accept-space-invitation.use-case',
  () => ({
    AcceptSpaceInvitationUseCase: class {
      execute = mockExecute;
    },
  }),
);

describe('useAcceptInvitation', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    mockExecute.mockResolvedValue(mockSpaceId);
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  });

  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);

  it('invalidates spaces query cache after a successful accept', async () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useAcceptInvitation(), { wrapper });

    result.current.mutate('TES · 2026 · AB');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['spaces'] });
  });
});
