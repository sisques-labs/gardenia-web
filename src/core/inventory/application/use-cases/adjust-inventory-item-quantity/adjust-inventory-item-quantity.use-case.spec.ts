import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdjustInventoryItemQuantityUseCase } from './adjust-inventory-item-quantity.use-case';
import type { IInventoryRepository } from '@/core/inventory/application/ports/inventory.repository.port';
import type { InventoryItem } from '@/core/inventory/domain/types/inventory-item.interface';

const mockItem: InventoryItem = {
  id: 'item-1',
  itemType: 'SEEDS',
  name: 'Lettuce seeds',
  brand: null,
  notes: null,
  quantity: 1,
  unit: 'PACKETS',
  lowStockThreshold: null,
  acquiredAt: null,
  expiresAt: null,
  userId: 'user-1',
  spaceId: 'space-1',
  createdAt: '2026-01-01',
  updatedAt: '2026-01-02',
};

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

  it('delegates to repository.adjustQuantity and returns the item', async () => {
    vi.mocked(mockRepository.adjustQuantity).mockResolvedValue(mockItem);
    const useCase = new AdjustInventoryItemQuantityUseCase(mockRepository);

    const input = { id: 'item-1', delta: -2, reason: 'sowed lettuce' };
    const result = await useCase.execute(input);

    expect(result).toEqual(mockItem);
    expect(mockRepository.adjustQuantity).toHaveBeenCalledWith(input);
  });
});
