import type { TaskStatus } from '@/core/tasks/domain/interfaces/task-status.enum';
import type { TaskBackoffStrategy } from '@/core/tasks/domain/interfaces/task-backoff-strategy.enum';
import type { PaginationInput } from './pagination.interface';

export interface ListTasksInput extends PaginationInput {
  spaceId: string;
  status?: TaskStatus;
}

export interface ListTaskRunsInput extends PaginationInput {
  taskId: string;
}

export interface ScheduleTaskInput {
  spaceId: string;
  templateId?: string;
  name: string;
  scheduledAt: string;
  payload: Record<string, unknown>;
}

export interface ListTemplatesInput extends PaginationInput {
  spaceId: string;
}

export interface CreateTemplateInput {
  spaceId: string;
  name: string;
  defaultPayload: Record<string, unknown>;
  maxRetries: number;
  backoffStrategy: TaskBackoffStrategy;
}

export interface UpdateTemplateInput {
  id: string;
  name?: string;
  defaultPayload?: Record<string, unknown>;
  maxRetries?: number;
  backoffStrategy?: TaskBackoffStrategy;
}
