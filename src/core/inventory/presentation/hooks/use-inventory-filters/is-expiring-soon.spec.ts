import { describe, it, expect } from 'vitest';
import { isExpiringSoon } from './is-expiring-soon';
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
