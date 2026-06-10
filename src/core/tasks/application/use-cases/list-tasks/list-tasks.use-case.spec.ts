import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ListTasksUseCase } from './list-tasks.use-case';
import type { ITasksRepository } from '@/core/tasks/application/ports/tasks.repository.port';
import type { Paginated } from '@/core/tasks/application/interfaces/pagination.interface';
import type { ITask } from '@/core/tasks/domain/interfaces/task.interface';
import { TaskStatus } from '@/core/tasks/domain/interfaces/task-status.enum';

const mockTask: ITask = {
  id: 'task-1',
  spaceId: 'space-1',
  name: 'Test task',
  status: TaskStatus.Pending,
  payload: {},
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

const mockPaginated: Paginated<ITask> = {
  items: [mockTask],
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

describe('ListTasksUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns paginated tasks from repository', async () => {
    vi.mocked(mockRepository.listTasks).mockResolvedValue(mockPaginated);
    const useCase = new ListTasksUseCase(mockRepository);

    const result = await useCase.execute({ spaceId: 'space-1', page: 1, pageSize: 10 });

    expect(result).toEqual(mockPaginated);
    expect(mockRepository.listTasks).toHaveBeenCalledWith({ spaceId: 'space-1', page: 1, pageSize: 10 });
  });

  it('propagates repository errors', async () => {
    vi.mocked(mockRepository.listTasks).mockRejectedValue(new Error('Network error'));
    const useCase = new ListTasksUseCase(mockRepository);

    await expect(useCase.execute({ spaceId: 'space-1', page: 1, pageSize: 10 })).rejects.toThrow('Network error');
  });
});
