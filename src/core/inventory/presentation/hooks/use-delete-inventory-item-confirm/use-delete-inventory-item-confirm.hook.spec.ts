import { act, renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { InventoryItem } from '@/core/inventory/domain/types/inventory-item.interface';

const mockMutate = vi.fn();

vi.mock('@/core/inventory/presentation/hooks/use-delete-inventory-item/use-delete-inventory-item.hook', () => ({
  useDeleteInventoryItem: () => ({ mutate: mockMutate, isError: false }),
}));

import { useDeleteInventoryItemConfirm } from './use-delete-inventory-item-confirm.hook';

function makeItem(overrides: Partial<InventoryItem> = {}): InventoryItem {
  return {
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
    ...overrides,
  };
}

describe('useDeleteInventoryItemConfirm', () => {
  beforeEach(() => {
    mockMutate.mockClear();
  });

  it('starts with no item pending deletion', () => {
    const { result } = renderHook(() => useDeleteInventoryItemConfirm());
    expect(result.current.itemToDelete).toBeNull();
  });

  it('requestDelete sets the pending item without calling the mutation', () => {
    const { result } = renderHook(() => useDeleteInventoryItemConfirm());
    const item = makeItem();

    act(() => {
      result.current.requestDelete(item);
    });

    expect(result.current.itemToDelete).toEqual(item);
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('confirmDelete calls the mutation with the pending item id and clears it', () => {
    const { result } = renderHook(() => useDeleteInventoryItemConfirm());
    const item = makeItem();

    act(() => {
      result.current.requestDelete(item);
    });
    act(() => {
      result.current.confirmDelete();
    });

    expect(mockMutate).toHaveBeenCalledWith(
      'i1',
      expect.objectContaining({ onSettled: expect.any(Function) }),
    );
  });

  it('confirmDelete does nothing when there is no pending item', () => {
    const { result } = renderHook(() => useDeleteInventoryItemConfirm());

    act(() => {
      result.current.confirmDelete();
    });

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('cancelDelete clears the pending item without calling the mutation', () => {
    const { result } = renderHook(() => useDeleteInventoryItemConfirm());
    const item = makeItem();

    act(() => {
      result.current.requestDelete(item);
    });
    act(() => {
      result.current.cancelDelete();
    });

    expect(result.current.itemToDelete).toBeNull();
    expect(mockMutate).not.toHaveBeenCalled();
  });
});
