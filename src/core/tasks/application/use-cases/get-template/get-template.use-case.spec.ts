import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetTemplateUseCase } from './get-template.use-case';
import type { ITasksRepository } from '@/core/tasks/application/ports/tasks.repository.port';
import type { ITaskTemplate } from '@/core/tasks/domain/interfaces/task-template.interface';
import { TaskBackoffStrategy } from '@/core/tasks/domain/interfaces/task-backoff-strategy.enum';

const mockTemplate: ITaskTemplate = {
  id: 'tmpl-1',
  spaceId: 'space-1',
  name: 'Daily sync',
  defaultPayload: { freq: 'daily' },
  maxRetries: 3,
  backoffStrategy: TaskBackoffStrategy.Fixed,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

const mockRepository: ITasksRepository = {
  listTasks: vi.fn(),
  getTask: vi.fn(),
  listTaskRuns: vi.fn(),
  scheduleTask: vi.fn(),
  cancelTask: vi.fn(),
  listTemplates: vi.fn(),
  getTemplate: vi.fn(),
  createTemplate: vi.fn(),
  updateTemplate: vi.fn(),
  deleteTemplate: vi.fn(),
};

describe('GetTemplateUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns template from repository', async () => {
    vi.mocked(mockRepository.getTemplate).mockResolvedValue(mockTemplate);
    const useCase = new GetTemplateUseCase(mockRepository);

    const result = await useCase.execute('tmpl-1');

    expect(result).toEqual(mockTemplate);
    expect(mockRepository.getTemplate).toHaveBeenCalledWith('tmpl-1');
  });

  it('propagates repository errors', async () => {
    vi.mocked(mockRepository.getTemplate).mockRejectedValue(new Error('Not found'));
    const useCase = new GetTemplateUseCase(mockRepository);

    await expect(useCase.execute('tmpl-1')).rejects.toThrow('Not found');
  });
});
