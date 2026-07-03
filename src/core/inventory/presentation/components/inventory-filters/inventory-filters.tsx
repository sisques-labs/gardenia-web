'use client';

import { ChevronDown } from 'lucide-react';
import { INVENTORY_ITEM_TYPES } from '@/core/inventory/domain/types/inventory-item.interface';
import type { InventoryItemType } from '@/core/inventory/domain/types/inventory-item.interface';
import type { InventoryFiltersState } from '@/core/inventory/presentation/hooks/use-inventory-filters/inventory-filters-state.interface';
import type { RemovableFilterKey } from '@/core/inventory/presentation/hooks/use-inventory-filters/use-inventory-filters.hook';
import { SearchInput } from '@/shared/presentation/components/ui/search-input/search-input';
import { Switch } from '@/shared/presentation/components/ui/switch/switch';
import { Button } from '@/shared/presentation/components/ui/button/button';
import { ActiveFilterChips, type ActiveFilter } from '@/shared/presentation/components/ui/active-filter-chips/active-filter-chips';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/shared/presentation/components/ui/dropdown-menu/dropdown-menu';
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

function buildActiveFilters(filters: InventoryFiltersState, dict: AppDict['inventory']): ActiveFilter[] {
  const active: ActiveFilter[] = [];
  const trimmedQuery = filters.query.trim();

  if (trimmedQuery) {
    active.push({ key: 'search', label: `${dict.filters.searchChipLabel}: ${trimmedQuery}` });
  }
  for (const type of filters.types) {
    active.push({ key: `type:${type}`, label: dict.types[type] });
  }
  if (filters.lowStockOnly) {
    active.push({ key: 'lowStock', label: dict.filters.lowStockOnly });
  }
  if (filters.expiringSoonOnly) {
    active.push({ key: 'expiringSoon', label: dict.filters.expiringSoon });
  }

  return active;
}

function typeTriggerLabel(filters: InventoryFiltersState, dict: AppDict['inventory']): string {
  if (filters.types.length === 0) return dict.filters.allTypes;
  if (filters.types.length === 1) return dict.types[filters.types[0]];
  return `${filters.types.length} ${dict.filters.typesSelectedSuffix}`;
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline" size="sm" className="w-48 justify-between font-normal">
              {typeTriggerLabel(filters, dict)}
              <ChevronDown className="h-3.5 w-3.5 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {INVENTORY_ITEM_TYPES.map((type) => (
              <DropdownMenuCheckboxItem
                key={type}
                checked={filters.types.includes(type)}
                onSelect={(e) => e.preventDefault()}
                onCheckedChange={() => onToggleType(type)}
              >
                {dict.types[type]}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

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
        onRemove={(key) => onRemoveFilter(key as RemovableFilterKey)}
      />
    </div>
  );
}
