import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';

const mockExecute = vi.hoisted(() => vi.fn());
const mockInvalidateQueries = vi.hoisted(() => vi.fn());

vi.mock('@/core/planting-spots/application/use-cases/delete-planting-spot/delete-planting-spot.use-case', () => ({
  DeletePlantingSpotUseCase: class {
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

import { useDeletePlantingSpot } from './use-delete-planting-spot.hook';

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return Wrapper;
}

describe('useDeletePlantingSpot', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls DeletePlantingSpotUseCase.execute with id on mutate', async () => {
    mockExecute.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeletePlantingSpot(), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.mutate('spot-1');
    });

    await waitFor(() => expect(mockExecute).toHaveBeenCalledWith('spot-1'));
  });

  it('invalidates planting-spots query on success', async () => {
    mockExecute.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeletePlantingSpot(), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.mutate('spot-1');
    });

    await waitFor(() =>
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['planting-spots'] }),
    );
  });
});
