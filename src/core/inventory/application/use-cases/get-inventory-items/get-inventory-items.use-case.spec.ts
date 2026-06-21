import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetInventoryItemsUseCase } from './get-inventory-items.use-case';
import type { IInventoryRepository } from '@/core/inventory/application/ports/inventory.repository.port';
import type { InventoryItem } from '@/core/inventory/domain/types/inventory-item.interface';

const mockItem: InventoryItem = {
  id: 'item-1',
  itemType: 'SEEDS',
  name: 'Lettuce seeds',
  brand: 'Batlle',
  notes: null,
  quantity: 3,
  unit: 'PACKETS',
  lowStockThreshold: 1,
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

describe('GetInventoryItemsUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('delegates to repository.findByCriteria and returns items', async () => {
    vi.mocked(mockRepository.findByCriteria).mockResolvedValue([mockItem]);
    const useCase = new GetInventoryItemsUseCase(mockRepository);

    const result = await useCase.execute();

    expect(result).toEqual([mockItem]);
    expect(mockRepository.findByCriteria).toHaveBeenCalledOnce();
  });

  it('propagates repository errors', async () => {
    vi.mocked(mockRepository.findByCriteria).mockRejectedValue(new Error('boom'));
    const useCase = new GetInventoryItemsUseCase(mockRepository);

    await expect(useCase.execute()).rejects.toThrow('boom');
  });
});
