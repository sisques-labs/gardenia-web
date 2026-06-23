import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import type { PlantingSpot } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';

const mockExecute = vi.hoisted(() => vi.fn());

vi.mock('@/core/planting-spots/application/use-cases/get-planting-spots/get-planting-spots.use-case', () => ({
  GetPlantingSpotsUseCase: class {
    execute = mockExecute;
  },
}));

vi.mock('@/core/planting-spots/infrastructure/repositories/graphql/planting-spots.gql.repository', () => ({
  PlantingSpotsGqlRepository: class {},
}));

import { usePlantingSpots } from './use-planting-spots.hook';

const mockSpots: PlantingSpot[] = [
  {
    id: 'spot-1',
    name: 'Main Bed',
    type: 'RAISED_BED',
    description: null,
    userId: 'u1',
    spaceId: 's1',
    resolvedPlants: [],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
];

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return Wrapper;
}

describe('usePlantingSpots', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns spots data on mount', async () => {
    mockExecute.mockResolvedValue({ items: mockSpots, total: 1, page: 1, perPage: 20, totalPages: 1 });

    const { result } = renderHook(() => usePlantingSpots(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.spots).toEqual(mockSpots);
  });

  it('isLoading is true while query is in flight', () => {
    mockExecute.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => usePlantingSpots(), { wrapper: makeWrapper() });

    expect(result.current.isLoading).toBe(true);
  });

  it('returns empty array when use-case returns empty', async () => {
    mockExecute.mockResolvedValue({ items: [], total: 0, page: 1, perPage: 20, totalPages: 1 });

    const { result } = renderHook(() => usePlantingSpots(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.spots).toEqual([]);
  });

  it('returns error state when use-case rejects', async () => {
    mockExecute.mockRejectedValue(new Error('load failed'));

    const { result } = renderHook(() => usePlantingSpots(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.error).toBeInstanceOf(Error));
  });
});
