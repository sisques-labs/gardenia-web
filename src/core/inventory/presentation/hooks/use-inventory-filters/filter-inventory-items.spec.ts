import { describe, it, expect } from 'vitest';
import { filterInventoryItems } from './filter-inventory-items';
import type { InventoryFiltersState } from './inventory-filters-state.interface';
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
    const result = filterInventoryItems(items, { ...baseState, type: 'SEEDS', lowStockOnly: true }, NOW);
    expect(result.map((i) => i.id)).toEqual(['a']);
  });
});
