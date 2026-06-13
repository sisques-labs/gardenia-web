import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';

const mockExecute = vi.hoisted(() => vi.fn());
const mockInvalidateQueries = vi.hoisted(() => vi.fn());

vi.mock('@/core/harvests/application/use-cases/delete-harvest/delete-harvest.use-case', () => ({
  DeleteHarvestUseCase: class {
    execute = mockExecute;
  },
}));

vi.mock('@/core/harvests/infrastructure/repositories/graphql/harvests.gql.repository', () => ({
  HarvestsGqlRepository: class {},
}));

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>();
  return {
    ...actual,
    useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
  };
});

import { useDeleteHarvest } from './use-delete-harvest.hook';

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return Wrapper;
}

describe('useDeleteHarvest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls DeleteHarvestUseCase.execute(id) on mutate', async () => {
    mockExecute.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteHarvest(), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.mutate('h1');
    });

    await waitFor(() => expect(mockExecute).toHaveBeenCalledWith('h1'));
  });

  it('invalidates harvests query on success', async () => {
    mockExecute.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteHarvest(), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.mutate('h1');
    });

    await waitFor(() =>
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['harvests'] })
    );
  });
});
