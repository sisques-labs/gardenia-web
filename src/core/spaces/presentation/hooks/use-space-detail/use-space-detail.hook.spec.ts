import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { useSpaceDetail } from './use-space-detail.hook';
import type { SpaceDetail } from '@/core/spaces/domain/interfaces/space-detail.interface';

const mockDetail: SpaceDetail = {
  id: 'space-1',
  name: 'My Garden',
  ownerId: 'user-1',
  createdAt: '2024-01-01T00:00:00.000Z',
};

const { mockExecute } = vi.hoisted(() => ({ mockExecute: vi.fn() }));

vi.mock('@/core/spaces/application/use-cases/get-space-detail/get-space-detail.use-case', () => ({
  GetSpaceDetailUseCase: class {
    execute = mockExecute;
  },
}));

describe('useSpaceDetail', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);

  it('returns space detail on success', async () => {
    mockExecute.mockResolvedValue(mockDetail);

    const { result } = renderHook(() => useSpaceDetail('space-1'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockDetail);
  });

  it('does not fetch when spaceId is null', () => {
    const { result } = renderHook(() => useSpaceDetail(null), { wrapper });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockExecute).not.toHaveBeenCalled();
  });
});
