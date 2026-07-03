import type { IInventoryRepository } from '@/core/inventory/application/ports/inventory.repository.port';
import type { InventoryListCriteria } from '@/core/inventory/application/interfaces/inventory-list-criteria.interface';
import type { InventoryItem } from '@/core/inventory/domain/types/inventory-item.interface';
import type { PaginatedResult } from '@/shared/domain/interfaces/paginated-result.interface';

export class GetInventoryItemsUseCase {
  constructor(private readonly inventoryRepository: IInventoryRepository) {}

  async execute(criteria?: InventoryListCriteria): Promise<PaginatedResult<InventoryItem>> {
    return this.inventoryRepository.findByCriteria(criteria);
  }
}
