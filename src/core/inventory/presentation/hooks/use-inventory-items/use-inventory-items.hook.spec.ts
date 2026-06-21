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

import { useInventoryItems } from './use-inventory-items.hook';

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

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return Wrapper;
}

describe('useInventoryItems', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns items on mount', async () => {
    mockExecute.mockResolvedValue(mockItems);
    const { result } = renderHook(() => useInventoryItems(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.items).toEqual(mockItems);
  });

  it('isLoading is true while in flight', () => {
    mockExecute.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useInventoryItems(), { wrapper: makeWrapper() });

    expect(result.current.isLoading).toBe(true);
  });

  it('returns empty array when use-case returns empty', async () => {
    mockExecute.mockResolvedValue([]);
    const { result } = renderHook(() => useInventoryItems(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.items).toEqual([]);
  });

  it('exposes error state when use-case rejects', async () => {
    mockExecute.mockRejectedValue(new Error('load failed'));
    const { result } = renderHook(() => useInventoryItems(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.error).toBeInstanceOf(Error));
  });
});
