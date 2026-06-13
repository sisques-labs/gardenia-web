import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { useCreateSpace } from './useCreateSpace.hook';
import { useSpacesStore } from '@/core/spaces/infrastructure/store/spaces.store';
import type { Space } from '@/core/spaces/domain/interfaces/space.interface';

const { mockNewSpace, mockExecute } = vi.hoisted(() => ({
  mockNewSpace: {
    id: 'space-new',
    name: 'New Garden',
    ownerId: 'user-1',
    createdAt: '2024-01-02',
  } satisfies Space,
  mockExecute: vi.fn(),
}));

vi.mock('@/core/spaces/application/use-cases/create-space/create-space.use-case', () => ({
  CreateSpaceUseCase: class {
    execute = mockExecute;
  },
}));

describe('useCreateSpace', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    useSpacesStore.getState().clear();
    mockExecute.mockResolvedValue(mockNewSpace);
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData<Space[]>(['spaces'], []);
  });

  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);

  it('appends the created space to the spaces query cache', async () => {
    const { result } = renderHook(() => useCreateSpace(), { wrapper });

    result.current.mutate('New Garden');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData<Space[]>(['spaces'])).toEqual([mockNewSpace]);
  });

  it('updates the spaces store and sets it as active', async () => {
    const { result } = renderHook(() => useCreateSpace(), { wrapper });

    result.current.mutate('New Garden');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(useSpacesStore.getState().availableSpaces).toContainEqual(mockNewSpace);
    expect(useSpacesStore.getState().currentSpaceId).toBe('space-new');
  });
});
