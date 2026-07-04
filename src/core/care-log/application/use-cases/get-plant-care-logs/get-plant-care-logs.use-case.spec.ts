import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetPlantCareLogsUseCase } from './get-plant-care-logs.use-case';
import type { ICareLogRepository } from '@/core/care-log/application/ports/care-log.repository.port';
import { CareLogActivityType } from '@/core/care-log/domain/interfaces/care-log-entry.interface';
import type { CareLogEntry } from '@/core/care-log/domain/interfaces/care-log-entry.interface';

const makeEntry = (overrides: Partial<CareLogEntry> = {}): CareLogEntry => ({
  id: 'entry-1',
  plantId: 'plant-1',
  activityType: CareLogActivityType.WATERING,
  performedAt: '2024-01-10T10:00:00.000Z',
  ...overrides,
});

const mockRepository: ICareLogRepository = {
  findByPlantId: vi.fn(),
  create: vi.fn(),
};

describe('GetPlantCareLogsUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns last entry per activity type when multiple entries exist', async () => {
    const older = makeEntry({ id: 'entry-older', performedAt: '2024-01-05T10:00:00.000Z' });
    const newer = makeEntry({ id: 'entry-newer', performedAt: '2024-01-10T10:00:00.000Z' });
    const fertilizing = makeEntry({
      id: 'entry-fert',
      activityType: CareLogActivityType.FERTILIZING,
      performedAt: '2024-01-08T10:00:00.000Z',
    });
    // API devuelve desc por performedAt, newest first
    vi.mocked(mockRepository.findByPlantId).mockResolvedValue([newer, fertilizing, older]);

    const useCase = new GetPlantCareLogsUseCase(mockRepository);
    const result = await useCase.execute('plant-1');

    expect(result[CareLogActivityType.WATERING]).toEqual(newer);
    expect(result[CareLogActivityType.FERTILIZING]).toEqual(fertilizing);
    expect(Object.keys(result)).toHaveLength(2);
  });

  it('returns empty object when no entries', async () => {
    vi.mocked(mockRepository.findByPlantId).mockResolvedValue([]);
    const useCase = new GetPlantCareLogsUseCase(mockRepository);

    const result = await useCase.execute('plant-1');

    expect(result).toEqual({});
  });

  it('calls findByPlantId with plantId and limit 50', async () => {
    vi.mocked(mockRepository.findByPlantId).mockResolvedValue([]);
    const useCase = new GetPlantCareLogsUseCase(mockRepository);

    await useCase.execute('plant-1');

    expect(mockRepository.findByPlantId).toHaveBeenCalledWith('plant-1', 50);
  });

  it('propagates repository errors', async () => {
    vi.mocked(mockRepository.findByPlantId).mockRejectedValue(new Error('Network error'));
    const useCase = new GetPlantCareLogsUseCase(mockRepository);

    await expect(useCase.execute('plant-1')).rejects.toThrow('Network error');
  });
});
