import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CompleteCareScheduleUseCase } from './complete-care-schedule.use-case';
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

describe('CompleteCareScheduleUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delegates to repository.complete with id and completedAt', async () => {
    vi.mocked(mockRepository.complete).mockResolvedValue(mockCreatedEntity);
    const useCase = new CompleteCareScheduleUseCase(mockRepository);

    const result = await useCase.execute('cs-1', '2026-07-05');

    expect(result).toEqual(mockCreatedEntity);
    expect(mockRepository.complete).toHaveBeenCalledWith('cs-1', '2026-07-05');
  });

  it('delegates without completedAt when omitted', async () => {
    vi.mocked(mockRepository.complete).mockResolvedValue(mockCreatedEntity);
    const useCase = new CompleteCareScheduleUseCase(mockRepository);

    await useCase.execute('cs-1');

    expect(mockRepository.complete).toHaveBeenCalledWith('cs-1', undefined);
  });
});
