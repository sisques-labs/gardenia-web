import type { ICareScheduleRepository } from '@/core/care-schedule/application/ports/care-schedule.repository.port';

export class DeleteCareScheduleUseCase {
  constructor(private readonly careScheduleRepository: ICareScheduleRepository) {}

  async execute(id: string): Promise<void> {
    return this.careScheduleRepository.delete(id);
  }
}
