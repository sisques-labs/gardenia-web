import type { IInventoryRepository } from '@/core/inventory/application/ports/inventory.repository.port';
import type { UpdateInventoryItemInput } from '@/core/inventory/application/interfaces/update-inventory-item-input.interface';
import type { CreatedEntity } from '@/shared/domain/interfaces/created-entity.interface';

export class UpdateInventoryItemUseCase {
  constructor(private readonly inventoryRepository: IInventoryRepository) {}

  async execute(input: UpdateInventoryItemInput): Promise<CreatedEntity> {
    return this.inventoryRepository.update(input);
  }
}
