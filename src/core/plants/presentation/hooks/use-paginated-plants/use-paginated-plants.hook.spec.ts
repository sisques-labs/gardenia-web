import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import type { Plant } from '@/core/plants/domain/interfaces/plant.interface';

const mockExecute = vi.hoisted(() => vi.fn());

vi.mock('@/core/plants/application/use-cases/get-plants/get-plants.use-case', () => ({
  GetPlantsUseCase: class {
    execute = mockExecute;
  },
}));

vi.mock('@/core/plants/infrastructure/repositories/graphql/plants.gql.repository', () => ({
  PlantsGqlRepository: class {},
}));

import { usePaginatedPlants } from './use-paginated-plants.hook';

const mockPlants: Plant[] = [
  { id: 'p1', name: 'Monstera', userId: 'u1', spaceId: 's1', createdAt: '', updatedAt: '' },
  { id: 'p2', name: 'Pothos', userId: 'u1', spaceId: 's1', createdAt: '', updatedAt: '' },
];

function makeWrapper(client?: QueryClient) {
  const queryClient = client ?? new QueryClient({ defaultOptions: { queries: { retry: false } } });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return Wrapper;
}

describe('usePaginatedPlants', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the paginated result when spaceId is provided', async () => {
    mockExecute.mockResolvedValue({ items: mockPlants, total: 2, page: 1, perPage: 20, totalPages: 1 });

    const { result } = renderHook(() => usePaginatedPlants('space-1'), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.items).toEqual(mockPlants);
    expect(result.current.data?.total).toBe(2);
  });

  it('forwards page, perPage and filters to the use case', async () => {
    mockExecute.mockResolvedValue({ items: [], total: 0, page: 2, perPage: 5, totalPages: 0 });
    const filters = [{ field: 'NAME' as never, operator: 'LIKE' as never, value: 'rose' }];

    renderHook(() => usePaginatedPlants('space-1', { page: 2, perPage: 5, filters }), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(mockExecute).toHaveBeenCalledWith({ filters, pagination: { page: 2, perPage: 5 } }));
  });

  it('defaults to page 1 and perPage 20 when no options are given', async () => {
    mockExecute.mockResolvedValue({ items: [], total: 0, page: 1, perPage: 20, totalPages: 0 });

    renderHook(() => usePaginatedPlants('space-1'), { wrapper: makeWrapper() });

    await waitFor(() => expect(mockExecute).toHaveBeenCalledWith({ filters: [], pagination: { page: 1, perPage: 20 } }));
  });

  it('is disabled (not fetching) when spaceId is null', () => {
    const { result } = renderHook(() => usePaginatedPlants(null), { wrapper: makeWrapper() });

    expect(result.current.isFetching).toBe(false);
    expect(result.current.data).toBeUndefined();
  });

  it('propagates errors from use case', async () => {
    mockExecute.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => usePaginatedPlants('space-1'), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });

  it('returns speciesCount as the number of distinct plantSpeciesId values', async () => {
    const items = [
      { ...mockPlants[0], plantSpeciesId: 'sp1' },
      { ...mockPlants[1], plantSpeciesId: 'sp2' },
      { id: 'p3', name: 'Monstera 2', userId: 'u1', spaceId: 's1', plantSpeciesId: 'sp1', createdAt: '', updatedAt: '' },
    ];
    mockExecute.mockResolvedValue({ items, total: items.length, page: 1, perPage: 20, totalPages: 1 });

    const { result } = renderHook(() => usePaginatedPlants('space-1'), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.speciesCount).toBe(2);
  });

  it('returns speciesCount 0 when data is not loaded yet', () => {
    mockExecute.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => usePaginatedPlants('space-1'), { wrapper: makeWrapper() });

    expect(result.current.speciesCount).toBe(0);
  });

  it('refetches once ["plants", spaceId] is invalidated (as useCreatePlant/useDeletePlant do)', async () => {
    mockExecute.mockResolvedValue({ items: mockPlants, total: 2, page: 1, perPage: 20, totalPages: 1 });
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    const { result } = renderHook(() => usePaginatedPlants('space-1'), {
      wrapper: makeWrapper(queryClient),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockExecute).toHaveBeenCalledTimes(1);

    await queryClient.invalidateQueries({ queryKey: ['plants', 'space-1'] });

    await waitFor(() => expect(mockExecute).toHaveBeenCalledTimes(2));
  });
});
