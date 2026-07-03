import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateCareScheduleUseCase } from './update-care-schedule.use-case';
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

describe('UpdateCareScheduleUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delegates to repository.update with the given input', async () => {
    vi.mocked(mockRepository.update).mockResolvedValue(mockCreatedEntity);
    const useCase = new UpdateCareScheduleUseCase(mockRepository);

    const input = { id: 'cs-1', notes: 'updated' };
    const result = await useCase.execute(input);

    expect(result).toEqual(mockCreatedEntity);
    expect(mockRepository.update).toHaveBeenCalledWith(input);
  });
});
