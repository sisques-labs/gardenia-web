import { describe, it, expect } from 'vitest';
import { isLowStock } from './is-low-stock';
import type { InventoryItem } from '@/core/inventory/domain/types/inventory-item.interface';

function makeItem(overrides: Partial<InventoryItem>): InventoryItem {
  return {
    id: 'i',
    itemType: 'SEEDS',
    name: 'Item',
    brand: null,
    notes: null,
    quantity: 5,
    unit: 'UNITS',
    lowStockThreshold: null,
    acquiredAt: null,
    expiresAt: null,
    userId: 'u',
    spaceId: 's',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    ...overrides,
  };
}

describe('isLowStock', () => {
  it('is true when quantity <= threshold', () => {
    expect(isLowStock(makeItem({ quantity: 1, lowStockThreshold: 2 }))).toBe(true);
  });
  it('is false when no threshold set', () => {
    expect(isLowStock(makeItem({ quantity: 0, lowStockThreshold: null }))).toBe(false);
  });
  it('is false when quantity above threshold', () => {
    expect(isLowStock(makeItem({ quantity: 5, lowStockThreshold: 2 }))).toBe(false);
  });
});
