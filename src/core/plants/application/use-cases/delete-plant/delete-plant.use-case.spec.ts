import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeletePlantUseCase } from './delete-plant.use-case';
import type { IPlantsRepository } from '@/core/plants/application/ports/plants.repository.port';

const mockRepository: IPlantsRepository = {
  list: vi.fn(),
  getById: vi.fn(),
  create: vi.fn(),
  delete: vi.fn(),
};

describe('DeletePlantUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delegates to repo and resolves void', async () => {
    vi.mocked(mockRepository.delete).mockResolvedValue(undefined);
    const useCase = new DeletePlantUseCase(mockRepository);

    const result = await useCase.execute('plant-1');

    expect(result).toBeUndefined();
    expect(mockRepository.delete).toHaveBeenCalledOnce();
    expect(mockRepository.delete).toHaveBeenCalledWith('plant-1');
  });

  it('propagates rejection', async () => {
    vi.mocked(mockRepository.delete).mockRejectedValue(new Error('Plant not found: plant-99'));
    const useCase = new DeletePlantUseCase(mockRepository);

    await expect(useCase.execute('plant-99')).rejects.toThrow('Plant not found: plant-99');
  });
});
