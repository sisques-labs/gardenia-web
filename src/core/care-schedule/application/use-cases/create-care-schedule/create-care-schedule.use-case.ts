import type { ICareScheduleRepository } from '@/core/care-schedule/application/ports/care-schedule.repository.port';
import type { CreateCareScheduleInput } from '@/core/care-schedule/application/interfaces/create-care-schedule-input.interface';
import type { CareSchedule } from '@/core/care-schedule/domain/types/care-schedule.interface';

export class CreateCareScheduleUseCase {
  constructor(private readonly careScheduleRepository: ICareScheduleRepository) {}

  async execute(input: CreateCareScheduleInput): Promise<CareSchedule> {
    return this.careScheduleRepository.create(input);
  }
}
