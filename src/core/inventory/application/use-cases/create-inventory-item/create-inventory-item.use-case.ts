import type { IInventoryRepository } from '@/core/inventory/application/ports/inventory.repository.port';
import type { CreateInventoryItemInput } from '@/core/inventory/application/interfaces/create-inventory-item-input.interface';
import type { CreatedEntity } from '@/shared/domain/interfaces/created-entity.interface';

export class CreateInventoryItemUseCase {
  constructor(private readonly inventoryRepository: IInventoryRepository) {}

  async execute(input: CreateInventoryItemInput): Promise<CreatedEntity> {
    return this.inventoryRepository.create(input);
  }
}
