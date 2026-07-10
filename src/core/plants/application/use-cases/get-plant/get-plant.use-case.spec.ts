import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetPlantUseCase } from './get-plant.use-case';
import type { IPlantsRepository } from '@/core/plants/application/ports/plants.repository.port';
import type { Plant } from '@/core/plants/domain/interfaces/plant.interface';

const mockPlant: Plant = {
  id: 'plant-1',
  name: 'Monstera',
  userId: 'user-1',
  spaceId: 'space-1',
  species: { gbifKey: 2882337, scientificName: 'Monstera deliciosa' },
  imageUrl: 'https://example.com/monstera.jpg',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

const mockRepository: IPlantsRepository = {
  list: vi.fn(),
  getById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  searchSpecies: vi.fn(),
};

describe('GetPlantUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns a plant by id from repository', async () => {
    vi.mocked(mockRepository.getById).mockResolvedValue(mockPlant);
    const useCase = new GetPlantUseCase(mockRepository);

    const result = await useCase.execute('plant-1');

    expect(result).toEqual(mockPlant);
    expect(mockRepository.getById).toHaveBeenCalledOnce();
    expect(mockRepository.getById).toHaveBeenCalledWith('plant-1');
  });

  it('propagates repository errors', async () => {
    vi.mocked(mockRepository.getById).mockRejectedValue(new Error('Not found'));
    const useCase = new GetPlantUseCase(mockRepository);

    await expect(useCase.execute('plant-1')).rejects.toThrow('Not found');
  });
});
