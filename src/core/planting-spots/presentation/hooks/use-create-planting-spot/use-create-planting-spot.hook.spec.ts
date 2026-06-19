import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import type { CreatePlantingSpotInput } from '@/core/planting-spots/application/interfaces/create-planting-spot-input.interface';
import type { PlantingSpot } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';

const mockExecute = vi.hoisted(() => vi.fn());
const mockInvalidateQueries = vi.hoisted(() => vi.fn());

vi.mock('@/core/planting-spots/application/use-cases/create-planting-spot/create-planting-spot.use-case', () => ({
  CreatePlantingSpotUseCase: class {
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

import { useCreatePlantingSpot } from './use-create-planting-spot.hook';

const mockSpot: PlantingSpot = {
  id: 'spot-1',
  name: 'Main Bed',
  type: 'RAISED_BED',
  description: null,
  userId: 'u1',
  spaceId: 's1',
  resolvedPlants: [],
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

const input: CreatePlantingSpotInput = {
  name: 'Main Bed',
  type: 'RAISED_BED',
};

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return Wrapper;
}

describe('useCreatePlantingSpot', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls CreatePlantingSpotUseCase.execute(input) on mutate', async () => {
    mockExecute.mockResolvedValue(mockSpot);

    const { result } = renderHook(() => useCreatePlantingSpot(), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.mutate(input);
    });

    await waitFor(() => expect(mockExecute).toHaveBeenCalledWith(input));
  });

  it('invalidates planting-spots query on success', async () => {
    mockExecute.mockResolvedValue(mockSpot);

    const { result } = renderHook(() => useCreatePlantingSpot(), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.mutate(input);
    });

    await waitFor(() =>
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['planting-spots'] }),
    );
  });
});
