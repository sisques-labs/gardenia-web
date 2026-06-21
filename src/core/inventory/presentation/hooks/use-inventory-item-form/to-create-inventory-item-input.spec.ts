import { describe, it, expect } from 'vitest';
import { toCreateInventoryItemInput } from './to-create-inventory-item-input';
import type { InventoryItemFormValues } from '@/core/inventory/presentation/schemas/inventory-item.schema';

const base: InventoryItemFormValues = {
  itemType: 'SEEDS',
  name: '  Lettuce seeds  ',
  brand: '  Batlle  ',
  notes: '',
  quantity: 3,
  unit: 'PACKETS',
  lowStockThreshold: 1,
  acquiredAt: '2026-01-01',
  expiresAt: '',
};

describe('toCreateInventoryItemInput', () => {
  it('trims name and optional strings', () => {
    const result = toCreateInventoryItemInput(base);
    expect(result.name).toBe('Lettuce seeds');
    expect(result.brand).toBe('Batlle');
  });

  it('maps empty optional strings to undefined', () => {
    const result = toCreateInventoryItemInput(base);
    expect(result.notes).toBeUndefined();
    expect(result.expiresAt).toBeUndefined();
  });

  it('keeps quantity, unit, type and threshold', () => {
    const result = toCreateInventoryItemInput(base);
    expect(result).toMatchObject({
      itemType: 'SEEDS',
      unit: 'PACKETS',
      quantity: 3,
      lowStockThreshold: 1,
      acquiredAt: '2026-01-01',
    });
  });
});
