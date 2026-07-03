'use client';

import { useMemo, useState } from 'react';
import { useDebouncedValue } from '@/shared/presentation/hooks/use-debounced-value/use-debounced-value.hook';
import { InventoryItemQueryableField } from '@/core/inventory/domain/enums/inventory-item-queryable-field.enum';
import { FilterOperator } from '@/shared/domain/enums/filter-operator.enum';
import type { InventoryItemType } from '@/core/inventory/domain/types/inventory-item.interface';
import type { InventoryFilter } from '@/core/inventory/application/interfaces/inventory-filter.interface';
import { EXPIRING_SOON_DAYS } from './is-expiring-soon';
import {
  INITIAL_INVENTORY_FILTERS,
  type InventoryFiltersState,
} from './inventory-filters-state.interface';

export type RemovableFilterKey = 'search' | 'lowStock' | 'expiringSoon' | `type:${InventoryItemType}`;

export function useInventoryFilters() {
  const [filterState, setFilterState] = useState<InventoryFiltersState>(INITIAL_INVENTORY_FILTERS);
  const debouncedQuery = useDebouncedValue(filterState.query);
  // Read once (state initializer, not during render) so the "expiring soon"
  // cutoff stays stable across re-renders instead of calling the impure
  // Date.now() directly in the memoized computation below.
  const [now] = useState(() => Date.now());

  const filters = useMemo<InventoryFilter[]>(() => {
    const result: InventoryFilter[] = [];

    const trimmed = debouncedQuery.trim();
    if (trimmed) {
      result.push({ field: InventoryItemQueryableField.NAME, operator: FilterOperator.LIKE, value: trimmed });
    }
    if (filterState.types.length === 1) {
      result.push({
        field: InventoryItemQueryableField.ITEM_TYPE,
        operator: FilterOperator.EQUALS,
        value: filterState.types[0],
      });
    } else if (filterState.types.length > 1) {
      result.push({
        field: InventoryItemQueryableField.ITEM_TYPE,
        operator: FilterOperator.IN,
        value: filterState.types,
      });
    }
    if (filterState.lowStockOnly) {
      result.push({ field: InventoryItemQueryableField.LOW_STOCK, operator: FilterOperator.EQUALS, value: true });
    }
    if (filterState.expiringSoonOnly) {
      const cutoff = new Date(now + EXPIRING_SOON_DAYS * 24 * 60 * 60 * 1000);
      result.push({
        field: InventoryItemQueryableField.EXPIRES_AT,
        operator: FilterOperator.LESS_THAN_OR_EQUAL,
        value: cutoff,
      });
    }

    return result;
  }, [debouncedQuery, filterState.types, filterState.lowStockOnly, filterState.expiringSoonOnly, now]);

  function setQuery(query: string) {
    setFilterState((s) => ({ ...s, query }));
  }

  function toggleType(type: InventoryItemType) {
    setFilterState((s) => ({
      ...s,
      types: s.types.includes(type) ? s.types.filter((t) => t !== type) : [...s.types, type],
    }));
  }

  function toggleLowStock() {
    setFilterState((s) => ({ ...s, lowStockOnly: !s.lowStockOnly }));
  }

  function toggleExpiringSoon() {
    setFilterState((s) => ({ ...s, expiringSoonOnly: !s.expiringSoonOnly }));
  }

  function removeFilter(key: RemovableFilterKey) {
    if (key === 'search') {
      setFilterState((s) => ({ ...s, query: '' }));
      return;
    }
    if (key === 'lowStock') {
      setFilterState((s) => ({ ...s, lowStockOnly: false }));
      return;
    }
    if (key === 'expiringSoon') {
      setFilterState((s) => ({ ...s, expiringSoonOnly: false }));
      return;
    }
    const type = key.slice('type:'.length) as InventoryItemType;
    setFilterState((s) => ({ ...s, types: s.types.filter((t) => t !== type) }));
  }

  return {
    filterState,
    filters,
    setQuery,
    toggleType,
    toggleLowStock,
    toggleExpiringSoon,
    removeFilter,
  };
}
