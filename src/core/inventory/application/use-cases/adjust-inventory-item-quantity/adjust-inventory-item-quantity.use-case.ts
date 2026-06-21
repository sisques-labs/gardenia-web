import type { IInventoryRepository } from '@/core/inventory/application/ports/inventory.repository.port';
import type { AdjustInventoryItemQuantityInput } from '@/core/inventory/application/interfaces/adjust-inventory-item-quantity-input.interface';
import type { InventoryItem } from '@/core/inventory/domain/types/inventory-item.interface';

export class AdjustInventoryItemQuantityUseCase {
  constructor(private readonly inventoryRepository: IInventoryRepository) {}

  async execute(input: AdjustInventoryItemQuantityInput): Promise<InventoryItem> {
    return this.inventoryRepository.adjustQuantity(input);
  }
}
