import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdatePlantingSpotUseCase } from './update-planting-spot.use-case';
import type { IPlantingSpotsRepository } from '@/core/planting-spots/application/ports/planting-spots.repository.port';
import type { UpdatePlantingSpotInput } from '@/core/planting-spots/application/interfaces/update-planting-spot-input.interface';

const mockCreatedEntity = { id: 'spot-1' };

const input: UpdatePlantingSpotInput = {
  id: 'spot-1',
  name: 'Updated Bed',
  type: 'POT',
};

const mockRepository: IPlantingSpotsRepository = {
  list: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  waterAll: vi.fn(),
};

describe('UpdatePlantingSpotUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls repo.update with input', async () => {
    vi.mocked(mockRepository.update).mockResolvedValue(mockCreatedEntity);
    const useCase = new UpdatePlantingSpotUseCase(mockRepository);

    await useCase.execute(input);

    expect(mockRepository.update).toHaveBeenCalledOnce();
    expect(mockRepository.update).toHaveBeenCalledWith(input);
  });

  it('returns the updated id', async () => {
    vi.mocked(mockRepository.update).mockResolvedValue(mockCreatedEntity);
    const useCase = new UpdatePlantingSpotUseCase(mockRepository);

    const result = await useCase.execute(input);

    expect(result).toEqual(mockCreatedEntity);
  });
});
