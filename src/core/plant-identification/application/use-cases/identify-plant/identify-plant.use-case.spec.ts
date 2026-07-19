import { describe, it, expect, vi } from 'vitest';
import { IdentifyPlantUseCase } from './identify-plant.use-case';
import type { IPlantIdentificationsHttpRepository } from '@/core/plant-identification/application/ports/plant-identifications-http.repository.port';
import type { PlantIdentification } from '@/core/plant-identification/domain/interfaces/plant-identification.interface';

const mockIdentification: PlantIdentification = {
  id: 'ident-1',
  status: 'resolved',
  resolved: { gbifKey: 2882337, scientificName: 'Monstera deliciosa' },
  candidates: [{ scientificName: 'Monstera deliciosa', commonNames: ['Swiss cheese plant'], score: 0.92 }],
  photos: [{ url: '/api/files/file-1/content', organ: 'leaf' }],
  convertedToPlantId: null,
  createdAt: '2026-07-01T10:00:00Z',
};

describe('IdentifyPlantUseCase', () => {
  const mockRepo: IPlantIdentificationsHttpRepository = {
    identify: vi.fn().mockResolvedValue(mockIdentification),
  };

  it('delegates to repository.identify and returns the identification', async () => {
    const useCase = new IdentifyPlantUseCase(mockRepo);
    const file = new File(['x'], 'leaf.png', { type: 'image/png' });
    const input = { photos: [{ file, organ: 'leaf' as const }] };

    const result = await useCase.execute(input);

    expect(mockRepo.identify).toHaveBeenCalledWith(input);
    expect(result).toEqual(mockIdentification);
  });

  it('propagates repository errors', async () => {
    vi.mocked(mockRepo.identify).mockRejectedValueOnce(new Error('Provider unavailable'));
    const useCase = new IdentifyPlantUseCase(mockRepo);
    const file = new File(['x'], 'leaf.png', { type: 'image/png' });

    await expect(useCase.execute({ photos: [{ file, organ: 'leaf' }] })).rejects.toThrow(
      'Provider unavailable',
    );
  });
});
