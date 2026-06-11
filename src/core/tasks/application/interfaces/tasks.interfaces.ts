import type { TaskStatus } from '@/core/tasks/domain/interfaces/task-status.enum';
import type { PaginationInput } from './pagination.interface';

export interface ListTasksInput extends PaginationInput {
  status?: TaskStatus;
}

export interface ListTaskRunsInput {
  taskId: string;
}

export interface ScheduleTaskInput {
  templateId: string;
  payload?: Record<string, unknown>;
  priority?: number;
  delayMs?: number;
  cronExpression?: string;
  isRecurring?: boolean;
  maxRuns?: number;
  idempotencyKey?: string;
  targetType?: string;
  targetId?: string;
  validFrom?: string;
  validUntil?: string;
}

export type ListTemplatesInput = PaginationInput;

export interface CreateTemplateInput {
  name: string;
  description?: string | null;
  taskTitle?: string | null;
  taskDescription?: string | null;
  handlerKey?: string | null;
  defaultPriority?: number;
  defaultRetryCount?: number;
  defaultBackoffStrategy?: string;
  defaultTimeoutMs?: number;
  maxConcurrency?: number;
  defaultCronExpression?: string | null;
  defaultIsRecurring?: boolean;
}

export interface UpdateTemplateInput {
  id: string;
  name?: string;
  description?: string | null;
  taskTitle?: string | null;
  taskDescription?: string | null;
  handlerKey?: string | null;
  defaultPriority?: number;
  defaultRetryCount?: number;
  defaultBackoffStrategy?: string;
  defaultTimeoutMs?: number;
  maxConcurrency?: number;
  defaultCronExpression?: string | null;
  defaultIsRecurring?: boolean;
}
