import type { ITasksRepository } from '@/core/tasks/application/ports/tasks.repository.port';
import type { Paginated } from '@/core/tasks/application/interfaces/pagination.interface';
import type { ListTemplatesInput } from '@/core/tasks/application/interfaces/tasks.interfaces';
import type { ITaskTemplate } from '@/core/tasks/domain/interfaces/task-template.interface';

export class ListTemplatesUseCase {
  constructor(private readonly tasksRepository: ITasksRepository) {}

  async execute(input: ListTemplatesInput): Promise<Paginated<ITaskTemplate>> {
    return this.tasksRepository.listTemplates(input);
  }
}
