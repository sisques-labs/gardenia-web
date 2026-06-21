import type { IInventoryRepository } from '@/core/inventory/application/ports/inventory.repository.port';

export class DeleteInventoryItemUseCase {
  constructor(private readonly inventoryRepository: IInventoryRepository) {}

  async execute(id: string): Promise<void> {
    return this.inventoryRepository.delete(id);
  }
}
