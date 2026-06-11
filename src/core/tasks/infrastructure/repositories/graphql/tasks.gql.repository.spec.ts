import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DocumentNode } from '@apollo/client';

vi.mock('@/shared/infrastructure/http/apollo.client', () => ({
  apolloClient: {
    query: vi.fn(),
    mutate: vi.fn(),
  },
}));

import { apolloClient } from '@/shared/infrastructure/http/apollo.client';
import { TasksGqlRepository } from './tasks.gql.repository';
import { TASKS_FIND_BY_CRITERIA } from './queries/tasks-find-by-criteria.query';
import { TASK_FIND_BY_ID } from './queries/task-find-by-id.query';
import { TASK_RUNS_FIND_BY_TASK_ID } from './queries/task-runs-find-by-task-id.query';
import { TASK_TEMPLATES_FIND_BY_CRITERIA } from './queries/task-templates-find-by-criteria.query';
import { TASK_TEMPLATE_FIND_BY_ID } from './queries/task-template-find-by-id.query';
import { SCHEDULE_TASK } from './mutations/schedule-task.mutation';
import { CANCEL_TASK } from './mutations/cancel-task.mutation';
import { TASK_TEMPLATE_CREATE } from './mutations/task-template-create.mutation';
import { TASK_TEMPLATE_UPDATE } from './mutations/task-template-update.mutation';
import { TASK_TEMPLATE_DELETE } from './mutations/task-template-delete.mutation';
import { TaskStatus } from '@/core/tasks/domain/interfaces/task-status.enum';
import { TaskRunStatus } from '@/core/tasks/domain/interfaces/task-run-status.enum';
import { TaskBackoffStrategy } from '@/core/tasks/domain/interfaces/task-backoff-strategy.enum';

