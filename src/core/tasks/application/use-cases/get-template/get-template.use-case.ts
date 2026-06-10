import type { ITasksRepository } from '@/core/tasks/application/ports/tasks.repository.port';
import type { ITaskTemplate } from '@/core/tasks/domain/interfaces/task-template.interface';

export class GetTemplateUseCase {
  constructor(private readonly tasksRepository: ITasksRepository) {}

  async execute(id: string): Promise<ITaskTemplate> {
    return this.tasksRepository.getTemplate(id);
  }
}
