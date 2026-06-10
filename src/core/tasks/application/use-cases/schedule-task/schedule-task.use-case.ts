import type { ITasksRepository } from '@/core/tasks/application/ports/tasks.repository.port';
import type { ScheduleTaskInput } from '@/core/tasks/application/interfaces/tasks.interfaces';
import type { ITask } from '@/core/tasks/domain/interfaces/task.interface';

export class ScheduleTaskUseCase {
  constructor(private readonly tasksRepository: ITasksRepository) {}

  async execute(input: ScheduleTaskInput): Promise<ITask> {
    return this.tasksRepository.scheduleTask(input);
  }
}
