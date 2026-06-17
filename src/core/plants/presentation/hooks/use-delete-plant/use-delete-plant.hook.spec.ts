import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';

const mockExecute = vi.hoisted(() => vi.fn());
const mockInvalidateQueries = vi.hoisted(() => vi.fn());

vi.mock('@/core/plants/application/use-cases/delete-plant/delete-plant.use-case', () => ({
  DeletePlantUseCase: class {
    execute = mockExecute;
  },
}));

vi.mock('@/core/plants/infrastructure/repositories/graphql/plants.gql.repository', () => ({
  PlantsGqlRepository: class {},
}));

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>();
  return {
    ...actual,
    useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
  };
});

import { useDeletePlant } from './use-delete-plant.hook';

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return Wrapper;
}

describe('useDeletePlant', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls DeletePlantUseCase.execute(id) on mutate', async () => {
    mockExecute.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeletePlant('space-1'), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.mutate('plant-1');
    });

    await waitFor(() => expect(mockExecute).toHaveBeenCalledWith('plant-1'));
  });

  it('invalidates plants query with spaceId on success', async () => {
    mockExecute.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeletePlant('space-1'), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.mutate('plant-1');
    });

    await waitFor(() =>
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['plants', 'space-1'] })
    );
  });
});
