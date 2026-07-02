import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeleteCareScheduleUseCase } from './delete-care-schedule.use-case';
import type { ICareScheduleRepository } from '@/core/care-schedule/application/ports/care-schedule.repository.port';

const mockRepository: ICareScheduleRepository = {
  findByCriteria: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  complete: vi.fn(),
  delete: vi.fn(),
};

describe('DeleteCareScheduleUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delegates to repo and resolves void', async () => {
    vi.mocked(mockRepository.delete).mockResolvedValue(undefined);
    const useCase = new DeleteCareScheduleUseCase(mockRepository);

    const result = await useCase.execute('cs-1');

    expect(result).toBeUndefined();
    expect(mockRepository.delete).toHaveBeenCalledWith('cs-1');
  });
});
