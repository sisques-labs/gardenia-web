import { describe, it, expect, vi } from 'vitest';
import { GetPlantIdentificationsUseCase } from './get-plant-identifications.use-case';
import type { IPlantIdentificationsRepository } from '@/core/plant-identification/application/ports/plant-identifications.repository.port';
import type { PlantIdentification } from '@/core/plant-identification/domain/interfaces/plant-identification.interface';

const mockIdentification: PlantIdentification = {
  id: 'ident-1',
  status: 'no_match',
  resolved: null,
  candidates: [],
  photos: [{ url: '/api/files/file-1/content', organ: 'leaf' }],
  convertedToPlantId: null,
  createdAt: '2026-07-01T10:00:00Z',
};

describe('GetPlantIdentificationsUseCase', () => {
  const mockRepo: IPlantIdentificationsRepository = {
    identify: vi.fn(),
    findByCriteria: vi.fn().mockResolvedValue({ items: [mockIdentification], total: 1 }),
    createPlantFromIdentification: vi.fn(),
  };

  it('delegates to repository.findByCriteria forwarding pagination params unmodified', async () => {
    const useCase = new GetPlantIdentificationsUseCase(mockRepo);

    const result = await useCase.execute('space-1', 1, 5);

    expect(mockRepo.findByCriteria).toHaveBeenCalledWith('space-1', 1, 5);
    expect(result).toEqual({ items: [mockIdentification], total: 1 });
  });

  it('propagates repository errors', async () => {
    vi.mocked(mockRepo.findByCriteria).mockRejectedValueOnce(new Error('Network error'));
    const useCase = new GetPlantIdentificationsUseCase(mockRepo);

    await expect(useCase.execute('space-1', 1, 5)).rejects.toThrow('Network error');
  });
});
