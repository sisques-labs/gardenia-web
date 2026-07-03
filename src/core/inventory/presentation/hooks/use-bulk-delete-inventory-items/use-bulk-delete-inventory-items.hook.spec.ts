import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';

const mockExecute = vi.hoisted(() => vi.fn());

vi.mock('@/core/inventory/application/use-cases/delete-inventory-items-bulk/delete-inventory-items-bulk.use-case', () => ({
  DeleteInventoryItemsBulkUseCase: class {
    execute = mockExecute;
  },
}));

vi.mock('@/core/inventory/infrastructure/repositories/graphql/inventory.gql.repository', () => ({
  InventoryGqlRepository: class {},
}));

import { useBulkDeleteInventoryItems } from './use-bulk-delete-inventory-items.hook';

function makeWrapper(client?: QueryClient) {
  const queryClient = client ?? new QueryClient({ defaultOptions: { queries: { retry: false } } });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return Wrapper;
}

describe('useBulkDeleteInventoryItems', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls the use-case with the given ids and returns the result', async () => {
    const result = { deletedIds: ['i1', 'i2'], notFoundIds: [], deletedCount: 2, requestedCount: 2 };
    mockExecute.mockResolvedValue(result);
    const { result: hookResult } = renderHook(() => useBulkDeleteInventoryItems(), {
      wrapper: makeWrapper(),
    });

    hookResult.current.mutate(['i1', 'i2']);

    await waitFor(() => expect(hookResult.current.isSuccess).toBe(true));
    expect(mockExecute).toHaveBeenCalledWith(['i1', 'i2']);
    expect(hookResult.current.data).toEqual(result);
  });

  it('invalidates ["inventory"] on settle', async () => {
    mockExecute.mockResolvedValue({ deletedIds: ['i1'], notFoundIds: [], deletedCount: 1, requestedCount: 1 });
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useBulkDeleteInventoryItems(), { wrapper: makeWrapper(queryClient) });
    result.current.mutate(['i1']);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['inventory'] });
  });

  it('exposes error state when the use-case rejects', async () => {
    mockExecute.mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => useBulkDeleteInventoryItems(), { wrapper: makeWrapper() });

    result.current.mutate(['i1']);

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
