import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateCareLogUseCase } from './create-care-log.use-case';
import type { ICareLogRepository } from '@/core/care-log/application/ports/care-log.repository.port';
import { CareLogActivityType } from '@/core/care-log/domain/interfaces/care-log-entry.interface';

const mockCreatedEntity = { id: 'entry-1' };

const mockRepository: ICareLogRepository = {
  findByPlantId: vi.fn(),
  create: vi.fn(),
};

describe('CreateCareLogUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delegates to repository.create with the given input', async () => {
    vi.mocked(mockRepository.create).mockResolvedValue(mockCreatedEntity);
    const useCase = new CreateCareLogUseCase(mockRepository);

    const input = { plantId: 'plant-1', activityType: CareLogActivityType.WATERING };
    const result = await useCase.execute(input);

    expect(result).toEqual(mockCreatedEntity);
    expect(mockRepository.create).toHaveBeenCalledWith(input);
  });
});
