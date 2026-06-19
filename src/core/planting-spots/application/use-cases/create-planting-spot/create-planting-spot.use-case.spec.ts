import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreatePlantingSpotUseCase } from './create-planting-spot.use-case';
import type { IPlantingSpotsRepository } from '@/core/planting-spots/application/ports/planting-spots.repository.port';
import type { PlantingSpot } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';
import type { CreatePlantingSpotInput } from '@/core/planting-spots/application/interfaces/create-planting-spot-input.interface';

const mockSpot: PlantingSpot = {
  id: 'spot-1',
  name: 'Main Bed',
  type: 'RAISED_BED',
  description: 'A nice bed',
  userId: 'user-1',
  spaceId: 'space-1',
  resolvedPlants: [],
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

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
    vi.mocked(mockRepository.create).mockResolvedValue(mockSpot);
    const useCase = new CreatePlantingSpotUseCase(mockRepository);

    await useCase.execute(input);

    expect(mockRepository.create).toHaveBeenCalledOnce();
    expect(mockRepository.create).toHaveBeenCalledWith(input);
  });

  it('returns the created spot', async () => {
    vi.mocked(mockRepository.create).mockResolvedValue(mockSpot);
    const useCase = new CreatePlantingSpotUseCase(mockRepository);

    const result = await useCase.execute(input);

    expect(result).toEqual(mockSpot);
  });
});
