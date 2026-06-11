import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateTemplateUseCase } from './create-template.use-case';
import type { ITasksRepository } from '@/core/tasks/application/ports/tasks.repository.port';

const mockRepo: ITasksRepository = {
  listTasks: vi.fn(),
  getTask: vi.fn(),
  listTaskRuns: vi.fn(),
  scheduleTask: vi.fn(),
  cancelTask: vi.fn(),
  listTemplates: vi.fn(),
  getTemplate: vi.fn(),
  createTemplate: vi.fn().mockResolvedValue('tmpl-1'),
  updateTemplate: vi.fn(),
  deleteTemplate: vi.fn(),
};

describe('CreateTemplateUseCase', () => {
  let useCase: CreateTemplateUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mockRepo.createTemplate).mockResolvedValue('tmpl-1');
    useCase = new CreateTemplateUseCase(mockRepo);
  });

  it('delegates to repository.createTemplate and returns the template id', async () => {
    const input = { name: 'Daily sync', defaultRetryCount: 3, defaultBackoffStrategy: 'exponential' };

    const result = await useCase.execute(input);

    expect(mockRepo.createTemplate).toHaveBeenCalledWith(input);
    expect(result).toBe('tmpl-1');
  });
});
