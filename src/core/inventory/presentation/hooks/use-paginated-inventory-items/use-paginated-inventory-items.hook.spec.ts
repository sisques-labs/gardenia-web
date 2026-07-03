import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import type { InventoryItem } from '@/core/inventory/domain/types/inventory-item.interface';

const mockExecute = vi.hoisted(() => vi.fn());

vi.mock('@/core/inventory/application/use-cases/get-inventory-items/get-inventory-items.use-case', () => ({
  GetInventoryItemsUseCase: class {
    execute = mockExecute;
  },
}));

vi.mock('@/core/inventory/infrastructure/repositories/graphql/inventory.gql.repository', () => ({
  InventoryGqlRepository: class {},
}));

import { usePaginatedInventoryItems } from './use-paginated-inventory-items.hook';

const mockItems: InventoryItem[] = [
  {
    id: 'i1',
    itemType: 'SEEDS',
    name: 'Lettuce seeds',
    brand: null,
    notes: null,
    quantity: 3,
    unit: 'PACKETS',
    lowStockThreshold: null,
    acquiredAt: null,
    expiresAt: null,
    userId: 'u1',
    spaceId: 's1',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
];

function makeWrapper(client?: QueryClient) {
  const queryClient = client ?? new QueryClient({ defaultOptions: { queries: { retry: false } } });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return Wrapper;
}

describe('usePaginatedInventoryItems', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns the paginated result on mount', async () => {
    mockExecute.mockResolvedValue({ items: mockItems, total: 1, page: 1, perPage: 20, totalPages: 1 });

    const { result } = renderHook(() => usePaginatedInventoryItems(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.items).toEqual(mockItems);
    expect(result.current.data?.total).toBe(1);
  });

  it('defaults to page 1 and perPage 20 when no options are given', async () => {
    mockExecute.mockResolvedValue({ items: [], total: 0, page: 1, perPage: 20, totalPages: 0 });

    renderHook(() => usePaginatedInventoryItems(), { wrapper: makeWrapper() });

    await waitFor(() =>
      expect(mockExecute).toHaveBeenCalledWith({
        filters: [],
        sorts: [],
        pagination: { page: 1, perPage: 20 },
      }),
    );
  });

  it('forwards page, perPage, filters and sorts to the use case', async () => {
    mockExecute.mockResolvedValue({ items: [], total: 0, page: 2, perPage: 5, totalPages: 0 });
    const filters = [{ field: 'ITEM_TYPE' as never, operator: 'EQUALS' as never, value: 'SEEDS' }];
    const sorts = [{ field: 'NAME' as never, direction: 'ASC' as never }];

    renderHook(() => usePaginatedInventoryItems({ page: 2, perPage: 5, filters, sorts }), {
      wrapper: makeWrapper(),
    });

    await waitFor(() =>
      expect(mockExecute).toHaveBeenCalledWith({ filters, sorts, pagination: { page: 2, perPage: 5 } }),
    );
  });

  it('propagates errors from the use case', async () => {
    mockExecute.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => usePaginatedInventoryItems(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });

  it('refetches once ["inventory"] is invalidated (as create/update/delete/adjust do)', async () => {
    mockExecute.mockResolvedValue({ items: mockItems, total: 1, page: 1, perPage: 20, totalPages: 1 });
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    const { result } = renderHook(() => usePaginatedInventoryItems(), { wrapper: makeWrapper(queryClient) });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockExecute).toHaveBeenCalledTimes(1);

    await queryClient.invalidateQueries({ queryKey: ['inventory'] });

    await waitFor(() => expect(mockExecute).toHaveBeenCalledTimes(2));
  });
});
