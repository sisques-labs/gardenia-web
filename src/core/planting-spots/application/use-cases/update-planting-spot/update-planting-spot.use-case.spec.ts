import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdatePlantingSpotUseCase } from './update-planting-spot.use-case';
import type { IPlantingSpotsRepository } from '@/core/planting-spots/application/ports/planting-spots.repository.port';
import type { PlantingSpot } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';
import type { UpdatePlantingSpotInput } from '@/core/planting-spots/application/interfaces/update-planting-spot-input.interface';

const mockSpot: PlantingSpot = {
  id: 'spot-1',
  name: 'Updated Bed',
  type: 'pot',
  description: null,
  userId: 'user-1',
  spaceId: 'space-1',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-02',
};

const input: UpdatePlantingSpotInput = {
  id: 'spot-1',
  name: 'Updated Bed',
  type: 'pot',
};

const mockRepository: IPlantingSpotsRepository = {
  list: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

describe('UpdatePlantingSpotUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls repo.update with input', async () => {
    vi.mocked(mockRepository.update).mockResolvedValue(mockSpot);
    const useCase = new UpdatePlantingSpotUseCase(mockRepository);

    await useCase.execute(input);

    expect(mockRepository.update).toHaveBeenCalledOnce();
    expect(mockRepository.update).toHaveBeenCalledWith(input);
  });

  it('returns the updated spot', async () => {
    vi.mocked(mockRepository.update).mockResolvedValue(mockSpot);
    const useCase = new UpdatePlantingSpotUseCase(mockRepository);

    const result = await useCase.execute(input);

    expect(result).toEqual(mockSpot);
  });
});
