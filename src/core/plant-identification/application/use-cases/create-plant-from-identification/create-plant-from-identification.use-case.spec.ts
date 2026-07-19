import { describe, it, expect, vi } from 'vitest';
import { CreatePlantFromIdentificationUseCase } from './create-plant-from-identification.use-case';
import type { IPlantIdentificationsRepository } from '@/core/plant-identification/application/ports/plant-identifications.repository.port';

describe('CreatePlantFromIdentificationUseCase', () => {
  const mockRepo: IPlantIdentificationsRepository = {
    findByCriteria: vi.fn(),
    createPlantFromIdentification: vi.fn().mockResolvedValue({ id: 'plant-1' }),
  };

  it('delegates to repository.createPlantFromIdentification and returns the created id', async () => {
    const useCase = new CreatePlantFromIdentificationUseCase(mockRepo);
    const input = { identificationId: 'ident-1', name: 'My Monstera' };

    const result = await useCase.execute(input);

    expect(mockRepo.createPlantFromIdentification).toHaveBeenCalledWith(input);
    expect(result).toEqual({ id: 'plant-1' });
  });

  it('propagates repository errors', async () => {
    vi.mocked(mockRepo.createPlantFromIdentification).mockRejectedValueOnce(new Error('Mutation failed'));
    const useCase = new CreatePlantFromIdentificationUseCase(mockRepo);

    await expect(
      useCase.execute({ identificationId: 'ident-1', name: 'My Monstera' }),
    ).rejects.toThrow('Mutation failed');
  });
});
