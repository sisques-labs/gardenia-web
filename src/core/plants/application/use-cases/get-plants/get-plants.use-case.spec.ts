import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetPlantsUseCase } from './get-plants.use-case';
import type { IPlantsRepository } from '@/core/plants/application/ports/plants.repository.port';
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

const mockRepository: IPlantsRepository = {
  list: vi.fn(),
  getById: vi.fn(),
  create: vi.fn(),
  delete: vi.fn(),
};

describe('GetPlantsUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns plants from repository', async () => {
    vi.mocked(mockRepository.list).mockResolvedValue(mockPlants);
    const useCase = new GetPlantsUseCase(mockRepository);

    const result = await useCase.execute();

    expect(result).toEqual(mockPlants);
    expect(mockRepository.list).toHaveBeenCalledOnce();
  });

  it('returns empty array when repository returns no plants', async () => {
    vi.mocked(mockRepository.list).mockResolvedValue([]);
    const useCase = new GetPlantsUseCase(mockRepository);

    const result = await useCase.execute();

    expect(result).toEqual([]);
    expect(mockRepository.list).toHaveBeenCalledOnce();
  });

  it('propagates repository errors', async () => {
    vi.mocked(mockRepository.list).mockRejectedValue(new Error('Network error'));
    const useCase = new GetPlantsUseCase(mockRepository);

    await expect(useCase.execute()).rejects.toThrow('Network error');
  });
});
