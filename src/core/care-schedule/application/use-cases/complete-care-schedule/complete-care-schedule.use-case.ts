import type { ICareScheduleRepository } from '@/core/care-schedule/application/ports/care-schedule.repository.port';
import type { CreatedEntity } from '@/shared/domain/interfaces/created-entity.interface';

export class CompleteCareScheduleUseCase {
  constructor(private readonly careScheduleRepository: ICareScheduleRepository) {}

  async execute(id: string, completedAt?: string): Promise<CreatedEntity> {
    return this.careScheduleRepository.complete(id, completedAt);
  }
}
