'use client';

import { useMemo, useState } from 'react';
import type {
  InventoryItem,
  InventoryItemType,
} from '@/core/inventory/domain/types/inventory-item.interface';

export const EXPIRING_SOON_DAYS = 30;

export function isLowStock(item: InventoryItem): boolean {
  return item.lowStockThreshold != null && item.quantity <= item.lowStockThreshold;
}

export function isExpiringSoon(
  item: InventoryItem,
  now: Date = new Date(),
  withinDays: number = EXPIRING_SOON_DAYS,
): boolean {
  if (!item.expiresAt) return false;
  const expires = new Date(item.expiresAt).getTime();
  const threshold = now.getTime() + withinDays * 24 * 60 * 60 * 1000;
  return expires <= threshold;
}

export interface InventoryFiltersState {
  query: string;
  type: InventoryItemType | 'ALL';
  lowStockOnly: boolean;
  expiringSoonOnly: boolean;
}

const INITIAL_STATE: InventoryFiltersState = {
  query: '',
  type: 'ALL',
  lowStockOnly: false,
  expiringSoonOnly: false,
};

export function filterInventoryItems(
  items: InventoryItem[],
  state: InventoryFiltersState,
  now: Date = new Date(),
): InventoryItem[] {
  const normalizedQuery = state.query.trim().toLowerCase();
  return items.filter((item) => {
    if (state.type !== 'ALL' && item.itemType !== state.type) return false;
    if (normalizedQuery && !item.name.toLowerCase().includes(normalizedQuery)) return false;
    if (state.lowStockOnly && !isLowStock(item)) return false;
    if (state.expiringSoonOnly && !isExpiringSoon(item, now)) return false;
    return true;
  });
}

export function useInventoryFilters(items: InventoryItem[]) {
  const [filters, setFilters] = useState<InventoryFiltersState>(INITIAL_STATE);

  const filteredItems = useMemo(() => filterInventoryItems(items, filters), [items, filters]);

  return {
    filters,
    filteredItems,
    setQuery: (query: string) => setFilters((s) => ({ ...s, query })),
    setType: (type: InventoryFiltersState['type']) => setFilters((s) => ({ ...s, type })),
    toggleLowStock: () => setFilters((s) => ({ ...s, lowStockOnly: !s.lowStockOnly })),
    toggleExpiringSoon: () => setFilters((s) => ({ ...s, expiringSoonOnly: !s.expiringSoonOnly })),
  };
}
