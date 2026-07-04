import { describe, it, expect, vi } from 'vitest';
import { UpdatePlantUseCase } from './update-plant.use-case';
import type { IPlantsRepository } from '@/core/plants/application/ports/plants.repository.port';

describe('UpdatePlantUseCase', () => {
  const mockRepo: IPlantsRepository = {
    list: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn().mockResolvedValue({ id: 'plant-1' }),
    delete: vi.fn(),
  };

  it('delegates to repository.update and returns the updated id', async () => {
    const useCase = new UpdatePlantUseCase(mockRepo);
    const result = await useCase.execute({ id: 'plant-1', plantingSpotId: 'spot-1' });
    expect(mockRepo.update).toHaveBeenCalledWith({ id: 'plant-1', plantingSpotId: 'spot-1' });
    expect(result).toEqual({ id: 'plant-1' });
  });

  it('passes null plantingSpotId through to unassign', async () => {
    const useCase = new UpdatePlantUseCase(mockRepo);
    await useCase.execute({ id: 'plant-1', plantingSpotId: null });
    expect(mockRepo.update).toHaveBeenCalledWith({ id: 'plant-1', plantingSpotId: null });
  });

  it('propagates repository errors', async () => {
    vi.mocked(mockRepo.update).mockRejectedValueOnce(new Error('Update failed'));
    const useCase = new UpdatePlantUseCase(mockRepo);
    await expect(useCase.execute({ id: 'plant-1', name: 'Renamed' })).rejects.toThrow('Update failed');
  });
});
