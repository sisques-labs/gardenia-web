import type { Paginated } from '@/core/tasks/application/interfaces/pagination.interface';

export interface TaskRunGqlRaw {
  id: string;
  taskId: string;
  status: string;
  output: string;
  error?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskRunsFindByTaskIdResponse {
  taskRunsFindByTaskId: Paginated<TaskRunGqlRaw>;
}
