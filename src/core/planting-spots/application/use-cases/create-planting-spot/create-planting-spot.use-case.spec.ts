import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreatePlantingSpotUseCase } from './create-planting-spot.use-case';
import type { IPlantingSpotsRepository } from '@/core/planting-spots/application/ports/planting-spots.repository.port';
import type { CreatePlantingSpotInput } from '@/core/planting-spots/application/interfaces/create-planting-spot-input.interface';

const mockCreatedEntity = { id: 'spot-1' };

const input: CreatePlantingSpotInput = {
  name: 'Main Bed',
  type: 'RAISED_BED',
  description: 'A nice bed',
};

const mockRepository: IPlantingSpotsRepository = {
  list: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

describe('CreatePlantingSpotUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls repo.create with input', async () => {
    vi.mocked(mockRepository.create).mockResolvedValue(mockCreatedEntity);
    const useCase = new CreatePlantingSpotUseCase(mockRepository);

    await useCase.execute(input);

    expect(mockRepository.create).toHaveBeenCalledOnce();
    expect(mockRepository.create).toHaveBeenCalledWith(input);
  });

  it('returns the created id', async () => {
    vi.mocked(mockRepository.create).mockResolvedValue(mockCreatedEntity);
    const useCase = new CreatePlantingSpotUseCase(mockRepository);

    const result = await useCase.execute(input);

    expect(result).toEqual(mockCreatedEntity);
  });
});
