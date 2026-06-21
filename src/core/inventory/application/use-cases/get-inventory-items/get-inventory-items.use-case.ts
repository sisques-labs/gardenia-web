import type { IInventoryRepository } from '@/core/inventory/application/ports/inventory.repository.port';
import type { InventoryItem } from '@/core/inventory/domain/types/inventory-item.interface';

export class GetInventoryItemsUseCase {
  constructor(private readonly inventoryRepository: IInventoryRepository) {}

  async execute(): Promise<InventoryItem[]> {
    return this.inventoryRepository.findByCriteria();
  }
}
