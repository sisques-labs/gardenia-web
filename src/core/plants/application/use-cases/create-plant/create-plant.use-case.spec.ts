import { describe, it, expect, vi } from 'vitest';
import { CreatePlantUseCase } from './create-plant.use-case';
import type { IPlantsRepository } from '@/core/plants/application/ports/plants.repository.port';

describe('CreatePlantUseCase', () => {
  const mockRepo: IPlantsRepository = {
    list: vi.fn(),
    getById: vi.fn(),
    create: vi.fn().mockResolvedValue({ id: 'p1' }),
    update: vi.fn(),
    delete: vi.fn(),
  };

  it('delegates to repository.create and returns the created id', async () => {
    const useCase = new CreatePlantUseCase(mockRepo);
    const result = await useCase.execute({ name: 'Monstera' });
    expect(mockRepo.create).toHaveBeenCalledWith({ name: 'Monstera' });
    expect(result).toEqual({ id: 'p1' });
  });

  it('passes optional fields through', async () => {
    const useCase = new CreatePlantUseCase(mockRepo);
    await useCase.execute({ name: 'Monstera', imageUrl: 'https://example.com/img.jpg', plantSpeciesId: 'sp-1' });
    expect(mockRepo.create).toHaveBeenCalledWith({
      name: 'Monstera',
      imageUrl: 'https://example.com/img.jpg',
      plantSpeciesId: 'sp-1',
    });
  });

  it('propagates repository errors', async () => {
    vi.mocked(mockRepo.create).mockRejectedValueOnce(new Error('Create failed'));
    const useCase = new CreatePlantUseCase(mockRepo);
    await expect(useCase.execute({ name: 'Monstera' })).rejects.toThrow('Create failed');
  });
});
