import type { TaskRunStatus } from './task-run-status.enum';

export interface ITaskRun {
  id: string;
  taskId: string;
  status: TaskRunStatus;
  output: Record<string, unknown>;
  error?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}
