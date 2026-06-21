import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateInventoryItemUseCase } from './update-inventory-item.use-case';
import type { IInventoryRepository } from '@/core/inventory/application/ports/inventory.repository.port';
import type { InventoryItem } from '@/core/inventory/domain/types/inventory-item.interface';

const mockItem: InventoryItem = {
  id: 'item-1',
  itemType: 'SEEDS',
  name: 'Renamed',
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

describe('UpdateInventoryItemUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('delegates to repository.update and returns the updated item', async () => {
    vi.mocked(mockRepository.update).mockResolvedValue(mockItem);
    const useCase = new UpdateInventoryItemUseCase(mockRepository);

    const input = { id: 'item-1', name: 'Renamed' };
    const result = await useCase.execute(input);

    expect(result).toEqual(mockItem);
    expect(mockRepository.update).toHaveBeenCalledWith(input);
  });
});
