import type { ITasksRepository } from '@/core/tasks/application/ports/tasks.repository.port';
import type { UpdateTemplateInput } from '@/core/tasks/application/interfaces/tasks.interfaces';

export class UpdateTemplateUseCase {
  constructor(private readonly tasksRepository: ITasksRepository) {}

  async execute(input: UpdateTemplateInput): Promise<void> {
    return this.tasksRepository.updateTemplate(input);
  }
}
