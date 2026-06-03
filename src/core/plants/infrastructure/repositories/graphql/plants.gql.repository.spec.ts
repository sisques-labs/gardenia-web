import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DocumentNode } from '@apollo/client';

vi.mock('@/shared/infrastructure/http/apollo.client', () => ({
  apolloClient: {
    query: vi.fn(),
  },
}));

import { apolloClient } from '@/shared/infrastructure/http/apollo.client';
import { PlantsGqlRepository } from './plants.gql.repository';
import { PLANTS_FIND_BY_CRITERIA } from './queries/plants-find-by-criteria.query';
import { PLANT_FIND_BY_ID } from './queries/plant-find-by-id.query';
import type { Plant } from '@/core/plants/domain/interfaces/plant.interface';

const mockPlants: Plant[] = [
  {
    id: 'plant-1',
    name: 'Monstera',
    userId: 'user-1',
    spaceId: 'space-1',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'plant-2',
    name: 'Pothos',
    userId: 'user-1',
    spaceId: 'space-1',
    createdAt: '2024-01-02',
    updatedAt: '2024-01-02',
  },
];

const mockPlant: Plant = {
  id: 'plant-1',
  name: 'Monstera',
  userId: 'user-1',
  spaceId: 'space-1',
  species: { id: 'species-1', name: 'Monstera deliciosa', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  imageUrl: 'https://example.com/monstera.jpg',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

describe('PlantsGqlRepository', () => {
  let repository: PlantsGqlRepository;

  beforeEach(() => {
    repository = new PlantsGqlRepository();
    vi.clearAllMocks();
  });

  describe('GQL document constants', () => {
    it('PLANTS_FIND_BY_CRITERIA is a valid GQL document', () => {
      expect(PLANTS_FIND_BY_CRITERIA).toBeDefined();
      expect((PLANTS_FIND_BY_CRITERIA as DocumentNode).kind).toBe('Document');
    });

    it('PLANT_FIND_BY_ID is a valid GQL document', () => {
      expect(PLANT_FIND_BY_ID).toBeDefined();
      expect((PLANT_FIND_BY_ID as DocumentNode).kind).toBe('Document');
    });
  });

  describe('list()', () => {
    it('calls apolloClient.query with PLANTS_FIND_BY_CRITERIA and returns Plant[]', async () => {
      vi.mocked(apolloClient.query).mockResolvedValue({
        data: { plantsFindByCriteria: { items: mockPlants } },
      } as never);

      const result = await repository.list();

      expect(apolloClient.query).toHaveBeenCalledOnce();
      expect(apolloClient.query).toHaveBeenCalledWith({ query: PLANTS_FIND_BY_CRITERIA });
      expect(result).toEqual(mockPlants);
    });

    it('returns empty array when items is empty', async () => {
      vi.mocked(apolloClient.query).mockResolvedValue({
        data: { plantsFindByCriteria: { items: [] } },
      } as never);

      const result = await repository.list();
      expect(result).toEqual([]);
    });

    it('propagates errors from apolloClient.query', async () => {
      vi.mocked(apolloClient.query).mockRejectedValue(new Error('Network error'));
      await expect(repository.list()).rejects.toThrow('Network error');
    });
  });

  describe('getById()', () => {
    it('calls apolloClient.query with PLANT_FIND_BY_ID and the given id, returns Plant', async () => {
      vi.mocked(apolloClient.query).mockResolvedValue({
        data: { plantFindById: mockPlant },
      } as never);

      const result = await repository.getById('plant-1');

      expect(apolloClient.query).toHaveBeenCalledOnce();
      expect(apolloClient.query).toHaveBeenCalledWith({
        query: PLANT_FIND_BY_ID,
        variables: { input: { id: 'plant-1' } },
      });
      expect(result).toEqual(mockPlant);
    });

    it('propagates errors from apolloClient.query', async () => {
      vi.mocked(apolloClient.query).mockRejectedValue(new Error('Not found'));
      await expect(repository.getById('plant-1')).rejects.toThrow('Not found');
    });
  });
});
