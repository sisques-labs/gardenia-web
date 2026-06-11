import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetTaskUseCase } from './get-task.use-case';
import type { ITasksRepository } from '@/core/tasks/application/ports/tasks.repository.port';
import type { ITask } from '@/core/tasks/domain/interfaces/task.interface';
import { TaskStatus } from '@/core/tasks/domain/interfaces/task-status.enum';

const mockTask: ITask = {
  id: 'task-1',
  triggerType: 'manual',
  status: TaskStatus.Active,
  payload: { key: 'value' },
  priority: 5,
  isRecurring: false,
  runCount: 0,
  userId: 'u1',
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

describe('GetTaskUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns task from repository', async () => {
    vi.mocked(mockRepository.getTask).mockResolvedValue(mockTask);
    const useCase = new GetTaskUseCase(mockRepository);

    const result = await useCase.execute('task-1');

    expect(result).toEqual(mockTask);
    expect(mockRepository.getTask).toHaveBeenCalledWith('task-1');
  });

  it('propagates repository errors', async () => {
    vi.mocked(mockRepository.getTask).mockRejectedValue(new Error('Not found'));
    const useCase = new GetTaskUseCase(mockRepository);

    await expect(useCase.execute('task-1')).rejects.toThrow('Not found');
  });
});
