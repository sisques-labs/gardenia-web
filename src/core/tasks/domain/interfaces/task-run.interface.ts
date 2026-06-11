import type { TaskRunStatus } from './task-run-status.enum';

export interface ITaskRun {
  id: string;
  taskId: string;
  attempt: number;
  status: TaskRunStatus;
  progress: number;
  error?: string | null;
  startedAt: string;
  endedAt?: string | null;
  createdAt: string;
}
