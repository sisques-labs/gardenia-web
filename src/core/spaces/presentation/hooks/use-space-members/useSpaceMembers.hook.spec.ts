import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { useSpaceMembers } from './useSpaceMembers.hook';
import { useSpacesStore } from '@/core/spaces/infrastructure/store/spaces.store';
import type { User } from '@/core/users/domain/interfaces/user.interface';

const { mockMembers, mockExecute } = vi.hoisted(() => ({
  mockMembers: [
    { id: 'user-1', status: 'active', username: 'jdoe', createdAt: '2024-01-01' },
    { id: 'user-2', status: 'invited', username: 'jane', createdAt: '2024-01-02' },
  ] satisfies User[],
  mockExecute: vi.fn(),
}));

vi.mock(
  '@/core/users/application/use-cases/get-space-members/get-space-members.use-case',
  () => ({
    GetSpaceMembersUseCase: class {
      execute = mockExecute;
    },
  }),
);

describe('useSpaceMembers', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    useSpacesStore.getState().clear();
    mockExecute.mockResolvedValue(mockMembers);
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  });

  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);

  it('does not fetch when there is no currentSpaceId', () => {
    const { result } = renderHook(() => useSpaceMembers(), { wrapper });
    expect(result.current.fetchStatus).toBe('idle');
    expect(mockExecute).not.toHaveBeenCalled();
  });

  it('fetches members when currentSpaceId is set', async () => {
    useSpacesStore.getState().setActiveSpace('space-1');

    const { result } = renderHook(() => useSpaceMembers(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockMembers);
  });
});
