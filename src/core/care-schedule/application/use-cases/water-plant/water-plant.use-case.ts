import type { ICareScheduleRepository } from '@/core/care-schedule/application/ports/care-schedule.repository.port';
import type { WaterPlantResult } from '@/core/care-schedule/domain/types/care-schedule.interface';

export class WaterPlantUseCase {
  constructor(private readonly careScheduleRepository: ICareScheduleRepository) {}

  async execute(plantId: string, performedAt?: string): Promise<WaterPlantResult> {
    return this.careScheduleRepository.waterPlant(plantId, performedAt);
  }
}
