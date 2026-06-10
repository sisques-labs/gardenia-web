import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ListTemplatesUseCase } from './list-templates.use-case';
import type { ITasksRepository } from '@/core/tasks/application/ports/tasks.repository.port';
import type { Paginated } from '@/core/tasks/application/interfaces/pagination.interface';
import type { ITaskTemplate } from '@/core/tasks/domain/interfaces/task-template.interface';
import { TaskBackoffStrategy } from '@/core/tasks/domain/interfaces/task-backoff-strategy.enum';

const mockTemplate: ITaskTemplate = {
  id: 'tmpl-1',
  spaceId: 'space-1',
  name: 'Daily sync',
  defaultPayload: {},
  maxRetries: 3,
  backoffStrategy: TaskBackoffStrategy.Exponential,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

const mockPaginated: Paginated<ITaskTemplate> = {
  items: [mockTemplate],
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

describe('ListTemplatesUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns paginated templates from repository', async () => {
    vi.mocked(mockRepository.listTemplates).mockResolvedValue(mockPaginated);
    const useCase = new ListTemplatesUseCase(mockRepository);

    const result = await useCase.execute({ spaceId: 'space-1', page: 1, pageSize: 10 });

    expect(result).toEqual(mockPaginated);
    expect(mockRepository.listTemplates).toHaveBeenCalledWith({ spaceId: 'space-1', page: 1, pageSize: 10 });
  });

  it('propagates repository errors', async () => {
    vi.mocked(mockRepository.listTemplates).mockRejectedValue(new Error('Network error'));
    const useCase = new ListTemplatesUseCase(mockRepository);

    await expect(useCase.execute({ spaceId: 'space-1', page: 1, pageSize: 10 })).rejects.toThrow('Network error');
  });
});
