import type { ITasksRepository } from '@/core/tasks/application/ports/tasks.repository.port';
import type { ITask } from '@/core/tasks/domain/interfaces/task.interface';

export class GetTaskUseCase {
  constructor(private readonly tasksRepository: ITasksRepository) {}

  async execute(id: string): Promise<ITask> {
    return this.tasksRepository.getTask(id);
  }
}
