import type { ITasksRepository } from '@/core/tasks/application/ports/tasks.repository.port';
import type { CreateTemplateInput } from '@/core/tasks/application/interfaces/tasks.interfaces';

export class CreateTemplateUseCase {
  constructor(private readonly tasksRepository: ITasksRepository) {}

  async execute(input: CreateTemplateInput): Promise<string> {
    return this.tasksRepository.createTemplate(input);
  }
}
