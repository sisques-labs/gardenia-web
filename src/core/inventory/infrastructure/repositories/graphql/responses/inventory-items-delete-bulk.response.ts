import type { BulkDeleteResult } from '@/core/inventory/domain/interfaces/bulk-delete-result.interface';

export interface InventoryItemsDeleteBulkResponse {
  inventoryItemsDeleteBulk: BulkDeleteResult;
}
