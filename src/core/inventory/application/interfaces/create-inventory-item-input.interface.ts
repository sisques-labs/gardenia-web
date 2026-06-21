import type {
  InventoryItemType,
  InventoryUnit,
} from '@/core/inventory/domain/types/inventory-item.interface';

export interface CreateInventoryItemInput {
  itemType: InventoryItemType;
  name: string;
  brand?: string;
  notes?: string;
  quantity: number;
  unit: InventoryUnit;
  lowStockThreshold?: number;
  acquiredAt?: string;
  expiresAt?: string;
}
