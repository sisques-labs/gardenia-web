import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import type { Harvest } from '@/core/harvests/domain/types/harvest.interface';

const mockExecute = vi.hoisted(() => vi.fn());

vi.mock('@/core/harvests/application/use-cases/get-harvests/get-harvests.use-case', () => ({
  GetHarvestsUseCase: class {
    execute = mockExecute;
  },
}));

vi.mock('@/core/harvests/infrastructure/repositories/graphql/harvests.gql.repository', () => ({
  HarvestsGqlRepository: class {},
}));

import { useHarvests } from './use-harvests.hook';

const mockHarvests: Harvest[] = [
  {
    id: 'h1',
    cropType: 'Tomato',
    quantity: 2.5,
    unit: 'KG',
    harvestedAt: '2026-06-01',
    userId: 'u1',
    spaceId: 's1',
    createdAt: '2026-06-01',
    updatedAt: '2026-06-01',
  },
];

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return Wrapper;
}

describe('useHarvests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns harvests data on mount', async () => {
    mockExecute.mockResolvedValue(mockHarvests);

    const { result } = renderHook(() => useHarvests(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.harvests).toEqual(mockHarvests);
  });

  it('isLoading is true while query is in flight', () => {
    mockExecute.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useHarvests(), { wrapper: makeWrapper() });

    expect(result.current.isLoading).toBe(true);
  });

  it('returns empty array when use-case returns empty', async () => {
    mockExecute.mockResolvedValue([]);

    const { result } = renderHook(() => useHarvests(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.harvests).toEqual([]);
  });

  it('returns error state when use-case rejects', async () => {
    mockExecute.mockRejectedValue(new Error('load failed'));

    const { result } = renderHook(() => useHarvests(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.error).toBeInstanceOf(Error));
  });
});
