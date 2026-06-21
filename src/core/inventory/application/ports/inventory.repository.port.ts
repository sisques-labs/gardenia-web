import type { InventoryItem } from '@/core/inventory/domain/types/inventory-item.interface';
import type { CreateInventoryItemInput } from '@/core/inventory/application/interfaces/create-inventory-item-input.interface';
import type { UpdateInventoryItemInput } from '@/core/inventory/application/interfaces/update-inventory-item-input.interface';
import type { AdjustInventoryItemQuantityInput } from '@/core/inventory/application/interfaces/adjust-inventory-item-quantity-input.interface';

export type {
  CreateInventoryItemInput,
  UpdateInventoryItemInput,
  AdjustInventoryItemQuantityInput,
};

export interface IInventoryRepository {
  findByCriteria(): Promise<InventoryItem[]>;
  findById(id: string): Promise<InventoryItem>;
  create(input: CreateInventoryItemInput): Promise<InventoryItem>;
  update(input: UpdateInventoryItemInput): Promise<InventoryItem>;
  adjustQuantity(input: AdjustInventoryItemQuantityInput): Promise<InventoryItem>;
  delete(id: string): Promise<void>;
}
