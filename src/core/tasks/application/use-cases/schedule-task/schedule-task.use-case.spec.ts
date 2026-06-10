import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ScheduleTaskUseCase } from './schedule-task.use-case';
import type { ITasksRepository } from '@/core/tasks/application/ports/tasks.repository.port';
import type { ITask } from '@/core/tasks/domain/interfaces/task.interface';
import { TaskStatus } from '@/core/tasks/domain/interfaces/task-status.enum';
import { TaskBackoffStrategy } from '@/core/tasks/domain/interfaces/task-backoff-strategy.enum';

const mockTask: ITask = {
  id: 'task-1',
  spaceId: 'space-1',
  templateId: 'tmpl-1',
  name: 'Daily sync',
  status: TaskStatus.Pending,
  payload: { cron: '0 8 * * *' },
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
  scheduleTask: vi.fn().mockResolvedValue(mockTask),
  cancelTask: vi.fn(),
  listTemplates: vi.fn(),
  getTemplate: vi.fn(),
  createTemplate: vi.fn(),
  updateTemplate: vi.fn(),
  deleteTemplate: vi.fn(),
};

describe('ScheduleTaskUseCase', () => {
  let useCase: ScheduleTaskUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mockRepo.scheduleTask).mockResolvedValue(mockTask);
    useCase = new ScheduleTaskUseCase(mockRepo);
  });

  it('delegates to repository.scheduleTask and returns the scheduled task', async () => {
    const input = {
      spaceId: 'space-1',
      templateId: 'tmpl-1',
      name: 'Daily sync',
      scheduledAt: '2026-06-10T08:00:00Z',
      payload: { cron: '0 8 * * *' },
    };

    const result = await useCase.execute(input);

    expect(mockRepo.scheduleTask).toHaveBeenCalledWith(input);
    expect(result).toEqual(mockTask);
  });
});
