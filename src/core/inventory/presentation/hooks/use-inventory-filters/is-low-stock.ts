import type { InventoryItem } from '@/core/inventory/domain/types/inventory-item.interface';

export function isLowStock(item: InventoryItem): boolean {
  return item.lowStockThreshold != null && item.quantity <= item.lowStockThreshold;
}
