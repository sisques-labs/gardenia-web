import type { IInventoryRepository } from '@/core/inventory/application/ports/inventory.repository.port';
import type { BulkDeleteResult } from '@/core/inventory/domain/interfaces/bulk-delete-result.interface';

export class DeleteInventoryItemsBulkUseCase {
  constructor(private readonly inventoryRepository: IInventoryRepository) {}

  async execute(ids: string[]): Promise<BulkDeleteResult> {
    return this.inventoryRepository.deleteBulk(ids);
  }
}
