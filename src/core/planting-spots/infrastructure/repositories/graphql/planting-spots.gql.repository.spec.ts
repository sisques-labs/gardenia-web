import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DocumentNode } from '@apollo/client';

vi.mock('@/shared/infrastructure/http/apollo.client', () => ({
  apolloClient: {
    query: vi.fn(),
    mutate: vi.fn(),
  },
}));

import { apolloClient } from '@/shared/infrastructure/http/apollo.client';
import { PlantingSpotsGqlRepository } from './planting-spots.gql.repository';
import { PLANTING_SPOTS_FIND_BY_CRITERIA } from './queries/planting-spots-find-by-criteria.query';
import { PLANTING_SPOT_FIND_BY_ID } from './queries/planting-spot-find-by-id.query';
import { PLANTING_SPOT_CREATE } from './mutations/planting-spot-create.mutation';
import { PLANTING_SPOT_UPDATE } from './mutations/planting-spot-update.mutation';
import { PLANTING_SPOT_DELETE } from './mutations/planting-spot-delete.mutation';
import { PLANTING_SPOT_MARK_FALLOW } from './mutations/planting-spot-mark-fallow.mutation';
import { PLANTING_SPOT_MARK_ACTIVE } from './mutations/planting-spot-mark-active.mutation';
import type { PlantingSpot } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';

