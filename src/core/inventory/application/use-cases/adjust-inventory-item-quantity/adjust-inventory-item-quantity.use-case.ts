import type { IInventoryRepository } from '@/core/inventory/application/ports/inventory.repository.port';
import type { AdjustInventoryItemQuantityInput } from '@/core/inventory/application/interfaces/adjust-inventory-item-quantity-input.interface';
import type { CreatedEntity } from '@/shared/domain/interfaces/created-entity.interface';

export class AdjustInventoryItemQuantityUseCase {
  constructor(private readonly inventoryRepository: IInventoryRepository) {}

  async execute(input: AdjustInventoryItemQuantityInput): Promise<CreatedEntity> {
    return this.inventoryRepository.adjustQuantity(input);
  }
}