const mockTaskRaw = {
  id: 'task-1',
  triggerType: 'template',
  title: 'Test task',
  status: TaskStatus.Pending,
  payload: '{"key":"value"}',
  priority: 5,
  isRecurring: false,
  runCount: 0,
  userId: 'u1',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

const mockRunRaw = {
  id: 'run-1',
  taskId: 'task-1',
  attempt: 1,
  status: TaskRunStatus.Completed,
  progress: 100,
  startedAt: '2024-01-01',
  endedAt: '2024-01-01',
  createdAt: '2024-01-01',
};

const mockTemplateRaw = {
  id: 'tmpl-1',
  name: 'Daily sync',
  defaultPriority: 5,
  defaultRetryCount: 3,
  defaultBackoffStrategy: TaskBackoffStrategy.Exponential,
  defaultTimeoutMs: 30000,
  maxConcurrency: 1,
  defaultIsRecurring: false,
  userId: 'u1',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

describe('TasksGqlRepository', () => {
  let repository: TasksGqlRepository;

  beforeEach(() => {
    repository = new TasksGqlRepository();
    vi.clearAllMocks();
  });

  describe('GQL document constants', () => {
    it('TASKS_FIND_BY_CRITERIA is a valid GQL document', () => {
      expect((TASKS_FIND_BY_CRITERIA as DocumentNode).kind).toBe('Document');
    });
    it('TASK_FIND_BY_ID is a valid GQL document', () => {
      expect((TASK_FIND_BY_ID as DocumentNode).kind).toBe('Document');
    });
    it('TASK_RUNS_FIND_BY_TASK_ID is a valid GQL document', () => {
      expect((TASK_RUNS_FIND_BY_TASK_ID as DocumentNode).kind).toBe('Document');
    });
    it('TASK_TEMPLATES_FIND_BY_CRITERIA is a valid GQL document', () => {
      expect((TASK_TEMPLATES_FIND_BY_CRITERIA as DocumentNode).kind).toBe('Document');
    });
    it('TASK_TEMPLATE_FIND_BY_ID is a valid GQL document', () => {
      expect((TASK_TEMPLATE_FIND_BY_ID as DocumentNode).kind).toBe('Document');
    });
  });

  describe('listTasks()', () => {
    it('calls apolloClient.query with TASKS_FIND_BY_CRITERIA and returns Paginated<ITask>', async () => {
      vi.mocked(apolloClient.query).mockResolvedValue({
        data: {
          taskFindByCriteria: {
            items: [mockTaskRaw],
            total: 1,
            page: 1,
          },
        },
      } as never);

      const result = await repository.listTasks({ page: 1, pageSize: 10 });

      expect(apolloClient.query).toHaveBeenCalledWith({
        query: TASKS_FIND_BY_CRITERIA,
        variables: { input: { pagination: { page: 1, perPage: 10 } } },
      });
      expect(result.items).toHaveLength(1);
      expect(result.items[0].payload).toEqual({ key: 'value' });
      expect(result.total).toBe(1);
    });

    it('parses null payload as empty object', async () => {
      vi.mocked(apolloClient.query).mockResolvedValue({
        data: {
          taskFindByCriteria: {
            items: [{ ...mockTaskRaw, payload: '' }],
            total: 1,
            page: 1,
          },
        },
      } as never);

      const result = await repository.listTasks({ page: 1, pageSize: 10 });
      expect(result.items[0].payload).toEqual({});
    });
  });

  describe('getTask()', () => {
    it('calls apolloClient.query with TASK_FIND_BY_ID and returns ITask with parsed payload', async () => {
      vi.mocked(apolloClient.query).mockResolvedValue({
        data: { taskFindById: mockTaskRaw },
      } as never);

      const result = await repository.getTask('task-1');

      expect(apolloClient.query).toHaveBeenCalledWith({
        query: TASK_FIND_BY_ID,
        variables: { input: { id: 'task-1' } },
      });
      expect(result.payload).toEqual({ key: 'value' });
    });

    it('throws when task not found', async () => {
      vi.mocked(apolloClient.query).mockResolvedValue({
        data: { taskFindById: null },
      } as never);

      await expect(repository.getTask('task-1')).rejects.toThrow('Task not found: task-1');
    });
  });

  describe('listTaskRuns()', () => {
    it('calls apolloClient.query with TASK_RUNS_FIND_BY_TASK_ID and returns Paginated<ITaskRun>', async () => {
      vi.mocked(apolloClient.query).mockResolvedValue({
        data: {
          taskRunsFindByTaskId: [mockRunRaw],
        },
      } as never);

      const result = await repository.listTaskRuns({ taskId: 'task-1', page: 1, pageSize: 10 });

      expect(apolloClient.query).toHaveBeenCalledWith({
        query: TASK_RUNS_FIND_BY_TASK_ID,
        variables: { input: { taskId: 'task-1' } },
      });
      expect(result.items).toHaveLength(1);
      expect(result.items[0].attempt).toBe(1);
      expect(result.items[0].progress).toBe(100);
    });
  });

  describe('listTemplates()', () => {
    it('calls apolloClient.query with TASK_TEMPLATES_FIND_BY_CRITERIA and returns Paginated<ITaskTemplate>', async () => {
      vi.mocked(apolloClient.query).mockResolvedValue({
        data: {
          taskTemplateFindByCriteria: {
            items: [mockTemplateRaw],
            total: 1,
            page: 1,
          },
        },
      } as never);

      const result = await repository.listTemplates({ page: 1, pageSize: 10 });

      expect(apolloClient.query).toHaveBeenCalledWith({
        query: TASK_TEMPLATES_FIND_BY_CRITERIA,
        variables: { input: { pagination: { page: 1, perPage: 10 } } },
      });
      expect(result.items[0].defaultRetryCount).toBe(3);
    });
  });

  describe('getTemplate()', () => {
    it('calls apolloClient.query with TASK_TEMPLATE_FIND_BY_ID and returns ITaskTemplate', async () => {
      vi.mocked(apolloClient.query).mockResolvedValue({
        data: { taskTemplateFindById: mockTemplateRaw },
      } as never);

      const result = await repository.getTemplate('tmpl-1');

      expect(apolloClient.query).toHaveBeenCalledWith({
        query: TASK_TEMPLATE_FIND_BY_ID,
        variables: { id: 'tmpl-1' },
      });
      expect(result.name).toBe('Daily sync');
    });

    it('throws when template not found', async () => {
      vi.mocked(apolloClient.query).mockResolvedValue({
        data: { taskTemplateFindById: null },
      } as never);

      await expect(repository.getTemplate('tmpl-1')).rejects.toThrow('TaskTemplate not found: tmpl-1');
    });
  });

  describe('scheduleTask()', () => {
    it('SCHEDULE_TASK is a valid GQL document', () => {
      expect((SCHEDULE_TASK as DocumentNode).kind).toBe('Document');
    });

    it('calls apolloClient.mutate with SCHEDULE_TASK and stringifies payload', async () => {
      vi.mocked(apolloClient.mutate).mockResolvedValue({
        data: { scheduleTask: { success: true, message: 'ok', id: 'task-new' } },
      } as never);

      const input = {
        templateId: 'tmpl-1',
        payload: { key: 'value' },
      };

      const result = await repository.scheduleTask(input);

      expect(apolloClient.mutate).toHaveBeenCalledWith({
        mutation: SCHEDULE_TASK,
        variables: {
          input: {
            templateId: 'tmpl-1',
            payload: '{"key":"value"}',
          },
        },
      });
      expect(result).toBe('task-new');
    });

    it('stringifies empty payload as {}', async () => {
      vi.mocked(apolloClient.mutate).mockResolvedValue({
        data: { scheduleTask: { success: true, id: 'task-new' } },
      } as never);

      await repository.scheduleTask({ templateId: 'tmpl-1', payload: {} });

      const callArgs = vi.mocked(apolloClient.mutate).mock.calls[0][0] as { variables: { input: { payload: string } } };
      expect(callArgs.variables.input.payload).toBe('{}');
    });
  });

  describe('cancelTask()', () => {
    it('CANCEL_TASK is a valid GQL document', () => {
      expect((CANCEL_TASK as DocumentNode).kind).toBe('Document');
    });

    it('calls apolloClient.mutate with CANCEL_TASK and task id', async () => {
      vi.mocked(apolloClient.mutate).mockResolvedValue({
        data: { cancelTask: { success: true, id: 'task-1' } },
      } as never);

      await repository.cancelTask('task-1');

      expect(apolloClient.mutate).toHaveBeenCalledWith({
        mutation: CANCEL_TASK,
        variables: { id: 'task-1' },
      });
    });

    it('resolves to void on success', async () => {
      vi.mocked(apolloClient.mutate).mockResolvedValue({
        data: { cancelTask: { success: true } },
      } as never);

      const result = await repository.cancelTask('task-1');
      expect(result).toBeUndefined();
    });
  });

  describe('createTemplate()', () => {
    it('TASK_TEMPLATE_CREATE is a valid GQL document', () => {
      expect((TASK_TEMPLATE_CREATE as DocumentNode).kind).toBe('Document');
    });

    it('calls apolloClient.mutate with TASK_TEMPLATE_CREATE', async () => {
      vi.mocked(apolloClient.mutate).mockResolvedValue({
        data: { createTaskTemplate: { success: true, id: 'tmpl-new' } },
      } as never);

      const input = {
        name: 'Daily sync',
        defaultRetryCount: 3,
        defaultBackoffStrategy: TaskBackoffStrategy.Exponential,
      };

      const result = await repository.createTemplate(input);

      expect(apolloClient.mutate).toHaveBeenCalledWith({
        mutation: TASK_TEMPLATE_CREATE,
        variables: { input },
      });
      expect(result).toBe('tmpl-new');
    });
  });

  describe('updateTemplate()', () => {
    it('TASK_TEMPLATE_UPDATE is a valid GQL document', () => {
      expect((TASK_TEMPLATE_UPDATE as DocumentNode).kind).toBe('Document');
    });

    it('calls apolloClient.mutate with TASK_TEMPLATE_UPDATE', async () => {
      vi.mocked(apolloClient.mutate).mockResolvedValue({
        data: { updateTaskTemplate: { success: true } },
      } as never);

      const input = {
        id: 'tmpl-1',
        name: 'Updated',
        defaultRetryCount: 5,
        defaultBackoffStrategy: TaskBackoffStrategy.Fixed,
      };

      await repository.updateTemplate(input);

      expect(apolloClient.mutate).toHaveBeenCalledWith({
        mutation: TASK_TEMPLATE_UPDATE,
        variables: { input },
      });
    });

    it('resolves to void on success', async () => {
      vi.mocked(apolloClient.mutate).mockResolvedValue({
        data: { updateTaskTemplate: { success: true } },
      } as never);

      const result = await repository.updateTemplate({ id: 'tmpl-1', name: 'Only name change' });
      expect(result).toBeUndefined();
    });
  });

  describe('deleteTemplate()', () => {
    it('TASK_TEMPLATE_DELETE is a valid GQL document', () => {
      expect((TASK_TEMPLATE_DELETE as DocumentNode).kind).toBe('Document');
    });

    it('calls apolloClient.mutate with TASK_TEMPLATE_DELETE and template id', async () => {
      vi.mocked(apolloClient.mutate).mockResolvedValue({
        data: { deleteTaskTemplate: { success: true } },
      } as never);

      await repository.deleteTemplate('tmpl-1');

      expect(apolloClient.mutate).toHaveBeenCalledWith({
        mutation: TASK_TEMPLATE_DELETE,
        variables: { id: 'tmpl-1' },
      });
    });

    it('resolves to void on success', async () => {
      vi.mocked(apolloClient.mutate).mockResolvedValue({
        data: { deleteTaskTemplate: { success: true } },
      } as never);

      const result = await repository.deleteTemplate('tmpl-1');
      expect(result).toBeUndefined();
    });
  });
});
