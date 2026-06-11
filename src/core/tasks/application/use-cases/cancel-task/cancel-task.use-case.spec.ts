import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CancelTaskUseCase } from './cancel-task.use-case';
import type { ITasksRepository } from '@/core/tasks/application/ports/tasks.repository.port';

const mockRepo: ITasksRepository = {
  listTasks: vi.fn(),
  getTask: vi.fn(),
  listTaskRuns: vi.fn(),
  scheduleTask: vi.fn(),
  cancelTask: vi.fn().mockResolvedValue(undefined),
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
    vi.mocked(mockRepo.cancelTask).mockResolvedValue(undefined);
    useCase = new CancelTaskUseCase(mockRepo);
  });

  it('delegates to repository.cancelTask', async () => {
    await useCase.execute('task-1');

    expect(mockRepo.cancelTask).toHaveBeenCalledWith('task-1');
  });
});
