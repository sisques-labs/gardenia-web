import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateTemplateUseCase } from './create-template.use-case';
import type { ITasksRepository } from '@/core/tasks/application/ports/tasks.repository.port';
import type { ITaskTemplate } from '@/core/tasks/domain/interfaces/task-template.interface';
import { TaskBackoffStrategy } from '@/core/tasks/domain/interfaces/task-backoff-strategy.enum';

const mockTemplate: ITaskTemplate = {
  id: 'tmpl-1',
  spaceId: 'space-1',
  name: 'Daily sync',
  defaultPayload: { freq: 'daily' },
  maxRetries: 3,
  backoffStrategy: TaskBackoffStrategy.Exponential,
  createdAt: '2026-06-10T00:00:00Z',
  updatedAt: '2026-06-10T00:00:00Z',
};

const mockRepo: ITasksRepository = {
  listTasks: vi.fn(),
  getTask: vi.fn(),
  listTaskRuns: vi.fn(),
  scheduleTask: vi.fn(),
  cancelTask: vi.fn(),
  listTemplates: vi.fn(),
  getTemplate: vi.fn(),
  createTemplate: vi.fn().mockResolvedValue(mockTemplate),
  updateTemplate: vi.fn(),
  deleteTemplate: vi.fn(),
};

describe('CreateTemplateUseCase', () => {
  let useCase: CreateTemplateUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mockRepo.createTemplate).mockResolvedValue(mockTemplate);
    useCase = new CreateTemplateUseCase(mockRepo);
  });

  it('delegates to repository.createTemplate and returns the created template', async () => {
    const input = {
      spaceId: 'space-1',
      name: 'Daily sync',
      defaultPayload: { freq: 'daily' },
      maxRetries: 3,
      backoffStrategy: TaskBackoffStrategy.Exponential,
    };

    const result = await useCase.execute(input);

    expect(mockRepo.createTemplate).toHaveBeenCalledWith(input);
    expect(result).toEqual(mockTemplate);
  });
});
