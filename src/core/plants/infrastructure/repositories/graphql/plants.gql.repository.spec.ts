import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DocumentNode } from '@apollo/client';

vi.mock('@/shared/infrastructure/http/apollo.client', () => ({
  apolloClient: {
    query: vi.fn(),
    mutate: vi.fn(),
  },
}));

import { apolloClient } from '@/shared/infrastructure/http/apollo.client';
import { PlantsGqlRepository } from './plants.gql.repository';
import { PLANTS_FIND_BY_CRITERIA } from './queries/plants-find-by-criteria.query';
import { PLANT_FIND_BY_ID } from './queries/plant-find-by-id.query';
import { PLANT_CREATE } from './mutations/plant-create.mutation';
import { PLANT_DELETE } from './mutations/plant-delete.mutation';
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
  species: { id: 'species-1', scientificName: 'Monstera deliciosa', description: null, imageUrl: null, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
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

    it('PLANT_CREATE is a valid GQL document', () => {
      expect(PLANT_CREATE).toBeDefined();
      expect((PLANT_CREATE as DocumentNode).kind).toBe('Document');
    });

    it('PLANT_DELETE is a valid GQL document', () => {
      expect(PLANT_DELETE).toBeDefined();
      expect((PLANT_DELETE as DocumentNode).kind).toBe('Document');
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

  describe('create()', () => {
    it('calls apolloClient.mutate with PLANT_CREATE and then getById, returns Plant', async () => {
      vi.mocked(apolloClient.mutate).mockResolvedValue({
        data: { plantCreate: { id: 'plant-1', success: true, message: 'Plant created successfully' } },
      } as never);
      vi.mocked(apolloClient.query).mockResolvedValue({
        data: { plantFindById: mockPlant },
      } as never);

      const result = await repository.create({ name: 'Monstera' });

      expect(apolloClient.mutate).toHaveBeenCalledOnce();
      expect(apolloClient.mutate).toHaveBeenCalledWith({
        mutation: PLANT_CREATE,
        variables: { input: { name: 'Monstera' } },
      });
      expect(apolloClient.query).toHaveBeenCalledWith({
        query: PLANT_FIND_BY_ID,
        variables: { input: { id: 'plant-1' } },
      });
      expect(result).toEqual(mockPlant);
    });

    it('throws when success is false', async () => {
      vi.mocked(apolloClient.mutate).mockResolvedValue({
        data: { plantCreate: { id: '', success: false, message: 'Failed' } },
      } as never);

      await expect(repository.create({ name: 'Monstera' })).rejects.toThrow('plantCreate mutation failed');
    });

    it('propagates errors from apolloClient.mutate', async () => {
      vi.mocked(apolloClient.mutate).mockRejectedValue(new Error('Network error'));
      await expect(repository.create({ name: 'Monstera' })).rejects.toThrow('Network error');
    });
  });

  describe('delete()', () => {
    it('calls apolloClient.mutate with PLANT_DELETE and the given id', async () => {
      vi.mocked(apolloClient.mutate).mockResolvedValue({ data: { plantDelete: { success: true, message: 'ok' } } } as never);

      await repository.delete('plant-1');

      expect(apolloClient.mutate).toHaveBeenCalledOnce();
      expect(apolloClient.mutate).toHaveBeenCalledWith({
        mutation: PLANT_DELETE,
        variables: { input: { id: 'plant-1' } },
      });
    });

    it('resolves void on success', async () => {
      vi.mocked(apolloClient.mutate).mockResolvedValue({ data: { plantDelete: { success: true, message: 'ok' } } } as never);

      const result = await repository.delete('plant-99');

      expect(result).toBeUndefined();
    });

    it('propagates errors from apolloClient.mutate', async () => {
      vi.mocked(apolloClient.mutate).mockRejectedValue(new Error('Plant not found'));
      await expect(repository.delete('plant-x')).rejects.toThrow('Plant not found');
    });
  });
});
