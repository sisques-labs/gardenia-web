import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateCareScheduleUseCase } from './update-care-schedule.use-case';
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

describe('UpdateCareScheduleUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delegates to repository.update with the given input', async () => {
    vi.mocked(mockRepository.update).mockResolvedValue(mockCareSchedule);
    const useCase = new UpdateCareScheduleUseCase(mockRepository);

    const input = { id: 'cs-1', notes: 'updated' };
    const result = await useCase.execute(input);

    expect(result).toEqual(mockCareSchedule);
    expect(mockRepository.update).toHaveBeenCalledWith(input);
  });
});
