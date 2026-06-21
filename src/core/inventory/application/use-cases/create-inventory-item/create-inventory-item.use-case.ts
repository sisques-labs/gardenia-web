import type { IInventoryRepository } from '@/core/inventory/application/ports/inventory.repository.port';
import type { CreateInventoryItemInput } from '@/core/inventory/application/interfaces/create-inventory-item-input.interface';
import type { InventoryItem } from '@/core/inventory/domain/types/inventory-item.interface';

export class CreateInventoryItemUseCase {
  constructor(private readonly inventoryRepository: IInventoryRepository) {}

  async execute(input: CreateInventoryItemInput): Promise<InventoryItem> {
    return this.inventoryRepository.create(input);
  }
}
