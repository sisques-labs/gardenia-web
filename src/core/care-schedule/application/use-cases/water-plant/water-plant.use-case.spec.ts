import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WaterPlantUseCase } from './water-plant.use-case';
import type { ICareScheduleRepository } from '@/core/care-schedule/application/ports/care-schedule.repository.port';
import type { WaterPlantResult } from '@/core/care-schedule/domain/types/care-schedule.interface';

const mockWaterPlantResult: WaterPlantResult = {
  plantId: 'plant-1',
  mode: 'SCHEDULE_COMPLETED',
  careScheduleId: 'cs-1',
};

const mockRepository: ICareScheduleRepository = {
  findByCriteria: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  complete: vi.fn(),
  delete: vi.fn(),
  waterPlant: vi.fn(),
};

describe('WaterPlantUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delegates to repository.waterPlant with plantId and performedAt', async () => {
    vi.mocked(mockRepository.waterPlant).mockResolvedValue(mockWaterPlantResult);
    const useCase = new WaterPlantUseCase(mockRepository);

    const result = await useCase.execute('plant-1', '2026-07-05');

    expect(result).toEqual(mockWaterPlantResult);
    expect(mockRepository.waterPlant).toHaveBeenCalledWith('plant-1', '2026-07-05');
  });

  it('delegates without performedAt when omitted', async () => {
    vi.mocked(mockRepository.waterPlant).mockResolvedValue(mockWaterPlantResult);
    const useCase = new WaterPlantUseCase(mockRepository);

    await useCase.execute('plant-1');

    expect(mockRepository.waterPlant).toHaveBeenCalledWith('plant-1', undefined);
  });
});
