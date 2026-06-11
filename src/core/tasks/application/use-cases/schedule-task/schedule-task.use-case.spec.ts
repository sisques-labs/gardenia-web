import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ScheduleTaskUseCase } from './schedule-task.use-case';
import type { ITasksRepository } from '@/core/tasks/application/ports/tasks.repository.port';

const mockRepo: ITasksRepository = {
  listTasks: vi.fn(),
  getTask: vi.fn(),
  listTaskRuns: vi.fn(),
  scheduleTask: vi.fn().mockResolvedValue('task-1'),
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
    vi.mocked(mockRepo.scheduleTask).mockResolvedValue('task-1');
    useCase = new ScheduleTaskUseCase(mockRepo);
  });

  it('delegates to repository.scheduleTask and returns the task id', async () => {
    const input = { templateId: 'tmpl-1', payload: { cron: '0 8 * * *' } };

    const result = await useCase.execute(input);

    expect(mockRepo.scheduleTask).toHaveBeenCalledWith(input);
    expect(result).toBe('task-1');
  });
});
