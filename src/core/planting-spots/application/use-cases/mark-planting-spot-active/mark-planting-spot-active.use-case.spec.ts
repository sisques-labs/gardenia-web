import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MarkPlantingSpotActiveUseCase } from './mark-planting-spot-active.use-case';
import type { IPlantingSpotsRepository } from '@/core/planting-spots/application/ports/planting-spots.repository.port';

const mockCreatedEntity = { id: 'spot-1' };

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
    vi.mocked(mockRepository.markActive).mockResolvedValue(mockCreatedEntity);
    const useCase = new MarkPlantingSpotActiveUseCase(mockRepository);

    await useCase.execute('spot-1');

    expect(mockRepository.markActive).toHaveBeenCalledOnce();
    expect(mockRepository.markActive).toHaveBeenCalledWith('spot-1');
  });

  it('returns the id', async () => {
    vi.mocked(mockRepository.markActive).mockResolvedValue(mockCreatedEntity);
    const useCase = new MarkPlantingSpotActiveUseCase(mockRepository);

    const result = await useCase.execute('spot-1');

    expect(result).toEqual(mockCreatedEntity);
  });
});
