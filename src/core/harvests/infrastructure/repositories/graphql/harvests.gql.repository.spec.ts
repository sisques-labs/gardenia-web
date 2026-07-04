import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DocumentNode } from '@apollo/client';

vi.mock('@/shared/infrastructure/http/apollo.client', () => ({
  apolloClient: {
    query: vi.fn(),
    mutate: vi.fn(),
  },
}));

import { apolloClient } from '@/shared/infrastructure/http/apollo.client';
import { HarvestsGqlRepository } from './harvests.gql.repository';
import { HARVESTS_FIND_BY_CRITERIA } from './queries/harvest-find-by-criteria.query';
import { HARVEST_FIND_BY_ID } from './queries/harvest-find-by-id.query';
import { HARVEST_CREATE } from './mutations/harvest-create.mutation';
import { HARVEST_UPDATE } from './mutations/harvest-update.mutation';
import { HARVEST_DELETE } from './mutations/harvest-delete.mutation';
import type { Harvest } from '@/core/harvests/domain/types/harvest.interface';

const mockHarvests: Harvest[] = [
  {
    id: 'harvest-1',
    cropType: 'Tomato',
    quantity: 5,
    unit: 'KG',
    harvestedAt: '2024-06-01',
    userId: 'user-1',
    spaceId: 'space-1',
    createdAt: '2024-06-01',
    updatedAt: '2024-06-01',
  },
];

const mockHarvest: Harvest = {
  id: 'harvest-1',
  cropType: 'Tomato',
  quantity: 5,
  unit: 'KG',
  harvestedAt: '2024-06-01',
  userId: 'user-1',
  spaceId: 'space-1',
  createdAt: '2024-06-01',
  updatedAt: '2024-06-01',
};

