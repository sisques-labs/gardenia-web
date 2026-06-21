import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { InventoryItem } from '@/core/inventory/domain/types/inventory-item.interface';

const mockCreateMutate = vi.hoisted(() => vi.fn());
const mockUpdateMutate = vi.hoisted(() => vi.fn());

vi.mock('@/core/inventory/presentation/hooks/use-create-inventory-item/use-create-inventory-item.hook', () => ({
  useCreateInventoryItem: vi.fn(() => ({ mutate: mockCreateMutate, isPending: false })),
}));

vi.mock('@/core/inventory/presentation/hooks/use-update-inventory-item/use-update-inventory-item.hook', () => ({
  useUpdateInventoryItem: vi.fn(() => ({ mutate: mockUpdateMutate, isPending: false })),
}));

import { useInventoryItemForm } from './use-inventory-item-form.hook';

const mockItem: InventoryItem = {
  id: 'item-1',
  itemType: 'FERTILIZER',
  name: 'Tomato fertilizer',
  brand: 'Compo',
  notes: 'half used',
  quantity: 500,
  unit: 'G',
  lowStockThreshold: 100,
  acquiredAt: '2026-01-01T00:00:00.000Z',
  expiresAt: '2026-12-01T00:00:00.000Z',
  userId: 'u1',
  spaceId: 's1',
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

describe('useInventoryItemForm', () => {
  beforeEach(() => vi.clearAllMocks());

  it('defaults to create mode with SEEDS/UNITS', () => {
    const { result } = renderHook(() => useInventoryItemForm({ onClose: vi.fn() }));
    expect(result.current.isEditing).toBe(false);
    expect(result.current.selectedType).toBe('SEEDS');
    expect(result.current.selectedUnit).toBe('UNITS');
  });

  it('calls createItem on submit in create mode', async () => {
    mockCreateMutate.mockImplementation((_input: unknown, options: { onSuccess: () => void }) => {
      options.onSuccess();
    });
    const onClose = vi.fn();
    const { result } = renderHook(() => useInventoryItemForm({ onClose }));

    await act(async () => {
      result.current.form.setValue('name', 'Lettuce seeds');
      result.current.form.setValue('quantity', 3);
      result.current.setUnit('PACKETS');
    });
    await act(async () => {
      await result.current.onSubmit();
    });

    expect(mockUpdateMutate).not.toHaveBeenCalled();
    expect(mockCreateMutate).toHaveBeenCalledWith(
      expect.objectContaining({ itemType: 'SEEDS', name: 'Lettuce seeds', quantity: 3, unit: 'PACKETS' }),
      expect.any(Object),
    );
    expect(onClose).toHaveBeenCalled();
  });

  it('prefills values and updates on submit in edit mode', async () => {
    mockUpdateMutate.mockImplementation((_input: unknown, options: { onSuccess: () => void }) => {
      options.onSuccess();
    });
    const onClose = vi.fn();
    const { result } = renderHook(() => useInventoryItemForm({ item: mockItem, onClose }));

    expect(result.current.isEditing).toBe(true);
    expect(result.current.form.getValues()).toMatchObject({
      itemType: 'FERTILIZER',
      name: 'Tomato fertilizer',
      brand: 'Compo',
      unit: 'G',
      acquiredAt: '2026-01-01',
      expiresAt: '2026-12-01',
    });

    await act(async () => {
      await result.current.onSubmit();
    });

    expect(mockCreateMutate).not.toHaveBeenCalled();
    expect(mockUpdateMutate).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'item-1', name: 'Tomato fertilizer' }),
      expect.any(Object),
    );
    expect(onClose).toHaveBeenCalled();
  });

  it('exposes setType to change the selected type', async () => {
    const { result } = renderHook(() => useInventoryItemForm({ onClose: vi.fn() }));
    await act(async () => {
      result.current.setType('SUBSTRATE');
    });
    expect(result.current.selectedType).toBe('SUBSTRATE');
  });
});
