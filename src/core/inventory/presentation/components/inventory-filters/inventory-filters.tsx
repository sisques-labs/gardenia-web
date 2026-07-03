'use client';

import { INVENTORY_ITEM_TYPES } from '@/core/inventory/domain/types/inventory-item.interface';
import type { InventoryFiltersState } from '@/core/inventory/presentation/hooks/use-inventory-filters/inventory-filters-state.interface';
import { SearchInput } from '@/shared/presentation/components/ui/search-input/search-input';
import { Switch } from '@/shared/presentation/components/ui/switch/switch';
import { ActiveFilterChips, type ActiveFilter } from '@/shared/presentation/components/ui/active-filter-chips/active-filter-chips';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/presentation/components/ui/select/select';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

type FilterKey = 'search' | 'type' | 'lowStock' | 'expiringSoon';

type Props = {
  dict: AppDict['inventory'];
  filters: InventoryFiltersState;
  onQueryChange: (query: string) => void;
  onTypeChange: (type: InventoryFiltersState['type']) => void;
  onToggleLowStock: () => void;
  onToggleExpiringSoon: () => void;
  onRemoveFilter: (key: FilterKey) => void;
};

function buildActiveFilters(filters: InventoryFiltersState, dict: AppDict['inventory']): ActiveFilter[] {
  const active: ActiveFilter[] = [];
  const trimmedQuery = filters.query.trim();

  if (trimmedQuery) {
    active.push({ key: 'search', label: `${dict.filters.searchChipLabel}: ${trimmedQuery}` });
  }
  if (filters.type !== 'ALL') {
    active.push({ key: 'type', label: dict.types[filters.type] });
  }
  if (filters.lowStockOnly) {
    active.push({ key: 'lowStock', label: dict.filters.lowStockOnly });
  }
  if (filters.expiringSoonOnly) {
    active.push({ key: 'expiringSoon', label: dict.filters.expiringSoon });
  }

  return active;
}

export function InventoryFilters({
  dict,
  filters,
  onQueryChange,
  onTypeChange,
  onToggleLowStock,
  onToggleExpiringSoon,
  onRemoveFilter,
}: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-4">
        <SearchInput
          placeholder={dict.filters.searchPlaceholder}
          value={filters.query}
          onChange={(e) => onQueryChange(e.target.value)}
          onClear={() => onQueryChange('')}
          className="w-64"
        />

        <Select
          value={filters.type}
          onValueChange={(value) => onTypeChange(value as InventoryFiltersState['type'])}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{dict.filters.allTypes}</SelectItem>
            {INVENTORY_ITEM_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {dict.types[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <label className="flex items-center gap-2 text-sm text-ink-2">
          <Switch checked={filters.lowStockOnly} onCheckedChange={onToggleLowStock} />
          {dict.filters.lowStockOnly}
        </label>

        <label className="flex items-center gap-2 text-sm text-ink-2">
          <Switch checked={filters.expiringSoonOnly} onCheckedChange={onToggleExpiringSoon} />
          {dict.filters.expiringSoon}
        </label>
      </div>

      <ActiveFilterChips
        filters={buildActiveFilters(filters, dict)}
        onRemove={(key) => onRemoveFilter(key as FilterKey)}
      />
    </div>
  );
}
