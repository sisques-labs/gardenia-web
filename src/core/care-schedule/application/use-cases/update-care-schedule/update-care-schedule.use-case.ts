import type { ICareScheduleRepository } from '@/core/care-schedule/application/ports/care-schedule.repository.port';
import type { UpdateCareScheduleInput } from '@/core/care-schedule/application/interfaces/update-care-schedule-input.interface';
import type { CreatedEntity } from '@/shared/domain/interfaces/created-entity.interface';

export class UpdateCareScheduleUseCase {
  constructor(private readonly careScheduleRepository: ICareScheduleRepository) {}

  async execute(input: UpdateCareScheduleInput): Promise<CreatedEntity> {
    return this.careScheduleRepository.update(input);
  }
}
