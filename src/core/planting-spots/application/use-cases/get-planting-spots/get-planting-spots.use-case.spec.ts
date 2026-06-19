import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetPlantingSpotsUseCase } from './get-planting-spots.use-case';
import type { IPlantingSpotsRepository } from '@/core/planting-spots/application/ports/planting-spots.repository.port';
import type { PlantingSpot } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';

const mockSpots: PlantingSpot[] = [
  {
    id: 'spot-1',
    name: 'Main Bed',
    type: 'RAISED_BED',
    description: null,
    userId: 'user-1',
    spaceId: 'space-1',
    resolvedPlants: [],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
];

const mockRepository: IPlantingSpotsRepository = {
  list: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

describe('GetPlantingSpotsUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns list from repository', async () => {
    vi.mocked(mockRepository.list).mockResolvedValue(mockSpots);
    const useCase = new GetPlantingSpotsUseCase(mockRepository);

    const result = await useCase.execute();

    expect(result).toEqual(mockSpots);
    expect(mockRepository.list).toHaveBeenCalledOnce();
  });

  it('returns empty array when repository returns empty', async () => {
    vi.mocked(mockRepository.list).mockResolvedValue([]);
    const useCase = new GetPlantingSpotsUseCase(mockRepository);

    const result = await useCase.execute();

    expect(result).toEqual([]);
  });

  it('propagates repository errors', async () => {
    vi.mocked(mockRepository.list).mockRejectedValue(new Error('Network error'));
    const useCase = new GetPlantingSpotsUseCase(mockRepository);

    await expect(useCase.execute()).rejects.toThrow('Network error');
  });
});
