import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ListTaskRunsUseCase } from './list-task-runs.use-case';
import type { ITasksRepository } from '@/core/tasks/application/ports/tasks.repository.port';
import type { Paginated } from '@/core/tasks/application/interfaces/pagination.interface';
import type { ITaskRun } from '@/core/tasks/domain/interfaces/task-run.interface';
import { TaskRunStatus } from '@/core/tasks/domain/interfaces/task-run-status.enum';

const mockRun: ITaskRun = {
  id: 'run-1',
  taskId: 'task-1',
  attempt: 1,
  status: TaskRunStatus.Completed,
  progress: 100,
  startedAt: '2024-01-01',
  createdAt: '2024-01-01',
};

const mockPaginated: Paginated<ITaskRun> = {
  items: [mockRun],
  total: 1,
  page: 1,
  pageSize: 10,
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

describe('ListTaskRunsUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns paginated task runs from repository', async () => {
    vi.mocked(mockRepository.listTaskRuns).mockResolvedValue(mockPaginated);
    const useCase = new ListTaskRunsUseCase(mockRepository);

    const result = await useCase.execute({ taskId: 'task-1' });

    expect(result).toEqual(mockPaginated);
    expect(mockRepository.listTaskRuns).toHaveBeenCalledWith({ taskId: 'task-1' });
  });

  it('propagates repository errors', async () => {
    vi.mocked(mockRepository.listTaskRuns).mockRejectedValue(new Error('Network error'));
    const useCase = new ListTaskRunsUseCase(mockRepository);

    await expect(useCase.execute({ taskId: 'task-1' })).rejects.toThrow('Network error');
  });
});
