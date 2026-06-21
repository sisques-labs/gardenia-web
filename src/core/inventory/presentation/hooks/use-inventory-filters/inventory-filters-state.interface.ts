import type { InventoryItemType } from '@/core/inventory/domain/types/inventory-item.interface';

export interface InventoryFiltersState {
  query: string;
  type: InventoryItemType | 'ALL';
  lowStockOnly: boolean;
  expiringSoonOnly: boolean;
}

export const INITIAL_INVENTORY_FILTERS: InventoryFiltersState = {
  query: '',
  type: 'ALL',
  lowStockOnly: false,
  expiringSoonOnly: false,
};
