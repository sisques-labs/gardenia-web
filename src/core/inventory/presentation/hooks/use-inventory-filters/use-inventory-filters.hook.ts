'use client';

import { useMemo, useState } from 'react';
import type { InventoryItem } from '@/core/inventory/domain/types/inventory-item.interface';
import {
  INITIAL_INVENTORY_FILTERS,
  type InventoryFiltersState,
} from './inventory-filters-state.interface';
import { filterInventoryItems } from './filter-inventory-items';

export function useInventoryFilters(items: InventoryItem[]) {
  const [filters, setFilters] = useState<InventoryFiltersState>(INITIAL_INVENTORY_FILTERS);

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
