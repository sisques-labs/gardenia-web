import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CompleteCareScheduleUseCase } from './complete-care-schedule.use-case';
import type { ICareScheduleRepository } from '@/core/care-schedule/application/ports/care-schedule.repository.port';
import type { CareSchedule } from '@/core/care-schedule/domain/types/care-schedule.interface';

const mockCareSchedule: CareSchedule = {
  id: 'cs-1',
  plantId: 'plant-1',
  activityType: 'WATERING',
  intervalDays: 3,
  quantity: null,
  unit: null,
  notes: null,
  nextDueAt: '2026-07-08',
  lastCompletedAt: '2026-07-05',
  active: true,
  userId: 'user-1',
  spaceId: 'space-1',
  createdAt: '2026-07-01',
  updatedAt: '2026-07-05',
};

const mockRepository: ICareScheduleRepository = {
  findByCriteria: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  complete: vi.fn(),
  waterPlant: vi.fn(),
  delete: vi.fn(),
};

describe('CompleteCareScheduleUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delegates to repository.complete with id and completedAt', async () => {
    vi.mocked(mockRepository.complete).mockResolvedValue(mockCareSchedule);
    const useCase = new CompleteCareScheduleUseCase(mockRepository);

    const result = await useCase.execute('cs-1', '2026-07-05');

    expect(result).toEqual(mockCareSchedule);
    expect(mockRepository.complete).toHaveBeenCalledWith('cs-1', '2026-07-05');
  });

  it('delegates without completedAt when omitted', async () => {
    vi.mocked(mockRepository.complete).mockResolvedValue(mockCareSchedule);
    const useCase = new CompleteCareScheduleUseCase(mockRepository);

    await useCase.execute('cs-1');

    expect(mockRepository.complete).toHaveBeenCalledWith('cs-1', undefined);
  });
});
