import type { InventoryItem } from '@/core/inventory/domain/types/inventory-item.interface';
import type { CreateInventoryItemInput } from '@/core/inventory/application/interfaces/create-inventory-item-input.interface';
import type { UpdateInventoryItemInput } from '@/core/inventory/application/interfaces/update-inventory-item-input.interface';
import type { AdjustInventoryItemQuantityInput } from '@/core/inventory/application/interfaces/adjust-inventory-item-quantity-input.interface';
import type { CreatedEntity } from '@/shared/domain/interfaces/created-entity.interface';

export type {
  CreateInventoryItemInput,
  UpdateInventoryItemInput,
  AdjustInventoryItemQuantityInput,
};

export interface IInventoryRepository {
  findByCriteria(): Promise<InventoryItem[]>;
  findById(id: string): Promise<InventoryItem>;
  create(input: CreateInventoryItemInput): Promise<CreatedEntity>;
  update(input: UpdateInventoryItemInput): Promise<CreatedEntity>;
  adjustQuantity(input: AdjustInventoryItemQuantityInput): Promise<CreatedEntity>;
  delete(id: string): Promise<void>;
}
