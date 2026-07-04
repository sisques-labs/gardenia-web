import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeletePlantingSpotUseCase } from './delete-planting-spot.use-case';
import type { IPlantingSpotsRepository } from '@/core/planting-spots/application/ports/planting-spots.repository.port';

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

describe('DeletePlantingSpotUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls repo.delete with id', async () => {
    vi.mocked(mockRepository.delete).mockResolvedValue(undefined);
    const useCase = new DeletePlantingSpotUseCase(mockRepository);

    await useCase.execute('spot-1');

    expect(mockRepository.delete).toHaveBeenCalledOnce();
    expect(mockRepository.delete).toHaveBeenCalledWith('spot-1');
  });

  it('resolves void', async () => {
    vi.mocked(mockRepository.delete).mockResolvedValue(undefined);
    const useCase = new DeletePlantingSpotUseCase(mockRepository);

    const result = await useCase.execute('spot-1');

    expect(result).toBeUndefined();
  });
});
