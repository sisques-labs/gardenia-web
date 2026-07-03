import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MarkPlantingSpotFallowUseCase } from './mark-planting-spot-fallow.use-case';
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

describe('MarkPlantingSpotFallowUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls repo.markFallow with the id', async () => {
    vi.mocked(mockRepository.markFallow).mockResolvedValue(mockCreatedEntity);
    const useCase = new MarkPlantingSpotFallowUseCase(mockRepository);

    await useCase.execute('spot-1');

    expect(mockRepository.markFallow).toHaveBeenCalledOnce();
    expect(mockRepository.markFallow).toHaveBeenCalledWith('spot-1');
  });

  it('returns the id', async () => {
    vi.mocked(mockRepository.markFallow).mockResolvedValue(mockCreatedEntity);
    const useCase = new MarkPlantingSpotFallowUseCase(mockRepository);

    const result = await useCase.execute('spot-1');

    expect(result).toEqual(mockCreatedEntity);
  });
});
