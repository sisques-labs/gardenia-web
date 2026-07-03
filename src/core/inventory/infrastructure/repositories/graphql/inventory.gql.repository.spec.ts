import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DocumentNode } from '@apollo/client';

vi.mock('@/shared/infrastructure/http/apollo.client', () => ({
  apolloClient: {
    query: vi.fn(),
    mutate: vi.fn(),
  },
}));

import { apolloClient } from '@/shared/infrastructure/http/apollo.client';
import { InventoryGqlRepository } from './inventory.gql.repository';
import { INVENTORY_ITEMS_FIND_BY_CRITERIA } from './queries/inventory-items-find-by-criteria.query';
import { INVENTORY_ITEM_FIND_BY_ID } from './queries/inventory-item-find-by-id.query';
import { INVENTORY_ITEM_CREATE } from './mutations/inventory-item-create.mutation';
import { INVENTORY_ITEM_UPDATE } from './mutations/inventory-item-update.mutation';
import { INVENTORY_ITEM_ADJUST_QUANTITY } from './mutations/inventory-item-adjust-quantity.mutation';
import { INVENTORY_ITEM_DELETE } from './mutations/inventory-item-delete.mutation';
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

describe('InventoryGqlRepository', () => {
  let repository: InventoryGqlRepository;

  beforeEach(() => {
    repository = new InventoryGqlRepository();
    vi.clearAllMocks();
  });

  describe('GQL document constants', () => {
    it.each([
      ['INVENTORY_ITEMS_FIND_BY_CRITERIA', INVENTORY_ITEMS_FIND_BY_CRITERIA],
      ['INVENTORY_ITEM_FIND_BY_ID', INVENTORY_ITEM_FIND_BY_ID],
      ['INVENTORY_ITEM_CREATE', INVENTORY_ITEM_CREATE],
      ['INVENTORY_ITEM_UPDATE', INVENTORY_ITEM_UPDATE],
      ['INVENTORY_ITEM_ADJUST_QUANTITY', INVENTORY_ITEM_ADJUST_QUANTITY],
      ['INVENTORY_ITEM_DELETE', INVENTORY_ITEM_DELETE],
    ])('%s is a valid GQL document', (_name, doc) => {
      expect(doc).toBeDefined();
      expect((doc as DocumentNode).kind).toBe('Document');
    });
  });

  describe('findByCriteria()', () => {
    it('queries with no criteria and returns a paginated result', async () => {
      vi.mocked(apolloClient.query).mockResolvedValue({
        data: {
          inventoryItemsFindByCriteria: { items: [mockItem], total: 1, page: 1, perPage: 20, totalPages: 1 },
        },
      } as never);

      const result = await repository.findByCriteria();

      expect(apolloClient.query).toHaveBeenCalledWith({
        query: INVENTORY_ITEMS_FIND_BY_CRITERIA,
        variables: { input: undefined },
        fetchPolicy: 'network-only',
      });
      expect(result).toEqual({ items: [mockItem], total: 1, page: 1, perPage: 20, totalPages: 1 });
    });

    it('forwards filters, sorts and pagination as the input variable', async () => {
      vi.mocked(apolloClient.query).mockResolvedValue({
        data: {
          inventoryItemsFindByCriteria: { items: [], total: 0, page: 2, perPage: 5, totalPages: 0 },
        },
      } as never);

      const criteria = {
        filters: [{ field: 'NAME' as never, operator: 'LIKE' as never, value: 'seeds' }],
        sorts: [{ field: 'QUANTITY' as never, direction: 'ASC' as never }],
        pagination: { page: 2, perPage: 5 },
      };
      await repository.findByCriteria(criteria);

      expect(apolloClient.query).toHaveBeenCalledWith({
        query: INVENTORY_ITEMS_FIND_BY_CRITERIA,
        variables: { input: criteria },
        fetchPolicy: 'network-only',
      });
    });

    it('returns empty items when there are no items', async () => {
      vi.mocked(apolloClient.query).mockResolvedValue({
        data: { inventoryItemsFindByCriteria: { items: [], total: 0, page: 1, perPage: 20, totalPages: 0 } },
      } as never);

      const result = await repository.findByCriteria();
      expect(result.items).toEqual([]);
    });

    it('propagates query errors', async () => {
      vi.mocked(apolloClient.query).mockRejectedValue(new Error('Network error'));
      await expect(repository.findByCriteria()).rejects.toThrow('Network error');
    });
  });

  describe('findById()', () => {
    it('queries with the id and returns the item', async () => {
      vi.mocked(apolloClient.query).mockResolvedValue({
        data: { inventoryItemFindById: mockItem },
      } as never);

      const result = await repository.findById('item-1');

      expect(apolloClient.query).toHaveBeenCalledWith({
        query: INVENTORY_ITEM_FIND_BY_ID,
        variables: { input: { id: 'item-1' } },
        fetchPolicy: 'network-only',
      });
      expect(result).toEqual(mockItem);
    });

    it('throws when item is not found', async () => {
      vi.mocked(apolloClient.query).mockResolvedValue({
        data: { inventoryItemFindById: null },
      } as never);

      await expect(repository.findById('missing')).rejects.toThrow(
        'Inventory item not found: missing',
      );
    });
  });

  describe('create()', () => {
    it('mutates and returns just the created id', async () => {
      vi.mocked(apolloClient.mutate).mockResolvedValue({
        data: { inventoryItemCreate: { id: 'item-1', success: true, message: 'ok' } },
      } as never);

      const input = { itemType: 'SEEDS' as const, name: 'Lettuce seeds', quantity: 3, unit: 'PACKETS' as const };
      const result = await repository.create(input);

      expect(apolloClient.mutate).toHaveBeenCalledWith({ mutation: INVENTORY_ITEM_CREATE, variables: { input } });
      expect(apolloClient.query).not.toHaveBeenCalled();
      expect(result).toEqual({ id: 'item-1' });
    });

    it('throws when success is false', async () => {
      vi.mocked(apolloClient.mutate).mockResolvedValue({
        data: { inventoryItemCreate: { id: '', success: false, message: 'fail' } },
      } as never);

      await expect(
        repository.create({ itemType: 'SEEDS', name: 'x', quantity: 1, unit: 'UNITS' }),
      ).rejects.toThrow('inventoryItemCreate mutation failed');
    });
  });

  describe('update()', () => {
    it('mutates and returns just the updated id', async () => {
      vi.mocked(apolloClient.mutate).mockResolvedValue({
        data: { inventoryItemUpdate: { id: 'item-1', success: true, message: 'ok' } },
      } as never);

      const input = { id: 'item-1', name: 'Renamed' };
      const result = await repository.update(input);

      expect(apolloClient.mutate).toHaveBeenCalledWith({ mutation: INVENTORY_ITEM_UPDATE, variables: { input } });
      expect(apolloClient.query).not.toHaveBeenCalled();
      expect(result).toEqual({ id: 'item-1' });
    });
  });

  describe('adjustQuantity()', () => {
    it('mutates and returns just the adjusted id', async () => {
      vi.mocked(apolloClient.mutate).mockResolvedValue({
        data: { inventoryItemAdjustQuantity: { id: 'item-1', success: true, message: 'ok' } },
      } as never);

      const input = { id: 'item-1', delta: -2, reason: 'sowed' };
      const result = await repository.adjustQuantity(input);

      expect(apolloClient.mutate).toHaveBeenCalledWith({
        mutation: INVENTORY_ITEM_ADJUST_QUANTITY,
        variables: { input },
      });
      expect(apolloClient.query).not.toHaveBeenCalled();
      expect(result).toEqual({ id: 'item-1' });
    });
  });

  describe('delete()', () => {
    it('mutates with the id as a direct argument and resolves void', async () => {
      vi.mocked(apolloClient.mutate).mockResolvedValue({
        data: { inventoryItemDelete: { id: 'item-1', success: true, message: 'ok' } },
      } as never);

      const result = await repository.delete('item-1');

      expect(result).toBeUndefined();
      expect(apolloClient.mutate).toHaveBeenCalledWith({
        mutation: INVENTORY_ITEM_DELETE,
        variables: { id: 'item-1' },
      });
    });
  });
});
