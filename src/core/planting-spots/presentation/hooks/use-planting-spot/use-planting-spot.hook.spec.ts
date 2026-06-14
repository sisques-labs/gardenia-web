import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import type { PlantingSpot } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';

const mockExecute = vi.hoisted(() => vi.fn());

vi.mock('@/core/planting-spots/application/use-cases/get-planting-spot/get-planting-spot.use-case', () => ({
  GetPlantingSpotUseCase: class {
    execute = mockExecute;
  },
}));

vi.mock('@/core/planting-spots/infrastructure/repositories/graphql/planting-spots.gql.repository', () => ({
  PlantingSpotsGqlRepository: class {},
}));

import { usePlantingSpot } from './use-planting-spot.hook';

const mockSpot: PlantingSpot = {
  id: 'spot-1',
  name: 'Main Bed',
  type: 'raised_bed',
  description: null,
  userId: 'u1',
  spaceId: 's1',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return Wrapper;
}

describe('usePlantingSpot', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns spot data on success', async () => {
    mockExecute.mockResolvedValue(mockSpot);

    const { result } = renderHook(() => usePlantingSpot('spot-1'), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.spot).toEqual(mockSpot);
  });

  it('stays idle when id is empty', () => {
    const { result } = renderHook(() => usePlantingSpot(''), { wrapper: makeWrapper() });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.spot).toBeNull();
    expect(mockExecute).not.toHaveBeenCalled();
  });

  it('returns error state when use-case rejects', async () => {
    mockExecute.mockRejectedValue(new Error('not found'));

    const { result } = renderHook(() => usePlantingSpot('spot-99'), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.error).toBeInstanceOf(Error));
  });
});
