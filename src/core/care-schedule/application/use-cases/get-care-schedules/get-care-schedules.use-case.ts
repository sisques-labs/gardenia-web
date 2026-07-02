import type { ICareScheduleRepository } from '@/core/care-schedule/application/ports/care-schedule.repository.port';
import type { CareScheduleFilters } from '@/core/care-schedule/application/interfaces/care-schedule-filters.interface';
import type { CareSchedule } from '@/core/care-schedule/domain/types/care-schedule.interface';

export class GetCareSchedulesUseCase {
  constructor(private readonly careScheduleRepository: ICareScheduleRepository) {}

  async execute(filters?: CareScheduleFilters): Promise<CareSchedule[]> {
    return this.careScheduleRepository.findByCriteria(filters);
  }
}
