import type { ITasksRepository } from '@/core/tasks/application/ports/tasks.repository.port';

export class DeleteTemplateUseCase {
  constructor(private readonly tasksRepository: ITasksRepository) {}

  async execute(id: string): Promise<void> {
    return this.tasksRepository.deleteTemplate(id);
  }
}
