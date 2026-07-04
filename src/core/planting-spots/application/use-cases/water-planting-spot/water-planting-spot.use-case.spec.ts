import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WaterPlantingSpotUseCase } from './water-planting-spot.use-case';
import type { IPlantingSpotsRepository } from '@/core/planting-spots/application/ports/planting-spots.repository.port';
import type { WaterPlantingSpotResult } from '@/core/planting-spots/domain/interfaces/water-planting-spot-result.interface';

const mockResult: WaterPlantingSpotResult = {
  plantingSpotId: 'spot-1',
  wateredPlantIds: ['plant-1', 'plant-2'],
  failedPlants: [],
};

const mockRepository: IPlantingSpotsRepository = {
  list: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  waterAll: vi.fn(),
  markFallow: vi.fn(),
  markActive: vi.fn(),
};

describe('WaterPlantingSpotUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delegates to repo.waterAll with id and performedAt', async () => {
    vi.mocked(mockRepository.waterAll).mockResolvedValue(mockResult);
    const useCase = new WaterPlantingSpotUseCase(mockRepository);

    const result = await useCase.execute('spot-1', '2026-07-05');

    expect(result).toEqual(mockResult);
    expect(mockRepository.waterAll).toHaveBeenCalledWith('spot-1', '2026-07-05');
  });

  it('delegates without performedAt when omitted', async () => {
    vi.mocked(mockRepository.waterAll).mockResolvedValue(mockResult);
    const useCase = new WaterPlantingSpotUseCase(mockRepository);

    await useCase.execute('spot-1');

    expect(mockRepository.waterAll).toHaveBeenCalledWith('spot-1', undefined);
  });
});
