import { describe, it, expect } from 'vitest';
import {
  filterInventoryItems,
  isLowStock,
  isExpiringSoon,
  type InventoryFiltersState,
} from './use-inventory-filters.hook';
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

const NOW = new Date('2026-06-01T00:00:00Z');

const baseState: InventoryFiltersState = {
  query: '',
  type: 'ALL',
  lowStockOnly: false,
  expiringSoonOnly: false,
};

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

describe('isExpiringSoon', () => {
  it('is true when expiresAt within the window', () => {
    expect(isExpiringSoon(makeItem({ expiresAt: '2026-06-10' }), NOW)).toBe(true);
  });
  it('is false when expiresAt far in the future', () => {
    expect(isExpiringSoon(makeItem({ expiresAt: '2026-12-01' }), NOW)).toBe(false);
  });
  it('is false when no expiry date', () => {
    expect(isExpiringSoon(makeItem({ expiresAt: null }), NOW)).toBe(false);
  });
});

describe('filterInventoryItems', () => {
  const items = [
    makeItem({ id: 'a', name: 'Lettuce seeds', itemType: 'SEEDS', quantity: 1, lowStockThreshold: 2 }),
    makeItem({ id: 'b', name: 'Tomato fertilizer', itemType: 'FERTILIZER', quantity: 500 }),
    makeItem({ id: 'c', name: 'Old spray', itemType: 'PHYTOSANITARY', expiresAt: '2026-06-05' }),
  ];

  it('returns all items with default state', () => {
    expect(filterInventoryItems(items, baseState, NOW)).toHaveLength(3);
  });

  it('filters by type', () => {
    const result = filterInventoryItems(items, { ...baseState, type: 'FERTILIZER' }, NOW);
    expect(result.map((i) => i.id)).toEqual(['b']);
  });

  it('filters by name query (case-insensitive)', () => {
    const result = filterInventoryItems(items, { ...baseState, query: 'tomato' }, NOW);
    expect(result.map((i) => i.id)).toEqual(['b']);
  });

  it('filters by low stock', () => {
    const result = filterInventoryItems(items, { ...baseState, lowStockOnly: true }, NOW);
    expect(result.map((i) => i.id)).toEqual(['a']);
  });

  it('filters by expiring soon', () => {
    const result = filterInventoryItems(items, { ...baseState, expiringSoonOnly: true }, NOW);
    expect(result.map((i) => i.id)).toEqual(['c']);
  });

  it('combines filters', () => {
    const result = filterInventoryItems(
      items,
      { ...baseState, type: 'SEEDS', lowStockOnly: true },
      NOW,
    );
    expect(result.map((i) => i.id)).toEqual(['a']);
  });
});
