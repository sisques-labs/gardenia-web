import type { ICareScheduleRepository } from '@/core/care-schedule/application/ports/care-schedule.repository.port';
import type { UpdateCareScheduleInput } from '@/core/care-schedule/application/interfaces/update-care-schedule-input.interface';
import type { CareSchedule } from '@/core/care-schedule/domain/types/care-schedule.interface';

export class UpdateCareScheduleUseCase {
  constructor(private readonly careScheduleRepository: ICareScheduleRepository) {}

  async execute(input: UpdateCareScheduleInput): Promise<CareSchedule> {
    return this.careScheduleRepository.update(input);
  }
}
