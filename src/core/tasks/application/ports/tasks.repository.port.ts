import type { ITask } from '@/core/tasks/domain/interfaces/task.interface';
import type { ITaskRun } from '@/core/tasks/domain/interfaces/task-run.interface';
import type { ITaskTemplate } from '@/core/tasks/domain/interfaces/task-template.interface';
import type { Paginated } from '@/core/tasks/application/interfaces/pagination.interface';
import type {
  ListTasksInput,
  ListTaskRunsInput,
  ScheduleTaskInput,
  ListTemplatesInput,
  CreateTemplateInput,
  UpdateTemplateInput,
} from '@/core/tasks/application/interfaces/tasks.interfaces';

export interface ITasksRepository {
  listTasks(input: ListTasksInput): Promise<Paginated<ITask>>;
  getTask(id: string): Promise<ITask>;
  listTaskRuns(input: ListTaskRunsInput): Promise<Paginated<ITaskRun>>;
  scheduleTask(input: ScheduleTaskInput): Promise<string>;
  cancelTask(id: string): Promise<void>;
  listTemplates(input: ListTemplatesInput): Promise<Paginated<ITaskTemplate>>;
  getTemplate(id: string): Promise<ITaskTemplate>;
  createTemplate(input: CreateTemplateInput): Promise<string>;
  updateTemplate(input: UpdateTemplateInput): Promise<void>;
  deleteTemplate(id: string): Promise<void>;
}
