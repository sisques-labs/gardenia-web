import type { TaskStatus } from './task-status.enum';

export interface ITask {
  id: string;
  spaceId: string;
  templateId?: string;
  name: string;
  status: TaskStatus;
  payload: Record<string, unknown>;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}
