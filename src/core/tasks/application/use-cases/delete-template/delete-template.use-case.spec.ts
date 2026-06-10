import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeleteTemplateUseCase } from './delete-template.use-case';
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
  updateTemplate: vi.fn(),
  deleteTemplate: vi.fn().mockResolvedValue(undefined),
};

describe('DeleteTemplateUseCase', () => {
  let useCase: DeleteTemplateUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mockRepo.deleteTemplate).mockResolvedValue(undefined);
    useCase = new DeleteTemplateUseCase(mockRepo);
  });

  it('delegates to repository.deleteTemplate with the template id', async () => {
    await useCase.execute('tmpl-1');

    expect(mockRepo.deleteTemplate).toHaveBeenCalledWith('tmpl-1');
  });

  it('resolves to void', async () => {
    const result = await useCase.execute('tmpl-1');
    expect(result).toBeUndefined();
  });
});
