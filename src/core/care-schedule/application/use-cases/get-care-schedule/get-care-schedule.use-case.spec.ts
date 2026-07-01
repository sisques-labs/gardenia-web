import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetCareScheduleUseCase } from './get-care-schedule.use-case';
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
  delete: vi.fn(),
};

describe('GetCareScheduleUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns a single care schedule from the repository', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(mockCareSchedule);
    const useCase = new GetCareScheduleUseCase(mockRepository);

    const result = await useCase.execute('cs-1');

    expect(result).toEqual(mockCareSchedule);
    expect(mockRepository.findById).toHaveBeenCalledWith('cs-1');
  });

  it('propagates rejection', async () => {
    vi.mocked(mockRepository.findById).mockRejectedValue(new Error('not found'));
    const useCase = new GetCareScheduleUseCase(mockRepository);

    await expect(useCase.execute('cs-99')).rejects.toThrow('not found');
  });
});
