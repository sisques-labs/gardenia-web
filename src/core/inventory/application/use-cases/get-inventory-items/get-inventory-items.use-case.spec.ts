import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetInventoryItemsUseCase } from './get-inventory-items.use-case';
import type { IInventoryRepository } from '@/core/inventory/application/ports/inventory.repository.port';
import type { InventoryItem } from '@/core/inventory/domain/types/inventory-item.interface';
import { InventoryItemQueryableField } from '@/core/inventory/domain/enums/inventory-item-queryable-field.enum';
import { FilterOperator } from '@/shared/domain/enums/filter-operator.enum';
import { SortDirection } from '@/shared/domain/enums/sort-direction.enum';

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

const paginatedResult = {
  items: [mockItem],
  total: 1,
  page: 1,
  perPage: 20,
  totalPages: 1,
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

  it('delegates to repository.findByCriteria with no criteria and returns the paginated result', async () => {
    vi.mocked(mockRepository.findByCriteria).mockResolvedValue(paginatedResult);
    const useCase = new GetInventoryItemsUseCase(mockRepository);

    const result = await useCase.execute();

    expect(result).toEqual(paginatedResult);
    expect(mockRepository.findByCriteria).toHaveBeenCalledWith(undefined);
  });

  it('forwards filters, sorts and pagination criteria to the repository', async () => {
    vi.mocked(mockRepository.findByCriteria).mockResolvedValue(paginatedResult);
    const useCase = new GetInventoryItemsUseCase(mockRepository);
    const criteria = {
      filters: [
        {
          field: InventoryItemQueryableField.ITEM_TYPE,
          operator: FilterOperator.EQUALS,
          value: 'SEEDS',
        },
      ],
      sorts: [{ field: InventoryItemQueryableField.NAME, direction: SortDirection.ASC }],
      pagination: { page: 2, perPage: 20 },
    };

    await useCase.execute(criteria);

    expect(mockRepository.findByCriteria).toHaveBeenCalledWith(criteria);
  });

  it('propagates repository errors', async () => {
    vi.mocked(mockRepository.findByCriteria).mockRejectedValue(new Error('boom'));
    const useCase = new GetInventoryItemsUseCase(mockRepository);

    await expect(useCase.execute()).rejects.toThrow('boom');
  });
});
