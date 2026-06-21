import { describe, it, expect } from 'vitest';
import { toUpdateInventoryItemInput } from './to-update-inventory-item-input';
import type { InventoryItemFormValues } from '@/core/inventory/presentation/schemas/inventory-item.schema';

const base: InventoryItemFormValues = {
  itemType: 'FERTILIZER',
  name: 'Tomato fertilizer',
  brand: '',
  notes: 'half used',
  quantity: 500,
  unit: 'G',
  lowStockThreshold: undefined,
  acquiredAt: '',
  expiresAt: '',
};

describe('toUpdateInventoryItemInput', () => {
  it('includes the id', () => {
    expect(toUpdateInventoryItemInput('item-1', base).id).toBe('item-1');
  });

  it('never includes quantity', () => {
    expect(toUpdateInventoryItemInput('item-1', base)).not.toHaveProperty('quantity');
  });

  it('maps empty optional strings to null so they can be cleared', () => {
    const result = toUpdateInventoryItemInput('item-1', base);
    expect(result.brand).toBeNull();
    expect(result.acquiredAt).toBeNull();
    expect(result.expiresAt).toBeNull();
    expect(result.lowStockThreshold).toBeNull();
  });

  it('keeps provided values', () => {
    const result = toUpdateInventoryItemInput('item-1', base);
    expect(result).toMatchObject({ itemType: 'FERTILIZER', name: 'Tomato fertilizer', unit: 'G', notes: 'half used' });
  });
});
