import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateCareScheduleUseCase } from './create-care-schedule.use-case';
import type { ICareScheduleRepository } from '@/core/care-schedule/application/ports/care-schedule.repository.port';

const mockCreatedEntity = { id: 'cs-1' };

const mockRepository: ICareScheduleRepository = {
  findByCriteria: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  complete: vi.fn(),
  delete: vi.fn(),
};

describe('CreateCareScheduleUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delegates to repository.create with the given input', async () => {
    vi.mocked(mockRepository.create).mockResolvedValue(mockCreatedEntity);
    const useCase = new CreateCareScheduleUseCase(mockRepository);

    const input = { plantId: 'plant-1', activityType: 'WATERING' as const, intervalDays: 3 };
    const result = await useCase.execute(input);

    expect(result).toEqual(mockCreatedEntity);
    expect(mockRepository.create).toHaveBeenCalledWith(input);
  });
});
