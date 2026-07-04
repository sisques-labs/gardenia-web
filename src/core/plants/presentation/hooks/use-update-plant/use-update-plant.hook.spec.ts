import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';

const mockExecute = vi.hoisted(() => vi.fn());
const mockInvalidateQueries = vi.hoisted(() => vi.fn());

vi.mock('@/core/plants/application/use-cases/update-plant/update-plant.use-case', () => ({
  UpdatePlantUseCase: class {
    execute = mockExecute;
  },
}));

vi.mock('@/core/plants/infrastructure/repositories/graphql/plants.gql.repository', () => ({
  plantsGqlRepository: {},
}));

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>();
  return {
    ...actual,
    useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
  };
});

import { useUpdatePlant } from './use-update-plant.hook';

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return Wrapper;
}

describe('useUpdatePlant', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls UpdatePlantUseCase.execute(input) on mutate', async () => {
    mockExecute.mockResolvedValue({ id: 'plant-1' });

    const { result } = renderHook(() => useUpdatePlant(), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.mutate({ id: 'plant-1', plantingSpotId: 'spot-1' });
    });

    await waitFor(() => expect(mockExecute).toHaveBeenCalledWith({ id: 'plant-1', plantingSpotId: 'spot-1' }));
  });

  it('invalidates plants, plant, planting-spots and planting-spot queries on success', async () => {
    mockExecute.mockResolvedValue({ id: 'plant-1' });

    const { result } = renderHook(() => useUpdatePlant(), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.mutate({ id: 'plant-1', plantingSpotId: 'spot-1' });
    });

    await waitFor(() => {
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['plants'] });
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['plant'] });
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['planting-spots'] });
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['planting-spot'] });
    });
  });
});
