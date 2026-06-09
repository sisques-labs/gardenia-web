import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { useAcceptInvitation } from './useAcceptInvitation.hook';
import type { Space } from '@/core/spaces/domain/interfaces/space.interface';

const { mockJoinedSpace, mockExecute } = vi.hoisted(() => ({
  mockJoinedSpace: {
    id: 'space-joined',
    name: 'Shared Garden',
    ownerId: 'user-2',
    createdAt: '2024-01-02',
  } satisfies Space,
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
    mockExecute.mockResolvedValue(mockJoinedSpace);
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData<Space[]>(['spaces'], []);
  });

  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);

  it('invalidates spaces query cache after a successful accept', async () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useAcceptInvitation(), { wrapper });

    result.current.mutate('TES · 2026 · AB');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['spaces'] });
    expect(queryClient.getQueryData<Space[]>(['spaces'])).toEqual([mockJoinedSpace]);
  });
});
