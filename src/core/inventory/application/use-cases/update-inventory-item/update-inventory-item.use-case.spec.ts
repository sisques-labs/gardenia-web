import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateInventoryItemUseCase } from './update-inventory-item.use-case';
import type { IInventoryRepository } from '@/core/inventory/application/ports/inventory.repository.port';

const mockCreatedEntity = { id: 'item-1' };

const mockRepository: IInventoryRepository = {
  findByCriteria: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  adjustQuantity: vi.fn(),
  delete: vi.fn(),
};

describe('UpdateInventoryItemUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('delegates to repository.update and returns the updated id', async () => {
    vi.mocked(mockRepository.update).mockResolvedValue(mockCreatedEntity);
    const useCase = new UpdateInventoryItemUseCase(mockRepository);

    const input = { id: 'item-1', name: 'Renamed' };
    const result = await useCase.execute(input);

    expect(result).toEqual(mockCreatedEntity);
    expect(mockRepository.update).toHaveBeenCalledWith(input);
  });
});
