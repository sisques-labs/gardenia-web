import { describe, it, expect, vi } from 'vitest';
import { UploadPlantPhotoUseCase } from './upload-plant-photo.use-case';
import type { IPlantPhotosRepository } from '@/core/plant-photos/application/ports/plant-photos.repository.port';

describe('UploadPlantPhotoUseCase', () => {
  const mockRepo: IPlantPhotosRepository = {
    listByPlant: vi.fn(),
    upload: vi.fn().mockResolvedValue({ id: 'ph1', plantId: 'plant-1' }),
    delete: vi.fn(),
  };

  it('delegates to repository.upload and returns the created photo', async () => {
    const useCase = new UploadPlantPhotoUseCase(mockRepo);
    const file = new File(['x'], 'rose.png', { type: 'image/png' });
    const result = await useCase.execute('plant-1', file);
    expect(mockRepo.upload).toHaveBeenCalledWith('plant-1', file);
    expect(result).toEqual({ id: 'ph1', plantId: 'plant-1' });
  });

  it('propagates repository errors', async () => {
    vi.mocked(mockRepo.upload).mockRejectedValueOnce(new Error('Upload failed'));
    const useCase = new UploadPlantPhotoUseCase(mockRepo);
    const file = new File(['x'], 'rose.png', { type: 'image/png' });
    await expect(useCase.execute('plant-1', file)).rejects.toThrow('Upload failed');
  });
});
