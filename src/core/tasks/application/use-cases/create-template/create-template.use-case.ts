import type { ITasksRepository } from '@/core/tasks/application/ports/tasks.repository.port';
import type { CreateTemplateInput } from '@/core/tasks/application/interfaces/tasks.interfaces';
import type { ITaskTemplate } from '@/core/tasks/domain/interfaces/task-template.interface';

export class CreateTemplateUseCase {
  constructor(private readonly tasksRepository: ITasksRepository) {}

  async execute(input: CreateTemplateInput): Promise<ITaskTemplate> {
    return this.tasksRepository.createTemplate(input);
  }
}
