import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateInventoryItemUseCase } from './create-inventory-item.use-case';
import type { IInventoryRepository } from '@/core/inventory/application/ports/inventory.repository.port';
import type { CreateInventoryItemInput } from '@/core/inventory/application/interfaces/create-inventory-item-input.interface';

const createInput: CreateInventoryItemInput = {
  itemType: 'SEEDS',
  name: 'Lettuce seeds',
  quantity: 3,
  unit: 'PACKETS',
};

const mockCreatedEntity = { id: 'item-1' };

const mockRepository: IInventoryRepository = {
  findByCriteria: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  adjustQuantity: vi.fn(),
  delete: vi.fn(),
};

describe('CreateInventoryItemUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('delegates to repository.create and returns the created id', async () => {
    vi.mocked(mockRepository.create).mockResolvedValue(mockCreatedEntity);
    const useCase = new CreateInventoryItemUseCase(mockRepository);

    const result = await useCase.execute(createInput);

    expect(result).toEqual(mockCreatedEntity);
    expect(mockRepository.create).toHaveBeenCalledWith(createInput);
  });
});
