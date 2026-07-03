import type { InventoryItem } from '@/core/inventory/domain/types/inventory-item.interface';
import type { PaginatedResult } from '@/shared/domain/interfaces/paginated-result.interface';

export interface InventoryItemsFindByCriteriaResponse {
  inventoryItemsFindByCriteria: PaginatedResult<InventoryItem>;
}
