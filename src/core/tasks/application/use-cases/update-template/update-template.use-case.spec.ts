import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateTemplateUseCase } from './update-template.use-case';
import type { ITasksRepository } from '@/core/tasks/application/ports/tasks.repository.port';
import type { ITaskTemplate } from '@/core/tasks/domain/interfaces/task-template.interface';
import { TaskBackoffStrategy } from '@/core/tasks/domain/interfaces/task-backoff-strategy.enum';

const mockTemplate: ITaskTemplate = {
  id: 'tmpl-1',
  spaceId: 'space-1',
  name: 'Updated sync',
  defaultPayload: { freq: 'weekly' },
  maxRetries: 5,
  backoffStrategy: TaskBackoffStrategy.Linear,
  createdAt: '2026-06-10T00:00:00Z',
  updatedAt: '2026-06-11T00:00:00Z',
};

const mockRepo: ITasksRepository = {
  listTasks: vi.fn(),
  getTask: vi.fn(),
  listTaskRuns: vi.fn(),
  scheduleTask: vi.fn(),
  cancelTask: vi.fn(),
  listTemplates: vi.fn(),
  getTemplate: vi.fn(),
  createTemplate: vi.fn(),
  updateTemplate: vi.fn().mockResolvedValue(mockTemplate),
  deleteTemplate: vi.fn(),
};

describe('UpdateTemplateUseCase', () => {
  let useCase: UpdateTemplateUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mockRepo.updateTemplate).mockResolvedValue(mockTemplate);
    useCase = new UpdateTemplateUseCase(mockRepo);
  });

  it('delegates to repository.updateTemplate and returns the updated template', async () => {
    const input = {
      id: 'tmpl-1',
      name: 'Updated sync',
      defaultPayload: { freq: 'weekly' },
    };

    const result = await useCase.execute(input);

    expect(mockRepo.updateTemplate).toHaveBeenCalledWith(input);
    expect(result).toEqual(mockTemplate);
  });
});
