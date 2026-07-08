import { describe, it, expect, vi } from 'vitest';
import { GetPlantPhotosUseCase } from './get-plant-photos.use-case';
import type { IPlantPhotosRepository } from '@/core/plant-photos/application/ports/plant-photos.repository.port';

describe('GetPlantPhotosUseCase', () => {
  const mockRepo: IPlantPhotosRepository = {
    listByPlant: vi.fn().mockResolvedValue([{ id: 'ph1' }]),
    upload: vi.fn(),
    delete: vi.fn(),
  };

  it('delegates to repository.listByPlant and returns the photos', async () => {
    const useCase = new GetPlantPhotosUseCase(mockRepo);
    const result = await useCase.execute('plant-1');
    expect(mockRepo.listByPlant).toHaveBeenCalledWith('plant-1');
    expect(result).toEqual([{ id: 'ph1' }]);
  });

  it('propagates repository errors', async () => {
    vi.mocked(mockRepo.listByPlant).mockRejectedValueOnce(new Error('List failed'));
    const useCase = new GetPlantPhotosUseCase(mockRepo);
    await expect(useCase.execute('plant-1')).rejects.toThrow('List failed');
  });
});
