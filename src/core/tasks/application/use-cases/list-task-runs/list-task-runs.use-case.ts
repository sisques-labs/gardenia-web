import type { ITasksRepository } from '@/core/tasks/application/ports/tasks.repository.port';
import type { Paginated } from '@/core/tasks/application/interfaces/pagination.interface';
import type { ListTaskRunsInput } from '@/core/tasks/application/interfaces/tasks.interfaces';
import type { ITaskRun } from '@/core/tasks/domain/interfaces/task-run.interface';

export class ListTaskRunsUseCase {
  constructor(private readonly tasksRepository: ITasksRepository) {}

  async execute(input: ListTaskRunsInput): Promise<Paginated<ITaskRun>> {
    return this.tasksRepository.listTaskRuns(input);
  }
}
