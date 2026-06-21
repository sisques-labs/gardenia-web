import type { IInventoryRepository } from '@/core/inventory/application/ports/inventory.repository.port';
import type { UpdateInventoryItemInput } from '@/core/inventory/application/interfaces/update-inventory-item-input.interface';
import type { InventoryItem } from '@/core/inventory/domain/types/inventory-item.interface';

export class UpdateInventoryItemUseCase {
  constructor(private readonly inventoryRepository: IInventoryRepository) {}

  async execute(input: UpdateInventoryItemInput): Promise<InventoryItem> {
    return this.inventoryRepository.update(input);
  }
}
