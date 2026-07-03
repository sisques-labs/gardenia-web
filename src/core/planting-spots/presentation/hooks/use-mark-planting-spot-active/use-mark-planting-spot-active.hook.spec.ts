import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import type { PlantingSpot } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';

const mockExecute = vi.hoisted(() => vi.fn());
const mockInvalidateQueries = vi.hoisted(() => vi.fn());

vi.mock('@/core/planting-spots/application/use-cases/mark-planting-spot-active/mark-planting-spot-active.use-case', () => ({
  MarkPlantingSpotActiveUseCase: class {
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

import { useMarkPlantingSpotActive } from './use-mark-planting-spot-active.hook';

const mockSpot: PlantingSpot = {
  id: 'spot-1',
  name: 'North Bed',
  type: 'RAISED_BED',
  description: null,
  status: 'ACTIVE',
  fallowSince: null,
  userId: 'u1',
  spaceId: 's1',
  resolvedPlants: [],
  createdAt: '2024-01-01',
  updatedAt: '2024-01-02',
};

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return Wrapper;
}

describe('useMarkPlantingSpotActive', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls MarkPlantingSpotActiveUseCase.execute(id) on mutate', async () => {
    mockExecute.mockResolvedValue(mockSpot);

    const { result } = renderHook(() => useMarkPlantingSpotActive(), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.mutate('spot-1');
    });

    await waitFor(() => expect(mockExecute).toHaveBeenCalledWith('spot-1'));
  });

  it('invalidates list and detail queries on success', async () => {
    mockExecute.mockResolvedValue(mockSpot);

    const { result } = renderHook(() => useMarkPlantingSpotActive(), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.mutate('spot-1');
    });

    await waitFor(() => {
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['planting-spots'] });
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['planting-spot', 'spot-1'] });
    });
  });
});