const mockSpot: PlantingSpot = {
  id: 'spot-1',
  name: 'Main Bed',
  type: 'RAISED_BED',
  description: null,
  userId: 'user-1',
  spaceId: 'space-1',
  status: 'ACTIVE',
  fallowSince: null,
  resolvedPlants: [],
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

const mockSpots: PlantingSpot[] = [mockSpot];

describe('PlantingSpotsGqlRepository', () => {
  let repository: PlantingSpotsGqlRepository;

  beforeEach(() => {
    repository = new PlantingSpotsGqlRepository();
    vi.clearAllMocks();
  });

  describe('GQL document constants', () => {
    it('PLANTING_SPOTS_FIND_BY_CRITERIA is a valid GQL document', () => {
      expect(PLANTING_SPOTS_FIND_BY_CRITERIA).toBeDefined();
      expect((PLANTING_SPOTS_FIND_BY_CRITERIA as DocumentNode).kind).toBe('Document');
    });

    it('PLANTING_SPOT_FIND_BY_ID is a valid GQL document', () => {
      expect(PLANTING_SPOT_FIND_BY_ID).toBeDefined();
      expect((PLANTING_SPOT_FIND_BY_ID as DocumentNode).kind).toBe('Document');
    });

    it('PLANTING_SPOT_CREATE is a valid GQL document', () => {
      expect(PLANTING_SPOT_CREATE).toBeDefined();
      expect((PLANTING_SPOT_CREATE as DocumentNode).kind).toBe('Document');
    });

    it('PLANTING_SPOT_UPDATE is a valid GQL document', () => {
      expect(PLANTING_SPOT_UPDATE).toBeDefined();
      expect((PLANTING_SPOT_UPDATE as DocumentNode).kind).toBe('Document');
    });

    it('PLANTING_SPOT_DELETE is a valid GQL document', () => {
      expect(PLANTING_SPOT_DELETE).toBeDefined();
      expect((PLANTING_SPOT_DELETE as DocumentNode).kind).toBe('Document');
    });

    it('PLANTING_SPOT_MARK_FALLOW is a valid GQL document', () => {
      expect(PLANTING_SPOT_MARK_FALLOW).toBeDefined();
      expect((PLANTING_SPOT_MARK_FALLOW as DocumentNode).kind).toBe('Document');
    });

    it('PLANTING_SPOT_MARK_ACTIVE is a valid GQL document', () => {
      expect(PLANTING_SPOT_MARK_ACTIVE).toBeDefined();
      expect((PLANTING_SPOT_MARK_ACTIVE as DocumentNode).kind).toBe('Document');
    });
  });

  describe('list()', () => {
    it('calls apolloClient.query with PLANTING_SPOTS_FIND_BY_CRITERIA and returns mapped items', async () => {
      vi.mocked(apolloClient.query).mockResolvedValue({
        data: { plantingSpotsFindByCriteria: { items: mockSpots, total: 1, page: 1, perPage: 20, totalPages: 1 } },
      } as never);

      const result = await repository.list(1, 20);

      expect(apolloClient.query).toHaveBeenCalledOnce();
      expect(apolloClient.query).toHaveBeenCalledWith({
        query: PLANTING_SPOTS_FIND_BY_CRITERIA,
        variables: { input: { pagination: { page: 1, perPage: 20 } } },
        fetchPolicy: 'network-only',
      });
      expect(result).toEqual({ items: mockSpots, total: 1, page: 1, perPage: 20, totalPages: 1 });
    });

    it('returns empty result when items is empty', async () => {
      vi.mocked(apolloClient.query).mockResolvedValue({
        data: { plantingSpotsFindByCriteria: { items: [], total: 0, page: 1, perPage: 20, totalPages: 1 } },
      } as never);

      const result = await repository.list(1, 20);
      expect(result).toEqual({ items: [], total: 0, page: 1, perPage: 20, totalPages: 1 });
    });

    it('propagates errors from apolloClient.query', async () => {
      vi.mocked(apolloClient.query).mockRejectedValue(new Error('Network error'));
      await expect(repository.list(1, 20)).rejects.toThrow('Network error');
    });
  });

  describe('findById()', () => {
    it('calls apolloClient.query with PLANTING_SPOT_FIND_BY_ID and correct variables', async () => {
      vi.mocked(apolloClient.query).mockResolvedValue({
        data: { plantingSpotFindById: mockSpot },
      } as never);

      const result = await repository.findById('spot-1');

      expect(apolloClient.query).toHaveBeenCalledOnce();
      expect(apolloClient.query).toHaveBeenCalledWith({
        query: PLANTING_SPOT_FIND_BY_ID,
        variables: { input: { id: 'spot-1' } },
        fetchPolicy: 'network-only',
      });
      expect(result).toEqual(mockSpot);
    });

    it('throws when plantingSpotFindById is null', async () => {
      vi.mocked(apolloClient.query).mockResolvedValue({
        data: { plantingSpotFindById: null },
      } as never);

      await expect(repository.findById('spot-99')).rejects.toThrow('PlantingSpot not found: spot-99');
    });
  });

  describe('create()', () => {
    it('calls apolloClient.mutate with PLANTING_SPOT_CREATE and returns just the created id', async () => {
      vi.mocked(apolloClient.mutate).mockResolvedValue({
        data: { plantingSpotCreate: { id: 'spot-1', success: true, message: 'Created' } },
      } as never);

      const input = { name: 'Main Bed', type: 'RAISED_BED' as const };
      const result = await repository.create(input);

      expect(apolloClient.mutate).toHaveBeenCalledOnce();
      expect(apolloClient.mutate).toHaveBeenCalledWith({
        mutation: PLANTING_SPOT_CREATE,
        variables: { input },
      });
      expect(apolloClient.query).not.toHaveBeenCalled();
      expect(result).toEqual({ id: 'spot-1' });
    });

    it('throws when mutation success is false', async () => {
      vi.mocked(apolloClient.mutate).mockResolvedValue({
        data: { plantingSpotCreate: { id: '', success: false, message: 'Failed' } },
      } as never);

      await expect(
        repository.create({ name: 'Test', type: 'POT' }),
      ).rejects.toThrow('plantingSpotCreate mutation failed');
    });
  });

  describe('update()', () => {
    it('calls apolloClient.mutate with PLANTING_SPOT_UPDATE and returns just the updated id', async () => {
      vi.mocked(apolloClient.mutate).mockResolvedValue({
        data: { plantingSpotUpdate: { id: 'spot-1', success: true, message: 'Updated' } },
      } as never);

      const input = { id: 'spot-1', name: 'Updated Bed' };
      const result = await repository.update(input);

      expect(apolloClient.mutate).toHaveBeenCalledOnce();
      expect(apolloClient.mutate).toHaveBeenCalledWith({
        mutation: PLANTING_SPOT_UPDATE,
        variables: { input },
      });
      expect(apolloClient.query).not.toHaveBeenCalled();
      expect(result).toEqual({ id: 'spot-1' });
    });

    it('throws when mutation success is false', async () => {
      vi.mocked(apolloClient.mutate).mockResolvedValue({
        data: { plantingSpotUpdate: { id: '', success: false, message: 'Failed' } },
      } as never);

      await expect(repository.update({ id: 'spot-99' })).rejects.toThrow('plantingSpotUpdate mutation failed');
    });
  });

  describe('delete()', () => {
    it('calls apolloClient.mutate with PLANTING_SPOT_DELETE and correct variables', async () => {
      vi.mocked(apolloClient.mutate).mockResolvedValue({
        data: { plantingSpotDelete: { id: 'spot-1', success: true, message: 'Deleted' } },
      } as never);

      const result = await repository.delete('spot-1');

      expect(result).toBeUndefined();
      expect(apolloClient.mutate).toHaveBeenCalledOnce();
      expect(apolloClient.mutate).toHaveBeenCalledWith({
        mutation: PLANTING_SPOT_DELETE,
        variables: { input: { id: 'spot-1' } },
      });
    });
  });

  describe('markFallow()', () => {
    it('calls apolloClient.mutate with PLANTING_SPOT_MARK_FALLOW then re-fetches by id', async () => {
      vi.mocked(apolloClient.mutate).mockResolvedValue({
        data: { plantingSpotMarkFallow: { id: 'spot-1', success: true, message: 'Marked fallow' } },
      } as never);
      vi.mocked(apolloClient.query).mockResolvedValue({
        data: { plantingSpotFindById: { ...mockSpot, status: 'FALLOW', fallowSince: '2026-07-03T00:00:00.000Z' } },
      } as never);

      const result = await repository.markFallow('spot-1');

      expect(apolloClient.mutate).toHaveBeenCalledWith({
        mutation: PLANTING_SPOT_MARK_FALLOW,
        variables: { input: { id: 'spot-1' } },
      });
      expect(result.status).toBe('FALLOW');
    });

    it('throws when mutation success is false', async () => {
      vi.mocked(apolloClient.mutate).mockResolvedValue({
        data: { plantingSpotMarkFallow: { id: '', success: false, message: 'Failed' } },
      } as never);

      await expect(repository.markFallow('spot-1')).rejects.toThrow('plantingSpotMarkFallow mutation failed');
    });
  });

  describe('markActive()', () => {
    it('calls apolloClient.mutate with PLANTING_SPOT_MARK_ACTIVE then re-fetches by id', async () => {
      vi.mocked(apolloClient.mutate).mockResolvedValue({
        data: { plantingSpotMarkActive: { id: 'spot-1', success: true, message: 'Marked active' } },
      } as never);
      vi.mocked(apolloClient.query).mockResolvedValue({
        data: { plantingSpotFindById: mockSpot },
      } as never);

      const result = await repository.markActive('spot-1');

      expect(apolloClient.mutate).toHaveBeenCalledWith({
        mutation: PLANTING_SPOT_MARK_ACTIVE,
        variables: { input: { id: 'spot-1' } },
      });
      expect(result.status).toBe('ACTIVE');
    });

    it('throws when mutation success is false', async () => {
      vi.mocked(apolloClient.mutate).mockResolvedValue({
        data: { plantingSpotMarkActive: { id: '', success: false, message: 'Failed' } },
      } as never);

      await expect(repository.markActive('spot-1')).rejects.toThrow('plantingSpotMarkActive mutation failed');
    });
  });
});
