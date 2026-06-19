import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetPlantingSpotUseCase } from './get-planting-spot.use-case';
import type { IPlantingSpotsRepository } from '@/core/planting-spots/application/ports/planting-spots.repository.port';
import type { PlantingSpot } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';

const mockSpot: PlantingSpot = {
  id: 'spot-1',
  name: 'Main Bed',
  type: 'RAISED_BED',
  description: null,
  userId: 'user-1',
  spaceId: 'space-1',
  resolvedPlants: [],
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

const mockRepository: IPlantingSpotsRepository = {
  list: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

describe('GetPlantingSpotUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns spot by id', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(mockSpot);
    const useCase = new GetPlantingSpotUseCase(mockRepository);

    const result = await useCase.execute('spot-1');

    expect(result).toEqual(mockSpot);
  });

  it('calls repository with the given id', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(mockSpot);
    const useCase = new GetPlantingSpotUseCase(mockRepository);

    await useCase.execute('spot-1');

    expect(mockRepository.findById).toHaveBeenCalledOnce();
    expect(mockRepository.findById).toHaveBeenCalledWith('spot-1');
  });

  it('propagates repository errors', async () => {
    vi.mocked(mockRepository.findById).mockRejectedValue(new Error('Not found'));
    const useCase = new GetPlantingSpotUseCase(mockRepository);

    await expect(useCase.execute('spot-99')).rejects.toThrow('Not found');
  });
});
