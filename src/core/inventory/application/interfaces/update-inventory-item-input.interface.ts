import type {
  InventoryItemType,
  InventoryUnit,
} from '@/core/inventory/domain/types/inventory-item.interface';

/**
 * Update never changes `quantity` — stock is modified exclusively via
 * `adjustQuantity`. Nullable fields can be cleared by sending `null`.
 */
export interface UpdateInventoryItemInput {
  id: string;
  itemType?: InventoryItemType;
  name?: string;
  brand?: string | null;
  notes?: string | null;
  unit?: InventoryUnit;
  lowStockThreshold?: number | null;
  acquiredAt?: string | null;
  expiresAt?: string | null;
}
