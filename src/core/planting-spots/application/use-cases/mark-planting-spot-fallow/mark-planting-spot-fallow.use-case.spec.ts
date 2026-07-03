import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MarkPlantingSpotFallowUseCase } from './mark-planting-spot-fallow.use-case';
import type { IPlantingSpotsRepository } from '@/core/planting-spots/application/ports/planting-spots.repository.port';
import type { PlantingSpot } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';

const mockSpot: PlantingSpot = {
  id: 'spot-1',
  name: 'North Bed',
  type: 'RAISED_BED',
  description: null,
  status: 'FALLOW',
  fallowSince: '2026-07-03T00:00:00.000Z',
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

describe('MarkPlantingSpotFallowUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls repo.markFallow with the id', async () => {
    vi.mocked(mockRepository.markFallow).mockResolvedValue(mockSpot);
    const useCase = new MarkPlantingSpotFallowUseCase(mockRepository);

    await useCase.execute('spot-1');

    expect(mockRepository.markFallow).toHaveBeenCalledOnce();
    expect(mockRepository.markFallow).toHaveBeenCalledWith('spot-1');
  });

  it('returns the fallow spot', async () => {
    vi.mocked(mockRepository.markFallow).mockResolvedValue(mockSpot);
    const useCase = new MarkPlantingSpotFallowUseCase(mockRepository);

    const result = await useCase.execute('spot-1');

    expect(result).toEqual(mockSpot);
  });
});
