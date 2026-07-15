import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetCareSchedulesUseCase } from './get-care-schedules.use-case';
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
  nextDueAt: '2026-07-05',
  lastCompletedAt: null,
  active: true,
  userId: 'user-1',
  spaceId: 'space-1',
  createdAt: '2026-07-01',
  updatedAt: '2026-07-01',
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

describe('GetCareSchedulesUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delegates to repository.findByCriteria with the given filters', async () => {
    vi.mocked(mockRepository.findByCriteria).mockResolvedValue([mockCareSchedule]);
    const useCase = new GetCareSchedulesUseCase(mockRepository);

    const filters = { plantId: 'plant-1' };
    const result = await useCase.execute(filters);

    expect(result).toEqual([mockCareSchedule]);
    expect(mockRepository.findByCriteria).toHaveBeenCalledOnce();
    expect(mockRepository.findByCriteria).toHaveBeenCalledWith(filters);
  });

  it('delegates with no filters when none are given', async () => {
    vi.mocked(mockRepository.findByCriteria).mockResolvedValue([]);
    const useCase = new GetCareSchedulesUseCase(mockRepository);

    await useCase.execute();

    expect(mockRepository.findByCriteria).toHaveBeenCalledWith(undefined);
  });
});
