import type { ITasksRepository } from '@/core/tasks/application/ports/tasks.repository.port';
import type { Paginated } from '@/core/tasks/application/interfaces/pagination.interface';
import type { ListTasksInput } from '@/core/tasks/application/interfaces/tasks.interfaces';
import type { ITask } from '@/core/tasks/domain/interfaces/task.interface';

export class ListTasksUseCase {
  constructor(private readonly tasksRepository: ITasksRepository) {}

  async execute(input: ListTasksInput): Promise<Paginated<ITask>> {
    return this.tasksRepository.listTasks(input);
  }
}
