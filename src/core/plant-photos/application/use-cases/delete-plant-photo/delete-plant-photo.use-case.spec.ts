import { describe, it, expect, vi } from 'vitest';
import { DeletePlantPhotoUseCase } from './delete-plant-photo.use-case';
import type { IPlantPhotosRepository } from '@/core/plant-photos/application/ports/plant-photos.repository.port';

describe('DeletePlantPhotoUseCase', () => {
  const mockRepo: IPlantPhotosRepository = {
    listByPlant: vi.fn(),
    upload: vi.fn(),
    delete: vi.fn().mockResolvedValue(undefined),
  };

  it('delegates to repository.delete', async () => {
    const useCase = new DeletePlantPhotoUseCase(mockRepo);
    await useCase.execute('ph1');
    expect(mockRepo.delete).toHaveBeenCalledWith('ph1');
  });

  it('propagates repository errors', async () => {
    vi.mocked(mockRepo.delete).mockRejectedValueOnce(new Error('Delete failed'));
    const useCase = new DeletePlantPhotoUseCase(mockRepo);
    await expect(useCase.execute('ph1')).rejects.toThrow('Delete failed');
  });
});
