import type { ITasksRepository } from '@/core/tasks/application/ports/tasks.repository.port';
import type { UpdateTemplateInput } from '@/core/tasks/application/interfaces/tasks.interfaces';
import type { ITaskTemplate } from '@/core/tasks/domain/interfaces/task-template.interface';

export class UpdateTemplateUseCase {
  constructor(private readonly tasksRepository: ITasksRepository) {}

  async execute(input: UpdateTemplateInput): Promise<ITaskTemplate> {
    return this.tasksRepository.updateTemplate(input);
  }
}
