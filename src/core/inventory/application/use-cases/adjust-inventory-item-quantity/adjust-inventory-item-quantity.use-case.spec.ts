import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdjustInventoryItemQuantityUseCase } from './adjust-inventory-item-quantity.use-case';
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

describe('AdjustInventoryItemQuantityUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('delegates to repository.adjustQuantity and returns the id', async () => {
    vi.mocked(mockRepository.adjustQuantity).mockResolvedValue(mockCreatedEntity);
    const useCase = new AdjustInventoryItemQuantityUseCase(mockRepository);

    const input = { id: 'item-1', delta: -2, reason: 'sowed lettuce' };
    const result = await useCase.execute(input);

    expect(result).toEqual(mockCreatedEntity);
    expect(mockRepository.adjustQuantity).toHaveBeenCalledWith(input);
  });
});