describe('HarvestsGqlRepository', () => {
  let repository: HarvestsGqlRepository;

  beforeEach(() => {
    repository = new HarvestsGqlRepository();
    vi.clearAllMocks();
  });

  describe('GQL document constants', () => {
    it('HARVESTS_FIND_BY_CRITERIA is a valid GQL document', () => {
      expect(HARVESTS_FIND_BY_CRITERIA).toBeDefined();
      expect((HARVESTS_FIND_BY_CRITERIA as DocumentNode).kind).toBe('Document');
    });

    it('HARVEST_FIND_BY_ID is a valid GQL document', () => {
      expect(HARVEST_FIND_BY_ID).toBeDefined();
      expect((HARVEST_FIND_BY_ID as DocumentNode).kind).toBe('Document');
    });

    it('HARVEST_CREATE is a valid GQL document', () => {
      expect(HARVEST_CREATE).toBeDefined();
      expect((HARVEST_CREATE as DocumentNode).kind).toBe('Document');
    });

    it('HARVEST_UPDATE is a valid GQL document', () => {
      expect(HARVEST_UPDATE).toBeDefined();
      expect((HARVEST_UPDATE as DocumentNode).kind).toBe('Document');
    });

    it('HARVEST_DELETE is a valid GQL document', () => {
      expect(HARVEST_DELETE).toBeDefined();
      expect((HARVEST_DELETE as DocumentNode).kind).toBe('Document');
    });
  });

  describe('findByCriteria()', () => {
    it('calls apolloClient.query with HARVESTS_FIND_BY_CRITERIA and returns mapped items', async () => {
      vi.mocked(apolloClient.query).mockResolvedValue({
        data: { harvestsFindByCriteria: { items: mockHarvests } },
      } as never);

      const result = await repository.findByCriteria();

      expect(apolloClient.query).toHaveBeenCalledOnce();
      expect(apolloClient.query).toHaveBeenCalledWith({ query: HARVESTS_FIND_BY_CRITERIA, fetchPolicy: 'network-only' });
      expect(result).toEqual(mockHarvests);
    });

    it('returns empty array when items is empty', async () => {
      vi.mocked(apolloClient.query).mockResolvedValue({
        data: { harvestsFindByCriteria: { items: [] } },
      } as never);

      const result = await repository.findByCriteria();
      expect(result).toEqual([]);
    });

    it('propagates errors from apolloClient.query', async () => {
      vi.mocked(apolloClient.query).mockRejectedValue(new Error('Network error'));
      await expect(repository.findByCriteria()).rejects.toThrow('Network error');
    });
  });

  describe('findById()', () => {
    it('calls apolloClient.query with HARVEST_FIND_BY_ID and correct variables, returns Harvest', async () => {
      vi.mocked(apolloClient.query).mockResolvedValue({
        data: { harvestFindById: mockHarvest },
      } as never);

      const result = await repository.findById('harvest-1');

      expect(apolloClient.query).toHaveBeenCalledOnce();
      expect(apolloClient.query).toHaveBeenCalledWith({
        query: HARVEST_FIND_BY_ID,
        variables: { input: { id: 'harvest-1' } },
        fetchPolicy: 'network-only',
      });
      expect(result).toEqual(mockHarvest);
    });

    it('throws when harvestFindById is null', async () => {
      vi.mocked(apolloClient.query).mockResolvedValue({
        data: { harvestFindById: null },
      } as never);

      await expect(repository.findById('harvest-99')).rejects.toThrow('Harvest not found: harvest-99');
    });
  });

  describe('create()', () => {
    it('calls apolloClient.mutate with HARVEST_CREATE and returns just the created id', async () => {
      vi.mocked(apolloClient.mutate).mockResolvedValue({
        data: { harvestCreate: { id: 'harvest-1', success: true, message: 'Harvest created' } },
      } as never);

      const input = { cropType: 'Tomato', quantity: 5, unit: 'KG' as const, harvestedAt: '2024-06-01' };
      const result = await repository.create(input);

      expect(apolloClient.mutate).toHaveBeenCalledOnce();
      expect(apolloClient.mutate).toHaveBeenCalledWith({
        mutation: HARVEST_CREATE,
        variables: { input },
      });
      expect(apolloClient.query).not.toHaveBeenCalled();
      expect(result).toEqual({ id: 'harvest-1' });
    });

    it('throws when mutation success is false', async () => {
      vi.mocked(apolloClient.mutate).mockResolvedValue({
        data: { harvestCreate: { id: '', success: false, message: 'Failed' } },
      } as never);

      await expect(
        repository.create({ cropType: 'Tomato', quantity: 5, unit: 'KG', harvestedAt: '2024-06-01' }),
      ).rejects.toThrow('harvestCreate mutation failed');
    });
  });

  describe('update()', () => {
    it('calls apolloClient.mutate with HARVEST_UPDATE and returns just the updated id', async () => {
      vi.mocked(apolloClient.mutate).mockResolvedValue({
        data: { harvestUpdate: { id: 'harvest-1', success: true, message: 'Harvest updated' } },
      } as never);

      const input = { id: 'harvest-1', cropType: 'Tomato Updated' };
      const result = await repository.update(input);

      expect(apolloClient.mutate).toHaveBeenCalledOnce();
      expect(apolloClient.mutate).toHaveBeenCalledWith({
        mutation: HARVEST_UPDATE,
        variables: { input },
      });
      expect(apolloClient.query).not.toHaveBeenCalled();
      expect(result).toEqual({ id: 'harvest-1' });
    });

    it('throws when mutation success is false', async () => {
      vi.mocked(apolloClient.mutate).mockResolvedValue({
        data: { harvestUpdate: { id: '', success: false, message: 'Failed' } },
      } as never);

      await expect(repository.update({ id: 'harvest-99' })).rejects.toThrow('harvestUpdate mutation failed');
    });
  });

  describe('delete()', () => {
    it('calls apolloClient.mutate with HARVEST_DELETE and correct variables, resolves void', async () => {
      vi.mocked(apolloClient.mutate).mockResolvedValue({
        data: { harvestDelete: { success: true, message: 'Harvest deleted' } },
      } as never);

      const result = await repository.delete('harvest-1');

      expect(result).toBeUndefined();
      expect(apolloClient.mutate).toHaveBeenCalledOnce();
      expect(apolloClient.mutate).toHaveBeenCalledWith({
        mutation: HARVEST_DELETE,
        variables: { input: { id: 'harvest-1' } },
      });
    });
  });
});
