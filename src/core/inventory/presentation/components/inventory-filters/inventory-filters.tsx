'use client';

import { INVENTORY_ITEM_TYPES } from '@/core/inventory/domain/types/inventory-item.interface';
import type { InventoryItemType } from '@/core/inventory/domain/types/inventory-item.interface';
import type { InventoryFiltersState } from '@/core/inventory/presentation/hooks/use-inventory-filters/inventory-filters-state.interface';
import type { RemovableFilterKey } from '@/core/inventory/presentation/hooks/use-inventory-filters/use-inventory-filters.hook';
import { FilterBar, type FilterDescriptor } from '@/shared/presentation/components/ui/filter-bar/filter-bar';
import type { ActiveFilter } from '@/shared/presentation/components/ui/active-filter-chips/active-filter-chips';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

type Props = {
  dict: AppDict['inventory'];
  filters: InventoryFiltersState;
  onQueryChange: (query: string) => void;
  onToggleType: (type: InventoryItemType) => void;
  onToggleLowStock: () => void;
  onToggleExpiringSoon: () => void;
  onRemoveFilter: (key: RemovableFilterKey) => void;
};

function buildChips(filters: InventoryFiltersState, dict: AppDict['inventory']): ActiveFilter[] {
  const chips: ActiveFilter[] = [];
  const trimmedQuery = filters.query.trim();

  if (trimmedQuery) {
    chips.push({ key: 'search', label: `${dict.filters.searchChipLabel}: ${trimmedQuery}` });
  }
  for (const type of filters.types) {
    chips.push({ key: `type:${type}`, label: dict.types[type] });
  }
  if (filters.lowStockOnly) {
    chips.push({ key: 'lowStock', label: dict.filters.lowStockOnly });
  }
  if (filters.expiringSoonOnly) {
    chips.push({ key: 'expiringSoon', label: dict.filters.expiringSoon });
  }

  return chips;
}

export function InventoryFilters({
  dict,
  filters,
  onQueryChange,
  onToggleType,
  onToggleLowStock,
  onToggleExpiringSoon,
  onRemoveFilter,
}: Props) {
  const descriptors: FilterDescriptor[] = [
    {
      type: 'search',
      key: 'search',
      placeholder: dict.filters.searchPlaceholder,
      value: filters.query,
      onChange: onQueryChange,
    },
    {
      type: 'select',
      key: 'type',
      allLabel: dict.filters.allTypes,
      selectedSuffix: dict.filters.typesSelectedSuffix,
      options: INVENTORY_ITEM_TYPES.map((itemType) => ({ value: itemType, label: dict.types[itemType] })),
      selected: filters.types,
      onToggle: (value) => onToggleType(value as InventoryItemType),
    },
    {
      type: 'toggle',
      key: 'lowStock',
      label: dict.filters.lowStockOnly,
      checked: filters.lowStockOnly,
      onChange: onToggleLowStock,
    },
    {
      type: 'toggle',
      key: 'expiringSoon',
      label: dict.filters.expiringSoon,
      checked: filters.expiringSoonOnly,
      onChange: onToggleExpiringSoon,
    },
  ];

  return (
    <FilterBar
      filters={descriptors}
      chips={buildChips(filters, dict)}
      onRemoveChip={(key) => onRemoveFilter(key as RemovableFilterKey)}
    />
  );
}
