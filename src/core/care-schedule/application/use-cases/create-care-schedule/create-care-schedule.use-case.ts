import type { ICareScheduleRepository } from '@/core/care-schedule/application/ports/care-schedule.repository.port';
import type { CreateCareScheduleInput } from '@/core/care-schedule/application/interfaces/create-care-schedule-input.interface';
import type { CreatedEntity } from '@/shared/domain/interfaces/created-entity.interface';

export class CreateCareScheduleUseCase {
  constructor(private readonly careScheduleRepository: ICareScheduleRepository) {}

  async execute(input: CreateCareScheduleInput): Promise<CreatedEntity> {
    return this.careScheduleRepository.create(input);
  }
}
