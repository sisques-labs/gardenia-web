import type { InventoryItem } from '@/core/inventory/domain/types/inventory-item.interface';

export interface InventoryItemFindByIdResponse {
  inventoryItemFindById: InventoryItem | null;
}
