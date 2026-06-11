import { apolloClient } from '@/shared/infrastructure/http/apollo.client';
import type { ITasksRepository } from '@/core/tasks/application/ports/tasks.repository.port';
import type { ITask } from '@/core/tasks/domain/interfaces/task.interface';
import type { ITaskRun } from '@/core/tasks/domain/interfaces/task-run.interface';
import type { ITaskTemplate } from '@/core/tasks/domain/interfaces/task-template.interface';
import type { Paginated } from '@/core/tasks/application/interfaces/pagination.interface';
import type {
  ListTasksInput,
  ListTaskRunsInput,
  ListTemplatesInput,
  ScheduleTaskInput,
  CreateTemplateInput,
  UpdateTemplateInput,
} from '@/core/tasks/application/interfaces/tasks.interfaces';

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

import type { TasksFindByCriteriaResponse } from './responses/tasks-find-by-criteria.response';
import type { TaskFindByIdResponse } from './responses/task-find-by-id.response';
import type { TaskRunsFindByTaskIdResponse } from './responses/task-runs-find-by-task-id.response';
import type { TaskTemplatesFindByCriteriaResponse } from './responses/task-templates-find-by-criteria.response';
import type { TaskTemplateFindByIdResponse } from './responses/task-template-find-by-id.response';
import type { ScheduleTaskResponse } from './responses/schedule-task.response';
import type { CancelTaskResponse } from './responses/cancel-task.response';
import type { TaskTemplateCreateResponse } from './responses/task-template-create.response';
import type { TaskTemplateUpdateResponse } from './responses/task-template-update.response';
import type { TaskTemplateDeleteResponse } from './responses/task-template-delete.response';

import { TaskMapper } from './mappers/task.mapper';
import { TaskRunMapper } from './mappers/task-run.mapper';
import { TaskTemplateMapper } from './mappers/task-template.mapper';

export class TasksGqlRepository implements ITasksRepository {
  async listTasks(input: ListTasksInput): Promise<Paginated<ITask>> {
    const filters = input.status
      ? [{ field: 'status', operator: 'eq', value: input.status }]
      : [];
    const res = await apolloClient.query<TasksFindByCriteriaResponse>({
      query: TASKS_FIND_BY_CRITERIA,
      variables: {
        input: {
          ...(filters.length ? { filters } : {}),
          pagination: { page: input.page, perPage: input.pageSize },
        },
      },
    });
    const data = res.data.taskFindByCriteria;
    return {
      items: data.items.map(TaskMapper.toTask),
      total: data.total,
      page: data.page,
      pageSize: input.pageSize,
    };
  }

  async getTask(id: string): Promise<ITask> {
    const res = await apolloClient.query<TaskFindByIdResponse>({
      query: TASK_FIND_BY_ID,
      variables: { input: { id } },
    });
    if (!res.data?.taskFindById) throw new Error(`Task not found: ${id}`);
    return TaskMapper.toTask(res.data.taskFindById);
  }

  async listTaskRuns(input: ListTaskRunsInput): Promise<Paginated<ITaskRun>> {
    const res = await apolloClient.query<TaskRunsFindByTaskIdResponse>({
      query: TASK_RUNS_FIND_BY_TASK_ID,
      variables: { input: { taskId: input.taskId } },
    });
    const items = (res.data.taskRunsFindByTaskId ?? []).map(TaskRunMapper.toTaskRun);
    return { items, total: items.length, page: 1, pageSize: items.length };
  }

  async listTemplates(input: ListTemplatesInput): Promise<Paginated<ITaskTemplate>> {
    const res = await apolloClient.query<TaskTemplatesFindByCriteriaResponse>({
      query: TASK_TEMPLATES_FIND_BY_CRITERIA,
      variables: {
        input: { pagination: { page: input.page, perPage: input.pageSize } },
      },
    });
    const data = res.data.taskTemplateFindByCriteria;
    return {
      items: data.items.map(TaskTemplateMapper.toTaskTemplate),
      total: data.total,
      page: data.page,
      pageSize: input.pageSize,
    };
  }

  async getTemplate(id: string): Promise<ITaskTemplate> {
    const res = await apolloClient.query<TaskTemplateFindByIdResponse>({
      query: TASK_TEMPLATE_FIND_BY_ID,
      variables: { id },
    });
    if (!res.data?.taskTemplateFindById) throw new Error(`TaskTemplate not found: ${id}`);
    return TaskTemplateMapper.toTaskTemplate(res.data.taskTemplateFindById);
  }

  async scheduleTask(input: ScheduleTaskInput): Promise<string> {
    const res = await apolloClient.mutate<ScheduleTaskResponse>({
      mutation: SCHEDULE_TASK,
      variables: {
        input: {
          ...input,
          ...(input.payload !== undefined ? { payload: JSON.stringify(input.payload) } : {}),
        },
      },
    });
    const id = res.data?.scheduleTask?.id;
    if (!id) throw new Error('scheduleTask returned no id');
    return id;
  }

  async cancelTask(id: string): Promise<void> {
    await apolloClient.mutate<CancelTaskResponse>({
      mutation: CANCEL_TASK,
      variables: { id },
    });
  }

  async createTemplate(input: CreateTemplateInput): Promise<string> {
    const res = await apolloClient.mutate<TaskTemplateCreateResponse>({
      mutation: TASK_TEMPLATE_CREATE,
      variables: { input },
    });
    const id = res.data?.createTaskTemplate?.id;
    if (!id) throw new Error('createTemplate returned no id');
    return id;
  }

  async updateTemplate(input: UpdateTemplateInput): Promise<void> {
    await apolloClient.mutate<TaskTemplateUpdateResponse>({
      mutation: TASK_TEMPLATE_UPDATE,
      variables: { input },
    });
  }

  async deleteTemplate(id: string): Promise<void> {
    await apolloClient.mutate<TaskTemplateDeleteResponse>({
      mutation: TASK_TEMPLATE_DELETE,
      variables: { id },
    });
  }
}

export const tasksGqlRepository = new TasksGqlRepository();
