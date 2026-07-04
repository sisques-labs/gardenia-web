import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeleteInventoryItemsBulkUseCase } from './delete-inventory-items-bulk.use-case';
import type { IInventoryRepository } from '@/core/inventory/application/ports/inventory.repository.port';

const mockRepository: IInventoryRepository = {
  findByCriteria: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  adjustQuantity: vi.fn(),
  delete: vi.fn(),
  deleteBulk: vi.fn(),
};

describe('DeleteInventoryItemsBulkUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('delegates to repository.deleteBulk and returns the result', async () => {
    const result = { deletedIds: ['i1', 'i2'], notFoundIds: [], deletedCount: 2, requestedCount: 2 };
    vi.mocked(mockRepository.deleteBulk).mockResolvedValue(result);
    const useCase = new DeleteInventoryItemsBulkUseCase(mockRepository);

    expect(await useCase.execute(['i1', 'i2'])).toEqual(result);
    expect(mockRepository.deleteBulk).toHaveBeenCalledWith(['i1', 'i2']);
  });

  it('propagates repository errors', async () => {
    vi.mocked(mockRepository.deleteBulk).mockRejectedValue(new Error('boom'));
    const useCase = new DeleteInventoryItemsBulkUseCase(mockRepository);

    await expect(useCase.execute(['i1'])).rejects.toThrow('boom');
  });
});
