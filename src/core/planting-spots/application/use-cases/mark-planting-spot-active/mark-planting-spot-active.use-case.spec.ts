import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MarkPlantingSpotActiveUseCase } from './mark-planting-spot-active.use-case';
import type { IPlantingSpotsRepository } from '@/core/planting-spots/application/ports/planting-spots.repository.port';
import type { PlantingSpot } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';

const mockSpot: PlantingSpot = {
  id: 'spot-1',
  name: 'North Bed',
  type: 'RAISED_BED',
  description: null,
  status: 'ACTIVE',
  fallowSince: null,
  userId: 'user-1',
  spaceId: 'space-1',
  resolvedPlants: [],
  createdAt: '2024-01-01',
  updatedAt: '2024-01-02',
};

const mockRepository: IPlantingSpotsRepository = {
  list: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  markFallow: vi.fn(),
  markActive: vi.fn(),
};

describe('MarkPlantingSpotActiveUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls repo.markActive with the id', async () => {
    vi.mocked(mockRepository.markActive).mockResolvedValue(mockSpot);
    const useCase = new MarkPlantingSpotActiveUseCase(mockRepository);

    await useCase.execute('spot-1');

    expect(mockRepository.markActive).toHaveBeenCalledOnce();
    expect(mockRepository.markActive).toHaveBeenCalledWith('spot-1');
  });

  it('returns the active spot', async () => {
    vi.mocked(mockRepository.markActive).mockResolvedValue(mockSpot);
    const useCase = new MarkPlantingSpotActiveUseCase(mockRepository);

    const result = await useCase.execute('spot-1');

    expect(result).toEqual(mockSpot);
  });
});
