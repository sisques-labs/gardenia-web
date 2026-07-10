import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';

const mockExecute = vi.hoisted(() => vi.fn());

vi.mock('@/core/plants/application/use-cases/search-species/search-species.use-case', () => ({
  SearchSpeciesUseCase: class {
    execute = mockExecute;
  },
}));

vi.mock('@/core/plants/infrastructure/repositories/graphql/plants.gql.repository', () => ({
  plantsGqlRepository: {},
}));

import { useSpeciesSearch } from './use-species-search.hook';

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return Wrapper;
}

describe('useSpeciesSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not query before the debounce delay elapses', async () => {
    const { result, rerender } = renderHook(({ query }) => useSpeciesSearch(query), {
      wrapper: makeWrapper(),
      initialProps: { query: '' },
    });

    rerender({ query: 'Monstera' });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });

    expect(result.current.isFetching).toBe(false);
    expect(mockExecute).not.toHaveBeenCalled();
  });

  it('queries after the debounce delay elapses', async () => {
    mockExecute.mockResolvedValue([{ gbifKey: 2882337, scientificName: 'Monstera deliciosa' }]);

    const { result } = renderHook(() => useSpeciesSearch('Monstera'), { wrapper: makeWrapper() });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    expect(mockExecute).toHaveBeenCalledWith('Monstera', 10);
    expect(result.current.data).toEqual([{ gbifKey: 2882337, scientificName: 'Monstera deliciosa' }]);
  });

  it('is disabled for queries shorter than 2 characters', async () => {
    const { result } = renderHook(() => useSpeciesSearch('M'), { wrapper: makeWrapper() });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    expect(result.current.isFetching).toBe(false);
    expect(mockExecute).not.toHaveBeenCalled();
  });

  it('surfaces an error state without throwing when the search fails', async () => {
    mockExecute.mockRejectedValue(new Error('network down'));

    const { result } = renderHook(() => useSpeciesSearch('Monstera'), { wrapper: makeWrapper() });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    expect(result.current.isError).toBe(true);
    expect(result.current.data).toBeUndefined();
  });
});
