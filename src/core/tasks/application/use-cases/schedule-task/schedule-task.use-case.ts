import type { ITasksRepository } from '@/core/tasks/application/ports/tasks.repository.port';
import type { ScheduleTaskInput } from '@/core/tasks/application/interfaces/tasks.interfaces';

export class ScheduleTaskUseCase {
  constructor(private readonly tasksRepository: ITasksRepository) {}

  async execute(input: ScheduleTaskInput): Promise<string> {
    return this.tasksRepository.scheduleTask(input);
  }
}
