import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateTemplateUseCase } from './update-template.use-case';
import type { ITasksRepository } from '@/core/tasks/application/ports/tasks.repository.port';

const mockRepo: ITasksRepository = {
  listTasks: vi.fn(),
  getTask: vi.fn(),
  listTaskRuns: vi.fn(),
  scheduleTask: vi.fn(),
  cancelTask: vi.fn(),
  listTemplates: vi.fn(),
  getTemplate: vi.fn(),
  createTemplate: vi.fn(),
  updateTemplate: vi.fn().mockResolvedValue(undefined),
  deleteTemplate: vi.fn(),
};

describe('UpdateTemplateUseCase', () => {
  let useCase: UpdateTemplateUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mockRepo.updateTemplate).mockResolvedValue(undefined);
    useCase = new UpdateTemplateUseCase(mockRepo);
  });

  it('delegates to repository.updateTemplate', async () => {
    const input = { id: 'tmpl-1', name: 'Updated sync' };

    await useCase.execute(input);

    expect(mockRepo.updateTemplate).toHaveBeenCalledWith(input);
  });
});
