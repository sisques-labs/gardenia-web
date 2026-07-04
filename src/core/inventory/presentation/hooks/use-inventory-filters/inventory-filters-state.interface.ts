import type { InventoryItemType } from '@/core/inventory/domain/types/inventory-item.interface';

export interface InventoryFiltersState {
  query: string;
  types: InventoryItemType[];
  lowStockOnly: boolean;
  expiringSoonOnly: boolean;
}

export const INITIAL_INVENTORY_FILTERS: InventoryFiltersState = {
  query: '',
  types: [],
  lowStockOnly: false,
  expiringSoonOnly: false,
};
