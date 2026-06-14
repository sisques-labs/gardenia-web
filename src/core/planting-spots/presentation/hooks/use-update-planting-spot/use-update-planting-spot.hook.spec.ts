import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import type { UpdatePlantingSpotInput } from '@/core/planting-spots/application/interfaces/update-planting-spot-input.interface';
import type { PlantingSpot } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';

const mockExecute = vi.hoisted(() => vi.fn());
const mockInvalidateQueries = vi.hoisted(() => vi.fn());

vi.mock('@/core/planting-spots/application/use-cases/update-planting-spot/update-planting-spot.use-case', () => ({
  UpdatePlantingSpotUseCase: class {
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

import { useUpdatePlantingSpot } from './use-update-planting-spot.hook';

const mockSpot: PlantingSpot = {
  id: 'spot-1',
  name: 'Updated Bed',
  type: 'POT',
  description: null,
  userId: 'u1',
  spaceId: 's1',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-02',
};

const input: UpdatePlantingSpotInput = {
  id: 'spot-1',
  name: 'Updated Bed',
  type: 'POT',
};

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return Wrapper;
}

describe('useUpdatePlantingSpot', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls UpdatePlantingSpotUseCase.execute(input) on mutate', async () => {
    mockExecute.mockResolvedValue(mockSpot);

    const { result } = renderHook(() => useUpdatePlantingSpot(), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.mutate(input);
    });

    await waitFor(() => expect(mockExecute).toHaveBeenCalledWith(input));
  });

  it('invalidates list and detail queries on success', async () => {
    mockExecute.mockResolvedValue(mockSpot);

    const { result } = renderHook(() => useUpdatePlantingSpot(), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.mutate(input);
    });

    await waitFor(() => {
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['planting-spots'] });
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['planting-spot', 'spot-1'] });
    });
  });
});
