import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateInventoryItemUseCase } from './create-inventory-item.use-case';
import type { IInventoryRepository } from '@/core/inventory/application/ports/inventory.repository.port';
import type { InventoryItem } from '@/core/inventory/domain/types/inventory-item.interface';
import type { CreateInventoryItemInput } from '@/core/inventory/application/interfaces/create-inventory-item-input.interface';

const createInput: CreateInventoryItemInput = {
  itemType: 'SEEDS',
  name: 'Lettuce seeds',
  quantity: 3,
  unit: 'PACKETS',
};

const mockItem: InventoryItem = {
  id: 'item-1',
  itemType: 'SEEDS',
  name: 'Lettuce seeds',
  brand: null,
  notes: null,
  quantity: 3,
  unit: 'PACKETS',
  lowStockThreshold: null,
  acquiredAt: null,
  expiresAt: null,
  userId: 'user-1',
  spaceId: 'space-1',
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

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

  it('delegates to repository.create and returns the created item', async () => {
    vi.mocked(mockRepository.create).mockResolvedValue(mockItem);
    const useCase = new CreateInventoryItemUseCase(mockRepository);

    const result = await useCase.execute(createInput);

    expect(result).toEqual(mockItem);
    expect(mockRepository.create).toHaveBeenCalledWith(createInput);
  });
});
