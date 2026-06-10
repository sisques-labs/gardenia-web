import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CancelTaskUseCase } from './cancel-task.use-case';
import type { ITasksRepository } from '@/core/tasks/application/ports/tasks.repository.port';
import type { ITask } from '@/core/tasks/domain/interfaces/task.interface';
import { TaskStatus } from '@/core/tasks/domain/interfaces/task-status.enum';
import { TaskBackoffStrategy } from '@/core/tasks/domain/interfaces/task-backoff-strategy.enum';

const mockTask: ITask = {
  id: 'task-1',
  spaceId: 'space-1',
  templateId: 'tmpl-1',
  name: 'Daily sync',
  status: TaskStatus.Cancelled,
  payload: {},
  scheduledAt: '2026-06-10T08:00:00Z',
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
  cancelTask: vi.fn().mockResolvedValue(mockTask),
  listTemplates: vi.fn(),
  getTemplate: vi.fn(),
  createTemplate: vi.fn(),
  updateTemplate: vi.fn(),
  deleteTemplate: vi.fn(),
};

describe('CancelTaskUseCase', () => {
  let useCase: CancelTaskUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mockRepo.cancelTask).mockResolvedValue(mockTask);
    useCase = new CancelTaskUseCase(mockRepo);
  });

  it('delegates to repository.cancelTask and returns the cancelled task', async () => {
    const result = await useCase.execute('task-1');

    expect(mockRepo.cancelTask).toHaveBeenCalledWith('task-1');
    expect(result).toEqual(mockTask);
    expect(result.status).toBe(TaskStatus.Cancelled);
  });
});
