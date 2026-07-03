import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetInventoryItemUseCase } from './get-inventory-item.use-case';
import type { IInventoryRepository } from '@/core/inventory/application/ports/inventory.repository.port';
import type { InventoryItem } from '@/core/inventory/domain/types/inventory-item.interface';

const mockItem: InventoryItem = {
  id: 'item-1',
  itemType: 'FERTILIZER',
  name: 'Tomato fertilizer',
  brand: null,
  notes: null,
  quantity: 500,
  unit: 'G',
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
  deleteBulk: vi.fn(),
};

describe('GetInventoryItemUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('delegates to repository.findById with the id and returns the item', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(mockItem);
    const useCase = new GetInventoryItemUseCase(mockRepository);

    const result = await useCase.execute('item-1');

    expect(result).toEqual(mockItem);
    expect(mockRepository.findById).toHaveBeenCalledWith('item-1');
  });
});
