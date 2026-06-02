import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/shared/infrastructure/http/axios.client', () => ({
  http: {
    get: vi.fn(),
  },
}));

import { http } from '@/shared/infrastructure/http/axios.client';
import { PlantsHttpRepository } from './plants-http.repository';
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

describe('PlantsHttpRepository', () => {
  let repository: PlantsHttpRepository;

  beforeEach(() => {
    repository = new PlantsHttpRepository();
    vi.clearAllMocks();
  });

  describe('list()', () => {
    it('calls GET /plants and maps response.data.items', async () => {
      vi.mocked(http.get).mockResolvedValue({ data: { items: mockPlants, total: 1, page: 1, perPage: 20 } });

      const result = await repository.list();

      expect(http.get).toHaveBeenCalledOnce();
      expect(http.get).toHaveBeenCalledWith('/plants');
      expect(result).toEqual(mockPlants);
    });

    it('propagates errors', async () => {
      vi.mocked(http.get).mockRejectedValue(new Error('Network error'));

      await expect(repository.list()).rejects.toThrow('Network error');
    });
  });

  describe('getById()', () => {
    it('calls GET /plants/:id and returns response.data', async () => {
      vi.mocked(http.get).mockResolvedValue({ data: mockPlant });

      const result = await repository.getById('plant-1');

      expect(http.get).toHaveBeenCalledOnce();
      expect(http.get).toHaveBeenCalledWith('/plants/plant-1');
      expect(result).toEqual(mockPlant);
    });

    it('propagates errors', async () => {
      vi.mocked(http.get).mockRejectedValue(new Error('Not found'));

      await expect(repository.getById('plant-1')).rejects.toThrow('Not found');
    });
  });
});
