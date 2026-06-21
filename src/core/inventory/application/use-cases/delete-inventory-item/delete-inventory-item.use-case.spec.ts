import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeleteInventoryItemUseCase } from './delete-inventory-item.use-case';
import type { IInventoryRepository } from '@/core/inventory/application/ports/inventory.repository.port';

const mockRepository: IInventoryRepository = {
  findByCriteria: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  adjustQuantity: vi.fn(),
  delete: vi.fn(),
};

describe('DeleteInventoryItemUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('delegates to repository.delete with the id', async () => {
    vi.mocked(mockRepository.delete).mockResolvedValue(undefined);
    const useCase = new DeleteInventoryItemUseCase(mockRepository);

    await useCase.execute('item-1');

    expect(mockRepository.delete).toHaveBeenCalledWith('item-1');
  });
});
