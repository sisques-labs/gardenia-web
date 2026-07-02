import type { ICareScheduleRepository } from '@/core/care-schedule/application/ports/care-schedule.repository.port';
import type { CareSchedule } from '@/core/care-schedule/domain/types/care-schedule.interface';

export class CompleteCareScheduleUseCase {
  constructor(private readonly careScheduleRepository: ICareScheduleRepository) {}

  async execute(id: string, completedAt?: string): Promise<CareSchedule> {
    return this.careScheduleRepository.complete(id, completedAt);
  }
}
