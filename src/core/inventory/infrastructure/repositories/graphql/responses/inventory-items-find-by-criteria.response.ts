import type { InventoryItem } from '@/core/inventory/domain/types/inventory-item.interface';

export interface InventoryItemsFindByCriteriaResponse {
  inventoryItemsFindByCriteria: { items: InventoryItem[] };
}
