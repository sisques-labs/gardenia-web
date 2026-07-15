import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import type { WaterPlantingSpotResult } from '@/core/planting-spots/domain/interfaces/water-planting-spot-result.interface';

const mockExecute = vi.hoisted(() => vi.fn());
const mockInvalidateQueries = vi.hoisted(() => vi.fn());

vi.mock('@/core/planting-spots/application/use-cases/water-planting-spot/water-planting-spot.use-case', () => ({
  WaterPlantingSpotUseCase: class {
    execute = mockExecute;
  },
}));

vi.mock('@/core/planting-spots/infrastructure/repositories/graphql/planting-spots.gql.repository', () => ({
  PlantingSpotsGqlRepository: class {},
}));

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>();
  return {
    ...actual,
    useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
  };
});

import { useWaterPlantingSpot } from './use-water-planting-spot.hook';

const mockResult: WaterPlantingSpotResult = {
  plantingSpotId: 'spot-1',
  wateredPlantIds: ['plant-1', 'plant-2'],
  failedPlants: [],
};

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return Wrapper;
}

describe('useWaterPlantingSpot', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls WaterPlantingSpotUseCase.execute(id, performedAt) on mutate', async () => {
    mockExecute.mockResolvedValue(mockResult);

    const { result } = renderHook(() => useWaterPlantingSpot(), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.mutate({ id: 'spot-1', performedAt: '2026-07-05' });
    });

    await waitFor(() => expect(mockExecute).toHaveBeenCalledWith('spot-1', '2026-07-05'));
  });

  it('invalidates the planting-spot and care-schedules queries on success', async () => {
    mockExecute.mockResolvedValue(mockResult);

    const { result } = renderHook(() => useWaterPlantingSpot(), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.mutate({ id: 'spot-1' });
    });

    await waitFor(() =>
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['planting-spot', 'spot-1'] }),
    );
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['care-schedules'] });
  });
});
